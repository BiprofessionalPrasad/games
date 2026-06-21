import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, extname, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PORT = Number(process.env.BLUEY_TESTBENCH_PORT) || 5173;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

function resolveFilePath(urlPath) {
  let filePath = join(ROOT, decodeURIComponent(urlPath));

  if (!filePath.startsWith(ROOT) || !existsSync(filePath)) {
    return null;
  }

  if (statSync(filePath).isDirectory()) {
    filePath = join(filePath, "index.html");
    if (!existsSync(filePath)) {
      return null;
    }
  }

  return filePath;
}

createServer((req, res) => {
  try {
    const raw = req.url?.split("?")[0] ?? "/";
    const urlPath = raw === "/" ? "/testbench/index.html" : raw;
    const filePath = resolveFilePath(urlPath);

    if (!filePath) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    const ext = extname(filePath);
    res.writeHead(200, { "Content-Type": MIME[ext] ?? "application/octet-stream" });
    res.end(readFileSync(filePath));
  } catch (err) {
    console.error(err);
    res.writeHead(500);
    res.end("Server error");
  }
}).listen(PORT, () => {
  console.log(`Bluey testbench: http://localhost:${PORT}/testbench/`);
}).on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use. Stop the other testbench server or set BLUEY_TESTBENCH_PORT.`);
  } else {
    console.error(err);
  }
  process.exit(1);
});