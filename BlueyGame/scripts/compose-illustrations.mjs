import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CHAR_MANIFEST = join(ROOT, "assets", "characters", "manifest.json");
const STYLES = join(ROOT, "storybooks", "styles", "storybook.css");

const PROP_STYLES = `
  .prop-ipad {
    position: absolute;
    width: 90px;
    height: 120px;
    background: linear-gradient(145deg, #4a9eff, #2563eb);
    border-radius: 12px;
    border: 4px solid #1e40af;
    box-shadow: 0 8px 24px rgba(37, 99, 235, 0.45);
    transform: translate(-50%, -50%);
  }
  .prop-ipad.glow::after {
    content: "";
    position: absolute;
    inset: -20px;
    border-radius: 24px;
    background: radial-gradient(circle, rgba(96, 165, 250, 0.5) 0%, transparent 70%);
    z-index: -1;
  }
  .prop-ipad.gold::after {
    background: radial-gradient(circle, rgba(251, 191, 36, 0.65) 0%, transparent 70%);
  }
  .prop-bucket {
    position: absolute;
    width: 70px;
    height: 55px;
    background: #3b82f6;
    border-radius: 4px 4px 12px 12px;
    border: 3px solid #1d4ed8;
    transform: translate(-50%, -50%);
  }
  .prop-hose-snake {
    position: absolute;
    width: 200px;
    height: 24px;
    background: repeating-linear-gradient(90deg, #22c55e 0 20px, #16a34a 20px 40px);
    border-radius: 12px;
    transform: translate(-50%, -50%) rotate(-8deg);
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  }
  .prop-pool-noodle {
    position: absolute;
    width: 180px;
    height: 28px;
    background: linear-gradient(90deg, #f472b6, #ec4899);
    border-radius: 14px;
    transform: translate(-50%, -50%) rotate(15deg);
    box-shadow: 0 4px 12px rgba(236, 72, 153, 0.4);
  }
  .prop-lava {
    position: absolute;
    left: 5%;
    right: 5%;
    height: 80px;
    bottom: 0;
    background: linear-gradient(180deg, #f97316, #dc2626);
    border-radius: 50% 50% 0 0;
    opacity: 0.85;
  }
  .prop-camera-flash {
    position: absolute;
    width: 60px;
    height: 60px;
    background: radial-gradient(circle, #fff 0%, rgba(255,255,255,0) 70%);
    transform: translate(-50%, -50%);
    animation: none;
  }
  .compose-frame {
    width: 768px;
    height: 737px;
    position: relative;
    overflow: hidden;
  }
  .compose-character {
    position: absolute;
    transform-origin: bottom center;
    z-index: 10;
  }
  .compose-character img {
    display: block;
    height: 380px;
    width: auto;
    filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.25));
  }
  .compose-character.flip img { transform: scaleX(-1); }
  .big-tree {
    position: absolute;
    bottom: 5%;
    left: 50%;
    transform: translateX(-50%);
    width: 200px;
    height: 280px;
    background: #2d6a4f;
    border-radius: 50% 50% 10% 10%;
    z-index: 1;
  }
  .big-tree::before {
    content: "";
    position: absolute;
    bottom: -30px;
    left: 40%;
    width: 20%;
    height: 40px;
    background: #6b4423;
  }
`;

function renderProp(prop) {
  const glow = prop.glow === true ? " glow" : prop.glow === "gold" ? " glow gold" : "";
  const style = `left:${prop.x}%; top:${prop.y}%;`;
  switch (prop.type) {
    case "ipad":
      return `<div class="prop-ipad${glow}" style="${style}"></div>`;
    case "bucket":
      return `<div class="prop-bucket" style="${style}"></div>`;
    case "hose-snake":
      return `<div class="prop-hose-snake" style="${style}"></div>`;
    case "pool-noodle":
      return `<div class="prop-pool-noodle" style="${style}"></div>`;
    case "lava":
      return `<div class="prop-lava"></div>`;
    case "camera-flash":
      return `<div class="prop-camera-flash" style="${style}"></div>`;
    default:
      return "";
  }
}

function renderDecor(decor) {
  if (decor === "sun") return `<div class="sun"></div><div class="cloud cloud-1"></div>`;
  if (decor === "tree") return `<div class="big-tree"></div>`;
  return "";
}

function buildSceneHtml(page, characterMap, css) {
  const decor = SCENE_DECOR_HTML[page.scene] ?? "";
  const extraDecor = renderDecor(page.decor);
  const chars = (page.characters ?? [])
    .map((ch) => {
      const meta = characterMap.get(ch.id);
      if (!meta) return "";
      const src = pathToFileURL(resolve(ROOT, meta.file)).href;
      const flip = ch.flip ? " flip" : "";
      const scale = ch.scale ?? 0.5;
      const rotate = ch.rotate ? ` rotate(${ch.rotate}deg)` : "";
      return `<div class="compose-character${flip}" style="left:${ch.x}%; bottom:${100 - ch.y}%; transform: scale(${scale})${rotate};">
        <img src="${src}" alt="" />
      </div>`;
    })
    .join("");
  const props = (page.props ?? []).map(renderProp).join("");

  return `<!DOCTYPE html><html><head><style>${css}${PROP_STYLES}</style></head>
<body><div class="compose-frame"><div class="scene scene-${page.scene}">${decor}${extraDecor}${props}${chars}</div></div></body></html>`;
}

const SCENE_DECOR_HTML = {
  "backyard-day": `<div class="hill"></div>`,
  "backyard-sunset": `<div class="sun"></div><div class="hill"></div>`,
  "living-room": `<div class="couch"></div>`,
};

async function main() {
  const sceneFile = process.argv[2];
  if (!sceneFile) {
    console.error("Usage: node compose-illustrations.mjs <scenes.json>");
    process.exit(1);
  }

  const config = JSON.parse(readFileSync(join(ROOT, sceneFile), "utf8"));
  const charManifest = JSON.parse(readFileSync(CHAR_MANIFEST, "utf8"));
  const characterMap = new Map(charManifest.characters.map((c) => [c.id, c]));
  const css = readFileSync(STYLES, "utf8");

  const outDir = join(ROOT, "storybooks", "illustrations", config.id);
  mkdirSync(outDir, { recursive: true });
  const scratchDir = join(ROOT, ".scratch", "compose");
  mkdirSync(scratchDir, { recursive: true });

  const puppeteer = await import("puppeteer");
  const browser = await puppeteer.default.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const browserPage = await browser.newPage();
    await browserPage.setViewport({ width: config.width, height: config.height });

    for (const page of config.pages) {
      const html = buildSceneHtml(page, characterMap, css);
      const htmlPath = join(scratchDir, `${config.id}-${page.file}.html`);
      writeFileSync(htmlPath, html, "utf8");
      await browserPage.goto(pathToFileURL(htmlPath).href, { waitUntil: "networkidle0" });
      const outPath = join(outDir, page.file);
      await browserPage.screenshot({ path: outPath, type: "png" });
      console.log(`✓ ${config.id}/${page.file}`);
    }
  } finally {
    await browser.close();
  }

  console.log(`Done — ${config.pages.length} scenes in ${outDir}`);
}

main().catch((err) => {
  console.error("FAIL:", err.message);
  process.exit(1);
});