import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const requiredFiles = [
  "testbench/index.html",
  "testbench/testbench.js",
  "testbench/styles.css",
];

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exit(1);
}

for (const file of requiredFiles) {
  const path = join(ROOT, file);
  if (!existsSync(path)) {
    fail(`missing testbench file: ${file}`);
  }
  if (readFileSync(path, "utf8").trim().length === 0) {
    fail(`empty testbench file: ${file}`);
  }
  console.log(`PASS: ${file}`);
}

const html = readFileSync(join(ROOT, "testbench/index.html"), "utf8");
if (!html.includes("testbench.js")) {
  fail("index.html must load testbench.js");
}

const js = readFileSync(join(ROOT, "testbench/testbench.js"), "utf8");
if (!js.includes("manifest.json")) {
  fail("testbench.js must load character manifest");
}

console.log("PASS: testbench structure validated");
process.exit(0);