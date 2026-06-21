/**
 * Full GasoMini QC test — every hub card, navigation, and core interaction.
 */
import { chromium } from 'playwright';
import { readFileSync } from 'fs';

const URL = 'file:///C:/Tools/game/GasoMini/index.html';
const html = readFileSync('index.html', 'utf8');

const HUB_MODULES = [...html.matchAll(/data-module="(module-[^"]+)"/g)].map(m => m[1]);
const MODULE_IDS = [...new Set([...html.matchAll(/id="(module-[^"]+)"/g)].map(m => m[1]))];

const failures = [];
const passes = [];

function pass(msg) { passes.push(msg); }
function fail(msg) { failures.push(msg); }

async function drag(page, locator, dx, dy) {
  const box = await locator.boundingBox();
  if (!box) return false;
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + dx, y + dy, { steps: 12 });
  const dragging = await locator.evaluate(el => el.classList.contains('dragging'));
  await page.mouse.up();
  return dragging;
}

async function goHome(page) {
  await page.locator('#btn-home').click();
  await page.waitForTimeout(250);
  await page.evaluate(() => document.getElementById('module-hub')?.scrollTo(0, 0));
  const hubActive = await page.locator('#module-hub.active').count();
  if (!hubActive) fail('Home button did not return to hub');
  else pass('Home → hub');
}

async function openModule(page, id) {
  const card = page.locator(`[data-module="${id}"]`);
  await card.scrollIntoViewIfNeeded();
  await card.click({ timeout: 10000 });
  await page.waitForTimeout(350);
  const active = await page.locator(`#${id}.active`).count();
  if (!active) { fail(`${id}: module did not activate`); return false; }
  pass(`${id}: activates`);
  return true;
}

async function testFeedZoo(page) {
  if (!await openModule(page, 'module-feed-zoo')) return;
  const animals = await page.locator('.feed-card').count();
  if (animals !== 8) fail(`feed-zoo: expected 8 animals, got ${animals}`);
  else pass('feed-zoo: 8 animals listed');
  await page.locator('.feed-card[data-feed="dog"]').click();
  await page.waitForTimeout(400);
  const feedVisible = await page.locator('#feed-view:not(.hidden)').count();
  if (feedVisible) pass('feed-zoo: opens feeding view');
  else fail('feed-zoo: feeding view not shown');
  const food = page.locator('#feed-tray .draggable').first();
  if (await drag(page, food, 0, -100)) pass('feed-zoo: food drags');
  else fail('feed-zoo: food drag failed');
  await page.click('#feed-back-btn');
  await page.waitForTimeout(200);
  await goHome(page);
}

async function testPreschool(page) {
  if (!await openModule(page, 'module-preschool')) return;
  await page.waitForTimeout(300);
  const apple = page.locator('.food-item').first();
  if (await drag(page, apple, 0, -80)) pass('preschool: food drags');
  else fail('preschool: food drag failed');
  const shape = page.locator('.shape-piece').first();
  if (await drag(page, shape, 0, -100)) pass('preschool: shape drags');
  else fail('preschool: shape drag failed');
  await goHome(page);
}

async function testMath(page) {
  if (!await openModule(page, 'module-math')) return;
  const eq = await page.locator('#math-equation').textContent();
  if (!eq || !eq.includes('+')) fail('math: equation missing');
  else pass(`math: equation "${eq.trim()}"`);
  const tile = page.locator('#math-choices .draggable').first();
  if (await drag(page, tile, 0, -120)) pass('math: number drags');
  else fail('math: number drag failed');
  await goHome(page);
}

async function testWords(page) {
  if (!await openModule(page, 'module-words')) return;
  const slots = await page.locator('.letter-slot').count();
  if (slots < 3) fail('words: letter slots missing');
  else pass(`words: ${slots} slots`);
  const tile = page.locator('#word-tray .draggable').first();
  if (await drag(page, tile, 0, -100)) pass('words: letter drags');
  else fail('words: letter drag failed');
  await goHome(page);
}

async function testMemory(page) {
  if (!await openModule(page, 'module-memory')) return;
  const cards = await page.locator('.mem-card').count();
  if (cards !== 12) fail(`memory: expected 12 cards, got ${cards}`);
  else pass('memory: 12 cards');
  await page.locator('.mem-card').first().click();
  await page.waitForTimeout(300);
  const flipped = await page.locator('.mem-card.flipped').count();
  if (flipped !== 1) fail('memory: card flip failed');
  else pass('memory: card flips');
  await goHome(page);
}

async function testPattern(page) {
  if (!await openModule(page, 'module-pattern')) return;
  const row = await page.locator('#pattern-row .pattern-item').count();
  if (row < 4) fail('pattern: sequence missing');
  else pass(`pattern: ${row} items in sequence`);
  const tile = page.locator('#pattern-choices .draggable').first();
  if (await drag(page, tile, 0, -80)) pass('pattern: piece drags');
  else fail('pattern: piece drag failed');
  await goHome(page);
}

async function testArtMix(page) {
  if (!await openModule(page, 'module-art-mix')) return;
  const hint = await page.locator('#art-mix-hint').textContent();
  if (!hint?.includes('Mix')) fail('art-mix: hint missing');
  else pass('art-mix: hint shown');
  const tile = page.locator('#art-mix-tray .draggable').first();
  if (await drag(page, tile, 0, -100)) pass('art-mix: color drags');
  else fail('art-mix: color drag failed');
  await goHome(page);
}

async function testArtPaint(page) {
  if (!await openModule(page, 'module-art-paint')) return;
  const canvas = page.locator('#paint-canvas');
  if (!(await canvas.count())) fail('art-paint: canvas missing');
  else pass('art-paint: canvas exists');
  const box = await canvas.boundingBox();
  if (box) {
    await page.mouse.move(box.x + box.width/2, box.y + box.height/2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width/2 + 30, box.y + box.height/2 + 20, { steps: 5 });
    await page.mouse.up();
    pass('art-paint: draw stroke');
  }
  await page.click('#paint-clear');
  pass('art-paint: clear button');
  await goHome(page);
}

async function testArtSticker(page) {
  if (!await openModule(page, 'module-art-sticker')) return;
  if (!(await page.locator('#sticker-scene').count())) fail('art-sticker: scene missing');
  else pass('art-sticker: scene exists');
  const tile = page.locator('#sticker-tray .draggable').first();
  if (await drag(page, tile, 0, -120)) pass('art-sticker: sticker drags');
  else fail('art-sticker: sticker drag failed');
  await goHome(page);
}

async function testArtRainbow(page) {
  if (!await openModule(page, 'module-art-rainbow')) return;
  const slots = await page.locator('.rainbow-slot').count();
  if (slots !== 7) fail(`art-rainbow: expected 7 slots, got ${slots}`);
  else pass('art-rainbow: 7 slots');
  const tile = page.locator('#rainbow-tray .draggable').first();
  if (await drag(page, tile, 0, -100)) pass('art-rainbow: color drags');
  else fail('art-rainbow: color drag failed');
  await goHome(page);
}

async function testArtMosaic(page) {
  if (!await openModule(page, 'module-art-mosaic')) return;
  const cells = await page.locator('.mosaic-cell').count();
  if (cells !== 16) fail(`art-mosaic: expected 16 cells, got ${cells}`);
  else pass('art-mosaic: 16 cells');
  const empty = await page.locator('.mosaic-cell:not(.filled)').count();
  if (empty < 1) fail('art-mosaic: no empty cells');
  else pass(`art-mosaic: ${empty} empty cells`);
  const tile = page.locator('#mosaic-tray .draggable').first();
  if (await drag(page, tile, 0, -100)) pass('art-mosaic: tile drags');
  else fail('art-mosaic: tile drag failed');
  await goHome(page);
}

async function testArtStamp(page) {
  if (!await openModule(page, 'module-art-stamp')) return;
  const canvas = page.locator('#stamp-canvas');
  if (!(await canvas.count())) fail('art-stamp: canvas missing');
  else pass('art-stamp: canvas exists');
  const box = await canvas.boundingBox();
  if (box) {
    await page.mouse.click(box.x + box.width/2, box.y + box.height/2);
    pass('art-stamp: tap stamps');
  }
  await goHome(page);
}

async function testArtSymmetry(page) {
  if (!await openModule(page, 'module-art-symmetry')) return;
  const left = page.locator('#sym-left');
  if (!(await left.count())) fail('art-symmetry: canvas missing');
  else pass('art-symmetry: canvases exist');
  const box = await left.boundingBox();
  if (box) {
    await page.mouse.move(box.x + box.width*0.3, box.y + box.height/2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width*0.3, box.y + box.height/2 + 40, { steps: 5 });
    await page.mouse.up();
    pass('art-symmetry: draw stroke');
  }
  await goHome(page);
}

async function testDocBandage(page) {
  if (!await openModule(page, 'module-doc-bandage')) return;
  const boos = await page.locator('.boo-boo').count();
  if (boos !== 3) fail(`doc-bandage: expected 3 boo-boos, got ${boos}`);
  else pass('doc-bandage: 3 boo-boos');
  const tile = page.locator('#bandage-tray .draggable').first();
  if (await drag(page, tile, 0, -100)) pass('doc-bandage: bandage drags');
  else fail('doc-bandage: bandage drag failed');
  await goHome(page);
}

async function testDocTemp(page) {
  if (!await openModule(page, 'module-doc-temp')) return;
  if (!(await page.locator('#temp-patient').count())) fail('doc-temp: patient missing');
  else pass('doc-temp: patient shown');
  const tile = page.locator('#temp-tray .draggable').first();
  if (await drag(page, tile, 0, -100)) pass('doc-temp: thermometer drags');
  else fail('doc-temp: thermometer drag failed');
  await goHome(page);
}

async function testDocMedicine(page) {
  if (!await openModule(page, 'module-doc-medicine')) return;
  const cards = await page.locator('.symptom-card').count();
  if (cards !== 3) fail(`doc-medicine: expected 3 symptoms, got ${cards}`);
  else pass('doc-medicine: 3 symptoms');
  const tile = page.locator('#medicine-tray .draggable').first();
  if (await drag(page, tile, 0, -100)) pass('doc-medicine: medicine drags');
  else fail('doc-medicine: medicine drag failed');
  await goHome(page);
}

async function testDocTools(page) {
  if (!await openModule(page, 'module-doc-tools')) return;
  const trays = await page.locator('.tool-tray').count();
  if (trays !== 4) fail(`doc-tools: expected 4 trays, got ${trays}`);
  else pass('doc-tools: 4 trays');
  const tile = page.locator('#doc-tools-tray .draggable').first();
  if (await drag(page, tile, 0, -100)) pass('doc-tools: tool drags');
  else fail('doc-tools: tool drag failed');
  await goHome(page);
}

async function testDocXray(page) {
  if (!await openModule(page, 'module-doc-xray')) return;
  const zones = await page.locator('.xray-zone').count();
  if (zones !== 3) fail(`doc-xray: expected 3 zones, got ${zones}`);
  else pass('doc-xray: 3 zones');
  const tile = page.locator('#xray-tray .draggable').first();
  if (await drag(page, tile, 0, -80)) pass('doc-xray: part drags');
  else fail('doc-xray: part drag failed');
  await goHome(page);
}

async function testDocClean(page) {
  if (!await openModule(page, 'module-doc-clean')) return;
  if (!(await page.locator('#wound-area').count())) fail('doc-clean: wound missing');
  else pass('doc-clean: wound shown');
  const tile = page.locator('#clean-tray .draggable').first();
  if (await drag(page, tile, 0, -20)) pass('doc-clean: sponge drags');
  else fail('doc-clean: sponge drag failed');
  await goHome(page);
}

async function testDocHeart(page) {
  if (!await openModule(page, 'module-doc-heart')) return;
  const pips = await page.locator('.score-pip').count();
  if (pips !== 5) fail(`doc-heart: expected 5 pips, got ${pips}`);
  else pass('doc-heart: 5 score pips');
  await page.locator('#heart-tap-zone').click();
  pass('doc-heart: tap zone clickable');
  await goHome(page);
}

// ── Static wiring checks ──
const missingModules = HUB_MODULES.filter(id => !MODULE_IDS.includes(id));
if (missingModules.length) fail(`Static: hub cards missing DOM: ${missingModules.join(', ')}`);
else pass(`Static: all ${HUB_MODULES.length} hub cards have module sections`);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
page.on('pageerror', e => errors.push(e.message));

await page.goto(URL);
await page.waitForTimeout(500);

if (await page.locator('#module-hub.active').count()) pass('Hub loads active');
else fail('Hub not active on load');

const hubCards = await page.locator('.hub-card').count();
if (hubCards !== HUB_MODULES.length) fail(`Hub card count: expected ${HUB_MODULES.length}, got ${hubCards}`);
else pass(`Hub shows ${hubCards} game cards`);

async function testWard(page) {
  if (!await openModule(page, 'module-doc-ward')) return;
  const patients = await page.locator('#ward-grid .patient-card').count();
  if (patients !== 8) fail(`ward: expected 8 patients, got ${patients}`);
  else pass('ward: 8 patients listed');
  await page.locator('#ward-grid .patient-card[data-patient="worm"]').click();
  await page.waitForTimeout(400);
  const treatVisible = await page.locator('#treat-view:not(.hidden)').count();
  if (treatVisible) pass('ward: opens treatment view');
  else fail('ward: treatment view not shown');
  const wormTools = await page.locator('#treat-tray .draggable').count();
  if (wormTools === 0) pass('ward: worm uses tap, no drag tools');
  else fail(`ward: worm should have no drag tools, got ${wormTools}`);
  const wormTappable = await page.locator('#treat-patient.worm-tappable').count();
  if (wormTappable) pass('ward: worm patient is tappable');
  else fail('ward: worm patient not tappable');
  await page.locator('#treat-patient').click();
  await page.waitForTimeout(300);
  const untied = await page.locator('#treat-patient[data-untied="1"]').count();
  if (untied) pass('ward: worm tap unties knot');
  else fail('ward: worm tap did not register');
  await page.click('#ward-back-btn');
  await page.waitForTimeout(200);
  await page.locator('#ward-grid .patient-card[data-patient="elephant"]').click();
  await page.waitForTimeout(400);
  const tissue = page.locator('#treat-tray .draggable').first();
  if (await drag(page, tissue, 0, -80)) pass('ward: treatment tool drags');
  else fail('ward: treatment tool drag failed');
  await page.click('#ward-back-btn');
  await page.waitForTimeout(200);
  await goHome(page);
}

await testPreschool(page);
await testFeedZoo(page);
await testMath(page);
await testWords(page);
await testMemory(page);
await testPattern(page);
await testArtMix(page);
await testArtPaint(page);
await testArtSticker(page);
await testArtRainbow(page);
await testArtMosaic(page);
await testArtStamp(page);
await testArtSymmetry(page);
await testDocBandage(page);
await testDocTemp(page);
await testDocMedicine(page);
await testDocTools(page);
await testDocXray(page);
await testDocClean(page);
await testDocHeart(page);
await testWard(page);

if (errors.length) failures.push(`JS errors: ${errors.join('; ')}`);
else pass('No JavaScript runtime errors');

await browser.close();

console.log('\n=== PASSES (' + passes.length + ') ===');
passes.forEach(p => console.log('  ✓', p));
if (failures.length) {
  console.log('\n=== FAILURES (' + failures.length + ') ===');
  failures.forEach(f => console.log('  ✗', f));
  console.log('\nVERDICT: FAIL');
  process.exit(1);
}
console.log('\nVERDICT: PASS');