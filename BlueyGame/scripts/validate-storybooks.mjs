import { readFileSync, existsSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MANIFEST_PATH = join(ROOT, "storybooks", "stories", "manifest.json");
const MIN_BYTES = 50_000;

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`PASS: ${message}`);
}

if (!existsSync(MANIFEST_PATH)) {
  fail(`storybooks manifest not found at ${MANIFEST_PATH}`);
}

const manifest = JSON.parse(readFileSync(MANIFEST_PATH, "utf8"));

if (!Array.isArray(manifest.stories) || manifest.stories.length === 0) {
  fail("manifest.stories must be a non-empty array");
}

for (const story of manifest.stories) {
  const storyJsonPath = join(ROOT, story.file);
  if (!existsSync(storyJsonPath)) {
    fail(`story JSON missing: ${story.file}`);
  }

  const storyData = JSON.parse(readFileSync(storyJsonPath, "utf8"));
  if (!Array.isArray(storyData.pages) || storyData.pages.length < 6) {
    fail(`${story.id} must have at least 6 pages`);
  }

  const pdfPath = join(ROOT, story.output);
  if (!existsSync(pdfPath)) {
    fail(`PDF missing for ${story.id}: ${story.output} — run npm run build:storybooks`);
  }

  const bytes = statSync(pdfPath).size;
  if (bytes < MIN_BYTES) {
    fail(`${story.id} PDF too small (${bytes} bytes)`);
  }

  pass(`${story.id} — ${story.title} (${storyData.pages.length + 1} pages, ${Math.round(bytes / 1024)} KB)`);
}

pass(`validated ${manifest.stories.length} storybook PDFs`);