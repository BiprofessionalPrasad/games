#!/usr/bin/env node
/**
 * PvZ automated QC — static checks before declaring work complete.
 * Exit 0 = pass, 1 = fail.
 */
import { readFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PVZ_DIR = join(__dirname, '..', '..', '..', '..', 'PvZ');

const files = {
  game: join(PVZ_DIR, 'game.js'),
  html: join(PVZ_DIR, 'index.html'),
  css: join(PVZ_DIR, 'styles.css'),
};

const failures = [];
const passes = [];

function fail(msg) {
  failures.push(msg);
}

function pass(msg) {
  passes.push(msg);
}

function read(path) {
  if (!existsSync(path)) {
    fail(`Missing file: ${path}`);
    return '';
  }
  return readFileSync(path, 'utf8');
}

// --- 1. Syntax check ---
try {
  execSync(`node --check "${files.game}"`, { stdio: 'pipe' });
  pass('game.js syntax valid (node --check)');
} catch (e) {
  fail(`game.js syntax error: ${e.stderr?.toString() || e.message}`);
}

const gameJs = read(files.game);
const html = read(files.html);
const css = read(files.css);

if (!gameJs || !html) {
  report();
  process.exit(1);
}

// --- 2. DOM ID wiring ---
const idRefs = [...gameJs.matchAll(/getElementById\(['"]([^'"]+)['"]\)/g)].map((m) => m[1]);
const htmlIds = new Set([...html.matchAll(/\bid=["']([^"']+)["']/g)].map((m) => m[1]));
const dynamicIds = new Set(
  [...gameJs.matchAll(/\.id\s*=\s*['"]([^'"]+)['"]/g)].map((m) => m[1])
);

const missingIds = [];
for (const id of [...new Set(idRefs)]) {
  if (!htmlIds.has(id) && !dynamicIds.has(id)) {
    missingIds.push(id);
    fail(`game.js references #${id} but it is not in index.html or assigned dynamically`);
  }
}
if (missingIds.length === 0) {
  pass(`All ${new Set(idRefs).size} getElementById targets exist in HTML or are created at runtime`);
}

// --- 3. Required admin panel ---
const adminChecks = [
  ['adminPanel', 'admin panel container'],
  ['adminToggleInfiniteSunBtn', 'infinite sun toggle button'],
  ['adminToggleInfiniteSun', 'adminToggleInfiniteSun method'],
  ['adminSpawnZombieBtn', 'spawn zombie button'],
  ['closeAdminBtn', 'close admin button'],
  ['toggleAdminPanel', 'toggleAdminPanel method'],

  ['adminSpawnZombie', 'adminSpawnZombie method'],
  ['adminSpawnZombossBtn', 'spawn zomboss button'],
  ['adminSpawnZomboss', 'adminSpawnZomboss method'],
  ['adminToggleCooldowns', 'adminToggleCooldowns method'],
  ['adminToggleDoomCratersBtn', 'doom craters toggle button'],
  ['adminToggleDoomCraters', 'adminToggleDoomCraters method'],
  ['adminToggleCooldownsBtn', 'toggle cooldowns button'],
  ["e.key === 'g' || e.key === 'G'", 'G key handler'],
];

for (const [needle, label] of adminChecks) {
  const inGame = gameJs.includes(needle);
  const inHtml = html.includes(needle);
  const found = needle.includes(' ') || needle.includes('(') ? inGame : inGame || inHtml;
  if (!found) fail(`Missing ${label}: expected "${needle}"`);
  else pass(`${label} present`);
}

// --- 4. updatePlantBar shovel guard (known crash fix) ---
if (!gameJs.includes('if (!type || !PLANT_TYPES[type]) return')) {
  fail('updatePlantBar missing shovel/non-plant guard — will crash on shovel card');
} else {
  pass('updatePlantBar guards non-plant cards (shovel fix)');
}

// --- 5. ZOMBIE_TYPES used by admin spawn ---
for (const type of ['regular', 'cone', 'bucket', 'allstar', 'gargantuar']) {
  if (!gameJs.includes(`${type}:`) && !gameJs.includes(`'${type}'`)) {
    fail(`Zombie type "${type}" not referenced`);
  }
}
pass('Admin spawn zombie types defined');

// --- 6. Game constants (eval pre-class block only; avoids browser globals) ---
const constantsBlock = gameJs.split(/\nclass\s+\w+/)[0];

try {
  const fn = new Function(`${constantsBlock}\n;return { PLANT_TYPES, PLANT_UPGRADES, ZOMBIE_TYPES, LEVELS };`);
  const { PLANT_TYPES, PLANT_UPGRADES, ZOMBIE_TYPES, LEVELS } = fn();
  pass(`PLANT_TYPES has ${Object.keys(PLANT_TYPES).length} entries`);

  for (const [type, data] of Object.entries(PLANT_TYPES)) {
    if (!data.name || data.cost == null || data.hp == null) {
      fail(`PLANT_TYPES.${type} missing required fields`);
    }
  }
  pass('PLANT_TYPES entries have name, cost, hp');

  for (const [type, data] of Object.entries(ZOMBIE_TYPES)) {
    if (data.hp == null || data.speed == null) fail(`ZOMBIE_TYPES.${type} missing hp/speed`);
  }
  pass('ZOMBIE_TYPES entries have hp and speed');

  if (!ZOMBIE_TYPES.zomboss || ZOMBIE_TYPES.zomboss.hp <= ZOMBIE_TYPES.gargantuar.hp) {
    fail('ZOMBIE_TYPES.zomboss must exist and be tankier than gargantuar');
  } else {
    pass('Dr. Zomboss defined as tankiest zombie');
  }

  if (!gameJs.includes('isBossWave') || !gameJs.includes('spawnZomboss')) {
    fail('Boss wave logic (isBossWave/spawnZomboss) missing from game.js');
  } else {
    pass('Boss wave logic present');
  }

  const levelIds = Object.keys(LEVELS);
  if (!levelIds.includes('day') || !levelIds.includes('pool')) {
    fail('LEVELS missing expected day/pool entries');
  } else {
    pass(`LEVELS defines ${levelIds.length} levels`);
  }

  for (const [type, up] of Object.entries(PLANT_UPGRADES)) {
    if (PLANT_TYPES[type] && up.upgradeable === undefined) {
      fail(`PLANT_UPGRADES.${type} missing upgradeable flag`);
    }
  }
  pass('PLANT_UPGRADES aligned with plant types');
} catch (e) {
  fail(`Runtime eval of game constants failed: ${e.message}`);
}

// --- 7. PvZGame class structure ---
const requiredMethods = [
  'constructor',
  'startGame',
  'update',
  'draw',
  'spawnZombie',
  'updatePlantBar',
  'toggleAdminPanel',
  'checkSunAutoCollect',
  'beginWaveAssault',
];

for (const method of requiredMethods) {
  const re = new RegExp(`\\b${method}\\s*\\(`);
  if (!re.test(gameJs)) fail(`PvZGame missing method: ${method}`);
}
if (!failures.some((f) => f.startsWith('PvZGame missing'))) {
  pass(`PvZGame has ${requiredMethods.length} required methods`);
}

// --- 8. CSS for admin panel ---
const adminCss = ['.admin-panel', '.admin-btn', '.admin-buttons'];
for (const sel of adminCss) {
  if (!css.includes(sel)) fail(`styles.css missing ${sel}`);
}
if (!failures.some((f) => f.includes('styles.css missing'))) {
  pass('Admin panel CSS rules present');
}

// --- 9. Script load order ---
if (!html.includes('<script src="game.js">')) {
  fail('index.html must load game.js');
} else {
  pass('index.html loads game.js');
}

// --- 10. DOMContentLoaded bootstrap ---
if (!gameJs.includes("window.addEventListener('DOMContentLoaded'")) {
  fail('game.js must bootstrap on DOMContentLoaded');
} else {
  pass('Game bootstraps on DOMContentLoaded');
}

function report() {
  console.log('\n=== PvZ QC Report ===\n');
  for (const p of passes) console.log(`  ✓ ${p}`);
  if (failures.length) {
    console.log('');
    for (const f of failures) console.log(`  ✗ ${f}`);
    console.log(`\nFAILED: ${failures.length} issue(s)\n`);
  } else {
    console.log(`\nPASSED: ${passes.length} checks\n`);
  }
}

report();
process.exit(failures.length > 0 ? 1 : 0);