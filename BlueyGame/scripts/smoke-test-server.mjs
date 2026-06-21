import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PORT = 5174;
const BASE = `http://127.0.0.1:${PORT}`;

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exit(1);
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchStatus(url) {
  const response = await fetch(url);
  return response.status;
}

const child = spawn(process.execPath, ["scripts/serve-testbench.mjs"], {
  cwd: ROOT,
  env: { ...process.env, BLUEY_TESTBENCH_PORT: String(PORT) },
  stdio: ["ignore", "pipe", "pipe"],
});

let started = false;
child.stdout.on("data", (chunk) => {
  const text = chunk.toString();
  if (text.includes("Bluey testbench")) {
    started = true;
  }
});

child.stderr.on("data", (chunk) => {
  process.stderr.write(chunk);
});

for (let attempt = 0; attempt < 20 && !started; attempt += 1) {
  await wait(100);
}

if (!started) {
  child.kill();
  fail("testbench server did not start within 2s");
}

try {
  const checks = [
    [`${BASE}/testbench/`, 200],
    [`${BASE}/assets/characters/manifest.json`, 200],
    [`${BASE}/assets/characters/bluey.png`, 200],
  ];

  for (const [url, expected] of checks) {
    const status = await fetchStatus(url);
    if (status !== expected) {
      fail(`${url} returned ${status}, expected ${expected}`);
    }
    console.log(`PASS: ${url} -> ${status}`);
  }

  console.log("PASS: testbench server smoke test");
} catch (err) {
  fail(err.message);
} finally {
  child.kill();
  await wait(100);
  process.exit(0);
}