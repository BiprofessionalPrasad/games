import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const STORIES_MANIFEST = join(ROOT, "storybooks", "stories", "manifest.json");
const CHAR_MANIFEST = join(ROOT, "assets", "characters", "manifest.json");
const STYLES = join(ROOT, "storybooks", "styles", "storybook.css");
const OUTPUT_DIR = join(ROOT, "storybooks", "output");
const SCRATCH_DIR = join(ROOT, ".scratch", "storybooks");

const PAGE_WIDTH = 768;
const PAGE_HEIGHT = 1024;

const COVER_THEMES = {
  "01-treasure-map": "cover-treasure",
  "02-blanket-fort": "cover-fort",
  "03-sleepout": "cover-sleepout",
  "04-missing-sock": "cover-sock",
  "05-friendship-feast": "cover-feast",
};

const SCENE_DECOR = {
  "backyard-day": `<div class="sun"></div><div class="cloud cloud-1"></div><div class="cloud cloud-2"></div><div class="hill"></div><div class="tree tree-1"></div><div class="tree tree-2"></div>`,
  "backyard-rain": `<div class="cloud cloud-1"></div><div class="cloud cloud-2"></div><div class="hill"></div>`,
  "backyard-sunset": `<div class="sun"></div><div class="hill"></div><div class="tree tree-1"></div>`,
  "living-room": `<div class="couch"></div>`,
  "night-sky": `<div class="moon"></div>`,
  "kitchen": ``,
  "picnic": `<div class="checkered-cloth"></div><div class="hill"></div>`,
  "cover-treasure": `<div class="hill"></div>`,
};

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderCharacters(characters, characterMap, basePath) {
  return characters
    .map((ch) => {
      const meta = characterMap.get(ch.id);
      if (!meta) return "";
      const src = pathToFileURL(resolve(ROOT, meta.file)).href;
      const flip = ch.flip ? " flip" : "";
      const scale = ch.scale ?? 0.55;
      return `<div class="character${flip}" style="left:${ch.x}%; bottom:${100 - ch.y}%; transform: scale(${scale});">
        <div class="character-glow"></div>
        <img src="${src}" alt="${escapeHtml(meta.name)}" />
      </div>`;
    })
    .join("\n");
}

function illustrationSrc(relativePath) {
  return pathToFileURL(resolve(ROOT, relativePath)).href;
}

function renderIllustratedCover(story) {
  const src = illustrationSrc(story.coverIllustration);
  return `<section class="page cover-illustrated">
    <img class="cover-illustration" src="${src}" alt="" />
    <div class="cover-overlay">
      <div class="cover-badge">A Backyard Adventure Storybook</div>
      <h1>${escapeHtml(story.title)}</h1>
      <p class="subtitle">${escapeHtml(story.subtitle)}</p>
    </div>
  </section>`;
}

function renderCoverPage(story, characterMap) {
  if (story.mode === "illustrated" && story.coverIllustration) {
    return renderIllustratedCover(story);
  }

  const theme = COVER_THEMES[story.id] ?? "cover-treasure";
  const cast = (story.coverCharacters ?? []).map((id, i) => {
    const x = 12 + i * 28;
    return { id, x, y: 55, scale: 0.48 };
  });

  return `<section class="page cover ${theme}">
    <div class="cover-badge">A Backyard Adventure Storybook</div>
    <h1>${escapeHtml(story.title)}</h1>
    <p class="subtitle">${escapeHtml(story.subtitle)}</p>
    <div class="cover-characters">
      ${renderCharacters(cast, characterMap)}
    </div>
    <p class="cast">Featuring Bluey, Bingo, Bandit, Chilli, Muffin, Socks &amp; Lia</p>
  </section>`;
}

function renderIllustratedStoryPage(page, pageNum, totalPages) {
  const endingClass = page.isEnding ? " ending" : "";
  const label = page.isEnding ? "The End" : `Page ${pageNum} of ${totalPages}`;
  const src = illustrationSrc(page.illustration);

  return `<section class="page story-page illustrated">
    <div class="illustration-panel">
      <img src="${src}" alt="" />
    </div>
    <div class="text-panel">
      <div class="page-number">${label}</div>
      <p class="story-text${endingClass}">${escapeHtml(page.text)}</p>
    </div>
  </section>`;
}

function renderStoryPage(page, pageNum, totalPages, characterMap, story) {
  if (story.mode === "illustrated" && page.illustration) {
    return renderIllustratedStoryPage(page, pageNum, totalPages);
  }

  const decor = SCENE_DECOR[page.scene] ?? "";
  const endingClass = page.isEnding ? " ending" : "";
  const label = page.isEnding ? "The End" : `Page ${pageNum} of ${totalPages}`;

  return `<section class="page story-page">
    <div class="art-panel">
      <div class="scene scene-${page.scene}">
        ${decor}
        ${renderCharacters(page.characters ?? [], characterMap)}
      </div>
    </div>
    <div class="text-panel">
      <div class="page-number">${label}</div>
      <p class="story-text${endingClass}">${escapeHtml(page.text)}</p>
    </div>
  </section>`;
}

function buildHtml(story, characterMap) {
  const css = readFileSync(STYLES, "utf8");
  const storyPages = story.pages.length;
  const pages = [
    renderCoverPage(story, characterMap),
    ...story.pages.map((page, i) => renderStoryPage(page, i + 1, storyPages, characterMap, story)),
  ];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(story.title)}</title>
  <style>${css}</style>
</head>
<body>
${pages.join("\n")}
</body>
</html>`;
}

async function renderPdf(htmlPath, pdfPath) {
  const puppeteer = await import("puppeteer");
  const browser = await puppeteer.default.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "networkidle0" });
    await page.pdf({
      path: pdfPath,
      width: `${PAGE_WIDTH}px`,
      height: `${PAGE_HEIGHT}px`,
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });
  } finally {
    await browser.close();
  }
}

async function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true });
  mkdirSync(SCRATCH_DIR, { recursive: true });

  const storiesManifest = JSON.parse(readFileSync(STORIES_MANIFEST, "utf8"));
  const charManifest = JSON.parse(readFileSync(CHAR_MANIFEST, "utf8"));
  const characterMap = new Map(charManifest.characters.map((c) => [c.id, c]));

  console.log("Building storybook PDFs (768×1024 — iPad portrait)…\n");

  for (const entry of storiesManifest.stories) {
    const storyPath = join(ROOT, entry.file);
    const story = JSON.parse(readFileSync(storyPath, "utf8"));
    const htmlPath = join(SCRATCH_DIR, `${entry.id}.html`);
    const pdfPath = join(ROOT, entry.output);

    const html = buildHtml(story, characterMap);
    writeFileSync(htmlPath, html, "utf8");

    await renderPdf(htmlPath, pdfPath);
    console.log(`✓ ${entry.title}`);
    console.log(`  → ${entry.output} (${story.pages.length + 1} pages)\n`);
  }

  console.log(`Done — ${storiesManifest.stories.length} PDFs in storybooks/output/`);
}

main().catch((err) => {
  console.error("FAIL:", err.message);
  process.exit(1);
});