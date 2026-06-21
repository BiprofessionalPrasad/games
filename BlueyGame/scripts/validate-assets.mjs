import { readFileSync, existsSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MANIFEST_PATH = join(ROOT, "assets", "characters", "manifest.json");
const MIN_WIDTH = 512;
const MIN_HEIGHT = 512;
const MIN_BYTES = 10_000;

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`PASS: ${message}`);
}

if (!existsSync(MANIFEST_PATH)) {
  fail(`manifest not found at ${MANIFEST_PATH}`);
}

const manifest = JSON.parse(readFileSync(MANIFEST_PATH, "utf8"));

if (!Array.isArray(manifest.characters) || manifest.characters.length === 0) {
  fail("manifest.characters must be a non-empty array");
}

const requiredFields = ["id", "name", "role", "file", "width", "height", "description"];
const ids = new Set();

for (const character of manifest.characters) {
  for (const field of requiredFields) {
    if (!(field in character)) {
      fail(`character '${character.id ?? "unknown"}' missing field '${field}'`);
    }
  }

  if (ids.has(character.id)) {
    fail(`duplicate character id '${character.id}'`);
  }
  ids.add(character.id);

  const assetPath = join(ROOT, character.file);
  if (!existsSync(assetPath)) {
    fail(`asset missing for '${character.id}': ${character.file}`);
  }

  const bytes = statSync(assetPath).size;
  if (bytes < MIN_BYTES) {
    fail(`${character.id} asset too small (${bytes} bytes)`);
  }

  if (character.width < MIN_WIDTH || character.height < MIN_HEIGHT) {
    fail(
      `${character.id} resolution ${character.width}x${character.height} below minimum ${MIN_WIDTH}x${MIN_HEIGHT}`
    );
  }

  pass(`${character.id} — ${character.name} (${character.width}x${character.height})`);
}

pass(`validated ${manifest.characters.length} HD character assets`);
process.exit(0);