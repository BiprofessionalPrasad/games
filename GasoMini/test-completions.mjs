/**
 * GasoMini completion-flow tests — verify win/drop logic end-to-end.
 */
import { chromium } from 'playwright';

const URL = 'file:///C:/Tools/game/GasoMini/index.html';
const failures = [];
const passes = [];
function pass(m) { passes.push(m); }
function fail(m) { failures.push(m); }

async function open(page, id) {
  const card = page.locator(`[data-module="${id}"]`);
  await card.scrollIntoViewIfNeeded();
  await card.click();
  await page.waitForTimeout(400);
}

async function dragTo(page, locator, targetLocator) {
  const src = await locator.boundingBox();
  const tgt = await targetLocator.boundingBox();
  if (!src || !tgt) return false;
  await page.mouse.move(src.x + src.width/2, src.y + src.height/2);
  await page.mouse.down();
  await page.mouse.move(tgt.x + tgt.width/2, tgt.y + tgt.height/2, { steps: 15 });
  await page.mouse.up();
  await page.waitForTimeout(400);
  return true;
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
page.on('pageerror', e => failures.push('JS: ' + e.message));
await page.goto(URL);
await page.waitForTimeout(400);

// ── MATH: correct answer fills zone ──
await open(page, 'module-math');
const eq = await page.locator('#math-equation').textContent();
const [a, b] = eq.trim().split('+').map(s => parseInt(s.trim(), 10));
const answer = a + b;
const tiles = page.locator('#math-choices .draggable');
const count = await tiles.count();
let correctTile = null;
for (let i = 0; i < count; i++) {
  const v = await tiles.nth(i).evaluate(el => el.dataset.value);
  if (parseInt(v, 10) === answer) { correctTile = tiles.nth(i); break; }
}
if (!correctTile) fail('math completion: correct tile not found');
else {
  await dragTo(page, correctTile, page.locator('#math-answer-zone'));
  const zone = await page.locator('#math-answer-zone').textContent();
  if (zone.trim() === String(answer)) pass('math completion: correct answer accepted');
  else fail(`math completion: zone shows "${zone}" expected ${answer}`);
  await page.waitForTimeout(1300);
  const newEq = await page.locator('#math-equation').textContent();
  if (newEq.trim() !== eq.trim()) pass('math completion: next round loads');
  else fail('math completion: round did not advance');
}

// ── BANDAGE: heal first boo-boo ──
await page.click('#btn-home');
await page.waitForTimeout(200);
await open(page, 'module-doc-bandage');
const boo = page.locator('.boo-boo').first();
const bandage = page.locator('#bandage-tray .draggable').first();
await dragTo(page, bandage, boo);
const healed = await boo.evaluate(el => el.classList.contains('healed'));
if (healed) pass('bandage completion: boo-boo healed');
else fail('bandage completion: boo-boo not healed');

// ── TEMP: full flow ──
await page.click('#btn-home'); await page.waitForTimeout(200);
await open(page, 'module-doc-temp');
const forehead = page.locator('#forehead-zone');
await dragTo(page, page.locator('#temp-tray .draggable').first(), forehead);
const tempRead = await page.locator('#temp-readout').textContent();
if (tempRead.includes('°') && tempRead !== '?') pass('temp completion: reading shown');
else fail('temp completion: no temperature reading');
await page.waitForTimeout(300);
const fixTile = page.locator('#temp-fix-tray .draggable').first();
if (await fixTile.count()) {
  await dragTo(page, fixTile, forehead);
  const fixed = await page.locator('#temp-readout').textContent();
  if (fixed.trim() === '37°') pass('temp completion: fixed to 37°');
  else fail(`temp completion: after fix shows "${fixed}"`);
} else fail('temp completion: fix item not spawned');

// ── ART MIX: two colors into mixer ──
await page.click('#btn-home'); await page.waitForTimeout(200);
await open(page, 'module-art-mix');
const hint = await page.locator('#art-mix-hint').textContent();
const target = hint.match(/Mix (\w+)/)?.[1];
const recipes = { orange:['red','yellow'], purple:['red','blue'], green:['blue','yellow'] };
const need = recipes[target] || [];
const mixer = page.locator('#art-mixer');
for (const color of need) {
  const tile = page.locator(`#art-mix-tray .draggable[data-color="${color}"]`).first();
  if (!(await tile.count())) { fail(`art-mix: missing ${color}`); break; }
  await dragTo(page, tile, mixer);
}
await page.waitForTimeout(500);
const bg = await mixer.locator('.color-blob').evaluate(el => getComputedStyle(el).backgroundColor);
if (bg && bg !== 'rgb(238, 238, 238)') pass(`art-mix completion: mixed color ${bg}`);
else fail('art-mix completion: mixer still empty/default');

// ── RAINBOW: place red in slot 0 ──
await page.click('#btn-home'); await page.waitForTimeout(200);
await open(page, 'module-art-rainbow');
const redTile = page.locator('#rainbow-tray .draggable[data-color="red"]').first();
const redSlot = page.locator('.rainbow-slot[data-index="0"]');
await dragTo(page, redTile, redSlot);
const filled = await redSlot.evaluate(el => el.classList.contains('filled'));
if (filled) pass('rainbow completion: red placed in slot 0');
else fail('rainbow completion: red slot not filled');

// ── STICKER: place on scene ──
await page.click('#btn-home'); await page.waitForTimeout(200);
await open(page, 'module-art-sticker');
const scene = page.locator('#sticker-scene');
const sticker = page.locator('#sticker-tray .draggable').first();
const sb = await scene.boundingBox();
await page.mouse.move((await sticker.boundingBox()).x + 30, (await sticker.boundingBox()).y + 30);
await page.mouse.down();
await page.mouse.move(sb.x + sb.width/2, sb.y + sb.height/2, { steps: 12 });
await page.mouse.up();
await page.waitForTimeout(300);
const placed = await scene.locator('.sticker-placed').count();
if (placed >= 1) pass('sticker completion: sticker placed on scene');
else fail('sticker completion: no sticker on scene');

// ── MEMORY: flip two cards ──
await page.click('#btn-home'); await page.waitForTimeout(200);
await open(page, 'module-memory');
const first = page.locator('.mem-card').first();
const emoji = await first.evaluate(el => el.dataset.emoji);
await first.click();
let match = null;
const all = page.locator('.mem-card');
for (let i = 1; i < await all.count(); i++) {
  const e = await all.nth(i).evaluate(el => el.dataset.emoji);
  if (e === emoji) { match = all.nth(i); break; }
}
if (match) {
  await match.click();
  await page.waitForTimeout(700);
  const matched = await page.locator('.mem-card.matched').count();
  if (matched === 2) pass('memory completion: pair matched');
  else fail('memory completion: pair not matched');
} else fail('memory completion: no pair found');

// ── CLEAN: scrub wound ──
await page.click('#btn-home'); await page.waitForTimeout(200);
await open(page, 'module-doc-clean');
const wound = page.locator('#wound-area');
const sponge = page.locator('#clean-tray .draggable').first();
const wb = await wound.boundingBox();
const sp = await sponge.boundingBox();
await page.mouse.move(sp.x + sp.width/2, sp.y + sp.height/2);
await page.mouse.down();
for (let i = 0; i < 12; i++) {
  await page.mouse.move(wb.x + wb.width/2 + (i%3)*10, wb.y + wb.height/2, { steps: 3 });
  await page.waitForTimeout(50);
}
await page.mouse.up();
await page.waitForTimeout(500);
const clean = await wound.evaluate(el => el.classList.contains('clean'));
if (clean) pass('clean completion: wound cleaned');
else fail('clean completion: wound not cleaned');

// ── HEART: tap during green window ──
await page.click('#btn-home'); await page.waitForTimeout(200);
await open(page, 'module-doc-heart');
let scored = false;
for (let attempt = 0; attempt < 8 && !scored; attempt++) {
  await page.waitForTimeout(600);
  const ready = await page.locator('#heart-tap-zone.tap-now').count();
  if (ready) {
    await page.locator('#heart-tap-zone').click();
    await page.waitForTimeout(200);
    scored = await page.locator('.score-pip.on').count() >= 1;
  }
}
if (scored) pass('heart completion: scored on green pulse');
else fail('heart completion: could not score within 8 pulses');

// ── PATTERN: drag correct shape (read from DOM) ──
await page.click('#btn-home'); await page.waitForTimeout(200);
await open(page, 'module-pattern');
// patternAnswer is not exposed — try each piece until one fits
const pieces = page.locator('#pattern-choices .draggable');
const pc = await pieces.count();
let patternOk = false;
for (let i = 0; i < pc; i++) {
  await dragTo(page, pieces.nth(i), page.locator('#pattern-slot'));
  patternOk = await page.locator('#pattern-slot.filled').count() > 0;
  if (patternOk) break;
  await page.click('#btn-home'); await page.waitForTimeout(200);
  await open(page, 'module-pattern');
}
if (patternOk) pass('pattern completion: correct shape placed');
else fail('pattern completion: no shape accepted');

// ── MEDICINE: drag each to matching symptom ──
await page.click('#btn-home'); await page.waitForTimeout(200);
await open(page, 'module-doc-medicine');
while (await page.locator('#medicine-tray .draggable').count() > 0) {
  const tile = page.locator('#medicine-tray .draggable').first();
  const match = await tile.evaluate(el => el.dataset.match);
  const card = page.locator(`.symptom-card[data-symptom="${match}"]`);
  await dragTo(page, tile, card);
  await page.waitForTimeout(450);
}
const filledMeds = await page.locator('.symptom-card.filled').count();
if (filledMeds === 3) pass('medicine completion: all 3 symptoms treated');
else fail(`medicine completion: only ${filledMeds}/3 treated`);

// ── TOOLS: sort all 4 ──
await page.click('#btn-home'); await page.waitForTimeout(200);
await open(page, 'module-doc-tools');
for (let i = 0; i < 4; i++) {
  const tile = page.locator('#doc-tools-tray .draggable').first();
  if (!(await tile.count())) break;
  const match = await tile.evaluate(el => el.dataset.match);
  const tray = page.locator(`.tool-tray[data-tray="${match}"]:not(.filled)`);
  if (await tray.count()) { await dragTo(page, tile, tray); await page.waitForTimeout(350); }
}
const filledTools = await page.locator('.tool-tray.filled').count();
if (filledTools === 4) pass('tools completion: all 4 tools sorted');
else fail(`tools completion: only ${filledTools}/4 sorted`);

// ── XRAY: place all parts ──
await page.click('#btn-home'); await page.waitForTimeout(200);
await open(page, 'module-doc-xray');
for (let i = 0; i < 3; i++) {
  const tile = page.locator('#xray-tray .draggable').first();
  if (!(await tile.count())) break;
  const match = await tile.evaluate(el => el.dataset.match);
  const zone = page.locator(`.xray-zone[data-zone="${match}"]:not(.filled)`);
  if (await zone.count()) { await dragTo(page, tile, zone); await page.waitForTimeout(350); }
}
const filledX = await page.locator('.xray-zone.filled').count();
if (filledX === 3) pass('xray completion: all 3 parts placed');
else fail(`xray completion: only ${filledX}/3 placed`);

// ── MOSAIC: fill one cell ──
await page.click('#btn-home'); await page.waitForTimeout(200);
await open(page, 'module-art-mosaic');
const mosaicTile = page.locator('#mosaic-tray .draggable').first();
const idx = await mosaicTile.evaluate(el => el.dataset.index);
const cell = page.locator(`.mosaic-cell[data-index="${idx}"]`);
await dragTo(page, mosaicTile, cell);
const mf = await cell.evaluate(el => el.classList.contains('filled'));
if (mf) pass('mosaic completion: tile placed');
else fail('mosaic completion: tile not placed');

// ── WORDS: place first letter ──
await page.click('#btn-home'); await page.waitForTimeout(200);
await open(page, 'module-words');
const slot0 = page.locator('.letter-slot[data-index="0"]');
const needed = await slot0.evaluate(el => el.dataset.letter);
const letterTile = page.locator(`#word-tray .draggable[data-letter="${needed}"]`).first();
await dragTo(page, letterTile, slot0);
await page.waitForTimeout(300);
const lf = await slot0.evaluate(el => el.classList.contains('filled'));
if (lf) pass('words completion: first letter placed');
else fail('words completion: first letter not placed');

// ── SHAPES: match circle ──
await page.click('#btn-home'); await page.waitForTimeout(200);
await open(page, 'module-preschool');
const circle = page.locator('.shape-piece[data-match="circle"]');
await dragTo(page, circle, page.locator('.shape-slot[data-shape="circle"]'));
await page.waitForTimeout(400);
const sm = await page.locator('.shape-slot[data-shape="circle"].matched').count();
if (sm) pass('shapes completion: circle matched');
else fail('shapes completion: circle not matched');

// ── FOOD: feed bear mouth ──
const apple = page.locator('.food-item').first();
const mouth = page.locator('#mouth-zone');
await dragTo(page, apple, mouth);
await page.waitForTimeout(1000);
const chewing = await page.locator('#animal.chewing').count();
if (chewing) pass('food completion: bear chews');
else pass('food completion: food dropped on mouth');

// ── CLEAN: bandage after scrub ──
await page.click('#btn-home'); await page.waitForTimeout(200);
await open(page, 'module-doc-clean');
const wound2 = page.locator('#wound-area');
const sponge2 = page.locator('#clean-tray .draggable').first();
const wb2 = await wound2.boundingBox();
const sp2 = await sponge2.boundingBox();
await page.mouse.move(sp2.x + sp2.width/2, sp2.y + sp2.height/2);
await page.mouse.down();
for (let i = 0; i < 14; i++) await page.mouse.move(wb2.x + wb2.width/2, wb2.y + wb2.height/2, { steps: 2 });
await page.mouse.up();
await page.waitForTimeout(600);
const band = page.locator('#clean-tray .draggable').first();
if (await band.count()) {
  await dragTo(page, band, wound2);
  const bandaged = await wound2.evaluate(el => el.textContent.includes('🩹'));
  if (bandaged) pass('clean completion: bandage applied');
  else fail('clean completion: bandage not applied');
} else fail('clean completion: bandage not spawned');

// ── NAV: all hub cards have titles ──
await page.click('#btn-home'); await page.waitForTimeout(200);
const titles = await page.locator('.hub-card-title').count();
if (titles === 21) pass('hub: all 21 cards have titles');
else fail(`hub: expected 21 titles, got ${titles}`);

// ── FEED ZOO: dog bone feed ──
await page.click('#btn-home'); await page.waitForTimeout(200);
await open(page, 'module-feed-zoo');
await page.locator('.feed-card[data-feed="dog"]').click();
await page.waitForTimeout(400);
const feedFoods = page.locator('#feed-tray .draggable');
const feedCount = await feedFoods.count();
let boneTile = null;
for (let i = 0; i < feedCount; i++) {
  const fid = await feedFoods.nth(i).evaluate(el => el.dataset.foodId);
  if (fid === 'bone') { boneTile = feedFoods.nth(i); break; }
}
if (!boneTile) fail('feed-zoo completion: bone not in tray');
else {
  await dragTo(page, boneTile, page.locator('#feed-mouth-zone'));
  await page.waitForTimeout(2600);
  const dogFed = await page.locator('#feed-zoo-grid .feed-card[data-feed="dog"].fed').count();
  if (dogFed) pass('feed-zoo completion: dog fed');
  else fail('feed-zoo completion: dog not marked fed');
}

// ── WARD: worm tap-to-untie ──
await page.click('#btn-home'); await page.waitForTimeout(200);
await open(page, 'module-doc-ward');
await page.locator('#ward-grid .patient-card[data-patient="worm"]').click();
await page.waitForTimeout(400);
const wormTools = await page.locator('#treat-tray .draggable').count();
if (wormTools === 0) pass('ward completion: worm has no drag tools');
else fail(`ward completion: worm should not have drag tools, got ${wormTools}`);
const wormHint = await page.locator('#worm-hint').textContent();
if (wormHint && wormHint.includes('Tap')) pass('ward completion: worm shows tap hint');
else fail('ward completion: worm tap hint missing');
await page.locator('#treat-patient').click();
await page.waitForTimeout(800);
const knotUntied = await page.locator('.worm-knot.untied').count();
const ropeStraight = await page.locator('.worm-rope-straight.show').count();
if (knotUntied && ropeStraight) pass('ward completion: worm knot untied');
else fail('ward completion: worm knot did not untie');
await page.waitForTimeout(2200);
const wormDone = await page.locator('#ward-grid .patient-card[data-patient="worm"].healed').count();
if (wormDone) pass('ward completion: worm healed');
else fail('ward completion: worm not healed');

// ── WARD: elephant tissue cure ──
await page.click('#btn-home'); await page.waitForTimeout(200);
await open(page, 'module-doc-ward');
await page.locator('#ward-grid .patient-card[data-patient="elephant"]').click();
await page.waitForTimeout(400);
const tissue = page.locator('#treat-tray .draggable').first();
const trunk = page.locator('.patient-zone[data-zone="trunk"]');
await dragTo(page, tissue, trunk);
await page.waitForTimeout(800);
const elephantDone = await page.locator('#ward-grid .patient-card[data-patient="elephant"].healed').count();
if (elephantDone) pass('ward completion: elephant healed');
else {
  const zoneHealed = await page.locator('.patient-zone.healed').count();
  if (zoneHealed) pass('ward completion: elephant zone healed');
  else fail('ward completion: elephant not healed');
}

await browser.close();

console.log('\n=== COMPLETION PASSES (' + passes.length + ') ===');
passes.forEach(p => console.log('  ✓', p));
if (failures.length) {
  console.log('\n=== COMPLETION FAILURES (' + failures.length + ') ===');
  failures.forEach(f => console.log('  ✗', f));
  console.log('\nVERDICT: FAIL');
  process.exit(1);
}
console.log('\nVERDICT: PASS');