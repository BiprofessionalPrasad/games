// Plants vs Zombies - Enhanced Canvas Game

const PLANT_TYPES = {
    sunflower: { name: 'Sunflower', cost: 50, cooldown: 5, hp: 80, icon: '🌻', color: '#ffd60a' },
    twinsunflower: { name: 'Twin Sunflower', cost: 150, cooldown: 10, hp: 80, icon: '🌻', color: '#ffd60a', upgradesPlant: 'sunflower' },
    puffshroom: { name: 'Puff-shroom', cost: 0, cooldown: 7, hp: 60, icon: '🍄', color: '#9d4edd', mushroom: true, shortRange: 3 },
    sunshroom: { name: 'Sun-shroom', cost: 25, cooldown: 5, hp: 80, icon: '🍄', color: '#ffd60a', mushroom: true, growTime: 24 },
    hypnoshroom: { name: 'Hypno-shroom', cost: 75, cooldown: 7, hp: 80, icon: '🍄', color: '#ff4d8d', mushroom: true },
    iceshroom: { name: 'Ice-shroom', cost: 75, cooldown: 50, hp: 1, icon: '🍄', color: '#48cae4', mushroom: true, freezeDuration: 4 },
    coffeebean: { name: 'Coffee Bean', cost: 75, cooldown: 5, hp: 1, icon: '☕', color: '#6f4e37', wakesPlant: 'mushroom' },
    peashooter: { name: 'Peashooter', cost: 100, cooldown: 7, hp: 80, icon: '🌱', color: '#52b788' },
    gatlingpea: { name: 'Gatling Pea', cost: 400, cooldown: 10, hp: 80, icon: '🔫', color: '#2d6a4f', upgradesPlant: 'peashooter' },
    wallnut: { name: 'Wall-nut', cost: 50, cooldown: 20, hp: 400, icon: '🥜', color: '#bc6c25' },
    squash: { name: 'Squash', cost: 50, cooldown: 30, hp: 1, icon: '🎃', color: '#f4a261' },
    tallnut: { name: 'Tall-nut', cost: 125, cooldown: 30, hp: 800, icon: '🌰', color: '#8b5e34' },
    cherrybomb: { name: 'Cherry Bomb', cost: 150, cooldown: 30, hp: 1, icon: '🍒', color: '#e63946' },
    jalapeno: { name: 'Jalapeno', cost: 125, cooldown: 30, hp: 1, icon: '🌶️', color: '#e85d04' },
    potatomine: { name: 'Potato Mine', cost: 25, cooldown: 10, hp: 80, icon: '🥔', color: '#c4a35a', armTime: 7 },
    snowpea: { name: 'Snow Pea', cost: 175, cooldown: 7, hp: 80, icon: '❄️', color: '#48cae4' },
    torchwood: { name: 'Torchwood', cost: 175, cooldown: 7, hp: 300, icon: '🔥', color: '#e85d04' },
    cabbagepult: { name: 'Cabbage-pult', cost: 100, cooldown: 7, hp: 80, icon: '🥬', color: '#7cb518', lob: true },
    kernelpult: { name: 'Kernel-pult', cost: 100, cooldown: 7, hp: 80, icon: '🌽', color: '#f4a261', lob: true },
    cobcannon: {
        name: 'Cob Cannon',
        cost: 500,
        cooldown: 7,
        hp: 300,
        icon: '🌽',
        color: '#d4a373',
        upgradesPlant: 'kernelpult',
        reloadTime: 36,
    },
    melonpult: { name: 'Melon-pult', cost: 300, cooldown: 10, hp: 80, icon: '🍈', color: '#52b788', lob: true },
    wintermelon: { name: 'Winter Melon', cost: 200, cooldown: 7, hp: 80, icon: '❄️', color: '#48cae4', lob: true, upgradesPlant: 'melonpult' },
    doomshroom: { name: 'Doom Shroom', cost: 5000, cooldown: 300, hp: 1, icon: '💀', color: '#5a189a' },
    boomshroom: { name: 'Boom Shroom', cost: 125, cooldown: 50, hp: 80, icon: '💥', color: '#e63946', mushroom: true, boomDelay: 1.5 },
    lilypad: { name: 'Lily Pad', cost: 25, cooldown: 5, hp: 80, icon: '🪷', color: '#2d6a4f', poolOnly: true },
    tanglekelp: { name: 'Tangle Kelp', cost: 25, cooldown: 7, hp: 1, icon: '🌿', color: '#0077b6', poolOnly: true, waterOnly: true },
    flowerpot: { name: 'Flower Pot', cost: 25, cooldown: 5, hp: 80, icon: '🏺', color: '#bc6c25', roofOnly: true },
};

const DOOM_SHROOM_CRATER_DURATION = 120;
const ROOF_STARTER_POT_COLS = 3;

const ZOMBIE_TYPES = {
    regular: { name: 'Zombie', hp: 100, speed: 0.3, damage: 15, color: '#6b705c', hat: null, score: 10 },
    cone: { name: 'Conehead', hp: 200, speed: 0.28, damage: 15, color: '#6b705c', hat: 'cone', score: 25 },
    bucket: { name: 'Buckethead', hp: 350, speed: 0.25, damage: 18, color: '#6b705c', hat: 'bucket', score: 40 },
    allstar: { name: 'All-Star Zombie', hp: 450, speed: 0.38, damage: 18, color: '#6b705c', hat: 'allstar', score: 55 },
    gargantuar: { name: 'Gargantuar', hp: 600, speed: 0.16, damage: 25, color: '#5a5340', hat: 'gargantuar', score: 75, instantPlantHitsToKill: 2, scale: 1.55 },
    gigagargantuar: {
        name: 'Giga-gargantuar',
        hp: 1200,
        speed: 0.14,
        damage: 32,
        color: '#4a3f30',
        hat: 'gigagargantuar',
        score: 150,
        instantPlantHitsToKill: 4,
        scale: 1.85,
    },
    imp: { name: 'Imp', hp: 70, speed: 0.42, damage: 12, color: '#6b705c', hat: 'imp', score: 15, scale: 0.62 },
    flag: { name: 'Flag Zombie', hp: 100, speed: 0.32, damage: 15, color: '#6b705c', hat: 'flag', score: 15 },
    zomboss: {
        name: 'Dr. Zomboss',
        hp: 5000,
        speed: 0,
        damage: 0,
        color: '#8d99ae',
        hat: 'zomboss',
        score: 500,
        instantPlantHitsToKill: 10,
    },
};

const BOSS_WAVE_INTERVAL = 20;
const MAX_LOADOUT_PLANTS = 8;

const SPAWN_WAVE_TYPES = ['regular', 'cone', 'bucket', 'allstar', 'gargantuar', 'gigagargantuar'];
const IMP_THROW_DURATION = 0.55;

function isGargantuarType(type) {
    return type === 'gargantuar' || type === 'gigagargantuar';
}
const POOL_SWIMMER_TYPES = new Set(['regular', 'cone', 'bucket']);

const MAX_PLANT_LEVEL = 3;

function getMaxPlantLevel(type) {
    const up = PLANT_UPGRADES[type];
    if (!up?.upgradeable) return 1;
    return up.descriptions?.length || up.maxHp?.length || MAX_PLANT_LEVEL;
}

const PLANT_UPGRADES = {
    sunflower: {
        upgradeable: true,
        sunInterval: [7, 5, 3.5],
        sunValue: [25, 35, 50],
        descriptions: [
            'Produces sun every 7s (25 each)',
            'Faster production: 5s interval, 35 sun',
            'Max output: 3.5s interval, 50 sun',
        ],
    },
    twinsunflower: {
        upgradeable: true,
        sunInterval: [7, 5, 3.5],
        sunValue: [25, 35, 50],
        sunCount: [2, 2, 2],
        descriptions: [
            'Two suns every 7s (25 each — 50 total)',
            'Faster production: 5s interval, 35 each (70 total)',
            'Max output: 3.5s interval, 50 each (100 total)',
        ],
    },
    puffshroom: {
        upgradeable: true,
        shootInterval: [1.5, 1.2, 0.95],
        damage: [20, 28, 36],
        shortRange: [3, 4, 5],
        descriptions: [
            'Spores every 1.5s, 3-tile range (20 dmg)',
            'Faster spores: 1.2s, 4-tile range, 28 dmg',
            'Spore storm: 0.95s interval, 5-tile range, 36 dmg',
        ],
    },
    sunshroom: {
        upgradeable: true,
        growTime: [24, 18, 12],
        smallSunInterval: [12, 10, 8],
        smallSunValue: [15, 18, 22],
        grownSunInterval: [7, 5.5, 4],
        grownSunValue: [25, 32, 40],
        descriptions: [
            'Small: 15☀/12s → grows in 24s to 25☀/7s',
            'Faster growth: 18s; 18☀/10s → 32☀/5.5s',
            'Rapid bloom: 12s growth; 22☀/8s → 40☀/4s',
        ],
    },
    hypnoshroom: {
        upgradeable: true,
        maxHp: [80, 120, 180],
        descriptions: [
            'Hypnotizes a zombie that eats it',
            'Sturdier cap: 120 HP',
            'Reinforced: 180 HP',
        ],
    },
    coffeebean: { upgradeable: false },
    peashooter: {
        upgradeable: true,
        shootInterval: [1.5, 1.1, 0.8],
        damage: [20, 28, 38],
        descriptions: [
            'Shoots peas every 1.5s (20 dmg)',
            'Rapid fire: 1.1s interval, 28 dmg',
            'Gatling mode: 0.8s interval, 38 dmg',
        ],
    },
    wallnut: {
        upgradeable: true,
        maxHp: [400, 600, 900],
        descriptions: [
            '400 HP wall',
            'Reinforced: 600 HP',
            'Fortified: 900 HP',
        ],
    },
    tallnut: {
        upgradeable: true,
        maxHp: [800, 1200, 1800],
        descriptions: [
            '800 HP tall wall',
            'Reinforced: 1200 HP',
            'Fortified: 1800 HP',
        ],
    },
    snowpea: {
        upgradeable: true,
        shootInterval: [1.8, 1.4, 1.0],
        damage: [20, 28, 38],
        slowDuration: [3, 4, 5],
        descriptions: [
            'Icy shots every 1.8s, 3s slow',
            'Faster shots: 1.4s, 4s slow, 28 dmg',
            'Blizzard: 1.0s interval, 5s slow, 38 dmg',
        ],
    },
    cabbagepult: {
        upgradeable: true,
        shootInterval: [2.5, 2.0, 1.5],
        damage: [40, 55, 70],
        descriptions: [
            'Lobs cabbages every 2.5s (40 dmg)',
            'Faster lobs: 2.0s interval, 55 dmg',
            'Cabbage barrage: 1.5s interval, 70 dmg',
        ],
    },
    kernelpult: {
        upgradeable: true,
        shootInterval: [2.0, 1.6, 1.2],
        damage: [20, 28, 36],
        butterChance: [0.2, 0.25, 0.3],
        butterDamage: [40, 55, 70],
        stunDuration: [3, 4, 5],
        descriptions: [
            'Lobs kernels every 2.0s, 20% butter stun',
            'Faster lobs: 1.6s, 25% butter, 55 butter dmg',
            'Kernel storm: 1.2s interval, 30% butter, 70 butter dmg',
        ],
    },
    melonpult: {
        upgradeable: true,
        shootInterval: [3.0, 2.5, 2.0],
        damage: [80, 100, 120],
        splashDamage: [30, 40, 50],
        descriptions: [
            'Lobs melons every 3s — 80 dmg, 30 splash',
            'Faster lobs: 2.5s, 100 dmg, 40 splash',
            'Melon mayhem: 2.0s interval, 120 dmg, 50 splash',
        ],
    },
    wintermelon: {
        upgradeable: true,
        shootInterval: [2.5, 2.0, 1.5],
        damage: [80, 100, 120],
        splashDamage: [30, 42, 55],
        slowDuration: [4, 5, 6],
        descriptions: [
            'Icy melons every 2.5s — 80 dmg, 30 splash, 4s slow',
            'Faster lobs: 2.0s, 100 dmg, 42 splash, 5s slow',
            'Blizzard barrage: 1.5s interval, 120 dmg, 55 splash, 6s slow',
        ],
    },
    gatlingpea: {
        upgradeable: true,
        shootInterval: [0.35, 0.26, 0.18],
        damage: [20, 30, 42],
        descriptions: [
            'Rapid peas every 0.35s (20 dmg)',
            'Faster burst: 0.26s interval, 30 dmg',
            'Bullet hail: 0.18s interval, 42 dmg',
        ],
    },
    torchwood: {
        upgradeable: true,
        maxHp: [300, 450, 550, 650],
        damageMult: [2, 3, 4, 5],
        peaColor: ['#ff6b35', '#48cae4', '#9d4edd', '#f8f9fa'],
        descriptions: [
            '300 HP — ignites peas orange (2× damage)',
            'Blue flame: 3× pea damage, 450 HP',
            'Purple flame: 4× pea damage, 550 HP',
            'White inferno: 5× pea damage, 650 HP',
        ],
    },
    cherrybomb: { upgradeable: false },
    jalapeno: { upgradeable: false },
    potatomine: { upgradeable: false },
    iceshroom: { upgradeable: false },
    squash: { upgradeable: false },
    cobcannon: {
        upgradeable: true,
        maxHp: [300, 450, 650],
        reloadTime: [36, 28, 20],
        bossHits: [1, 2, 3],
        blastRadius: [1, 1, 2],
        descriptions: [
            '3×3 cob blast, 36s reload, 300 HP (1 boss hit)',
            'Faster reload: 28s, 450 HP, 2 boss hits',
            'Mega blast: 5×5 area, 20s reload, 650 HP, 3 boss hits',
        ],
    },
    doomshroom: { upgradeable: false },
    boomshroom: { upgradeable: false },
    lilypad: {
        upgradeable: true,
        maxHp: [80, 120, 180],
        descriptions: [
            '80 HP water platform',
            'Sturdy pad: 120 HP',
            'Reinforced pad: 180 HP',
        ],
    },
    tanglekelp: { upgradeable: false },
    flowerpot: {
        upgradeable: true,
        maxHp: [80, 120, 180],
        descriptions: [
            '80 HP roof planter',
            'Sturdy pot: 120 HP',
            'Reinforced pot: 180 HP',
        ],
    },
};

function getUpgradeCost(type, currentLevel) {
    if (!PLANT_UPGRADES[type]?.upgradeable || currentLevel >= getMaxPlantLevel(type)) return null;
    const baseCost = Math.max(PLANT_TYPES[type].cost, 25);
    return Math.floor(baseCost * (0.5 + currentLevel * 0.35));
}

function buildPoolWaterCells(rows, cols) {
    const cells = [];
    const topPoolRow = Math.floor(rows / 2) - 1;
    const bottomPoolRow = Math.floor(rows / 2);
    for (let c = 0; c < cols; c++) {
        cells.push(`${topPoolRow},${c}`);
        cells.push(`${bottomPoolRow},${c}`);
    }
    return cells;
}

const LEVELS = {
    day: {
        id: 'day',
        name: 'Front Yard',
        icon: '☀️',
        description: 'Sun falls from the sky',
        theme: 'day',
        rows: 5,
        cols: 9,
        startingSun: 150,
        skySun: true,
        waterCells: [],
        zombieSpeedMult: 1,
    },
    night: {
        id: 'night',
        name: 'Night',
        icon: '🌙',
        description: 'No sky sun — use Sun-shrooms!',
        theme: 'night',
        rows: 5,
        cols: 9,
        startingSun: 175,
        skySun: false,
        waterCells: [],
        zombieSpeedMult: 1,
    },
    pool: {
        id: 'pool',
        name: 'Backyard Pool',
        icon: '🏊',
        description: 'Pool runs through the middle rows',
        theme: 'pool',
        rows: 6,
        cols: 9,
        startingSun: 150,
        skySun: true,
        waterCells: buildPoolWaterCells(6, 9),
        zombieSpeedMult: 1,
    },
    roof: {
        id: 'roof',
        name: 'Roof',
        icon: '🏠',
        description: 'Steep roof — lobbing plants only!',
        theme: 'roof',
        rows: 5,
        cols: 9,
        startingSun: 200,
        skySun: false,
        waterCells: [],
        zombieSpeedMult: 1,
    },
};

class AudioManager {
    constructor() {
        this.ctx = null;
        this.muted = false;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
        } catch (_) { /* audio unavailable */ }
    }

    toggleMute() {
        this.muted = !this.muted;
        return this.muted;
    }

    play(type) {
        if (this.muted || !this.ctx) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        const presets = {
            shoot: { freq: 520, type: 'square', dur: 0.06, vol: 0.06, slide: -200 },
            plant: { freq: 300, type: 'sine', dur: 0.15, vol: 0.1, slide: 400 },
            sun: { freq: 880, type: 'sine', dur: 0.12, vol: 0.08, slide: 200 },
            hit: { freq: 180, type: 'sawtooth', dur: 0.08, vol: 0.05, slide: -80 },
            explode: { freq: 80, type: 'sawtooth', dur: 0.4, vol: 0.12, slide: -60 },
            wave: { freq: 220, type: 'triangle', dur: 0.5, vol: 0.08, slide: 330 },
            death: { freq: 120, type: 'sawtooth', dur: 0.3, vol: 0.07, slide: -100 },
            win: { freq: 523, type: 'sine', dur: 0.6, vol: 0.1, slide: 0 },
            upgrade: { freq: 440, type: 'sine', dur: 0.25, vol: 0.1, slide: 220 },
            mower: { freq: 90, type: 'sawtooth', dur: 0.5, vol: 0.1, slide: 40 },
            shovel: { freq: 200, type: 'sawtooth', dur: 0.12, vol: 0.07, slide: -60 },
        };

        const p = presets[type] || presets.hit;
        osc.type = p.type;
        osc.frequency.setValueAtTime(p.freq, t);
        if (p.slide) osc.frequency.linearRampToValueAtTime(p.freq + p.slide, t + p.dur);
        gain.gain.setValueAtTime(p.vol, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + p.dur);
        osc.start(t);
        osc.stop(t + p.dur);

        if (type === 'win') {
            [659, 784].forEach((f, i) => {
                const o2 = this.ctx.createOscillator();
                const g2 = this.ctx.createGain();
                o2.connect(g2);
                g2.connect(this.ctx.destination);
                o2.type = 'sine';
                o2.frequency.value = f;
                g2.gain.setValueAtTime(0.06, t + 0.15 * (i + 1));
                g2.gain.exponentialRampToValueAtTime(0.001, t + 0.15 * (i + 1) + 0.3);
                o2.start(t + 0.15 * (i + 1));
                o2.stop(t + 0.15 * (i + 1) + 0.3);
            });
        }
    }
}

class PvZGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.audio = new AudioManager();

        this.cellW = 80;
        this.cellH = 100;
        this.lawnX = 60;
        this.lawnY = 50;
        this.currentLevel = 'day';
        this.levelConfig = LEVELS.day;
        this.plantLoadouts = {};
        this.selectedPlants = [];
        this.pendingLoadout = [];
        this.cols = 9;
        this.rows = 5;
        this.waterCells = new Set();
        this.stars = [];

        this.resizeCanvas();

        this.sun = 150;
        this.score = 0;
        this.kills = 0;
        this.selectedPlant = null;
        this.upgradeMode = false;
        this.shovelMode = false;
        this.adminPanelOpen = false;
        this.cooldownsDisabled = false;
        this.infiniteSunEnabled = false;
        this.savedSunAmount = 0;
        this.doomShroomCratersEnabled = true;
        this.zombieSpawningEnabled = true;
        this.selectedUpgradePlant = null;
        this.hoveredPlant = null;
        this.cobCannonAiming = null;
        this.plants = [];
        this.zombies = [];
        this.projectiles = [];
        this.suns = [];
        this.particles = [];
        this.floatingTexts = [];
        this.muzzleFlashes = [];
        this.clouds = [];
        this.explosionRings = [];
        this.lawnmowers = [];
        this.craters = [];

        this.wave = 1;
        this.zombiesInWave = 0;
        this.zombiesSpawned = 0;
        this.waveTimer = 0;
        this.spawnTimer = 0;
        this.waveAssaultActive = false;
        this.zombossActive = false;
        this.flagZombieSpawned = false;
        this.skySunTimer = 0;

        this.isPlaying = false;
        this.isPaused = false;
        this.isGameOver = false;
        this.won = false;

        this.screenShake = 0;
        this.screenFlash = 0;
        this.flashColor = '#fff';
        this.time = 0;

        this.cooldowns = {};
        for (const key of Object.keys(PLANT_TYPES)) {
            this.cooldowns[key] = 0;
        }

        this.lastTime = 0;
        this.mouseX = 0;
        this.mouseY = 0;

        this.initClouds();
        this.initStars();
        this.init();
    }

    initClouds() {
        this.clouds = [];
        const theme = this.levelConfig?.theme || 'day';
        const count = theme === 'night' ? 2 : theme === 'roof' ? 3 : 5;
        for (let i = 0; i < count; i++) {
            this.clouds.push({
                x: Math.random() * 800,
                y: 15 + Math.random() * 40,
                w: 60 + Math.random() * 50,
                speed: 8 + Math.random() * 12,
                opacity: theme === 'night' ? 0.15 + Math.random() * 0.1 : 0.4 + Math.random() * 0.3,
            });
        }
    }

    init() {
        this.setupLevelSelect();
        this.setupPlantBar();
        this.setupEventListeners();
    }

    resizeCanvas() {
        this.canvas.width = this.lawnX + this.cols * this.cellW + 20;
        this.canvas.height = this.lawnY + this.rows * this.cellH + 120;
    }

    applyLevel(levelId) {
        const level = LEVELS[levelId] || LEVELS.day;
        this.currentLevel = level.id;
        this.levelConfig = level;
        this.rows = level.rows;
        this.cols = level.cols;
        this.waterCells = new Set(level.waterCells);
        this.resizeCanvas();
        this.initClouds();
        this.initStars();
    }

    setupLevelSelect() {
        const grid = document.getElementById('levelGrid');
        grid.innerHTML = '';
        for (const level of Object.values(LEVELS)) {
            const card = document.createElement('div');
            card.className = 'level-card' + (level.id === this.currentLevel ? ' selected' : '');
            card.dataset.level = level.id;
            card.innerHTML = `
                <span class="level-icon">${level.icon}</span>
                <span class="level-title">${level.name}</span>
                <span class="level-desc">${level.description}</span>
            `;
            card.addEventListener('click', () => this.selectLevel(level.id));
            grid.appendChild(card);
        }
        this.updateLevelSelectUI();
    }

    selectLevel(levelId) {
        this.currentLevel = levelId;
        document.querySelectorAll('.level-card').forEach((card) => {
            card.classList.toggle('selected', card.dataset.level === levelId);
        });
        this.updateLevelSelectUI();
    }

    updateLevelSelectUI() {
        const level = LEVELS[this.currentLevel];
        document.getElementById('selectedLevelName').textContent = level.name;
    }

    getAvailablePlantTypes() {
        return Object.keys(PLANT_TYPES);
    }

    showPlantSelectScreen() {
        const level = LEVELS[this.currentLevel];
        this.pendingLoadout = [...(this.plantLoadouts[this.currentLevel] || [])];

        document.getElementById('menuScreen').classList.remove('active');
        document.getElementById('gameScreen').classList.remove('active');
        document.getElementById('plantSelectScreen').classList.add('active');
        document.getElementById('plantSelectLevelName').textContent = level.name;

        this.renderPlantSelectGrid();
        this.updatePlantSelectUI();
    }

    renderPlantSelectGrid() {
        const grid = document.getElementById('plantSelectGrid');
        grid.innerHTML = '';

        for (const type of this.getAvailablePlantTypes()) {
            const data = PLANT_TYPES[type];
            const card = document.createElement('div');
            card.className = 'plant-card';
            card.dataset.type = type;
            card.innerHTML = `
                <span class="card-icon">${data.icon}</span>
                <span class="card-name">${data.name}</span>
                <span class="card-cost">${data.cost}</span>
            `;
            card.addEventListener('click', () => this.toggleLoadoutPlant(type));
            grid.appendChild(card);
        }
    }

    toggleLoadoutPlant(type) {
        const index = this.pendingLoadout.indexOf(type);
        if (index >= 0) {
            this.pendingLoadout.splice(index, 1);
        } else if (this.pendingLoadout.length < MAX_LOADOUT_PLANTS) {
            this.pendingLoadout.push(type);
        }
        this.updatePlantSelectUI();
    }

    updatePlantSelectUI() {
        const count = this.pendingLoadout.length;
        const countEl = document.getElementById('plantSelectCount');
        const atLimit = count >= MAX_LOADOUT_PLANTS;

        countEl.textContent = `${count} / ${MAX_LOADOUT_PLANTS} selected`;
        countEl.classList.toggle('full', atLimit);

        document.getElementById('plantSelectStartBtn').disabled = count === 0;

        document.querySelectorAll('#plantSelectGrid .plant-card').forEach((card) => {
            const type = card.dataset.type;
            const picked = this.pendingLoadout.includes(type);
            card.classList.toggle('picked', picked);
            card.classList.toggle('at-limit', atLimit && !picked);
        });
    }

    confirmPlantLoadoutAndStart() {
        if (this.pendingLoadout.length === 0) return;
        this.selectedPlants = [...this.pendingLoadout];
        this.plantLoadouts[this.currentLevel] = [...this.selectedPlants];
        this.startGame();
    }

    isWaterCell(row, col) {
        return this.waterCells.has(`${row},${col}`);
    }

    hasCraterAt(row, col) {
        return this.craters.some((c) => c.row === row && c.col === col);
    }

    getCraterAt(row, col) {
        return this.craters.find((c) => c.row === row && c.col === col);
    }

    canPlantAt(row, col) {
        return row >= 0 && row < this.rows && col >= 0 && col < this.cols
            && !this.isWaterCell(row, col) && !this.hasCraterAt(row, col);
    }

    plantOccupiesCell(plant, row, col) {
        if (plant.row !== row || plant.hp <= 0) return false;
        if (plant.type === 'cobcannon') {
            const span = plant.spanCols || 2;
            return col >= plant.col && col < plant.col + span;
        }
        return plant.col === col;
    }

    getPlantsAt(row, col) {
        return this.plants.filter((p) => this.plantOccupiesCell(p, row, col));
    }

    hasCobCannonCovering(row, col) {
        return this.plants.some(
            (p) => p.type === 'cobcannon' && p.hp > 0 && p.row === row
                && col >= p.col && col < p.col + (p.spanCols || 2)
        );
    }

    getKernelPairForCobCannon(row, col) {
        const tryPair = (leftCol) => {
            if (leftCol < 0 || leftCol + 1 >= this.cols) return null;
            if (this.hasCobCannonCovering(row, leftCol) || this.hasCobCannonCovering(row, leftCol + 1)) return null;
            if (this.hasCraterAt(row, leftCol) || this.hasCraterAt(row, leftCol + 1)) return null;

            const left = this.plants.find(
                (p) => p.row === row && p.col === leftCol && p.type === 'kernelpult' && p.hp > 0
            );
            const right = this.plants.find(
                (p) => p.row === row && p.col === leftCol + 1 && p.type === 'kernelpult' && p.hp > 0
            );
            if (!left || !right) return null;
            return { leftCol, kernels: [left, right] };
        };

        return tryPair(col) || tryPair(col - 1);
    }

    isCarrierPlant(type) {
        return type === 'lilypad' || type === 'flowerpot';
    }

    isWaterOnlyPlant(type) {
        return type === 'tanglekelp';
    }

    canTangleKelpGrab(zombie) {
        if (!zombie || zombie.isBoss || zombie.dying || zombie.hp <= 0 || zombie.grabbedByKelp) return false;
        return !isGargantuarType(zombie.type);
    }

    getRequiredCarrier(row, col) {
        if (this.isWaterCell(row, col)) return 'lilypad';
        if (this.currentLevel === 'roof') return 'flowerpot';
        return null;
    }

    hasCarrierAt(row, col, carrierType) {
        return this.plants.some(
            (p) => p.row === row && p.col === col && p.type === carrierType && p.hp > 0
        );
    }

    canPlacePlant(row, col, plantType) {
        if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return false;
        if (this.hasCraterAt(row, col)) return false;

        const here = this.getPlantsAt(row, col);
        const requiredCarrier = this.getRequiredCarrier(row, col);
        const hasTopPlant = here.some((p) => !this.isCarrierPlant(p.type));

        if (plantType === 'tanglekelp') {
            return this.isWaterCell(row, col) && here.length === 0;
        }

        if (plantType === 'wintermelon') {
            return here.some((p) => p.type === 'melonpult' && p.hp > 0)
                && !here.some((p) => p.type === 'wintermelon');
        }

        if (plantType === 'twinsunflower') {
            return here.some((p) => p.type === 'sunflower' && p.hp > 0)
                && !here.some((p) => p.type === 'twinsunflower');
        }

        if (plantType === 'gatlingpea') {
            return here.some((p) => p.type === 'peashooter' && p.hp > 0)
                && !here.some((p) => p.type === 'gatlingpea');
        }

        if (plantType === 'cobcannon') {
            return !!this.getKernelPairForCobCannon(row, col);
        }

        if (plantType === 'coffeebean') {
            if (this.levelConfig.theme === 'night') return false;
            const mushroom = here.find((p) => PLANT_TYPES[p.type]?.mushroom && p.hp > 0);
            return !!mushroom && !mushroom.coffeeAwake;
        }

        if (plantType === 'lilypad') {
            return requiredCarrier === 'lilypad' && !this.hasCarrierAt(row, col, 'lilypad') && !hasTopPlant;
        }

        if (plantType === 'flowerpot') {
            return requiredCarrier === 'flowerpot' && !this.hasCarrierAt(row, col, 'flowerpot') && !hasTopPlant;
        }

        if (requiredCarrier) {
            return this.hasCarrierAt(row, col, requiredCarrier) && !hasTopPlant;
        }

        return here.length === 0;
    }

    initLawnmowers() {
        this.lawnmowers = [];
        for (let row = 0; row < this.rows; row++) {
            this.lawnmowers.push({
                row,
                state: 'idle',
                x: this.lawnX - 22,
                y: this.lawnY + row * this.cellH + this.cellH / 2,
            });
        }
    }

    initRoofStarterFlowerPots() {
        if (this.currentLevel !== 'roof') return;

        const data = PLANT_TYPES.flowerpot;
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < ROOF_STARTER_POT_COLS; col++) {
                const px = this.lawnX + col * this.cellW + this.cellW / 2;
                const py = this.lawnY + row * this.cellH + this.cellH / 2;
                this.plants.push({
                    type: 'flowerpot',
                    row,
                    col,
                    x: px,
                    y: py,
                    level: 1,
                    hp: data.hp,
                    maxHp: data.hp,
                    shootTimer: 0,
                    sunTimer: 0,
                    explodeTimer: 0,
                    armTimer: null,
                    armed: false,
                    spawnScale: 1,
                    spawnAnim: 0,
                    upgradeAnim: 0,
                });
            }
        }
    }

    activateLawnmower(mower) {
        if (!mower || mower.state !== 'idle') return;
        mower.state = 'active';
        mower.x = this.lawnX - 18;
        this.addScreenShake(8);
        this.audio.play('mower');
        this.spawnParticles(mower.x, mower.y, '#e85d04', 10, 'sparkle');
    }

    initStars() {
        this.stars = [];
        if (this.levelConfig.theme !== 'night') return;
        for (let i = 0; i < 40; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * (this.lawnY + 30),
                size: 1 + Math.random() * 2,
                twinkle: Math.random() * Math.PI * 2,
            });
        }
    }

    setupPlantBar() {
        const bar = document.getElementById('plantBar');
        bar.innerHTML = '';
        const loadout = this.selectedPlants;

        for (const type of loadout) {
            const data = PLANT_TYPES[type];
            if (!data) continue;

            const card = document.createElement('div');
            card.className = 'plant-card';
            card.dataset.type = type;
            card.innerHTML = `
                <span class="card-icon">${data.icon}</span>
                <span class="card-name">${data.name}</span>
                <span class="card-cost">${data.cost}</span>
                <div class="cooldown-overlay" style="height: 0%"></div>
            `;
            card.addEventListener('click', () => this.selectPlant(type));
            bar.appendChild(card);
        }

        const shovel = document.createElement('div');
        shovel.className = 'plant-card shovel-card';
        shovel.id = 'shovelCard';
        shovel.innerHTML = `
            <span class="card-icon">🪏</span>
            <span class="card-name">Shovel</span>
        `;
        shovel.addEventListener('click', () => this.toggleShovelMode());
        bar.appendChild(shovel);
    }

    setupEventListeners() {
        document.getElementById('startBtn').addEventListener('click', () => {
            this.audio.init();
            this.showPlantSelectScreen();
        });
        document.getElementById('plantSelectBackBtn').addEventListener('click', () => this.returnToMenu());
        document.getElementById('plantSelectStartBtn').addEventListener('click', () => this.confirmPlantLoadoutAndStart());
        document.getElementById('restartBtn').addEventListener('click', () => this.startGame());
        document.getElementById('menuBtn').addEventListener('click', () => this.returnToMenu());
        document.getElementById('resumeBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('pauseRestartBtn').addEventListener('click', () => this.startGame());
        document.getElementById('pauseMenuBtn').addEventListener('click', () => this.returnToMenu());
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('muteBtn').addEventListener('click', () => {
            const muted = this.audio.toggleMute();
            document.getElementById('muteBtn').textContent = muted ? '🔇' : '🔊';
        });
        document.getElementById('upgradeModeBtn').addEventListener('click', () => this.toggleUpgradeMode());
        document.getElementById('closeUpgradeBtn').addEventListener('click', () => this.hideUpgradePanel());
        document.getElementById('confirmUpgradeBtn').addEventListener('click', () => this.confirmUpgrade());
        document.getElementById('closeAdminBtn').addEventListener('click', () => this.toggleAdminPanel(false));
        document.getElementById('adminToggleInfiniteSunBtn').addEventListener('click', () => this.adminToggleInfiniteSun());
        document.getElementById('adminToggleZombieSpawningBtn').addEventListener('click', () => this.adminToggleZombieSpawning());
        document.getElementById('adminSpawnZombieBtn').addEventListener('click', () => this.adminSpawnZombie('regular'));
        document.getElementById('adminSpawnConeBtn').addEventListener('click', () => this.adminSpawnZombie('cone'));
        document.getElementById('adminSpawnBucketBtn').addEventListener('click', () => this.adminSpawnZombie('bucket'));
        document.getElementById('adminSpawnAllStarBtn').addEventListener('click', () => this.adminSpawnZombie('allstar'));
        document.getElementById('adminSpawnGargBtn').addEventListener('click', () => this.adminSpawnZombie('gargantuar'));
        document.getElementById('adminSpawnGigaGargBtn').addEventListener('click', () => this.adminSpawnZombie('gigagargantuar'));
        document.getElementById('adminSpawnImpBtn').addEventListener('click', () => this.adminSpawnZombie('imp'));
        document.getElementById('adminSpawnHypnoZombieBtn').addEventListener('click', () => this.adminSpawnHypnotizedZombie('regular'));
        document.getElementById('adminSpawnHypnoConeBtn').addEventListener('click', () => this.adminSpawnHypnotizedZombie('cone'));
        document.getElementById('adminSpawnHypnoBucketBtn').addEventListener('click', () => this.adminSpawnHypnotizedZombie('bucket'));
        document.getElementById('adminSpawnHypnoAllStarBtn').addEventListener('click', () => this.adminSpawnHypnotizedZombie('allstar'));
        document.getElementById('adminSpawnHypnoGargBtn').addEventListener('click', () => this.adminSpawnHypnotizedZombie('gargantuar'));
        document.getElementById('adminSpawnHypnoGigaGargBtn').addEventListener('click', () => this.adminSpawnHypnotizedZombie('gigagargantuar'));
        document.getElementById('adminSpawnHypnoImpBtn').addEventListener('click', () => this.adminSpawnHypnotizedZombie('imp'));
        document.getElementById('adminSpawnHypnoZombossBtn').addEventListener('click', () => this.adminSpawnHypnotizedZomboss());
        document.getElementById('adminSpawnZombossBtn').addEventListener('click', () => this.adminSpawnZomboss());
        document.getElementById('adminForceWaveBtn').addEventListener('click', () => this.adminForceWave());
        document.getElementById('adminToggleCooldownsBtn').addEventListener('click', () => this.adminToggleCooldowns());
        document.getElementById('adminToggleDoomCratersBtn').addEventListener('click', () => this.adminToggleDoomCraters());

        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;
            this.hoveredPlant = this.getPlantAt(this.mouseX, this.mouseY);
            this.updateCursor();
        });

        window.addEventListener('keydown', (e) => {
            if (e.key === 'p' || e.key === 'P') this.togglePause();
            if (e.key === 'u' || e.key === 'U') this.toggleUpgradeMode();
            if (e.key === 'g' || e.key === 'G') this.toggleAdminPanel();
            if (e.key === 'Escape') {
                this.deselectPlant();
                this.hideUpgradePanel();
                if (this.upgradeMode) this.toggleUpgradeMode(false);
                if (this.shovelMode) this.toggleShovelMode(false);
            }
        });
    }

    updateCursor() {
        let overSun = false;
        for (const s of this.suns) {
            if (Math.hypot(this.mouseX - s.x, this.mouseY - s.y) < s.radius + 10) {
                overSun = true;
                break;
            }
        }
        if (overSun) {
            this.canvas.style.cursor = 'pointer';
        } else if ((this.upgradeMode || this.shovelMode) && this.hoveredPlant) {
            this.canvas.style.cursor = 'pointer';
        } else if (this.shovelMode) {
            this.canvas.style.cursor = 'crosshair';
        } else if (this.selectedPlant) {
            this.canvas.style.cursor = 'crosshair';
        } else {
            this.canvas.style.cursor = 'default';
        }
    }

    deselectPlant() {
        this.selectedPlant = null;
        this.cobCannonAiming = null;
        document.querySelectorAll('.plant-card').forEach((c) => c.classList.remove('selected'));
    }

    toggleUpgradeMode(force) {
        if (!this.isPlaying || this.isGameOver) return;
        this.upgradeMode = typeof force === 'boolean' ? force : !this.upgradeMode;
        document.getElementById('upgradeModeBtn').classList.toggle('active', this.upgradeMode);
        if (this.upgradeMode) {
            this.deselectPlant();
            this.toggleShovelMode(false);
        } else {
            this.hideUpgradePanel();
        }
    }

    toggleShovelMode(force) {
        if (!this.isPlaying || this.isGameOver) return;
        this.shovelMode = typeof force === 'boolean' ? force : !this.shovelMode;
        document.getElementById('shovelCard')?.classList.toggle('selected', this.shovelMode);
        if (this.shovelMode) {
            this.deselectPlant();
            this.toggleUpgradeMode(false);
            this.hideUpgradePanel();
        }
    }

    removePlant(plant) {
        if (!plant || plant.hp <= 0) return;
        if (this.selectedUpgradePlant === plant) this.hideUpgradePanel();
        plant.hp = 0;
        this.spawnParticles(plant.x, plant.y, '#8b6914', 10, 'debris');
        this.audio.play('shovel');
    }

    toggleAdminPanel(force) {
        if (!this.isPlaying) return;
        this.adminPanelOpen = typeof force === 'boolean' ? force : !this.adminPanelOpen;
        document.getElementById('adminPanel').classList.toggle('hidden', !this.adminPanelOpen);
    }

    adminToggleInfiniteSun() {
        if (!this.isPlaying || this.isGameOver) return;
        if (!this.infiniteSunEnabled) {
            this.savedSunAmount = this.sun;
            this.infiniteSunEnabled = true;
        } else {
            this.sun = this.savedSunAmount;
            this.infiniteSunEnabled = false;
        }
        this.updateAdminInfiniteSunButton();
        this.updateHUD();
        this.updatePlantBar();
        if (this.selectedUpgradePlant) this.showUpgradePanel(this.selectedUpgradePlant);
    }

    updateAdminInfiniteSunButton() {
        const btn = document.getElementById('adminToggleInfiniteSunBtn');
        if (!btn) return;
        btn.classList.toggle('active', this.infiniteSunEnabled);
        btn.textContent = this.infiniteSunEnabled ? 'Infinite Sun: ON' : 'Infinite Sun: OFF';
    }

    adminToggleZombieSpawning() {
        if (!this.isPlaying || this.isGameOver) return;
        this.zombieSpawningEnabled = !this.zombieSpawningEnabled;
        if (!this.zombieSpawningEnabled) {
            this.zombies = [];
        }
        this.updateAdminZombieSpawningButton();
        this.updateHUD();
    }

    updateAdminZombieSpawningButton() {
        const btn = document.getElementById('adminToggleZombieSpawningBtn');
        if (!btn) return;
        btn.classList.toggle('active', !this.zombieSpawningEnabled);
        btn.textContent = this.zombieSpawningEnabled ? 'Zombie Spawning: ON' : 'Zombie Spawning: OFF';
    }

    hasEnoughSun(cost) {
        return this.infiniteSunEnabled || this.sun >= cost;
    }

    spendSun(cost) {
        if (!this.infiniteSunEnabled) this.sun -= cost;
    }

    adminSpawnZombie(type) {
        if (!this.isPlaying || this.isGameOver) return;
        this.spawnZombie(type);
        this.updateHUD();
    }

    adminSpawnHypnotizedZombie(type) {
        if (!this.isPlaying || this.isGameOver) return;
        this.spawnHypnotizedZombie(type);
        this.updateHUD();
    }

    adminSpawnHypnotizedZomboss() {
        if (!this.isPlaying || this.isGameOver) return;
        const hypnoBossAlive = this.zombies.some((z) => z.isBoss && z.hypnotized && !z.dying && z.hp > 0);
        if (hypnoBossAlive) return;
        this.spawnHypnotizedZomboss();
        this.updateHUD();
    }

    adminSpawnZomboss() {
        if (!this.isPlaying || this.isGameOver) return;
        const bossAlive = this.zombies.some((z) => z.isBoss && !z.dying && z.hp > 0);
        if (bossAlive) return;

        this.zombossActive = true;
        this.waveAssaultActive = true;
        this.zombiesSpawned = this.zombiesInWave;
        this.spawnZomboss();
        this.addFloatingText(
            this.lawnX + (this.cols * this.cellW) / 2,
            this.lawnY + 60,
            'DR. ZOMBOSS!',
            '#e63946',
            2.5,
            30
        );
        this.updateHUD();
    }

    getZombiesInWave(wave) {
        if (wave <= 1) return 5;
        return 8 + wave * 3;
    }

    spawnDiverseWave(count) {
        const pool = [...SPAWN_WAVE_TYPES].sort(() => Math.random() - 0.5);
        for (let i = 0; i < count; i++) {
            this.spawnZombie(pool[i % pool.length]);
        }
    }

    adminForceWave() {
        if (!this.isPlaying || this.isGameOver) return;
        const count = this.getZombiesInWave(Math.max(2, this.wave));
        this.spawnDiverseWave(count);
        this.showWaveBanner();
        this.audio.play('wave');
        this.updateHUD();
    }

    adminToggleCooldowns() {
        if (!this.isPlaying || this.isGameOver) return;
        this.cooldownsDisabled = !this.cooldownsDisabled;
        if (this.cooldownsDisabled) {
            for (const key of Object.keys(this.cooldowns)) this.cooldowns[key] = 0;
        }
        this.updateAdminCooldownButton();
        this.updatePlantBar();
    }

    updateAdminCooldownButton() {
        const btn = document.getElementById('adminToggleCooldownsBtn');
        if (!btn) return;
        btn.classList.toggle('active', this.cooldownsDisabled);
        btn.textContent = this.cooldownsDisabled ? 'Cooldowns: OFF' : 'Cooldowns: ON';
    }

    adminToggleDoomCraters() {
        if (!this.isPlaying || this.isGameOver) return;
        this.doomShroomCratersEnabled = !this.doomShroomCratersEnabled;
        this.updateAdminDoomCratersButton();
    }

    updateAdminDoomCratersButton() {
        const btn = document.getElementById('adminToggleDoomCratersBtn');
        if (!btn) return;
        btn.classList.toggle('active', !this.doomShroomCratersEnabled);
        btn.textContent = this.doomShroomCratersEnabled ? 'Doom Craters: ON' : 'Doom Craters: OFF';
    }

    isPlantOnCooldown(type) {
        return !this.cooldownsDisabled && this.cooldowns[type] > 0;
    }

    getPlantAt(x, y) {
        let carrier = null;
        for (let i = this.plants.length - 1; i >= 0; i--) {
            const p = this.plants[i];
            if (p.hp <= 0) continue;
            const hitRadius = p.type === 'cobcannon'
                ? { w: this.cellW * 0.95, h: this.cellH * 0.55 }
                : { w: 76, h: 76 };
            if (Math.abs(x - p.x) < hitRadius.w / 2 && Math.abs(y - p.y) < hitRadius.h / 2) {
                if (!this.isCarrierPlant(p.type)) return p;
                carrier = p;
            }
        }
        return carrier;
    }

    getPlantStats(plant) {
        const idx = (plant.level || 1) - 1;
        const up = PLANT_UPGRADES[plant.type];
        if (!up?.upgradeable) return {};

        switch (plant.type) {
            case 'sunflower':
                return { sunInterval: up.sunInterval[idx], sunValue: up.sunValue[idx], sunCount: 1 };
            case 'twinsunflower':
                return {
                    sunInterval: up.sunInterval[idx],
                    sunValue: up.sunValue[idx],
                    sunCount: up.sunCount[idx],
                };
            case 'sunshroom':
                return {
                    growTime: up.growTime[idx],
                    smallSunInterval: up.smallSunInterval[idx],
                    smallSunValue: up.smallSunValue[idx],
                    grownSunInterval: up.grownSunInterval[idx],
                    grownSunValue: up.grownSunValue[idx],
                };
            case 'peashooter':
            case 'puffshroom':
            case 'gatlingpea':
                return {
                    shootInterval: up.shootInterval[idx],
                    damage: up.damage[idx],
                    shortRange: up.shortRange?.[idx],
                };
            case 'wallnut':
            case 'tallnut':
            case 'lilypad':
            case 'flowerpot':
            case 'hypnoshroom':
                return { maxHp: up.maxHp[idx] };
            case 'torchwood':
                return {
                    maxHp: up.maxHp[idx],
                    damageMult: up.damageMult[idx],
                    peaColor: up.peaColor[idx],
                };
            case 'snowpea':
                return {
                    shootInterval: up.shootInterval[idx],
                    damage: up.damage[idx],
                    slowDuration: up.slowDuration[idx],
                };
            case 'cabbagepult':
                return {
                    shootInterval: up.shootInterval[idx],
                    damage: up.damage[idx],
                };
            case 'kernelpult':
                return {
                    shootInterval: up.shootInterval[idx],
                    damage: up.damage[idx],
                    butterChance: up.butterChance[idx],
                    butterDamage: up.butterDamage[idx],
                    stunDuration: up.stunDuration[idx],
                };
            case 'melonpult':
                return {
                    shootInterval: up.shootInterval[idx],
                    damage: up.damage[idx],
                    splashDamage: up.splashDamage[idx],
                };
            case 'wintermelon':
                return {
                    shootInterval: up.shootInterval[idx],
                    damage: up.damage[idx],
                    splashDamage: up.splashDamage[idx],
                    slowDuration: up.slowDuration[idx],
                };
            case 'cobcannon':
                return {
                    maxHp: up.maxHp[idx],
                    reloadTime: up.reloadTime[idx],
                    bossHits: up.bossHits[idx],
                    blastRadius: up.blastRadius[idx],
                };
            default:
                return {};
        }
    }

    isRoofLevel() {
        return this.currentLevel === 'roof';
    }

    isPoolLevel() {
        return this.currentLevel === 'pool';
    }

    isPoolRow(row) {
        if (!this.isPoolLevel()) return false;
        for (let c = 0; c < this.cols; c++) {
            if (this.isWaterCell(row, c)) return true;
        }
        return false;
    }

    canZombieSwimInPool(type) {
        return POOL_SWIMMER_TYPES.has(type);
    }

    getGrassRows() {
        const rows = [];
        for (let r = 0; r < this.rows; r++) {
            if (!this.isPoolRow(r)) rows.push(r);
        }
        return rows;
    }

    getSpawnRowForZombie(type) {
        if (!this.isPoolLevel() || this.canZombieSwimInPool(type)) {
            return Math.floor(Math.random() * this.rows);
        }
        const grassRows = this.getGrassRows();
        return grassRows[Math.floor(Math.random() * grassRows.length)];
    }

    getRightSpawnX() {
        return this.lawnX + this.cols * this.cellW + 20;
    }

    getRightBossX() {
        return this.lawnX + (this.cols - 1) * this.cellW + this.cellW / 2;
    }

    getLeftSpawnX() {
        return this.lawnX + this.cellW / 2;
    }

    getLeftBossX() {
        return this.lawnX + this.cellW / 2;
    }

    isStraightShooter(type) {
        return type === 'peashooter' || type === 'snowpea' || type === 'gatlingpea' || type === 'puffshroom';
    }

    isMushroomAwake(plant) {
        if (!PLANT_TYPES[plant.type]?.mushroom) return true;
        if (plant.coffeeAwake) return true;
        return this.levelConfig.theme === 'night';
    }

    isZombieFrozen(zombie) {
        return (zombie.freezeTimer || 0) > 0;
    }

    getZombieSpeedMult(zombie) {
        if (this.isZombieFrozen(zombie) || zombie.butterTimer > 0) return 0;
        return zombie.slowTimer > 0 ? 0.5 : 1;
    }

    canHypnotizeZombie(zombie) {
        if (!zombie || zombie.isBoss || zombie.isFlag || zombie.dying || zombie.hp <= 0) return false;
        if (zombie.hypnotized || zombie.grabbedByKelp || zombie.throwing) return false;
        return !isGargantuarType(zombie.type);
    }

    hypnotizeZombie(zombie) {
        if (!this.canHypnotizeZombie(zombie)) return false;

        zombie.hypnotized = true;
        zombie.butterTimer = 0;
        zombie.slowTimer = 0;
        zombie.eatAnim = 0;
        zombie.isFlag = false;
        zombie.raiseTimer = 0;
        this.spawnParticles(zombie.x, zombie.y - 20, '#ff4d8d', 18, 'sparkle');
        this.spawnParticles(zombie.x, zombie.y - 30, '#c77dff', 10);
        this.addFloatingText(zombie.x, zombie.y - 45, 'HYPNOTIZED!', '#ff4d8d', 1.0, 16);
        this.audio.play('upgrade');
        return true;
    }

    markZombieHypnotized(zombie) {
        zombie.hypnotized = true;
        zombie.butterTimer = 0;
        zombie.slowTimer = 0;
        zombie.eatAnim = 0;
        zombie.isFlag = false;
        zombie.raiseTimer = 0;
        zombie.flagRaised = false;
    }

    getClosestHypnotizedTarget(zombie, range) {
        let closest = null;
        let closestDist = Infinity;

        for (const other of this.zombies) {
            if (!other.hypnotized || other.dying || other.hp <= 0) continue;
            if (other.row !== zombie.row || other.x >= zombie.x) continue;

            const dist = Math.abs(zombie.x - other.x);
            if (dist >= range || dist >= closestDist) continue;

            closestDist = dist;
            closest = other;
        }

        return closest;
    }

    updateHypnotizedZombie(zombie, dt) {
        if (zombie.freezeTimer > 0) {
            zombie.freezeTimer -= dt;
            return;
        }
        if (zombie.butterTimer > 0) zombie.butterTimer -= dt;
        if (zombie.slowTimer > 0) zombie.slowTimer -= dt;
        let attacking = false;

        const attackRange = zombie.isBoss ? 55
            : isGargantuarType(zombie.type) ? 50
                : zombie.type === 'imp' ? 28 : 36;
        const attackDamage = zombie.damage || ZOMBIE_TYPES[zombie.type]?.damage || 15;

        for (const other of this.zombies) {
            if (other === zombie || other.hypnotized || other.dying || other.hp <= 0) continue;
            if (other.row !== zombie.row || other.x <= zombie.x) continue;
            if (Math.abs(other.x - zombie.x) > attackRange) continue;

            attacking = true;
            other.hp -= attackDamage * dt;
            zombie.eatAnim += dt * 8;
            if (other.hp <= 0) this.killZombie(other);
            break;
        }

        if (!attacking && !zombie.isBoss) {
            const speedMult = this.getZombieSpeedMult(zombie);
            zombie.x += zombie.speed * speedMult * 60 * dt;
            zombie.walkAnim += dt * 6;
        } else if (!attacking) {
            zombie.walkAnim += dt * 2;
        }
    }

    getPlantAttackRange(plant) {
        const stats = this.getPlantStats(plant);
        const cells = stats.shortRange ?? PLANT_TYPES[plant.type]?.shortRange;
        return cells ? cells * this.cellW : null;
    }

    isLobShooter(type) {
        return type === 'cabbagepult' || type === 'kernelpult' || type === 'melonpult' || type === 'wintermelon';
    }

    isShootingPlant(type) {
        return this.isStraightShooter(type) || this.isLobShooter(type);
    }

    plantHasTargetInLane(plant) {
        const maxRange = this.getPlantAttackRange(plant);
        const inRange = (zombieX) => !maxRange || zombieX - plant.x <= maxRange;

        return this.zombies.some(
            (z) => !z.isBoss && !z.hypnotized && z.row === plant.row && z.x > plant.x && z.hp > 0 && !z.dying && inRange(z.x)
        ) || this.canPlantShootBoss(plant);
    }

    getLobTarget(plant) {
        const laneZombies = this.zombies
            .filter((z) => !z.isBoss && !z.hypnotized && z.row === plant.row && z.x > plant.x && z.hp > 0 && !z.dying)
            .sort((a, b) => a.x - b.x);
        if (laneZombies.length > 0) {
            return { x: laneZombies[0].x, zombie: laneZombies[0] };
        }

        const boss = this.getBoss();
        if (boss && this.isLaneEmptyForBoss(plant.row) && boss.x > plant.x) {
            return { x: boss.x, zombie: boss };
        }

        return { x: this.lawnX + this.cols * this.cellW + 20, zombie: null };
    }

    fireStraightProjectile(plant, stats) {
        const isSnow = plant.type === 'snowpea';
        const isPuff = plant.type === 'puffshroom';
        const startX = plant.x + (isPuff ? 14 : 20);
        const maxRange = this.getPlantAttackRange(plant);
        this.projectiles.push({
            x: startX,
            y: plant.y - (isPuff ? 8 : 5),
            startX,
            row: plant.row,
            speed: isPuff ? 3.2 : 4,
            damage: stats.damage || (isPuff ? 20 : 20),
            frozen: isSnow,
            slowDuration: stats.slowDuration || 3,
            color: isSnow ? '#48cae4' : (isPuff ? '#c77dff' : '#52b788'),
            lob: false,
            spore: isPuff,
            projType: isPuff ? 'spore' : undefined,
            maxRange: maxRange || undefined,
            trail: [],
        });
        this.muzzleFlashes.push({
            x: plant.x + (isPuff ? 16 : 22),
            y: plant.y - 2,
            life: 0.12,
            color: isSnow ? '#caf0f8' : (isPuff ? '#e0aaff' : '#b7e4c7'),
        });
    }

    fireLobProjectile(plant, stats) {
        const startX = plant.x + 10;
        const startY = plant.y - 22;
        const { x: targetX, zombie: targetZombie } = this.getLobTarget(plant);
        let config;

        if (plant.type === 'wintermelon') {
            config = {
                lobDuration: 1.2,
                peakHeight: 110,
                damage: stats.damage || 80,
                splashDamage: stats.splashDamage || 30,
                splash: true,
                frozen: true,
                slowDuration: stats.slowDuration || 4,
                projType: 'wintermelon',
                color: '#48cae4',
            };
        } else if (plant.type === 'melonpult') {
            config = {
                lobDuration: 1.25,
                peakHeight: 110,
                damage: stats.damage || 80,
                splashDamage: stats.splashDamage || 30,
                splash: true,
                projType: 'melon',
                color: '#52b788',
            };
        } else if (plant.type === 'kernelpult') {
            const isButter = Math.random() < (stats.butterChance || 0.2);
            config = {
                lobDuration: 1.0,
                peakHeight: 85,
                damage: isButter ? (stats.butterDamage || 40) : (stats.damage || 20),
                projType: isButter ? 'butter' : 'kernel',
                butter: isButter,
                stunDuration: stats.stunDuration || 4,
                color: isButter ? '#ffd60a' : '#f4a261',
            };
        } else {
            config = {
                lobDuration: 1.15,
                peakHeight: 100,
                damage: stats.damage || 40,
                projType: 'cabbage',
                color: '#7cb518',
            };
        }

        this.projectiles.push({
            x: startX,
            y: startY,
            startX,
            startY,
            targetX,
            targetZombie,
            row: plant.row,
            lob: true,
            lobTimer: 0,
            trail: [],
            ...config,
        });
    }

    applyLobLanding(proj) {
        let hitZombie = null;

        if (proj.targetZombie && proj.targetZombie.hp > 0 && !proj.targetZombie.dying && !proj.targetZombie.hypnotized) {
            hitZombie = proj.targetZombie;
        } else {
            const landingX = proj.x;
            for (const zombie of this.zombies) {
                if (zombie.hp <= 0 || zombie.dying || zombie.hypnotized) continue;

                if (zombie.isBoss) {
                    if (!this.isLaneEmptyForBoss(proj.row)) continue;
                    if (Math.abs(zombie.x - landingX) < 55) {
                        hitZombie = zombie;
                        break;
                    }
                    continue;
                }

                if (zombie.row !== proj.row) continue;
                if (Math.abs(zombie.x - landingX) < this.cellW * 0.8) {
                    hitZombie = zombie;
                    break;
                }
            }
        }

        if (hitZombie) {
            this.applyProjectileHit(hitZombie, proj);
            return;
        }

        if (proj.splash) {
            this.applyMelonSplash(proj, null);
        }
        this.spawnParticles(proj.x, proj.y, proj.color, 6, 'sparkle');
    }

    applyTorchwoodToProjectile(proj) {
        if (proj.lob || proj.torched || proj.spore) return;

        for (const plant of this.plants) {
            if (plant.type !== 'torchwood' || plant.hp <= 0) continue;
            if (plant.row !== proj.row) continue;

            const igniteLeft = plant.x - this.cellW * 0.32;
            const igniteRight = plant.x + this.cellW * 0.32;
            if (proj.x < igniteLeft || proj.x > igniteRight) continue;

            const stats = this.getPlantStats(plant);
            const mult = stats.damageMult ?? 2;
            const color = stats.peaColor ?? '#ff6b35';

            proj.torched = true;
            proj.damage *= mult;
            proj.color = color;
            proj.fire = true;
            proj.frozen = false;
            this.spawnParticles(proj.x, proj.y, color, 5, 'sparkle');
            break;
        }
    }

    applyMelonSplash(proj, primaryZombie) {
        const splashRows = new Set([proj.row - 1, proj.row, proj.row + 1]);
        const splashRange = 60;

        for (const zombie of this.zombies) {
            if (zombie === primaryZombie || zombie.hp <= 0 || zombie.dying) continue;
            if (!splashRows.has(zombie.row)) continue;
            if (Math.abs(zombie.x - proj.x) > splashRange) continue;

            zombie.hp -= proj.splashDamage || 30;
            this.spawnParticles(zombie.x, zombie.y - 20, proj.color, 4);
            if (zombie.hp <= 0) this.killZombie(zombie);
        }

        this.spawnParticles(proj.x, proj.y, proj.color, 10, 'sparkle');
    }

    updateProjectiles(dt) {
        for (const proj of this.projectiles) {
            proj.trail.push({ x: proj.x, y: proj.y });
            if (proj.trail.length > 6) proj.trail.shift();

            if (proj.lob) {
                proj.lobTimer += dt;
                const t = Math.min(proj.lobTimer / proj.lobDuration, 1);

                if (proj.cob) {
                    proj.x = proj.startX + (proj.targetX - proj.startX) * t;
                    const baseY = proj.startY + (proj.targetY - proj.startY) * t;
                    proj.y = baseY - Math.sin(t * Math.PI) * proj.peakHeight;
                    if (t >= 1 && !proj.hit) {
                        this.applyCobExplosion(proj);
                        proj.hit = true;
                        proj.expired = true;
                    }
                } else {
                    if (proj.targetZombie && proj.targetZombie.hp > 0 && !proj.targetZombie.dying && !proj.targetZombie.hypnotized) {
                        proj.targetX = proj.targetZombie.x;
                    } else {
                        proj.targetZombie = null;
                    }

                    proj.x = proj.startX + (proj.targetX - proj.startX) * t;
                    proj.y = proj.startY - Math.sin(t * Math.PI) * proj.peakHeight;

                    if (t >= 1 && !proj.hit) {
                        this.applyLobLanding(proj);
                        proj.hit = true;
                        proj.expired = true;
                    }
                }
            } else {
                proj.x += proj.speed * 60 * dt;
                this.applyTorchwoodToProjectile(proj);
                if (proj.maxRange && proj.x - proj.startX > proj.maxRange) {
                    proj.expired = true;
                }
                if (this.isRoofLevel() && !proj.spore) {
                    const blockDist = 45 + proj.row * 6;
                    if (proj.x - proj.startX > blockDist) {
                        if (!proj.roofBlocked) {
                            proj.roofBlocked = true;
                            this.spawnParticles(proj.x, proj.y, '#8b7355', 5, 'debris');
                        }
                        proj.expired = true;
                    }
                }
            }
        }
        this.projectiles = this.projectiles.filter((p) => p.x < this.canvas.width && !p.expired);

        for (const proj of this.projectiles) {
            if (proj.hit || proj.lob) continue;

            for (const zombie of this.zombies) {
                if (zombie.hp <= 0 || zombie.dying || zombie.hypnotized) continue;

                if (zombie.isBoss) {
                    if (!this.isLaneEmptyForBoss(proj.row)) continue;
                    if (this.isRoofLevel() && !proj.lob) continue;
                    const hitW = 42;
                    const hitH = 36;
                    const hitY = this.getBossHitY(proj.row);
                    if (Math.abs(proj.x - zombie.x) < hitW && Math.abs(proj.y - hitY) < hitH) {
                        this.applyProjectileHit(zombie, proj);
                    }
                    continue;
                }

                if (zombie.row !== proj.row) continue;
                if (this.isRoofLevel() && !proj.lob) continue;

                const hitW = zombie.type === 'gigagargantuar' ? 36
                    : isGargantuarType(zombie.type) ? 30
                        : zombie.type === 'imp' ? 14 : 20;
                const hitH = zombie.type === 'gigagargantuar' ? 52
                    : isGargantuarType(zombie.type) ? 45
                        : zombie.type === 'imp' ? 22 : 30;
                if (Math.abs(proj.x - zombie.x) < hitW && Math.abs(proj.y - zombie.y) < hitH) {
                    this.applyProjectileHit(zombie, proj);
                    break;
                }
            }
        }
        this.projectiles = this.projectiles.filter((p) => !p.hit);
    }

    applyProjectileHit(zombie, proj) {
        zombie.hp -= proj.damage;
        if (proj.frozen) zombie.slowTimer = proj.slowDuration || 3;
        if (proj.butter) zombie.butterTimer = proj.stunDuration || 4;
        proj.hit = true;
        this.spawnParticles(proj.x, proj.y, proj.color, proj.splash ? 8 : 5);
        this.audio.play('hit');
        if (zombie.hp <= 0) this.killZombie(zombie);
        if (proj.splash) this.applyMelonSplash(proj, zombie);
    }

    canUpgradePlant(plant) {
        if (!plant || !PLANT_UPGRADES[plant.type]?.upgradeable) return false;
        if ((plant.level || 1) >= getMaxPlantLevel(plant.type)) return false;
        const cost = getUpgradeCost(plant.type, plant.level || 1);
        return cost !== null && this.hasEnoughSun(cost);
    }

    showUpgradePanel(plant) {
        if (!plant || !PLANT_UPGRADES[plant.type]?.upgradeable) return;

        this.selectedUpgradePlant = plant;
        const data = PLANT_TYPES[plant.type];
        const level = plant.level || 1;
        const up = PLANT_UPGRADES[plant.type];
        const cost = getUpgradeCost(plant.type, level);

        document.getElementById('upgradePlantIcon').textContent = data.icon;
        document.getElementById('upgradePlantName').textContent = data.name;
        const maxLevel = getMaxPlantLevel(plant.type);
        document.getElementById('upgradePlantLevel').textContent =
            level >= maxLevel ? `Level ${level} — MAX` : `Level ${level} → ${level + 1}`;

        const btn = document.getElementById('confirmUpgradeBtn');
        const desc = document.getElementById('upgradeDescription');

        if (level >= maxLevel) {
            desc.textContent = up.descriptions[maxLevel - 1] + ' (max level reached)';
            btn.textContent = 'Max Level';
            btn.disabled = true;
        } else {
            desc.textContent = up.descriptions[level];
            btn.textContent = `Upgrade — ☀ ${cost}`;
            btn.disabled = !this.hasEnoughSun(cost);
        }

        document.getElementById('upgradePanel').classList.remove('hidden');
    }

    hideUpgradePanel() {
        this.selectedUpgradePlant = null;
        document.getElementById('upgradePanel').classList.add('hidden');
    }

    confirmUpgrade() {
        if (!this.selectedUpgradePlant) return;
        this.upgradePlant(this.selectedUpgradePlant);
    }

    upgradePlant(plant) {
        if (!this.canUpgradePlant(plant)) return;

        const level = plant.level || 1;
        const cost = getUpgradeCost(plant.type, level);
        const up = PLANT_UPGRADES[plant.type];
        const oldMaxHp = plant.maxHp;

        this.spendSun(cost);
        plant.level = level + 1;
        plant.upgradeAnim = 0.5;

        const stats = this.getPlantStats(plant);
        if (stats.maxHp) {
            const hpGain = stats.maxHp - oldMaxHp;
            plant.maxHp = stats.maxHp;
            plant.hp = Math.min(plant.hp + hpGain, plant.maxHp);
        }

        this.spawnParticles(plant.x, plant.y, '#ffd60a', 16, 'sparkle');
        this.addFloatingText(plant.x, plant.y - 35, `LEVEL ${plant.level}!`, '#ffd60a', 1.2, 20);
        this.pulseSunCounter();
        this.audio.play('upgrade');
        this.showUpgradePanel(plant);
        this.updateHUD();
    }

    returnToMenu() {
        this.isPlaying = false;
        this.isGameOver = false;
        this.isPaused = false;
        document.body.classList.remove('game-paused');
        document.getElementById('gameOverOverlay').classList.add('hidden');
        document.getElementById('pauseOverlay').classList.add('hidden');
        document.getElementById('levelBadge').classList.remove('visible');
        document.getElementById('gameScreen').classList.remove('active');
        document.getElementById('plantSelectScreen').classList.remove('active');
        document.getElementById('menuScreen').classList.add('active');
    }

    startGame() {
        document.getElementById('menuScreen').classList.remove('active');
        document.getElementById('plantSelectScreen').classList.remove('active');
        document.getElementById('gameScreen').classList.add('active');
        document.getElementById('gameOverOverlay').classList.add('hidden');
        document.getElementById('pauseOverlay').classList.add('hidden');
        document.body.classList.remove('game-paused');

        this.applyLevel(this.currentLevel);
        this.setupPlantBar();
        this.deselectPlant();

        const badge = document.getElementById('levelBadge');
        badge.textContent = `${this.levelConfig.icon} ${this.levelConfig.name}`;
        badge.classList.add('visible');

        this.sun = this.levelConfig.startingSun;
        this.score = 0;
        this.kills = 0;
        this.selectedPlant = null;
        this.upgradeMode = false;
        this.shovelMode = false;
        this.adminPanelOpen = false;
        this.cooldownsDisabled = false;
        this.doomShroomCratersEnabled = true;
        this.zombieSpawningEnabled = true;
        this.selectedUpgradePlant = null;
        this.hoveredPlant = null;
        this.cobCannonAiming = null;
        this.plants = [];
        this.zombies = [];
        this.projectiles = [];
        this.suns = [];
        this.particles = [];
        this.floatingTexts = [];
        this.muzzleFlashes = [];
        this.explosionRings = [];
        this.craters = [];
        this.initLawnmowers();
        this.initRoofStarterFlowerPots();
        this.wave = 1;
        this.zombiesInWave = this.getZombiesInWave(1);
        this.zombiesSpawned = 0;
        this.waveTimer = 0;
        this.spawnTimer = 0;
        this.waveAssaultActive = false;
        this.zombossActive = false;
        this.flagZombieSpawned = false;
        this.skySunTimer = 5;
        this.isPlaying = true;
        this.isPaused = false;
        this.isGameOver = false;
        this.won = false;
        this.screenShake = 0;
        this.screenFlash = 0;
        this.time = 0;

        for (const key of Object.keys(PLANT_TYPES)) {
            this.cooldowns[key] = 0;
        }

        this.infiniteSunEnabled = false;
        this.savedSunAmount = 0;
        this.toggleUpgradeMode(false);
        this.toggleShovelMode(false);
        this.toggleAdminPanel(false);
        this.updateAdminCooldownButton();
        this.updateAdminInfiniteSunButton();
        this.updateAdminZombieSpawningButton();
        this.updateAdminDoomCratersButton();
        this.hideUpgradePanel();
        this.startWave();
        this.updateHUD();
        this.lastTime = performance.now();
        requestAnimationFrame((t) => this.gameLoop(t));
    }

    showWaveBanner() {
        const banner = document.getElementById('waveBanner');
        banner.textContent = `Wave ${this.wave}!`;
        banner.classList.remove('show');
        void banner.offsetWidth;
        banner.classList.add('show');
        this.audio.play('wave');
    }

    isBossWave(wave = this.wave) {
        return wave > 0 && wave % BOSS_WAVE_INTERVAL === 0;
    }

    startWave() {
        this.waveAssaultActive = false;
        this.zombossActive = false;
        this.flagZombieSpawned = false;
        this.zombiesSpawned = 0;
        this.spawnTimer = 0;

        if (!this.zombieSpawningEnabled) return;

        if (this.isBossWave()) {
            this.startBossWave();
            return;
        }
        this.spawnFlagZombie();
    }

    startBossWave() {
        this.zombossActive = true;
        this.waveAssaultActive = true;
        this.zombiesSpawned = this.zombiesInWave;
        this.spawnZomboss();

        const banner = document.getElementById('waveBanner');
        banner.textContent = '⚠️ DR. ZOMBOSS! ⚠️';
        banner.classList.remove('show');
        void banner.offsetWidth;
        banner.classList.add('show');
        this.audio.play('wave');
        this.addFloatingText(
            this.lawnX + (this.cols * this.cellW) / 2,
            this.lawnY + 60,
            'DR. ZOMBOSS!',
            '#e63946',
            3,
            34
        );
    }

    getBoss() {
        return this.zombies.find((z) => z.isBoss && !z.dying && z.hp > 0);
    }

    isLaneEmptyForBoss(row) {
        return !this.zombies.some(
            (z) => !z.isBoss && !z.dying && z.hp > 0 && z.row === row
        );
    }

    canPlantShootBoss(plant) {
        const boss = this.getBoss();
        if (!boss || !this.isLaneEmptyForBoss(plant.row)) return false;
        const maxRange = this.getPlantAttackRange(plant);
        if (maxRange && boss.x - plant.x > maxRange) return false;
        return boss.x > plant.x;
    }

    getBossHitY(row) {
        return this.lawnY + row * this.cellH + this.cellH / 2;
    }

    spawnZomboss() {
        const data = ZOMBIE_TYPES.zomboss;
        const bossCol = this.cols - 1;
        const x = this.getRightBossX();
        const y = this.lawnY + (this.rows * this.cellH) / 2;
        this.zombies.push({
            type: 'zomboss',
            isBoss: true,
            row: Math.floor(this.rows / 2),
            col: bossCol,
            x,
            y,
            hp: data.hp,
            maxHp: data.hp,
            speed: 0,
            damage: 0,
            slowTimer: 0,
            freezeTimer: 0,
            walkAnim: 0,
            eatAnim: 0,
            dying: false,
            deathTimer: 0,
            fallAngle: 0,
            spawnTimer: 1.5,
            animTimer: 0,
            instantPlantHits: 0,
            displayHp: data.hp,
        });
    }

    spawnZombossMinion() {
        const roll = Math.random();
        let type = 'regular';
        if (roll < 0.06) type = 'gigagargantuar';
        else if (roll < 0.14) type = 'gargantuar';
        else if (roll < 0.28) type = 'allstar';
        else if (roll < 0.45) type = 'bucket';
        else if (roll < 0.65) type = 'cone';
        this.spawnZombie(type);
    }

    spawnHypnotizedZombossMinion() {
        const roll = Math.random();
        let type = 'regular';
        if (roll < 0.06) type = 'gigagargantuar';
        else if (roll < 0.14) type = 'gargantuar';
        else if (roll < 0.28) type = 'allstar';
        else if (roll < 0.45) type = 'bucket';
        else if (roll < 0.65) type = 'cone';
        this.spawnHypnotizedZombie(type);
    }

    spawnHypnotizedZombie(type, options = {}) {
        const row = options.row ?? this.getSpawnRowForZombie(type);
        const zombie = this.spawnZombie(type);
        if (!zombie) return null;

        zombie.row = row;
        zombie.x = options.x ?? this.getLeftSpawnX();
        zombie.y = this.lawnY + row * this.cellH + this.cellH / 2;

        this.markZombieHypnotized(zombie);
        this.spawnParticles(zombie.x, zombie.y - 20, '#ff4d8d', 14, 'sparkle');
        this.spawnParticles(zombie.x, zombie.y - 30, '#c77dff', 8);
        return zombie;
    }

    spawnHypnotizedZomboss() {
        const data = ZOMBIE_TYPES.zomboss;
        const bossCol = 0;
        const x = this.getLeftBossX();
        const y = this.lawnY + (this.rows * this.cellH) / 2;
        const zombie = {
            type: 'zomboss',
            isBoss: true,
            row: Math.floor(this.rows / 2),
            col: bossCol,
            x,
            y,
            hp: data.hp,
            maxHp: data.hp,
            speed: 0,
            damage: 45,
            slowTimer: 0,
            freezeTimer: 0,
            walkAnim: 0,
            eatAnim: 0,
            dying: false,
            deathTimer: 0,
            fallAngle: 0,
            spawnTimer: 1.5,
            animTimer: 0,
            instantPlantHits: 0,
            displayHp: data.hp,
            hypnotized: true,
            spawnsHypnotizedMinions: true,
        };
        this.zombies.push(zombie);
        this.spawnParticles(x, y - 30, '#ff4d8d', 24, 'sparkle');
        this.spawnParticles(x - 40, y + 20, '#c77dff', 12);
        this.addFloatingText(x, y - 70, 'HYPNOTIZED ZOMBOSS!', '#ff4d8d', 1.4, 20);
        this.audio.play('upgrade');
        return zombie;
    }

    getSpawnInterval() {
        const t = (this.wave - 1) / 9;
        const minDelay = 4.0 - t * 3.0;
        const variance = 2.5 - t * 1.8;
        return minDelay + Math.random() * variance;
    }

    getAssaultStartDelay() {
        return Math.max(0.6, 2.8 - this.wave * 0.22);
    }

    beginWaveAssault() {
        if (this.waveAssaultActive) return;
        this.waveAssaultActive = true;
        this.showWaveBanner();
        this.spawnTimer = this.getAssaultStartDelay();
    }

    spawnFlagZombie() {
        const row = this.getSpawnRowForZombie('flag');
        const data = ZOMBIE_TYPES.flag;
        this.zombies.push({
            type: 'flag',
            isFlag: true,
            row,
            x: this.lawnX + this.cols * this.cellW + 40,
            y: this.lawnY + row * this.cellH + this.cellH / 2,
            hp: data.hp,
            maxHp: data.hp,
            speed: data.speed * (this.levelConfig.zombieSpeedMult || 1),
            damage: data.damage,
            slowTimer: 0,
            freezeTimer: 0,
            walkAnim: 0,
            eatAnim: 0,
            dying: false,
            deathTimer: 0,
            fallAngle: 0,
            flagRaised: false,
            raiseTimer: 0,
            displayHp: data.hp,
        });
        this.flagZombieSpawned = true;
    }

    applyWinterMelonUpgrade(row, col) {
        const data = PLANT_TYPES.wintermelon;
        const melon = this.getPlantsAt(row, col).find((p) => p.type === 'melonpult' && p.hp > 0);
        if (!melon) return;
        if (!this.hasEnoughSun(data.cost) || this.isPlantOnCooldown('wintermelon')) return;

        this.spendSun(data.cost);
        melon.type = 'wintermelon';
        melon.upgradeAnim = 0.5;
        melon.shootTimer = 0;
        if (!this.cooldownsDisabled) this.cooldowns.wintermelon = data.cooldown;
        this.spawnParticles(melon.x, melon.y, '#48cae4', 18, 'sparkle');
        this.addFloatingText(melon.x, melon.y - 35, 'Winter Melon!', '#caf0f8', 1.2, 18);
        this.audio.play('upgrade');
        this.deselectPlant();
        this.updateHUD();
        this.updatePlantBar();
    }

    applyGatlingPeaUpgrade(row, col) {
        const data = PLANT_TYPES.gatlingpea;
        const pea = this.getPlantsAt(row, col).find((p) => p.type === 'peashooter' && p.hp > 0);
        if (!pea) return;
        if (!this.hasEnoughSun(data.cost) || this.isPlantOnCooldown('gatlingpea')) return;

        this.spendSun(data.cost);
        pea.type = 'gatlingpea';
        pea.upgradeAnim = 0.5;
        pea.shootTimer = 0;
        if (!this.cooldownsDisabled) this.cooldowns.gatlingpea = data.cooldown;
        this.spawnParticles(pea.x, pea.y, '#52b788', 18, 'sparkle');
        this.addFloatingText(pea.x, pea.y - 35, 'Gatling Pea!', '#b7e4c7', 1.2, 18);
        this.audio.play('upgrade');
        this.deselectPlant();
        this.updateHUD();
        this.updatePlantBar();
    }

    applyTwinSunflowerUpgrade(row, col) {
        const data = PLANT_TYPES.twinsunflower;
        const sunflower = this.getPlantsAt(row, col).find((p) => p.type === 'sunflower' && p.hp > 0);
        if (!sunflower) return;
        if (!this.hasEnoughSun(data.cost) || this.isPlantOnCooldown('twinsunflower')) return;

        this.spendSun(data.cost);
        sunflower.type = 'twinsunflower';
        sunflower.upgradeAnim = 0.5;
        sunflower.sunTimer = 0;
        if (!this.cooldownsDisabled) this.cooldowns.twinsunflower = data.cooldown;
        this.spawnParticles(sunflower.x, sunflower.y, '#ffd60a', 20, 'sparkle');
        this.addFloatingText(sunflower.x, sunflower.y - 35, 'Twin Sunflower!', '#ffd60a', 1.2, 18);
        this.audio.play('upgrade');
        this.deselectPlant();
        this.updateHUD();
        this.updatePlantBar();
    }

    applyCobCannonUpgrade(row, col) {
        const pair = this.getKernelPairForCobCannon(row, col);
        if (!pair) return;

        const data = PLANT_TYPES.cobcannon;
        if (!this.hasEnoughSun(data.cost) || this.isPlantOnCooldown('cobcannon')) return;

        this.spendSun(data.cost);
        if (!this.cooldownsDisabled) this.cooldowns.cobcannon = data.cooldown;

        for (const kernel of pair.kernels) {
            kernel.hp = 0;
        }
        this.plants = this.plants.filter((p) => p.hp > 0);

        const leftCol = pair.leftCol;
        const px = this.lawnX + leftCol * this.cellW + this.cellW;
        const py = this.lawnY + row * this.cellH + this.cellH / 2;

        this.plants.push({
            type: 'cobcannon',
            row,
            col: leftCol,
            spanCols: 2,
            x: px,
            y: py,
            level: 1,
            hp: data.hp,
            maxHp: data.hp,
            shootTimer: 0,
            sunTimer: 0,
            reloadTimer: 0,
            spawnScale: 0,
            spawnAnim: 0.4,
            upgradeAnim: 0.5,
            grabbing: false,
            grabTarget: null,
            grabTimer: 0,
            growTimer: null,
            squashAttacking: false,
            squashTimer: 0,
            squashTarget: null,
            squashLanded: false,
            jumpOffset: 0,
            squashLandX: 0,
            boomArmed: false,
            boomTimer: 0,
        });

        this.spawnParticles(px, py, '#d4a373', 24, 'burst');
        this.spawnParticles(px, py, '#ffba08', 14, 'sparkle');
        this.addFloatingText(px, py - 45, 'Cob Cannon!', '#ffba08', 1.4, 20);
        this.audio.play('upgrade');
        this.deselectPlant();
        this.updateHUD();
        this.updatePlantBar();
    }

    fireCobCannon(plant, targetX, targetY) {
        const col = Math.floor((targetX - this.lawnX) / this.cellW);
        const row = Math.floor((targetY - this.lawnY) / this.cellH);
        if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) return false;
        if (plant.reloadTimer > 0) return false;

        const landX = this.lawnX + col * this.cellW + this.cellW / 2;
        const landY = this.lawnY + row * this.cellH + this.cellH / 2;
        const stats = this.getPlantStats(plant);

        this.projectiles.push({
            x: plant.x,
            y: plant.y - 28,
            startX: plant.x,
            startY: plant.y - 28,
            targetX: landX,
            targetY: landY,
            lob: true,
            cob: true,
            lobTimer: 0,
            lobDuration: 2.4,
            peakHeight: 200,
            blastRadius: stats.blastRadius ?? 1,
            bossHits: stats.bossHits ?? 1,
            trail: [],
        });

        plant.reloadTimer = stats.reloadTime || PLANT_TYPES.cobcannon.reloadTime || 36;
        this.spawnParticles(plant.x, plant.y - 20, '#ffba08', 12, 'sparkle');
        this.audio.play('shoot');
        this.addFloatingText(plant.x, plant.y - 55, 'FIRE!', '#ffd60a', 0.9, 16);
        return true;
    }

    applyCobExplosion(proj) {
        const col = Math.floor((proj.targetX - this.lawnX) / this.cellW);
        const row = Math.floor((proj.targetY - this.lawnY) / this.cellH);
        const radius = proj.blastRadius ?? 1;
        const bossHits = proj.bossHits ?? 1;

        for (let dr = -radius; dr <= radius; dr++) {
            for (let dc = -radius; dc <= radius; dc++) {
                const r = row + dr;
                const c = col + dc;
                if (r < 0 || r >= this.rows || c < 0 || c >= this.cols) continue;
                const fx = this.lawnX + c * this.cellW + this.cellW / 2;
                const fy = this.lawnY + r * this.cellH + this.cellH / 2;
                this.spawnParticles(fx, fy, '#ffba08', 14, 'explosion');
                this.spawnParticles(fx, fy, '#e85d04', 8, 'debris');
                this.explosionRings.push({ x: fx, y: fy, radius: 10 + radius * 2, life: 0.55, color: '#ffba08' });
            }
        }

        this.addScreenShake(20 + radius * 6);
        this.addScreenFlash('#ffba08', 0.75);
        this.audio.play('explode');
        this.addFloatingText(proj.targetX, proj.targetY - 50, 'KABOOM!', '#ffd60a', 2, 26);

        for (const zombie of [...this.zombies]) {
            if (zombie.dying || zombie.hp <= 0) continue;
            const zCol = Math.floor((zombie.x - this.lawnX) / this.cellW);
            if (Math.abs(zCol - col) > radius) continue;
            if (Math.abs(zombie.row - row) > radius) continue;

            if (zombie.isBoss) {
                for (let i = 0; i < bossHits; i++) {
                    if (zombie.hp <= 0 || zombie.dying) break;
                    this.applyInstantPlantHit(zombie);
                }
                continue;
            }
            this.applyInstantPlantHit(zombie);
        }
    }

    applyCoffeeBean(row, col) {
        const data = PLANT_TYPES.coffeebean;
        const mushroom = this.getPlantsAt(row, col).find((p) => PLANT_TYPES[p.type]?.mushroom && p.hp > 0);
        if (!mushroom || mushroom.coffeeAwake) return;
        if (!this.hasEnoughSun(data.cost) || this.isPlantOnCooldown('coffeebean')) return;

        this.spendSun(data.cost);
        mushroom.coffeeAwake = true;
        mushroom.upgradeAnim = 0.5;
        if (!this.cooldownsDisabled) this.cooldowns.coffeebean = data.cooldown;
        this.spawnParticles(mushroom.x, mushroom.y, '#6f4e37', 14, 'sparkle');
        this.spawnParticles(mushroom.x, mushroom.y - 10, '#ffd60a', 8);
        this.addFloatingText(mushroom.x, mushroom.y - 35, 'Wide awake!', '#ffd60a', 1.0, 16);
        if (mushroom.type === 'boomshroom') {
            this.armBoomShroom(mushroom);
        }
        this.audio.play('plant');
        this.deselectPlant();
        this.updateHUD();
        this.updatePlantBar();
    }

    selectPlant(type) {
        if (!this.isPlaying || this.isPaused || this.isGameOver) return;
        const data = PLANT_TYPES[type];
        if (!this.hasEnoughSun(data.cost) || this.isPlantOnCooldown(type)) return;

        if (this.upgradeMode) this.toggleUpgradeMode(false);
        if (this.shovelMode) this.toggleShovelMode(false);
        this.hideUpgradePanel();
        this.cobCannonAiming = null;
        this.selectedPlant = this.selectedPlant === type ? null : type;
        document.querySelectorAll('.plant-card').forEach((card) => {
            card.classList.toggle('selected', card.dataset.type === this.selectedPlant);
        });
    }

    handleClick(e) {
        if (!this.isPlaying || this.isPaused || this.isGameOver) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (this.cobCannonAiming) {
            const col = Math.floor((x - this.lawnX) / this.cellW);
            const row = Math.floor((y - this.lawnY) / this.cellH);
            if (col >= 0 && col < this.cols && row >= 0 && row < this.rows) {
                this.fireCobCannon(this.cobCannonAiming, x, y);
            }
            this.cobCannonAiming = null;
            return;
        }

        if (this.upgradeMode) {
            const plant = this.getPlantAt(x, y);
            if (plant) this.showUpgradePanel(plant);
            return;
        }

        if (this.shovelMode) {
            const plant = this.getPlantAt(x, y);
            if (plant) this.removePlant(plant);
            return;
        }

        if (!this.selectedPlant) {
            const clickedPlant = this.getPlantAt(x, y);
            if (clickedPlant?.type === 'cobcannon' && clickedPlant.reloadTimer <= 0) {
                this.cobCannonAiming = clickedPlant;
                this.addFloatingText(clickedPlant.x, clickedPlant.y - 60, 'Select target!', '#ffd60a', 1.1, 16);
                this.audio.play('plant');
            }
            return;
        }

        const col = Math.floor((x - this.lawnX) / this.cellW);
        const row = Math.floor((y - this.lawnY) / this.cellH);

        if (!this.canPlacePlant(row, col, this.selectedPlant)) return;

        const data = PLANT_TYPES[this.selectedPlant];
        if (!this.hasEnoughSun(data.cost) || this.isPlantOnCooldown(this.selectedPlant)) return;

        const px = this.lawnX + col * this.cellW + this.cellW / 2;
        const py = this.lawnY + row * this.cellH + this.cellH / 2;

        if (this.selectedPlant === 'doomshroom') {
            this.activateDoomShroom(row, col, px, py);
            this.spendSun(data.cost);
            if (!this.cooldownsDisabled) this.cooldowns.doomshroom = data.cooldown;
            this.deselectPlant();
            this.updateHUD();
            this.updatePlantBar();
            return;
        }

        if (this.selectedPlant === 'jalapeno') {
            this.activateJalapeno(row, px, py);
            this.spendSun(data.cost);
            if (!this.cooldownsDisabled) this.cooldowns.jalapeno = data.cooldown;
            this.deselectPlant();
            this.updateHUD();
            this.updatePlantBar();
            return;
        }

        if (this.selectedPlant === 'iceshroom') {
            this.activateIceShroom(px, py);
            this.spendSun(data.cost);
            if (!this.cooldownsDisabled) this.cooldowns.iceshroom = data.cooldown;
            this.deselectPlant();
            this.updateHUD();
            this.updatePlantBar();
            return;
        }

        if (this.selectedPlant === 'wintermelon') {
            this.applyWinterMelonUpgrade(row, col);
            return;
        }

        if (this.selectedPlant === 'gatlingpea') {
            this.applyGatlingPeaUpgrade(row, col);
            return;
        }

        if (this.selectedPlant === 'twinsunflower') {
            this.applyTwinSunflowerUpgrade(row, col);
            return;
        }

        if (this.selectedPlant === 'coffeebean') {
            this.applyCoffeeBean(row, col);
            return;
        }

        if (this.selectedPlant === 'cobcannon') {
            this.applyCobCannonUpgrade(row, col);
            return;
        }

        const stats = this.getPlantStats({ type: this.selectedPlant, level: 1 });
        const maxHp = stats.maxHp || data.hp;

        this.plants.push({
            type: this.selectedPlant,
            row,
            col,
            x: px,
            y: py,
            level: 1,
            hp: maxHp,
            maxHp,
            shootTimer: 0,
            sunTimer: 0,
            explodeTimer: this.selectedPlant === 'cherrybomb' ? 1.5 : 0,
            armTimer: this.selectedPlant === 'potatomine' ? 0 : null,
            armed: false,
            spawnScale: 0,
            spawnAnim: 0.4,
            upgradeAnim: 0,
            grabbing: false,
            grabTarget: null,
            grabTimer: 0,
            growTimer: this.selectedPlant === 'sunshroom' ? 0 : null,
            squashAttacking: false,
            squashTimer: 0,
            squashTarget: null,
            squashLanded: false,
            jumpOffset: 0,
            squashLandX: 0,
            boomArmed: false,
            boomTimer: 0,
        });

        const placed = this.plants[this.plants.length - 1];
        if (placed.type === 'boomshroom' && this.isMushroomAwake(placed)) {
            this.armBoomShroom(placed);
        }

        this.spendSun(data.cost);
        if (!this.cooldownsDisabled) this.cooldowns[this.selectedPlant] = data.cooldown;
        this.spawnParticles(px, py, data.color, 12, 'burst');
        this.audio.play('plant');
        this.deselectPlant();
        this.updateHUD();
    }

    armBoomShroom(plant) {
        if (!plant || plant.type !== 'boomshroom' || plant.boomArmed) return;
        plant.boomArmed = true;
        plant.boomTimer = PLANT_TYPES.boomshroom.boomDelay || 1.5;
        this.spawnParticles(plant.x, plant.y - 12, '#ffba08', 10, 'sparkle');
        this.addFloatingText(plant.x, plant.y - 40, 'BOOM!', '#ff6b6b', 0.9, 16);
    }

    activateBoomShroom(plant) {
        const px = plant.x;
        const py = plant.y;

        this.spawnParticles(px, py, '#e63946', 38, 'explosion');
        this.spawnParticles(px, py, '#ffba08', 22, 'sparkle');
        this.explosionRings.push({ x: px, y: py, radius: 12, life: 0.65, color: '#e63946' });
        this.explosionRings.push({ x: px, y: py, radius: 6, life: 0.45, color: '#ffba08' });
        this.addScreenShake(20);
        this.addScreenFlash('#e63946', 0.65);
        this.audio.play('explode');
        this.addFloatingText(px, py - 45, 'BOOM SHROOM!', '#ffba08', 1.8, 24);

        for (const zombie of [...this.zombies]) {
            if (zombie.dying || zombie.hp <= 0) continue;
            this.applyInstantPlantHit(zombie);
        }

        plant.hp = 0;
        plant.boomArmed = false;
        plant.boomTimer = 0;
    }

    activateDoomShroom(row, col, px, py) {
        this.spawnParticles(px, py, '#5a189a', 50, 'explosion');
        this.spawnParticles(px, py, '#240046', 30, 'sparkle');
        this.explosionRings.push({ x: px, y: py, radius: 15, life: 0.8, color: '#5a189a' });
        this.explosionRings.push({ x: px, y: py, radius: 8, life: 0.6, color: '#10002b' });
        this.addScreenShake(30);
        this.addScreenFlash('#5a189a', 0.85);
        this.audio.play('explode');
        this.addFloatingText(px, py - 40, 'DOOM!', '#c77dff', 2, 28);

        const victims = this.zombies.filter((z) => !z.dying && z.hp > 0);
        for (const zombie of victims) {
            zombie.hp = 0;
            this.killZombie(zombie);
        }

        if (!this.zombies.some((z) => z.isBoss && !z.dying && z.hp > 0)) {
            this.zombossActive = false;
        }

        if (this.doomShroomCratersEnabled) {
            this.craters.push({ row, col, timer: DOOM_SHROOM_CRATER_DURATION });
        }
    }

    activateJalapeno(row, px, py) {
        for (let c = 0; c < this.cols; c++) {
            const fx = this.lawnX + c * this.cellW + this.cellW / 2;
            const fy = this.lawnY + row * this.cellH + this.cellH / 2;
            this.spawnParticles(fx, fy, '#e85d04', 10, 'explosion');
            this.spawnParticles(fx, fy, '#ffba08', 6, 'sparkle');
            this.explosionRings.push({ x: fx, y: fy, radius: 8, life: 0.45, color: '#e85d04' });
        }

        this.addScreenShake(14);
        this.addScreenFlash('#e85d04', 0.55);
        this.audio.play('explode');
        this.addFloatingText(px, py - 40, 'JALAPENO!', '#ffba08', 1.4, 22);

        for (const zombie of [...this.zombies]) {
            if (zombie.dying || zombie.hp <= 0 || zombie.row !== row) continue;
            this.applyInstantPlantHit(zombie);
        }
    }

    activateIceShroom(px, py) {
        const duration = PLANT_TYPES.iceshroom.freezeDuration || 4;

        this.spawnParticles(px, py, '#48cae4', 40, 'sparkle');
        this.spawnParticles(px, py, '#caf0f8', 24, 'explosion');
        this.explosionRings.push({ x: px, y: py, radius: 12, life: 0.7, color: '#48cae4' });
        this.addScreenShake(8);
        this.addScreenFlash('#48cae4', 0.45);
        this.audio.play('upgrade');
        this.addFloatingText(px, py - 40, 'FROZEN!', '#caf0f8', 1.6, 22);

        for (const zombie of this.zombies) {
            if (zombie.dying || zombie.hp <= 0) continue;
            zombie.freezeTimer = Math.max(zombie.freezeTimer || 0, duration);
            zombie.butterTimer = 0;
        }
    }

    updateCraters(dt) {
        for (const crater of this.craters) crater.timer -= dt;
        this.craters = this.craters.filter((c) => c.timer > 0);
    }

    pulseSunCounter() {
        const el = document.getElementById('sunCounter');
        el.classList.remove('pulse');
        void el.offsetWidth;
        el.classList.add('pulse');
    }

    collectSun(index) {
        const s = this.suns[index];
        if (!s) return;
        if (!this.infiniteSunEnabled) this.sun += s.value;
        this.suns.splice(index, 1);
        this.spawnParticles(s.x, s.y, '#ffd60a', 10, 'sparkle');
        this.addFloatingText(s.x, s.y - 20, `+${s.value}`, '#ffd60a', 1);
        this.pulseSunCounter();
        this.audio.play('sun');
        this.updateHUD();
    }

    checkSunAutoCollect() {
        if (!this.isPlaying || this.isPaused || this.isGameOver) return;
        for (let i = this.suns.length - 1; i >= 0; i--) {
            const s = this.suns[i];
            if (Math.hypot(this.mouseX - s.x, this.mouseY - s.y) < s.radius + 14) {
                this.collectSun(i);
            }
        }
    }

    togglePause() {
        if (!this.isPlaying || this.isGameOver) return;
        this.isPaused = !this.isPaused;
        document.getElementById('pauseOverlay').classList.toggle('hidden', !this.isPaused);
        document.body.classList.toggle('game-paused', this.isPaused);
        if (this.isPaused) {
            document.activeElement?.blur();
        }
    }

    addFloatingText(x, y, text, color, duration = 1, size = 18) {
        this.floatingTexts.push({ x, y, text, color, life: duration, maxLife: duration, size, vy: -40 });
    }

    addScreenShake(intensity) {
        this.screenShake = Math.max(this.screenShake, intensity);
    }

    addScreenFlash(color, intensity) {
        this.screenFlash = Math.max(this.screenFlash, intensity);
        this.flashColor = color;
    }

    gameLoop(timestamp) {
        if (!this.isPlaying) return;

        const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05);
        this.lastTime = timestamp;
        this.time += dt;

        if (!this.isPaused && !this.isGameOver) {
            this.update(dt);
        }
        this.draw();

        if (!this.isGameOver || this.particles.length > 0 || this.floatingTexts.length > 0) {
            requestAnimationFrame((t) => this.gameLoop(t));
        }
    }

    update(dt) {
        if (!this.cooldownsDisabled) {
            for (const key of Object.keys(this.cooldowns)) {
                if (this.cooldowns[key] > 0) this.cooldowns[key] = Math.max(0, this.cooldowns[key] - dt);
            }
        }
        this.updatePlantBar();
        this.checkSunAutoCollect();

        if (this.screenShake > 0) this.screenShake = Math.max(0, this.screenShake - dt * 8);
        if (this.screenFlash > 0) this.screenFlash = Math.max(0, this.screenFlash - dt * 3);

        this.updateCraters(dt);

        for (const c of this.clouds) {
            c.x += c.speed * dt;
            if (c.x > this.canvas.width + c.w) c.x = -c.w;
        }

        if (this.levelConfig.skySun) {
            this.skySunTimer -= dt;
            if (this.skySunTimer <= 0) {
                this.skySunTimer = 8 + Math.random() * 7;
                this.spawnSkySun();
            }
        }

        for (const plant of this.plants) {
            if (plant.hp <= 0) continue;

            if (plant.spawnAnim > 0) {
                plant.spawnAnim -= dt;
                plant.spawnScale = 1 - plant.spawnAnim / 0.4;
            } else {
                plant.spawnScale = 1;
            }

            if (plant.upgradeAnim > 0) plant.upgradeAnim -= dt;

            const stats = this.getPlantStats(plant);

            if (plant.type === 'sunflower' || plant.type === 'twinsunflower') {
                plant.sunTimer += dt;
                const interval = stats.sunInterval || 7;
                if (plant.sunTimer >= interval) {
                    plant.sunTimer = 0;
                    const sunCount = stats.sunCount || 1;
                    const sunValue = stats.sunValue || 25;
                    for (let i = 0; i < sunCount; i++) {
                        const offsetX = sunCount > 1 ? (i === 0 ? -10 : 10) : 0;
                        this.suns.push({
                            x: plant.x + offsetX,
                            y: plant.y,
                            targetY: plant.y + 30,
                            value: sunValue,
                            radius: 18,
                            life: 8,
                            falling: true,
                        });
                    }
                }
            }

            if (plant.type === 'sunshroom' && this.isMushroomAwake(plant)) {
                plant.growTimer = (plant.growTimer || 0) + dt;
                const growTime = stats.growTime || PLANT_TYPES.sunshroom.growTime || 24;
                const grown = plant.growTimer >= growTime;
                plant.sunTimer += dt;
                const interval = grown
                    ? (stats.grownSunInterval || 7)
                    : (stats.smallSunInterval || 12);
                const sunValue = grown
                    ? (stats.grownSunValue || 25)
                    : (stats.smallSunValue || 15);
                if (plant.sunTimer >= interval) {
                    plant.sunTimer = 0;
                    this.suns.push({
                        x: plant.x,
                        y: plant.y - (grown ? 4 : 8),
                        targetY: plant.y + (grown ? 26 : 18),
                        value: sunValue,
                        radius: grown ? 18 : 14,
                        life: 8,
                        falling: true,
                    });
                }
            }

            if (this.isShootingPlant(plant.type) && this.isMushroomAwake(plant)) {
                plant.shootTimer += dt;
                const defaultInterval = plant.type === 'snowpea' ? 1.8
                    : plant.type === 'gatlingpea' ? 0.35
                        : plant.type === 'puffshroom' ? 1.5
                            : plant.type === 'cabbagepult' ? 2.5
                                : plant.type === 'kernelpult' ? 2.0
                                    : plant.type === 'melonpult' ? 3.0
                                        : plant.type === 'wintermelon' ? 2.5
                                            : 1.5;
                const interval = stats.shootInterval || defaultInterval;
                if (plant.shootTimer >= interval && this.plantHasTargetInLane(plant)) {
                    plant.shootTimer = 0;
                    if (this.isLobShooter(plant.type)) {
                        this.fireLobProjectile(plant, stats);
                    } else {
                        this.fireStraightProjectile(plant, stats);
                    }
                    this.audio.play('shoot');
                }
            }

            if (plant.type === 'cherrybomb' && plant.explodeTimer > 0) {
                plant.explodeTimer -= dt;
                if (plant.explodeTimer <= 0) {
                    this.explodeCherryBomb(plant);
                    plant.hp = 0;
                }
            }

            if (plant.type === 'potatomine' && !plant.armed) {
                plant.armTimer += dt;
                if (plant.armTimer >= (PLANT_TYPES.potatomine.armTime || 7)) {
                    plant.armed = true;
                }
            }

            if (plant.type === 'tanglekelp') {
                this.updateTangleKelp(plant, dt);
            }

            if (plant.type === 'squash') {
                this.updateSquash(plant, dt);
            }

            if (plant.type === 'boomshroom' && plant.boomArmed && plant.boomTimer > 0) {
                plant.boomTimer -= dt;
                if (plant.boomTimer <= 0) {
                    this.activateBoomShroom(plant);
                }
            }

            if (plant.type === 'cobcannon' && plant.reloadTimer > 0) {
                plant.reloadTimer -= dt;
            }
        }

        for (const plant of this.plants) {
            if (this.isCarrierPlant(plant.type) || this.isWaterOnlyPlant(plant.type) || plant.hp <= 0) continue;
            const requiredCarrier = this.getRequiredCarrier(plant.row, plant.col);
            if (requiredCarrier && !this.hasCarrierAt(plant.row, plant.col, requiredCarrier)) {
                plant.hp = 0;
            }
        }

        this.plants = this.plants.filter((p) => p.hp > 0);

        if (this.selectedUpgradePlant && !this.plants.includes(this.selectedUpgradePlant)) {
            this.hideUpgradePanel();
        }

        this.updateProjectiles(dt);

        for (const zombie of this.zombies) {
            if (zombie.dying) {
                zombie.deathTimer -= dt;
                zombie.fallAngle += dt * 4;
                continue;
            }
            if (zombie.hp <= 0) continue;

            if (zombie.displayHp === undefined) zombie.displayHp = zombie.hp;
            zombie.displayHp += (zombie.hp - zombie.displayHp) * Math.min(1, dt * 12);

            if (zombie.isBoss) {
                if (zombie.freezeTimer > 0) zombie.freezeTimer -= dt;
                if (zombie.slowTimer > 0) zombie.slowTimer -= dt;
                if (!this.isZombieFrozen(zombie)) {
                    zombie.animTimer += dt;
                    zombie.spawnTimer -= dt;
                }
                if (zombie.spawnTimer <= 0) {
                    if (zombie.spawnsHypnotizedMinions) {
                        this.spawnHypnotizedZombossMinion();
                        this.spawnParticles(zombie.x - 40, zombie.y + 20, '#ff4d8d', 8, 'sparkle');
                    } else {
                        this.spawnZombossMinion();
                        this.spawnParticles(zombie.x - 40, zombie.y + 20, '#6b705c', 6, 'debris');
                    }
                    zombie.spawnTimer = 1.0 + Math.random() * 1.5;
                }
                if (zombie.hypnotized) {
                    this.updateHypnotizedZombie(zombie, dt);
                    continue;
                }
                continue;
            }

            if (zombie.grabbedByKelp) continue;

            if (zombie.hypnotized) {
                this.updateHypnotizedZombie(zombie, dt);
                continue;
            }

            if (zombie.throwing) {
                this.updateThrownImp(zombie, dt);
                continue;
            }

            if (isGargantuarType(zombie.type) && !zombie.impThrown && zombie.hp <= zombie.maxHp * 0.5) {
                this.throwImpFromGargantuar(zombie);
            }

            if (zombie.throwAnim > 0) zombie.throwAnim -= dt;

            if (zombie.freezeTimer > 0) zombie.freezeTimer -= dt;
            if (zombie.butterTimer > 0) zombie.butterTimer -= dt;
            if (zombie.slowTimer > 0) zombie.slowTimer -= dt;
            const speedMult = this.getZombieSpeedMult(zombie);

            let eating = false;

            if (zombie.isFlag && zombie.raiseTimer > 0) {
                zombie.raiseTimer -= dt;
                eating = true;
            }

            const triggerX = this.lawnX + (this.cols - 2) * this.cellW;
            if (zombie.isFlag && !zombie.flagRaised && zombie.x <= triggerX) {
                zombie.flagRaised = true;
                zombie.raiseTimer = 0.8;
            }
            if (zombie.isFlag && zombie.flagRaised && zombie.raiseTimer <= 0 && !this.waveAssaultActive) {
                this.beginWaveAssault();
            }

            const eatRange = zombie.type === 'gigagargantuar' ? 55
                : isGargantuarType(zombie.type) ? 50
                    : zombie.type === 'imp' ? 28 : 35;
            const eatTargets = zombie.butterTimer > 0 || this.isZombieFrozen(zombie) ? [] : this.plants.filter((plant) => {
                if (plant.row !== zombie.row || plant.hp <= 0) return false;
                if (plant.type === 'cherrybomb' && plant.explodeTimer > 0) return false;
                if (plant.type === 'boomshroom' && plant.boomArmed) return false;
                return Math.abs(zombie.x - plant.x) < eatRange;
            });
            eatTargets.sort((a, b) => {
                const aCarrier = this.isCarrierPlant(a.type);
                const bCarrier = this.isCarrierPlant(b.type);
                if (aCarrier && !bCarrier) return 1;
                if (bCarrier && !aCarrier) return -1;
                return 0;
            });

            if (!eating && zombie.butterTimer <= 0 && !this.isZombieFrozen(zombie)) {
                const hypnoTarget = this.getClosestHypnotizedTarget(zombie, eatRange);
                if (hypnoTarget) {
                    let attackHypno = true;
                    if (eatTargets.length > 0) {
                        const closestPlant = eatTargets.reduce((closest, plant) => (
                            Math.abs(zombie.x - plant.x) < Math.abs(zombie.x - closest.x) ? plant : closest
                        ));
                        attackHypno = Math.abs(zombie.x - hypnoTarget.x) <= Math.abs(zombie.x - closestPlant.x);
                    }
                    if (attackHypno) {
                        hypnoTarget.hp -= zombie.damage * dt;
                        zombie.eatAnim += dt * 8;
                        eating = true;
                        if (hypnoTarget.hp <= 0) this.killZombie(hypnoTarget);
                    }
                }
            }

            if (!eating) {
                for (const plant of eatTargets) {
                    if (plant.type === 'potatomine' && plant.armed) {
                        this.explodePotatoMine(plant);
                        plant.hp = 0;
                        eating = true;
                        break;
                    }

                    if (plant.type === 'potatomine' && !plant.armed) {
                        eating = true;
                        plant.hp -= zombie.damage * dt;
                        zombie.eatAnim += dt * 8;
                        break;
                    }

                    if (plant.type === 'hypnoshroom') {
                        eating = true;
                        zombie.eatAnim += dt * 8;
                        if (this.canHypnotizeZombie(zombie)) {
                            this.hypnotizeZombie(zombie);
                            plant.hp = 0;
                        } else {
                            plant.hp -= zombie.damage * dt;
                        }
                        break;
                    }

                    eating = true;
                    plant.hp -= zombie.damage * dt;
                    zombie.eatAnim += dt * 8;
                    break;
                }
            }

            if (!eating) {
                zombie.x -= zombie.speed * speedMult * 60 * dt;
                zombie.walkAnim += dt * 6;
            }

            const mower = this.lawnmowers[zombie.row];
            if (mower?.state === 'idle' && zombie.x <= this.lawnX + 35) {
                this.activateLawnmower(mower);
            }

            if (zombie.x < this.lawnX - 30 && mower?.state === 'used') {
                this.endGame(false);
            }
        }
        this.zombies = this.zombies.filter((z) => !z.dying || z.deathTimer > 0);

        for (const s of this.suns) {
            s.life -= dt;
            if (s.falling && s.y < s.targetY) {
                s.y += 40 * dt;
            } else {
                s.falling = false;
            }
        }
        this.suns = this.suns.filter((s) => s.life > 0);

        for (const p of this.particles) {
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.life -= dt;
            p.vy += (p.gravity || 80) * dt;
            if (p.spin) p.angle = (p.angle || 0) + p.spin * dt;
        }
        this.particles = this.particles.filter((p) => p.life > 0);

        for (const mf of this.muzzleFlashes) mf.life -= dt;
        this.muzzleFlashes = this.muzzleFlashes.filter((m) => m.life > 0);

        for (const ring of this.explosionRings) {
            ring.life -= dt;
            ring.radius += 120 * dt;
        }
        this.explosionRings = this.explosionRings.filter((r) => r.life > 0);

        for (const ft of this.floatingTexts) {
            ft.y += ft.vy * dt;
            ft.life -= dt;
        }
        this.floatingTexts = this.floatingTexts.filter((f) => f.life > 0);

        this.updateLawnmowers(dt);
        this.updateWaves(dt);
        this.updateHUD();
    }

    updateLawnmowers(dt) {
        const mowerSpeed = 9 * 60;
        const rightEdge = this.lawnX + this.cols * this.cellW + 80;

        for (const mower of this.lawnmowers) {
            if (mower.state !== 'active') continue;

            mower.x += mowerSpeed * dt;

            for (const zombie of this.zombies) {
                if (zombie.isBoss || zombie.row !== mower.row || zombie.dying || zombie.hp <= 0) continue;
                if (Math.abs(zombie.x - mower.x) < 45) {
                    zombie.hp = 0;
                    this.killZombie(zombie);
                }
            }

            if (Math.random() < 0.4) {
                this.spawnParticles(mower.x - 10, mower.y + 6, '#6c757d', 1, 'default');
            }

            if (mower.x > rightEdge) {
                mower.state = 'used';
            }
        }
    }

    updateSquash(plant, dt) {
        const squashDuration = 0.9;

        if (plant.squashAttacking) {
            plant.squashTimer -= dt;
            const progress = 1 - Math.max(0, plant.squashTimer) / squashDuration;

            if (progress < 0.55) {
                plant.jumpOffset = -Math.sin((progress / 0.55) * Math.PI) * 70;
                const target = plant.squashTarget;
                if (target && target.hp > 0 && !target.dying) {
                    plant.squashLandX = target.x;
                }
            } else if (!plant.squashLanded) {
                plant.squashLanded = true;
                plant.jumpOffset = 0;
                this.squashImpact(plant);
            }

            if (plant.squashTimer <= 0) plant.hp = 0;
            return;
        }

        for (const zombie of this.zombies) {
            if (zombie.row !== plant.row || zombie.dying || zombie.hp <= 0 || zombie.hypnotized) continue;
            const zombieCol = Math.floor((zombie.x - this.lawnX) / this.cellW);
            if (zombieCol < plant.col - 1 || zombieCol > plant.col + 1) continue;

            plant.squashAttacking = true;
            plant.squashTimer = squashDuration;
            plant.squashTarget = zombie;
            plant.squashLandX = zombie.x;
            plant.squashLanded = false;
            plant.jumpOffset = 0;
            this.audio.play('plant');
            break;
        }
    }

    squashImpact(plant) {
        const x = plant.squashLandX || plant.x;
        const y = plant.y;

        this.spawnParticles(x, y, '#f4a261', 20, 'debris');
        this.spawnParticles(x, y, '#6a994e', 14, 'explosion');
        this.explosionRings.push({ x, y, radius: 10, life: 0.4, color: '#f4a261' });
        this.addScreenShake(10);
        this.audio.play('hit');

        for (const zombie of this.zombies) {
            if (zombie.dying || zombie.hp <= 0 || zombie.row !== plant.row) continue;

            const zombieCol = Math.floor((zombie.x - this.lawnX) / this.cellW);
            const onPlantOrLeft = zombieCol === plant.col || zombieCol === plant.col - 1;
            const distLand = Math.abs(zombie.x - x);

            if (onPlantOrLeft) {
                this.applyInstantPlantHit(zombie);
                continue;
            }

            if (distLand > 42) continue;
            if (distLand <= 28) {
                this.applyInstantPlantHit(zombie);
            } else if (!zombie.isBoss) {
                zombie.hp -= 180;
                if (zombie.hp <= 0) this.killZombie(zombie);
            }
        }
    }

    updateTangleKelp(plant, dt) {
        if (plant.grabbing) {
            plant.grabTimer -= dt;
            const zombie = plant.grabTarget;

            if (zombie && zombie.hp > 0 && !zombie.dying) {
                zombie.y += 90 * dt;
                zombie.x += (plant.x - zombie.x) * 2.5 * dt;
                zombie.fallAngle += dt * 2;
            }

            if (plant.grabTimer <= 0) {
                if (zombie && zombie.hp > 0 && !zombie.dying) {
                    zombie.hp = 0;
                    this.killZombie(zombie);
                }
                plant.hp = 0;
                this.spawnParticles(plant.x, plant.y, '#0077b6', 18, 'sparkle');
                this.spawnParticles(plant.x, plant.y - 10, '#48cae4', 10);
                this.audio.play('hit');
            }
            return;
        }

        for (const zombie of this.zombies) {
            if (zombie.row !== plant.row) continue;
            if (!this.canTangleKelpGrab(zombie)) continue;
            if (Math.abs(zombie.x - plant.x) > 36) continue;

            plant.grabbing = true;
            plant.grabTarget = zombie;
            plant.grabTimer = 1.1;
            zombie.grabbedByKelp = true;
            this.spawnParticles(plant.x, plant.y - 8, '#48cae4', 8, 'sparkle');
            this.audio.play('plant');
            break;
        }
    }

    throwImpFromGargantuar(garg) {
        garg.impThrown = true;
        const impData = ZOMBIE_TYPES.imp;
        const speedMult = this.levelConfig.zombieSpeedMult || 1;
        const landX = Math.max(this.lawnX + this.cellW * 0.5, garg.x - this.cellW * 2.2);
        const startX = garg.x - 28;
        const startY = garg.y - (garg.type === 'gigagargantuar' ? 68 : 55);

        this.zombies.push({
            type: 'imp',
            row: garg.row,
            x: startX,
            y: startY,
            hp: impData.hp,
            maxHp: impData.hp,
            speed: (impData.speed + this.wave * 0.02) * speedMult,
            damage: impData.damage,
            slowTimer: 0,
            butterTimer: 0,
            freezeTimer: 0,
            walkAnim: 0,
            eatAnim: 0,
            dying: false,
            deathTimer: 0,
            fallAngle: 0,
            displayHp: impData.hp,
            throwing: true,
            throwTimer: IMP_THROW_DURATION,
            throwDuration: IMP_THROW_DURATION,
            throwStartX: startX,
            throwStartY: startY,
            throwTargetX: landX,
            throwTargetY: garg.y,
        });

        garg.throwAnim = 0.45;
        this.spawnParticles(startX, startY, '#6b705c', 10, 'debris');
        this.addFloatingText(garg.x - 20, garg.y - 70, 'IMP!', '#ff6b6b', 0.7, 14);
        this.audio.play('hit');
    }

    updateThrownImp(zombie, dt) {
        zombie.throwTimer -= dt;
        const duration = zombie.throwDuration || IMP_THROW_DURATION;
        const t = 1 - Math.max(0, zombie.throwTimer) / duration;
        zombie.x = zombie.throwStartX + (zombie.throwTargetX - zombie.throwStartX) * t;
        zombie.y = zombie.throwStartY
            + (zombie.throwTargetY - zombie.throwStartY) * t
            - Math.sin(t * Math.PI) * 55;
        if (zombie.throwTimer <= 0) {
            zombie.throwing = false;
            zombie.y = zombie.throwTargetY;
        }
    }

    killZombie(zombie) {
        zombie.grabbedByKelp = false;
        const data = ZOMBIE_TYPES[zombie.type];
        this.score += data.score;
        this.kills++;
        zombie.dying = true;
        zombie.deathTimer = 0.6;
        zombie.fallAngle = 0;
        const debris = zombie.isBoss ? 50
            : zombie.type === 'gigagargantuar' ? 28
                : isGargantuarType(zombie.type) ? 22 : 14;
        const particleColor = zombie.isBoss ? '#8d99ae'
            : isGargantuarType(zombie.type) ? '#5a5340' : '#6b705c';
        this.spawnParticles(zombie.x, zombie.y, particleColor, debris, isGargantuarType(zombie.type) ? 'debris' : 'default');
        if (zombie.type === 'gigagargantuar') this.addScreenShake(10);
        else if (isGargantuarType(zombie.type)) this.addScreenShake(6);
        if (zombie.isBoss) {
            this.addScreenShake(25);
            this.addFloatingText(zombie.x, zombie.y - 90, 'BOSS DEFEATED!', '#ffd60a', 2.5, 28);
        } else {
            this.addFloatingText(zombie.x, zombie.y - 30, `+${data.score}`, '#95d5b2', 0.8, 16);
        }
        this.audio.play('death');
    }

    applyInstantPlantHit(zombie) {
        const data = ZOMBIE_TYPES[zombie.type];
        const hitsRequired = data.instantPlantHitsToKill || 1;

        if (hitsRequired <= 1) {
            zombie.hp = 0;
            this.killZombie(zombie);
            return;
        }

        zombie.instantPlantHits = (zombie.instantPlantHits || 0) + 1;
        if (zombie.instantPlantHits >= hitsRequired) {
            zombie.hp = 0;
            this.killZombie(zombie);
        } else {
            zombie.hp = zombie.maxHp * (1 - zombie.instantPlantHits / hitsRequired);
            this.spawnParticles(zombie.x, zombie.y - 15, '#e63946', 14, 'explosion');
            this.audio.play('hit');
            this.addScreenShake(5);
        }
    }

    getZombieHpPercent(zombie) {
        const maxHp = zombie.maxHp || 1;
        const current = zombie.displayHp !== undefined ? zombie.displayHp : zombie.hp;
        return Math.max(0, Math.min(1, current / maxHp));
    }

    drawFrozenOverlay(ctx, zombie, rx, ry) {
        if (!this.isZombieFrozen(zombie) || zombie.dying) return;

        ctx.fillStyle = 'rgba(202, 240, 248, 0.55)';
        ctx.beginPath();
        ctx.ellipse(zombie.x, zombie.y, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(144, 224, 239, 0.85)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(zombie.x, zombie.y - ry * 0.2, rx * 0.75, ry * 0.55, 0, 0, Math.PI * 2);
        ctx.stroke();
    }

    drawZombieHealthBar(ctx, x, y, zombie, barW, barH) {
        const hpPct = this.getZombieHpPercent(zombie);
        const left = x - barW / 2;
        const top = y;

        ctx.fillStyle = 'rgba(40, 15, 15, 0.85)';
        ctx.fillRect(left, top, barW, barH);

        if (hpPct > 0) {
            ctx.fillStyle = hpPct > 0.55 ? '#52b788' : hpPct > 0.28 ? '#ffd60a' : '#e63946';
            ctx.fillRect(left, top, barW * hpPct, barH);
        }

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.lineWidth = 1;
        ctx.strokeRect(left + 0.5, top + 0.5, barW - 1, barH - 1);
    }

    explodeArea(plant, color) {
        this.spawnParticles(plant.x, plant.y, color, 40, 'explosion');
        this.explosionRings.push({ x: plant.x, y: plant.y, radius: 10, life: 0.5, color });
        this.explosionRings.push({ x: plant.x, y: plant.y, radius: 5, life: 0.35, color: '#ffd60a' });
        this.addScreenShake(12);
        this.addScreenFlash(color, 0.5);
        this.audio.play('explode');

        for (const zombie of this.zombies) {
            if (zombie.isBoss) {
                const dx = Math.abs(zombie.x - plant.x);
                const dy = Math.abs(zombie.y - plant.y);
                if (dx < 130 && dy < 160 && !zombie.dying) this.applyInstantPlantHit(zombie);
                continue;
            }
            const rowDist = Math.abs(zombie.row - plant.row);
            const colApprox = Math.floor((zombie.x - this.lawnX) / this.cellW);
            const colDist = Math.abs(colApprox - plant.col);
            if (rowDist <= 1 && colDist <= 1.5 && !zombie.dying) {
                this.applyInstantPlantHit(zombie);
            }
        }
    }

    explodeCherryBomb(plant) {
        this.explodeArea(plant, '#e63946');
    }

    explodePotatoMine(plant) {
        const color = '#e85d04';
        this.spawnParticles(plant.x, plant.y, color, 18, 'explosion');
        this.spawnParticles(plant.x, plant.y, '#c4a35a', 12, 'debris');
        this.explosionRings.push({ x: plant.x, y: plant.y, radius: 6, life: 0.35, color });
        this.addScreenShake(6);
        this.addScreenFlash(color, 0.3);
        this.audio.play('explode');

        for (const zombie of this.zombies) {
            if (zombie.dying) continue;
            if (zombie.isBoss) {
                const dx = Math.abs(zombie.x - plant.x);
                const dy = Math.abs(zombie.y - plant.y);
                if (dx < 90 && dy < 120) this.applyInstantPlantHit(zombie);
                continue;
            }
            if (zombie.row !== plant.row) continue;
            const colApprox = Math.floor((zombie.x - this.lawnX) / this.cellW);
            if (colApprox === plant.col) {
                this.applyInstantPlantHit(zombie);
            }
        }
    }

    spawnSkySun() {
        const col = Math.floor(Math.random() * this.cols);
        const x = this.lawnX + col * this.cellW + this.cellW / 2;
        this.suns.push({
            x,
            y: this.lawnY - 20,
            targetY: this.lawnY + Math.random() * this.rows * this.cellH,
            value: 25,
            radius: 20,
            life: 10,
            falling: true,
        });
    }

    spawnParticles(x, y, color, count, style = 'default') {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = style === 'explosion' ? 80 + Math.random() * 200
                : style === 'sparkle' ? 40 + Math.random() * 80
                : style === 'debris' ? 60 + Math.random() * 100
                : 60 + Math.random() * 80;

            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - (style === 'explosion' ? 60 : 40),
                life: style === 'explosion' ? 0.6 + Math.random() * 0.5
                    : style === 'sparkle' ? 0.5 + Math.random() * 0.3
                    : 0.4 + Math.random() * 0.4,
                color,
                size: style === 'explosion' ? 4 + Math.random() * 8
                    : style === 'sparkle' ? 2 + Math.random() * 3
                    : 3 + Math.random() * 4,
                gravity: style === 'sparkle' ? 20 : 80,
                spin: style === 'debris' ? (Math.random() - 0.5) * 10 : 0,
                angle: Math.random() * Math.PI * 2,
                shape: style === 'sparkle' ? 'star' : style === 'debris' ? 'rect' : 'circle',
            });
        }
    }

    updateWaves(dt) {
        if (!this.zombieSpawningEnabled) return;

        if (this.zombossActive) {
            const bossAlive = this.zombies.some((z) => z.isBoss && !z.dying && z.hp > 0);
            if (bossAlive) return;

            if (this.zombies.length === 0) {
                this.zombossActive = false;
                this.waveTimer += dt;
                if (this.waveTimer >= 5) {
                    this.wave++;
                    this.zombiesInWave = this.getZombiesInWave(this.wave);
                    this.waveTimer = 0;
                    this.startWave();
                }
            }
            return;
        }

        if (!this.waveAssaultActive) {
            if (this.flagZombieSpawned) {
                const flagAlive = this.zombies.some((z) => z.isFlag && !z.dying && z.hp > 0);
                if (!flagAlive) this.beginWaveAssault();
            }
            return;
        }

        if (this.zombiesSpawned < this.zombiesInWave) {
            this.spawnTimer -= dt;
            if (this.spawnTimer <= 0) {
                this.spawnZombie();
                this.zombiesSpawned++;
                this.spawnTimer = this.getSpawnInterval();
            }
        } else if (this.zombies.length === 0) {
            this.waveTimer += dt;
            if (this.waveTimer >= 5) {
                this.wave++;
                if (this.isBossWave()) {
                    this.zombiesInWave = this.getZombiesInWave(this.wave);
                    this.waveTimer = 0;
                    this.startWave();
                    return;
                }
                this.zombiesInWave = this.getZombiesInWave(this.wave);
                this.waveTimer = 0;
                this.startWave();
            }
        }
    }

    spawnZombie(forcedType = null) {
        let type = forcedType || 'regular';
        if (!forcedType) {
            const roll = Math.random();
            if (this.wave >= 12 && roll < 0.05) type = 'gigagargantuar';
            else if (this.wave >= 7 && roll < 0.1) type = 'gargantuar';
            else if (this.wave >= 6 && roll < 0.2) type = 'allstar';
            else if (this.wave >= 5 && roll < 0.28) type = 'bucket';
            else if (this.wave >= 3 && roll < 0.38) type = 'cone';
        }

        const row = this.getSpawnRowForZombie(type);
        const data = ZOMBIE_TYPES[type];
        if (!data) return;
        const speedMult = this.levelConfig.zombieSpeedMult || 1;
        const zombie = {
            type,
            row,
            x: this.lawnX + this.cols * this.cellW + 20,
            y: this.lawnY + row * this.cellH + this.cellH / 2,
            hp: data.hp,
            maxHp: data.hp,
            speed: (data.speed + this.wave * 0.02) * speedMult,
            damage: data.damage,
            slowTimer: 0,
            butterTimer: 0,
            freezeTimer: 0,
            walkAnim: 0,
            eatAnim: 0,
            dying: false,
            deathTimer: 0,
            fallAngle: 0,
            instantPlantHits: isGargantuarType(type) ? 0 : undefined,
            impThrown: isGargantuarType(type) ? false : undefined,
            displayHp: data.hp,
        };
        this.zombies.push(zombie);
        return zombie;
    }

    endGame(won) {
        this.isGameOver = true;
        this.won = won;
        const overlay = document.getElementById('gameOverOverlay');
        const content = document.getElementById('gameOverContent');
        overlay.classList.remove('hidden');
        content.classList.toggle('victory', won);
        document.getElementById('gameOverTitle').textContent = won ? 'Victory!' : 'Game Over';
        document.getElementById('gameOverMessage').textContent = won
            ? 'You survived the zombie apocalypse! Your lawn is safe.'
            : 'The zombies ate your brains!';
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('finalWave').textContent = this.wave;
        document.getElementById('finalKills').textContent = this.kills;
        if (won) this.audio.play('win');
        else this.audio.play('death');
    }

    updateHUD() {
        document.getElementById('sunAmount').textContent =
            this.infiniteSunEnabled ? '∞' : Math.floor(this.sun);
        document.getElementById('waveNum').textContent = this.wave;
        document.getElementById('scoreAmount').textContent = this.score;
        if (this.zombossActive) {
            const boss = this.getBoss();
            document.getElementById('zombieCount').textContent = boss
                ? `👹 ${Math.ceil(boss.hp)}`
                : this.zombies.length;
        } else if (!this.waveAssaultActive) {
            document.getElementById('zombieCount').textContent = '🚩';
        } else {
            const remaining = this.zombiesInWave - this.zombiesSpawned + this.zombies.length;
            document.getElementById('zombieCount').textContent = Math.max(0, remaining);
        }
        this.updateUpgradePanelButton();
    }

    updateUpgradePanelButton() {
        if (!this.selectedUpgradePlant) return;
        const plant = this.selectedUpgradePlant;
        const level = plant.level || 1;
        const btn = document.getElementById('confirmUpgradeBtn');
        if (level >= getMaxPlantLevel(plant.type)) {
            btn.disabled = true;
            return;
        }
        const cost = getUpgradeCost(plant.type, level);
        btn.textContent = `Upgrade — ☀ ${cost}`;
        btn.disabled = !this.hasEnoughSun(cost);
    }

    updatePlantBar() {
        document.querySelectorAll('.plant-card').forEach((card) => {
            const type = card.dataset.type;
            if (!type || !PLANT_TYPES[type]) return;

            const data = PLANT_TYPES[type];
            const disabled = !this.hasEnoughSun(data.cost) || this.isPlantOnCooldown(type);
            card.classList.toggle('disabled', disabled);

            const overlay = card.querySelector('.cooldown-overlay');
            if (!overlay) return;
            const pct = data.cooldown > 0 ? (this.cooldowns[type] / data.cooldown) * 100 : 0;
            overlay.style.height = `${pct}%`;
        });
    }

    draw() {
        const ctx = this.ctx;
        ctx.save();

        if (this.screenShake > 0) {
            const sx = (Math.random() - 0.5) * this.screenShake;
            const sy = (Math.random() - 0.5) * this.screenShake;
            ctx.translate(sx, sy);
        }

        ctx.clearRect(-20, -20, this.canvas.width + 40, this.canvas.height + 40);

        this.drawBackground(ctx);
        if (this.levelConfig.theme === 'night') this.drawStars(ctx);
        this.drawClouds(ctx);
        this.drawLawn(ctx);
        if (this.levelConfig.theme === 'roof') this.drawRoofStructure(ctx);
        else this.drawHouse(ctx);
        if (this.levelConfig.theme === 'night') this.drawNightVignette(ctx);

        for (const mower of this.lawnmowers) {
            if (mower.state === 'idle') this.drawLawnmower(ctx, mower);
        }

        for (const plant of this.plants) {
            if (this.isCarrierPlant(plant.type)) this.drawPlant(ctx, plant);
        }
        for (const plant of this.plants) {
            if (!this.isCarrierPlant(plant.type)) this.drawPlant(ctx, plant);
        }
        for (const proj of this.projectiles) this.drawProjectile(ctx, proj);
        for (const zombie of this.zombies) this.drawZombie(ctx, zombie);

        for (const mower of this.lawnmowers) {
            if (mower.state === 'active') this.drawLawnmower(ctx, mower);
        }
        for (const s of this.suns) this.drawSun(ctx, s);
        for (const ring of this.explosionRings) this.drawExplosionRing(ctx, ring);
        for (const mf of this.muzzleFlashes) this.drawMuzzleFlash(ctx, mf);
        for (const p of this.particles) this.drawParticle(ctx, p);
        for (const ft of this.floatingTexts) this.drawFloatingText(ctx, ft);

        if (this.selectedPlant) this.drawPlacementPreview(ctx);
        if (this.cobCannonAiming) this.drawCobAimPreview(ctx);
        if (this.upgradeMode) this.drawUpgradeHighlights(ctx);
        if (this.shovelMode) this.drawShovelHighlights(ctx);

        if (this.screenFlash > 0) {
            ctx.fillStyle = this.flashColor;
            ctx.globalAlpha = this.screenFlash * 0.4;
            ctx.fillRect(-20, -20, this.canvas.width + 40, this.canvas.height + 40);
            ctx.globalAlpha = 1;
        }

        ctx.restore();
    }

    drawBackground(ctx) {
        const theme = this.levelConfig.theme;
        const grad = ctx.createLinearGradient(0, 0, 0, this.canvas.height);

        if (theme === 'night') {
            grad.addColorStop(0, '#0a0e27');
            grad.addColorStop(0.35, '#1a1a4e');
            grad.addColorStop(0.6, '#2d2d5a');
            grad.addColorStop(1, '#1a3a2a');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            const moonGlow = 0.7 + Math.sin(this.time * 1.5) * 0.1;
            ctx.fillStyle = `rgba(230, 230, 255, ${moonGlow * 0.2})`;
            ctx.beginPath();
            ctx.arc(this.canvas.width - 70, 50, 40, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#e8e8f0';
            ctx.beginPath();
            ctx.arc(this.canvas.width - 75, 48, 22, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#c8c8d8';
            ctx.beginPath();
            ctx.arc(this.canvas.width - 68, 42, 5, 0, Math.PI * 2);
            ctx.arc(this.canvas.width - 82, 52, 4, 0, Math.PI * 2);
            ctx.fill();
        } else if (theme === 'pool') {
            grad.addColorStop(0, '#5ba3d9');
            grad.addColorStop(0.3, '#87CEEB');
            grad.addColorStop(0.55, '#7ec8e3');
            grad.addColorStop(0.8, '#52b788');
            grad.addColorStop(1, '#2d6a4f');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            ctx.fillStyle = 'rgba(255, 214, 10, 0.18)';
            ctx.beginPath();
            ctx.arc(this.canvas.width - 60, 45, 35, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'rgba(255, 238, 50, 0.28)';
            ctx.beginPath();
            ctx.arc(this.canvas.width - 60, 45, 25, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#8b6914';
            ctx.fillRect(this.canvas.width - 30, this.lawnY - 10, 24, this.rows * this.cellH + 20);
        } else if (theme === 'roof') {
            grad.addColorStop(0, '#4a6fa5');
            grad.addColorStop(0.4, '#87a8c4');
            grad.addColorStop(0.7, '#6b7b8c');
            grad.addColorStop(1, '#4a5568');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            ctx.fillStyle = 'rgba(60, 70, 90, 0.6)';
            for (let i = 0; i < 6; i++) {
                const bx = 200 + i * 110;
                ctx.fillRect(bx, this.lawnY - 60 - (i % 2) * 20, 50, 80 + (i % 3) * 30);
            }
        } else {
            grad.addColorStop(0, '#5ba3d9');
            grad.addColorStop(0.25, '#87CEEB');
            grad.addColorStop(0.45, '#98D8C8');
            grad.addColorStop(0.7, '#52b788');
            grad.addColorStop(1, '#2d6a4f');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            ctx.fillStyle = 'rgba(255, 214, 10, 0.15)';
            ctx.beginPath();
            ctx.arc(this.canvas.width - 60, 45, 35, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'rgba(255, 238, 50, 0.25)';
            ctx.beginPath();
            ctx.arc(this.canvas.width - 60, 45, 25, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawStars(ctx) {
        for (const star of this.stars) {
            const alpha = 0.4 + Math.sin(this.time * 3 + star.twinkle) * 0.35;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }

    drawNightVignette(ctx) {
        const grad = ctx.createRadialGradient(
            this.canvas.width / 2, this.canvas.height / 2, 100,
            this.canvas.width / 2, this.canvas.height / 2, 450
        );
        grad.addColorStop(0, 'rgba(0,0,0,0)');
        grad.addColorStop(1, 'rgba(0,0,10,0.45)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawClouds(ctx) {
        for (const c of this.clouds) {
            ctx.globalAlpha = c.opacity;
            ctx.fillStyle = '#fff';
            this.drawCloudPuff(ctx, c.x, c.y, c.w);
            ctx.globalAlpha = 1;
        }
    }

    drawCloudPuff(ctx, x, y, w) {
        const h = w * 0.4;
        ctx.beginPath();
        ctx.ellipse(x, y, w * 0.3, h * 0.5, 0, 0, Math.PI * 2);
        ctx.ellipse(x + w * 0.2, y - h * 0.2, w * 0.25, h * 0.45, 0, 0, Math.PI * 2);
        ctx.ellipse(x + w * 0.45, y, w * 0.3, h * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    drawCrater(ctx, x, y, crater) {
        const cx = x + this.cellW / 2;
        const cy = y + this.cellH / 2 + 8;
        const heal = Math.min(1, crater.timer / DOOM_SHROOM_CRATER_DURATION);
        const alpha = 0.55 + heal * 0.35;

        ctx.fillStyle = `rgba(16, 0, 43, ${alpha})`;
        ctx.beginPath();
        ctx.ellipse(cx, cy, 30, 18, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = `rgba(60, 40, 30, ${alpha + 0.1})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(cx, cy, 32, 20, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = `rgba(90, 60, 45, ${alpha})`;
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2 + this.time * 0.2;
            ctx.beginPath();
            ctx.moveTo(cx + Math.cos(angle) * 20, cy + Math.sin(angle) * 12);
            ctx.lineTo(cx + Math.cos(angle) * 34, cy + Math.sin(angle) * 20);
            ctx.stroke();
        }

        if (crater.timer < 30) {
            ctx.fillStyle = `rgba(82, 183, 136, ${(1 - crater.timer / 30) * 0.25})`;
            ctx.beginPath();
            ctx.ellipse(cx, cy, 28, 16, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawHouse(ctx) {
        const hx = 5;
        const hy = this.lawnY + 20;

        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(hx + 4, hy + 4, 50, 80);

        ctx.fillStyle = '#8b4513';
        ctx.fillRect(hx, hy, 50, 80);
        ctx.fillStyle = '#cd853f';
        ctx.beginPath();
        ctx.moveTo(hx - 5, hy);
        ctx.lineTo(hx + 25, hy - 30);
        ctx.lineTo(hx + 55, hy);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#6b3a1f';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#4a3728';
        ctx.fillRect(hx + 15, hy + 40, 20, 40);
        ctx.strokeStyle = '#2d1f14';
        ctx.strokeRect(hx + 15, hy + 40, 20, 40);

        const winGlow = 0.6 + Math.sin(this.time * 3) * 0.2;
        ctx.fillStyle = `rgba(255, 214, 10, ${winGlow})`;
        ctx.beginPath();
        ctx.arc(hx + 25, hy + 15, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#6a994e';
        ctx.fillRect(hx - 8, hy + 70, 66, 8);
    }

    drawLawn(ctx) {
        const theme = this.levelConfig.theme;

        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const x = this.lawnX + col * this.cellW;
                const y = this.lawnY + row * this.cellH;
                const isWater = this.isWaterCell(row, col);
                const slant = theme === 'roof' ? row * 4 : 0;

                if (isWater) {
                    const wave = Math.sin(this.time * 3 + row + col * 0.5) * 3;
                    const poolGrad = ctx.createLinearGradient(x, y, x, y + this.cellH);
                    poolGrad.addColorStop(0, '#48cae4');
                    poolGrad.addColorStop(0.5, '#0096c7');
                    poolGrad.addColorStop(1, '#0077b6');
                    ctx.fillStyle = poolGrad;
                    ctx.fillRect(x, y, this.cellW - 2, this.cellH - 2);

                    ctx.strokeStyle = `rgba(202, 240, 248, ${0.3 + Math.sin(this.time * 4 + col) * 0.15})`;
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(x + 8, y + this.cellH / 2 + wave);
                    ctx.quadraticCurveTo(x + this.cellW / 2, y + this.cellH / 2 - 8 + wave, x + this.cellW - 10, y + this.cellH / 2 + wave);
                    ctx.stroke();
                    continue;
                }

                let colorA, colorB;
                if (theme === 'night') {
                    colorA = (row + col) % 2 === 0 ? '#2d5a3d' : '#234a32';
                } else if (theme === 'roof') {
                    colorA = (row + col) % 2 === 0 ? '#8b4513' : '#a0522d';
                    colorB = (row + col) % 2 === 0 ? '#cd5c5c' : '#b84a4a';
                } else {
                    colorA = (row + col) % 2 === 0 ? '#52b788' : '#40916c';
                }

                if (theme === 'roof') {
                    ctx.fillStyle = (row + col) % 2 === 0 ? colorA : colorB;
                    ctx.beginPath();
                    ctx.moveTo(x + slant, y);
                    ctx.lineTo(x + this.cellW - 2 + slant, y);
                    ctx.lineTo(x + this.cellW - 2 + slant + 6, y + this.cellH - 2);
                    ctx.lineTo(x + slant + 6, y + this.cellH - 2);
                    ctx.closePath();
                    ctx.fill();
                    ctx.strokeStyle = 'rgba(60, 30, 20, 0.5)';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                } else {
                    ctx.fillStyle = colorA;
                    ctx.fillRect(x, y, this.cellW - 2, this.cellH - 2);
                    ctx.strokeStyle = theme === 'night' ? 'rgba(20, 50, 35, 0.6)' : 'rgba(45, 106, 79, 0.5)';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(x, y, this.cellW - 2, this.cellH - 2);
                }

                const crater = this.getCraterAt(row, col);
                if (crater) {
                    this.drawCrater(ctx, x, y, crater);
                }

                if (theme === 'day' || theme === 'pool') {
                    if ((row + col) % 3 === 0) {
                        ctx.strokeStyle = 'rgba(45, 106, 79, 0.3)';
                        ctx.lineWidth = 1.5;
                        const gx = x + 15 + (col * 7) % 30;
                        const gy = y + this.cellH - 8;
                        ctx.beginPath();
                        ctx.moveTo(gx, gy);
                        ctx.quadraticCurveTo(gx + 2, gy - 10, gx + 4, gy - 5);
                        ctx.stroke();
                    }
                }
            }
        }

        if (theme !== 'roof') {
            const fenceGrad = ctx.createLinearGradient(this.lawnX - 4, 0, this.lawnX, 0);
            fenceGrad.addColorStop(0, theme === 'night' ? '#1a2e1f' : '#2d4a2e');
            fenceGrad.addColorStop(1, theme === 'night' ? '#2d4a35' : '#386641');
            ctx.fillStyle = fenceGrad;
            ctx.fillRect(this.lawnX - 4, this.lawnY, 4, this.rows * this.cellH);
        }
    }

    drawRoofStructure(ctx) {
        const hx = 2;
        const hy = this.lawnY + 30;

        ctx.fillStyle = '#5c4033';
        ctx.fillRect(hx, hy, 55, 90);
        ctx.fillStyle = '#8b7355';
        ctx.fillRect(hx + 55, hy + 20, 8, 70);

        ctx.fillStyle = '#4a3728';
        ctx.fillRect(hx + 12, hy + 55, 18, 35);

        ctx.fillStyle = '#6c757d';
        ctx.fillRect(hx + 20, hy - 25, 16, 30);
        ctx.fillStyle = '#adb5bd';
        ctx.fillRect(hx + 16, hy - 28, 24, 6);

        ctx.fillStyle = 'rgba(80, 60, 50, 0.5)';
        ctx.fillRect(this.lawnX - 10, this.lawnY + this.rows * this.cellH, this.cols * this.cellW + 20, 12);
    }

    drawUpgradeHighlights(ctx) {
        for (const plant of this.plants) {
            if (plant.hp <= 0 || !PLANT_UPGRADES[plant.type]?.upgradeable) continue;

            const isHovered = this.hoveredPlant === plant;
            const isSelected = this.selectedUpgradePlant === plant;
            const canUpgrade = this.canUpgradePlant(plant);
            const maxed = (plant.level || 1) >= getMaxPlantLevel(plant.type);

            if (!isHovered && !isSelected) continue;

            const color = maxed ? 'rgba(149, 213, 178, 0.35)'
                : canUpgrade ? 'rgba(255, 214, 10, 0.35)' : 'rgba(230, 57, 70, 0.35)';
            const x = this.lawnX + plant.col * this.cellW;
            const y = this.lawnY + plant.row * this.cellH;

            ctx.fillStyle = color;
            ctx.fillRect(x, y, this.cellW - 2, this.cellH - 2);
            ctx.strokeStyle = isSelected ? '#ffd60a' : (canUpgrade ? '#95d5b2' : '#e63946');
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 3]);
            ctx.strokeRect(x + 2, y + 2, this.cellW - 6, this.cellH - 6);
            ctx.setLineDash([]);
        }
    }

    drawShovelHighlights(ctx) {
        if (!this.hoveredPlant || this.hoveredPlant.hp <= 0) return;

        const plant = this.hoveredPlant;
        const x = this.lawnX + plant.col * this.cellW;
        const y = this.lawnY + plant.row * this.cellH;
        const pulse = 0.35 + Math.sin(this.time * 8) * 0.1;

        ctx.fillStyle = `rgba(230, 57, 70, ${pulse})`;
        ctx.fillRect(x, y, this.cellW - 2, this.cellH - 2);
        ctx.strokeStyle = '#e63946';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 3]);
        ctx.strokeRect(x + 2, y + 2, this.cellW - 6, this.cellH - 6);
        ctx.setLineDash([]);
    }

    drawPlantLevel(ctx, plant, bob) {
        const level = plant.level || 1;
        if (level <= 1 && !plant.upgradeAnim) return;

        const y = plant.y + bob - 42;
        for (let i = 0; i < level; i++) {
            const glow = plant.upgradeAnim > 0 ? Math.sin(this.time * 20) * 0.3 + 0.7 : 1;
            ctx.globalAlpha = glow;
            ctx.fillStyle = '#ffd60a';
            ctx.font = 'bold 11px Fredoka, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('★', plant.x - (level - 1) * 6 + i * 12, y);
        }
        ctx.globalAlpha = 1;

        if (plant.upgradeAnim > 0) {
            ctx.strokeStyle = `rgba(255, 214, 10, ${plant.upgradeAnim * 1.5})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(plant.x, plant.y + bob, 30 + (0.5 - plant.upgradeAnim) * 20, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    drawPotatoMine(ctx, plant, bob) {
        const armed = plant.armed;
        const armProgress = Math.min(1, (plant.armTimer || 0) / (PLANT_TYPES.potatomine.armTime || 7));
        const ballFlash = Math.sin(this.time * 8) > 0;
        const y = plant.y + bob;

        ctx.fillStyle = '#3d2817';
        ctx.beginPath();
        ctx.ellipse(plant.x, y + 18, 30, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        if (!armed) {
            ctx.fillStyle = '#5c4033';
            ctx.beginPath();
            ctx.ellipse(plant.x, y + 14, 26, 10, 0, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillStyle = '#c4a35a';
            ctx.beginPath();
            ctx.ellipse(plant.x, y + 6, 24, 20, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#8b6914';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.fillStyle = '#2d1f0e';
            ctx.beginPath();
            ctx.moveTo(plant.x - 14, y - 2);
            ctx.lineTo(plant.x - 6, y - 8);
            ctx.lineTo(plant.x + 2, y - 2);
            ctx.closePath();
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(plant.x + 14, y - 2);
            ctx.lineTo(plant.x + 6, y - 8);
            ctx.lineTo(plant.x - 2, y - 2);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = '#1a1a1a';
            ctx.beginPath();
            ctx.ellipse(plant.x - 8, y + 4, 5, 7, 0, 0, Math.PI * 2);
            ctx.ellipse(plant.x + 8, y + 4, 5, 7, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(plant.x - 6, y + 2, 2, 0, Math.PI * 2);
            ctx.arc(plant.x + 10, y + 2, 2, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#5c3d1e';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(plant.x, y + 14, 8, 0.2, Math.PI - 0.2);
            ctx.stroke();
        }

        const poleTop = y - (armed ? 32 : 18 - armProgress * 6);
        ctx.fillStyle = '#6c757d';
        ctx.fillRect(plant.x - 2, poleTop + 10, 4, armed ? 28 : 14 + armProgress * 8);

        ctx.fillStyle = ballFlash ? '#e63946' : '#495057';
        if (ballFlash) {
            ctx.shadowColor = '#e63946';
            ctx.shadowBlur = 10;
        }
        ctx.beginPath();
        ctx.arc(plant.x, poleTop + 6, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#adb5bd';
        ctx.beginPath();
        ctx.arc(plant.x - 2, poleTop + 4, 2, 0, Math.PI * 2);
        ctx.fill();

        if (!armed) {
            const pct = 1 - armProgress;
            ctx.fillStyle = 'rgba(0,0,0,0.45)';
            ctx.font = 'bold 11px Fredoka, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`${Math.ceil(pct * (PLANT_TYPES.potatomine.armTime || 7))}s`, plant.x, y + 36);
        }
    }

    drawPlant(ctx, plant) {
        const data = PLANT_TYPES[plant.type];
        const bob = Math.sin(this.time * 2 + plant.col) * 2;
        const levelScale = 1 + ((plant.level || 1) - 1) * 0.06;
        const scale = (plant.spawnScale || 1) * levelScale;

        ctx.save();
        ctx.translate(plant.x, plant.y);
        ctx.scale(scale, scale);
        ctx.translate(-plant.x, -plant.y);

        if (plant.type === 'tanglekelp') {
            const sway = Math.sin(this.time * 2.5 + plant.col) * 4;
            const submerge = plant.grabbing ? Math.min(20, (1.1 - plant.grabTimer) * 25) : 0;

            ctx.fillStyle = 'rgba(0, 119, 182, 0.25)';
            ctx.beginPath();
            ctx.ellipse(plant.x, plant.y + 14 + bob, 28, 10, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#1b4332';
            ctx.lineWidth = 3;
            for (let i = -1; i <= 1; i++) {
                const ox = i * 10;
                ctx.beginPath();
                ctx.moveTo(plant.x + ox, plant.y + 18 + bob + submerge);
                ctx.quadraticCurveTo(
                    plant.x + ox + sway,
                    plant.y + bob - 8 - submerge,
                    plant.x + ox + sway * 1.5,
                    plant.y - 22 + bob - submerge
                );
                ctx.stroke();
            }

            ctx.fillStyle = '#2d6a4f';
            ctx.beginPath();
            ctx.moveTo(plant.x - 14 + sway, plant.y - 18 + bob - submerge);
            ctx.quadraticCurveTo(plant.x - 6, plant.y - 30 + bob - submerge, plant.x + 2 + sway, plant.y - 16 + bob - submerge);
            ctx.quadraticCurveTo(plant.x + 10, plant.y - 8 + bob - submerge, plant.x + 16 + sway, plant.y - 22 + bob - submerge);
            ctx.quadraticCurveTo(plant.x + 8, plant.y - 34 + bob - submerge, plant.x - 14 + sway, plant.y - 18 + bob - submerge);
            ctx.fill();

            if (plant.grabbing) {
                ctx.strokeStyle = 'rgba(202, 240, 248, 0.7)';
                ctx.lineWidth = 2;
                for (let i = 0; i < 3; i++) {
                    const wave = Math.sin(this.time * 8 + i) * 6;
                    ctx.beginPath();
                    ctx.moveTo(plant.x - 20 + i * 20, plant.y + 10 + bob);
                    ctx.quadraticCurveTo(plant.x - 10 + i * 20 + wave, plant.y + 22 + bob, plant.x + wave, plant.y + 30 + bob);
                    ctx.stroke();
                }
            }
            ctx.restore();
            return;
        }

        if (plant.type === 'lilypad') {
            ctx.fillStyle = '#1b4332';
            ctx.beginPath();
            ctx.ellipse(plant.x, plant.y + 8 + bob, 34, 14, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#40916c';
            ctx.beginPath();
            ctx.ellipse(plant.x, plant.y + 6 + bob, 30, 11, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#2d6a4f';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(plant.x, plant.y + 6 + bob, 30, 11, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = '#52b788';
            ctx.beginPath();
            ctx.ellipse(plant.x - 10, plant.y + 2 + bob, 8, 5, -0.4, 0, Math.PI * 2);
            ctx.ellipse(plant.x + 12, plant.y + 4 + bob, 7, 4, 0.3, 0, Math.PI * 2);
            ctx.fill();
            this.drawPlantLevel(ctx, plant, bob);
            ctx.restore();
            return;
        }

        if (plant.type === 'flowerpot') {
            const potY = plant.y + 10 + bob;
            ctx.fillStyle = '#8b4513';
            ctx.beginPath();
            ctx.moveTo(plant.x - 22, potY - 8);
            ctx.lineTo(plant.x + 22, potY - 8);
            ctx.lineTo(plant.x + 16, potY + 14);
            ctx.lineTo(plant.x - 16, potY + 14);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#a0522d';
            ctx.fillRect(plant.x - 24, potY - 12, 48, 6);
            ctx.strokeStyle = '#6b3a1f';
            ctx.lineWidth = 2;
            ctx.strokeRect(plant.x - 24, potY - 12, 48, 6);
            ctx.fillStyle = '#5c3d1e';
            ctx.beginPath();
            ctx.ellipse(plant.x, potY + 14, 17, 4, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#3d2817';
            ctx.beginPath();
            ctx.ellipse(plant.x, potY - 4, 14, 5, 0, 0, Math.PI * 2);
            ctx.fill();
            this.drawPlantLevel(ctx, plant, bob);
            ctx.restore();
            return;
        }

        if (plant.type === 'potatomine') {
            this.drawPotatoMine(ctx, plant, bob);
            ctx.restore();
            return;
        }

        if (plant.type === 'squash') {
            const progress = plant.squashAttacking
                ? 1 - Math.max(0, plant.squashTimer) / 0.9
                : 0;
            const leapT = Math.min(1, progress / 0.55);
            const drawX = plant.squashAttacking
                ? plant.x + ((plant.squashLandX || plant.x) - plant.x) * leapT
                : plant.x;
            const drawY = plant.y + bob + (plant.jumpOffset || 0);
            const squashW = 26;
            const squashH = 22;

            ctx.fillStyle = '#6a994e';
            ctx.fillRect(drawX - 4, drawY + 10, 8, 12);

            const bodyGrad = ctx.createLinearGradient(drawX, drawY - squashH, drawX, drawY + squashH);
            bodyGrad.addColorStop(0, '#f4a261');
            bodyGrad.addColorStop(0.5, '#e76f51');
            bodyGrad.addColorStop(1, '#bc6c25');
            ctx.fillStyle = bodyGrad;
            ctx.beginPath();
            ctx.ellipse(drawX, drawY, squashW, squashH, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#8b5e34';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(drawX - 8, drawY - 4);
            ctx.quadraticCurveTo(drawX, drawY + 6, drawX + 10, drawY - 2);
            ctx.stroke();

            ctx.fillStyle = '#2d6a4f';
            ctx.beginPath();
            ctx.ellipse(drawX + 4, drawY - squashH + 4, 8, 5, -0.5, 0, Math.PI * 2);
            ctx.fill();

            if (plant.squashAttacking && progress < 0.55) {
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
                ctx.setLineDash([4, 4]);
                ctx.beginPath();
                ctx.moveTo(plant.x, plant.y + bob);
                ctx.lineTo(drawX, drawY);
                ctx.stroke();
                ctx.setLineDash([]);
            }

            ctx.restore();
            return;
        }

        if (plant.type === 'cherrybomb' && plant.explodeTimer > 0) {
            const pulse = 1 + Math.sin(this.time * 10) * 0.15;
            const flash = plant.explodeTimer < 0.5;
            ctx.fillStyle = flash ? '#ff0' : '#e63946';
            ctx.shadowColor = '#e63946';
            ctx.shadowBlur = flash ? 20 : 10;
            ctx.beginPath();
            ctx.arc(plant.x, plant.y + bob, 22 * pulse, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#ff6b6b';
            ctx.beginPath();
            ctx.arc(plant.x - 8, plant.y + bob - 5, 10, 0, Math.PI * 2);
            ctx.arc(plant.x + 8, plant.y + bob - 5, 10, 0, Math.PI * 2);
            ctx.fill();
            this.drawPlantLevel(ctx, plant, bob);
            ctx.restore();
            return;
        }

        if (plant.type === 'torchwood') {
            const flicker = Math.sin(this.time * 10) * 0.15 + 0.85;
            const torchStats = this.getPlantStats(plant);
            const flameColor = torchStats.peaColor || '#ff6b35';
            const flamePale = flameColor === '#f8f9fa' ? '#e9ecef' : flameColor;
            ctx.fillStyle = '#6a994e';
            ctx.fillRect(plant.x - 5, plant.y + 12, 10, 16);

            ctx.fillStyle = '#5c4033';
            ctx.fillRect(plant.x - 18, plant.y + bob - 2, 36, 22);
            ctx.strokeStyle = '#3d2817';
            ctx.lineWidth = 2;
            ctx.strokeRect(plant.x - 18, plant.y + bob - 2, 36, 22);

            ctx.fillStyle = '#8b6914';
            ctx.fillRect(plant.x - 14, plant.y + bob + 2, 8, 14);
            ctx.fillRect(plant.x + 6, plant.y + bob + 4, 8, 12);

            const flameH = 18 + Math.sin(this.time * 8) * 4;
            const grad = ctx.createLinearGradient(plant.x, plant.y + bob - flameH, plant.x, plant.y + bob);
            grad.addColorStop(0, flameColor === '#f8f9fa' ? `rgba(255, 255, 255, ${flicker})` : flamePale + 'ee');
            grad.addColorStop(0.45, flameColor + 'cc');
            grad.addColorStop(1, flameColor === '#f8f9fa' ? `rgba(206, 212, 218, ${flicker * 0.7})` : flameColor + '88');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.moveTo(plant.x - 12, plant.y + bob);
            ctx.quadraticCurveTo(plant.x - 8, plant.y + bob - flameH, plant.x, plant.y + bob - flameH - 6);
            ctx.quadraticCurveTo(plant.x + 8, plant.y + bob - flameH, plant.x + 12, plant.y + bob);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = flameColor === '#f8f9fa'
                ? `rgba(255, 255, 255, ${0.75 + Math.sin(this.time * 12) * 0.15})`
                : flameColor + 'aa';
            ctx.beginPath();
            ctx.arc(plant.x, plant.y + bob - 8, 5, 0, Math.PI * 2);
            ctx.fill();
            this.drawPlantLevel(ctx, plant, bob);
            ctx.restore();
            return;
        }

        if (plant.type === 'wallnut' || plant.type === 'tallnut') {
            const isTall = plant.type === 'tallnut';
            ctx.fillStyle = isTall ? '#8b5e34' : '#bc6c25';
            ctx.beginPath();
            if (isTall) {
                const h = 42;
                const w = 26;
                const top = plant.y + bob - h / 2;
                ctx.roundRect(plant.x - w / 2, top, w, h, 10);
            } else {
                ctx.ellipse(plant.x, plant.y + bob, 28, 24, 0, 0, Math.PI * 2);
            }
            ctx.fill();
            ctx.strokeStyle = isTall ? '#5c3d1e' : '#8b5e34';
            ctx.lineWidth = 3;
            ctx.stroke();

            if (isTall) {
                ctx.strokeStyle = '#6a4c2a';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(plant.x - 8, plant.y + bob - 14);
                ctx.lineTo(plant.x + 8, plant.y + bob - 14);
                ctx.stroke();
            }

            const hpPct = plant.hp / plant.maxHp;
            if (hpPct < 0.66) {
                ctx.strokeStyle = '#5c3d1e';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(plant.x - 10, plant.y + bob - (isTall ? 6 : 0));
                ctx.lineTo(plant.x + 5, plant.y + bob + (isTall ? 2 : 8));
                ctx.stroke();
            }
            if (hpPct < 0.33) {
                ctx.beginPath();
                ctx.moveTo(plant.x + 8, plant.y + bob - (isTall ? 12 : 5));
                ctx.lineTo(plant.x - 5, plant.y + bob + (isTall ? 6 : 12));
                ctx.stroke();
            }
            this.drawPlantLevel(ctx, plant, bob);
            ctx.restore();
            return;
        }

        if (plant.type === 'sunflower' || plant.type === 'twinsunflower') {
            const isTwin = plant.type === 'twinsunflower';
            const heads = isTwin ? [-14, 14] : [0];

            ctx.fillStyle = '#6a994e';
            if (isTwin) {
                ctx.fillRect(plant.x - 5, plant.y + 10, 10, 22);
            } else {
                ctx.fillRect(plant.x - 4, plant.y + 10, 8, 20);
            }

            for (const headX of heads) {
                for (let i = 0; i < 8; i++) {
                    const angle = (i / 8) * Math.PI * 2 + this.time + headX * 0.02;
                    const px = plant.x + headX + Math.cos(angle) * (isTwin ? 14 : 18);
                    const py = plant.y + bob + Math.sin(angle) * (isTwin ? 14 : 18);
                    ctx.fillStyle = '#ffd60a';
                    ctx.beginPath();
                    ctx.ellipse(px, py, isTwin ? 7 : 8, isTwin ? 10 : 12, angle, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.fillStyle = '#8b5e00';
                ctx.beginPath();
                ctx.arc(plant.x + headX, plant.y + bob, isTwin ? 10 : 12, 0, Math.PI * 2);
                ctx.fill();
            }

            this.drawPlantLevel(ctx, plant, bob);
            ctx.restore();
            return;
        }

        if (plant.type === 'boomshroom') {
            const asleep = !this.isMushroomAwake(plant);
            const armed = plant.boomArmed;
            const pulse = armed ? 1 + Math.sin(this.time * 12) * 0.12 : 1;
            const capR = 16 * pulse;
            const capY = plant.y + bob - capR * 0.35;

            ctx.fillStyle = '#f8f9fa';
            ctx.fillRect(plant.x - 4, plant.y + bob + 2, 8, 12);

            const capGrad = ctx.createRadialGradient(plant.x, capY, 2, plant.x, capY, capR);
            capGrad.addColorStop(0, armed ? '#ffba08' : '#ff6b6b');
            capGrad.addColorStop(1, armed ? '#e63946' : '#9d0208');
            ctx.fillStyle = capGrad;
            ctx.beginPath();
            ctx.arc(plant.x, capY, capR, Math.PI, 0);
            ctx.lineTo(plant.x + capR, capY + 4);
            ctx.quadraticCurveTo(plant.x, capY + 8, plant.x - capR, capY + 4);
            ctx.closePath();
            ctx.fill();

            if (armed) {
                ctx.shadowColor = '#ffba08';
                ctx.shadowBlur = armed && plant.boomTimer < 0.5 ? 18 : 10;
                ctx.fillStyle = '#fff3bf';
                ctx.beginPath();
                ctx.arc(plant.x, capY - 4, capR * 0.35, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            }

            ctx.fillStyle = '#495057';
            for (let i = 0; i < 5; i++) {
                const dotX = plant.x - 10 + i * 5;
                ctx.beginPath();
                ctx.arc(dotX, capY + 2, 1.5, 0, Math.PI * 2);
                ctx.fill();
            }

            if (plant.coffeeAwake) {
                ctx.font = '11px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('☕', plant.x + capR * 0.45, capY - capR - 2);
            }

            ctx.fillStyle = asleep ? '#adb5bd' : '#590d22';
            if (asleep) {
                ctx.lineWidth = 2;
                ctx.strokeStyle = '#495057';
                ctx.beginPath();
                ctx.moveTo(plant.x - 6, capY + 2);
                ctx.lineTo(plant.x - 2, capY + 2);
                ctx.moveTo(plant.x + 2, capY + 2);
                ctx.lineTo(plant.x + 6, capY + 2);
                ctx.stroke();
            } else {
                ctx.beginPath();
                ctx.arc(plant.x - 5, capY + 1, 2.5, 0, Math.PI * 2);
                ctx.arc(plant.x + 5, capY + 1, 2.5, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();
            return;
        }

        if (plant.type === 'puffshroom' || plant.type === 'sunshroom' || plant.type === 'hypnoshroom') {
            const isPuff = plant.type === 'puffshroom';
            const isHypno = plant.type === 'hypnoshroom';
            const asleep = !this.isMushroomAwake(plant);
            const shroomStats = isPuff ? {} : this.getPlantStats(plant);
            const growTime = shroomStats.growTime || PLANT_TYPES.sunshroom.growTime || 24;
            const growPct = isPuff ? 1 : Math.min(1, (plant.growTimer || 0) / growTime);
            const grown = growPct >= 1;
            const scale = isHypno ? 0.9 : (isPuff ? 0.85 : (0.65 + growPct * 0.35));
            const capR = (isHypno ? 15 : (isPuff ? 14 : 12)) * scale;
            const capY = plant.y + bob - capR * 0.35;

            ctx.fillStyle = '#f8f9fa';
            ctx.fillRect(plant.x - 3 * scale, plant.y + bob + 2, 6 * scale, 10 * scale);

            const capGrad = ctx.createRadialGradient(plant.x, capY, 2, plant.x, capY, capR);
            if (isHypno) {
                capGrad.addColorStop(0, '#ff8fab');
                capGrad.addColorStop(1, '#c9184a');
            } else if (isPuff) {
                capGrad.addColorStop(0, '#e0aaff');
                capGrad.addColorStop(1, '#7b2cbf');
            } else {
                capGrad.addColorStop(0, grown ? '#ffe066' : '#ffd60a');
                capGrad.addColorStop(1, grown ? '#e9c46a' : '#f4a261');
            }
            ctx.fillStyle = capGrad;
            ctx.beginPath();
            ctx.arc(plant.x, capY, capR, Math.PI, 0);
            ctx.lineTo(plant.x + capR, capY + 4);
            ctx.quadraticCurveTo(plant.x, capY + 8, plant.x - capR, capY + 4);
            ctx.closePath();
            ctx.fill();

            if (!isPuff && !isHypno && grown) {
                ctx.fillStyle = 'rgba(255, 214, 10, 0.35)';
                ctx.beginPath();
                ctx.arc(plant.x, capY - 2, capR * 0.55, 0, Math.PI * 2);
                ctx.fill();
            }

            if (plant.coffeeAwake) {
                ctx.font = '11px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('☕', plant.x + capR * 0.45, capY - capR - 2);
            }

            ctx.fillStyle = asleep ? '#adb5bd' : (isHypno ? '#590d22' : '#1b4332');
            if (asleep) {
                ctx.lineWidth = 2;
                ctx.strokeStyle = '#495057';
                ctx.beginPath();
                ctx.moveTo(plant.x - 6, capY + 2);
                ctx.lineTo(plant.x - 2, capY + 2);
                ctx.moveTo(plant.x + 2, capY + 2);
                ctx.lineTo(plant.x + 6, capY + 2);
                ctx.stroke();
                ctx.fillStyle = '#6c757d';
                ctx.font = 'bold 10px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('z', plant.x - 8, capY - capR - 4);
                ctx.fillText('z', plant.x + 2, capY - capR - 10);
            } else if (isHypno) {
                ctx.strokeStyle = '#590d22';
                ctx.lineWidth = 2;
                for (const eyeX of [-5, 5]) {
                    ctx.beginPath();
                    ctx.arc(plant.x + eyeX * scale, capY + 1, 4 * scale, 0, Math.PI * 1.6);
                    ctx.stroke();
                }
            } else {
                ctx.beginPath();
                ctx.arc(plant.x - 5 * scale, capY + 1, 2.5 * scale, 0, Math.PI * 2);
                ctx.arc(plant.x + 5 * scale, capY + 1, 2.5 * scale, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(plant.x - 4 * scale, capY, 1.2 * scale, 0, Math.PI * 2);
                ctx.arc(plant.x + 6 * scale, capY, 1.2 * scale, 0, Math.PI * 2);
                ctx.fill();
            }

            this.drawPlantLevel(ctx, plant, bob);
            ctx.restore();
            return;
        }

        if (plant.type === 'peashooter' || plant.type === 'snowpea' || plant.type === 'gatlingpea') {
            const isGatling = plant.type === 'gatlingpea';
            ctx.fillStyle = '#6a994e';
            ctx.fillRect(plant.x - 4, plant.y + 8, 8, 18);

            const bodyColor = plant.type === 'snowpea' ? '#48cae4' : '#52b788';
            ctx.fillStyle = bodyColor;
            ctx.beginPath();
            ctx.ellipse(plant.x, plant.y + bob, isGatling ? 18 : 16, isGatling ? 20 : 18, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = plant.type === 'snowpea' ? '#0096c7' : '#2d6a4f';
            if (isGatling) {
                for (let i = 0; i < 4; i++) {
                    const angle = -0.35 + i * 0.12;
                    ctx.save();
                    ctx.translate(plant.x + 16, plant.y + bob - 2);
                    ctx.rotate(angle);
                    ctx.beginPath();
                    ctx.ellipse(8, 0, 9, 6, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }
            } else {
                ctx.beginPath();
                ctx.ellipse(plant.x + 18, plant.y + bob - 2, 10, 8, 0, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.fillStyle = '#1b4332';
            ctx.beginPath();
            ctx.arc(plant.x - 5, plant.y + bob - 8, 5, 0, Math.PI * 2);
            ctx.arc(plant.x + 5, plant.y + bob - 8, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(plant.x - 4, plant.y + bob - 9, 2, 0, Math.PI * 2);
            ctx.arc(plant.x + 6, plant.y + bob - 9, 2, 0, Math.PI * 2);
            ctx.fill();
            this.drawPlantLevel(ctx, plant, bob);
            ctx.restore();
            return;
        }

        if (plant.type === 'cobcannon') {
            const cobStats = this.getPlantStats(plant);
            const reloadDuration = cobStats.reloadTime || PLANT_TYPES.cobcannon.reloadTime || 36;
            const ready = plant.reloadTimer <= 0;
            const reloadPct = ready ? 1 : 1 - (plant.reloadTimer / reloadDuration);
            const bob = Math.sin(this.time * 2 + plant.col) * 2;

            ctx.fillStyle = '#6a994e';
            ctx.fillRect(plant.x - this.cellW * 0.42, plant.y + 12, this.cellW * 0.84, 14);

            const baseW = this.cellW * 0.78;
            ctx.fillStyle = '#8b6914';
            ctx.fillRect(plant.x - baseW / 2, plant.y + bob + 4, baseW, 12);
            ctx.strokeStyle = '#5c4033';
            ctx.lineWidth = 2;
            ctx.strokeRect(plant.x - baseW / 2, plant.y + bob + 4, baseW, 12);

            const barrelGrad = ctx.createLinearGradient(plant.x - 40, plant.y, plant.x + 40, plant.y);
            barrelGrad.addColorStop(0, '#5c4033');
            barrelGrad.addColorStop(0.5, ready ? '#a0522d' : '#7a5c3e');
            barrelGrad.addColorStop(1, '#3d2817');
            ctx.fillStyle = barrelGrad;
            ctx.fillRect(plant.x - 34, plant.y + bob - 18, 68, 24);
            ctx.fillRect(plant.x + 30, plant.y + bob - 12, 22, 14);

            ctx.fillStyle = ready ? '#ffba08' : '#8b5e34';
            ctx.beginPath();
            ctx.arc(plant.x - 8, plant.y + bob - 6, 12, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#e9c46a';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(plant.x - 14, plant.y + bob - 10);
            ctx.quadraticCurveTo(plant.x - 4, plant.y + bob - 18, plant.x + 6, plant.y + bob - 8);
            ctx.stroke();

            if (!ready) {
                const barW = baseW - 8;
                ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
                ctx.fillRect(plant.x - barW / 2, plant.y + bob + 20, barW, 6);
                ctx.fillStyle = '#ffd60a';
                ctx.fillRect(plant.x - barW / 2, plant.y + bob + 20, barW * reloadPct, 6);
            } else {
                ctx.fillStyle = 'rgba(255, 214, 10, 0.35)';
                ctx.beginPath();
                ctx.arc(plant.x + 42, plant.y + bob - 6, 6 + Math.sin(this.time * 8) * 2, 0, Math.PI * 2);
                ctx.fill();
            }

            this.drawPlantLevel(ctx, plant, bob);
            ctx.restore();
            return;
        }

        if (plant.type === 'cabbagepult' || plant.type === 'kernelpult' || plant.type === 'melonpult' || plant.type === 'wintermelon') {
            const isKernel = plant.type === 'kernelpult';
            const isMelon = plant.type === 'melonpult' || plant.type === 'wintermelon';
            const isWinter = plant.type === 'wintermelon';
            ctx.fillStyle = '#6a994e';
            ctx.fillRect(plant.x - 4, plant.y + 10, 8, 16);

            const basketW = isMelon ? 34 : 28;
            ctx.fillStyle = '#8b6914';
            ctx.fillRect(plant.x - basketW / 2, plant.y + bob + 2, basketW, 10);
            ctx.strokeStyle = '#5c4033';
            ctx.lineWidth = 2;
            ctx.strokeRect(plant.x - basketW / 2, plant.y + bob + 2, basketW, 10);

            ctx.fillStyle = isWinter ? '#48cae4' : (isMelon ? '#40916c' : (isKernel ? '#e9c46a' : '#52b788'));
            ctx.beginPath();
            ctx.ellipse(plant.x, plant.y + bob - 4, isMelon ? 16 : 14, isMelon ? 18 : 16, 0, 0, Math.PI * 2);
            ctx.fill();

            if (isMelon) {
                ctx.fillStyle = isWinter ? '#90e0ef' : '#2d6a4f';
                ctx.beginPath();
                ctx.arc(plant.x, plant.y + bob - 20, 11, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = isWinter ? '#0096c7' : '#1b4332';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(plant.x - 8, plant.y + bob - 24);
                ctx.lineTo(plant.x + 8, plant.y + bob - 16);
                ctx.moveTo(plant.x - 4, plant.y + bob - 14);
                ctx.lineTo(plant.x + 10, plant.y + bob - 22);
                ctx.stroke();
                if (isWinter) {
                    ctx.fillStyle = 'rgba(202, 240, 248, 0.7)';
                    ctx.beginPath();
                    ctx.arc(plant.x - 5, plant.y + bob - 22, 3, 0, Math.PI * 2);
                    ctx.arc(plant.x + 6, plant.y + bob - 18, 2.5, 0, Math.PI * 2);
                    ctx.fill();
                }
            } else {
                ctx.fillStyle = isKernel ? '#f4a261' : '#7cb518';
                ctx.beginPath();
                ctx.arc(plant.x, plant.y + bob - 18, isKernel ? 7 : 9, 0, Math.PI * 2);
                ctx.fill();

                if (!isKernel) {
                    ctx.fillStyle = '#40916c';
                    ctx.beginPath();
                    ctx.ellipse(plant.x - 8, plant.y + bob - 20, 6, 3, -0.5, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            ctx.fillStyle = '#1b4332';
            ctx.beginPath();
            ctx.arc(plant.x - 4, plant.y + bob - 10, 4, 0, Math.PI * 2);
            ctx.arc(plant.x + 4, plant.y + bob - 10, 4, 0, Math.PI * 2);
            ctx.fill();
            this.drawPlantLevel(ctx, plant, bob);
            ctx.restore();
        }
    }

    drawDuckyTube(ctx, x, y, bob) {
        const tubeY = y + 10 + bob;
        const wobble = Math.sin(this.time * 3 + x * 0.05) * 2;

        ctx.fillStyle = 'rgba(72, 202, 228, 0.35)';
        ctx.beginPath();
        ctx.ellipse(x, tubeY + 10, 30, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ff9f1c';
        ctx.beginPath();
        ctx.ellipse(x, tubeY + wobble, 28, 13, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#e85d04';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(x, tubeY + wobble, 28, 13, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#ffb703';
        ctx.beginPath();
        ctx.ellipse(x - 10, tubeY - 4 + wobble, 6, 3, -0.4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#48cae4';
        ctx.beginPath();
        ctx.ellipse(x, tubeY + 2 + wobble, 14, 6, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    drawFlag(ctx, zombie, bob) {
        const poleX = zombie.x - 18;
        const poleTop = zombie.y - 75 + bob;
        const poleBottom = zombie.y - 5 + bob;
        const flutter = Math.sin(this.time * 8 + zombie.row) * 4;
        const raised = zombie.flagRaised;
        const raiseAngle = raised ? -0.4 : 0;

        ctx.save();
        ctx.translate(poleX, poleBottom);
        ctx.rotate(raiseAngle);
        ctx.translate(-poleX, -poleBottom);

        ctx.strokeStyle = '#5c4033';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(poleX, poleBottom);
        ctx.lineTo(poleX, poleTop);
        ctx.stroke();

        ctx.fillStyle = '#c1121f';
        ctx.beginPath();
        ctx.moveTo(poleX, poleTop);
        ctx.lineTo(poleX + 22 + flutter, poleTop + 6);
        ctx.lineTo(poleX + 20 + flutter, poleTop + 18);
        ctx.lineTo(poleX, poleTop + 14);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#ffd60a';
        ctx.fillRect(poleX + 4, poleTop + 4, 8, 8);

        if (raised && zombie.raiseTimer > 0) {
            ctx.fillStyle = `rgba(255, 214, 10, ${0.3 + Math.sin(this.time * 12) * 0.2})`;
            ctx.beginPath();
            ctx.arc(poleX + 10, poleTop + 8, 16, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    drawLawnmower(ctx, mower) {
        const { x, y } = mower;
        const active = mower.state === 'active';

        ctx.save();
        if (active) {
            ctx.fillStyle = 'rgba(232, 93, 4, 0.25)';
            ctx.beginPath();
            ctx.ellipse(x, y + 4, 28, 10, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.fillStyle = '#343a40';
        ctx.fillRect(x - 14, y - 6, 28, 14);
        ctx.fillStyle = active ? '#e85d04' : '#dc2f02';
        ctx.fillRect(x - 12, y - 10, 24, 8);

        ctx.fillStyle = '#212529';
        ctx.beginPath();
        ctx.arc(x - 9, y + 8, 5, 0, Math.PI * 2);
        ctx.arc(x + 9, y + 8, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#6c757d';
        ctx.beginPath();
        ctx.arc(x - 9, y + 8, 2, 0, Math.PI * 2);
        ctx.arc(x + 9, y + 8, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffd60a';
        ctx.fillRect(x - 4, y - 8, 8, 4);

        if (active) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 2;
            for (let i = 1; i <= 3; i++) {
                ctx.beginPath();
                ctx.moveTo(x - i * 14, y);
                ctx.lineTo(x - i * 14 - 6, y - 3);
                ctx.stroke();
            }
        }

        ctx.restore();
    }

    drawArmBandages(ctx, x, y) {
        const drawBandaid = (bx, by, angle) => {
            ctx.save();
            ctx.translate(bx, by);
            ctx.rotate(angle);
            ctx.fillStyle = '#f1f3f5';
            ctx.fillRect(-8, -3.5, 16, 7);
            ctx.strokeStyle = '#ced4da';
            ctx.lineWidth = 1;
            ctx.strokeRect(-8, -3.5, 16, 7);
            ctx.fillStyle = '#ffa8a8';
            ctx.fillRect(-2.5, -2, 5, 4);
            ctx.restore();
        };
        drawBandaid(x - 4, y - 2, -0.1);
        drawBandaid(x + 5, y + 3, 0.15);
    }

    drawZomboss(ctx, zombie) {
        const data = ZOMBIE_TYPES.zomboss;
        const bob = Math.sin(zombie.animTimer * 2) * 4;
        const stomp = Math.sin(zombie.animTimer * 3) * 2;
        const x = zombie.x;
        const y = zombie.y;
        const lawnHeight = this.rows * this.cellH;
        const scale = Math.min(0.82, (this.cellW - 6) / 96, lawnHeight / 175);

        ctx.save();
        ctx.translate(x, y);
        if (zombie.dying) {
            ctx.rotate(zombie.fallAngle);
            ctx.globalAlpha = zombie.deathTimer / 0.6;
        }
        ctx.scale(scale, scale);
        ctx.translate(-x, -y);

        if (zombie.slowTimer > 0 && !zombie.dying) {
            ctx.fillStyle = 'rgba(72, 202, 228, 0.3)';
            ctx.beginPath();
            ctx.ellipse(x, y, 65, 85, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath();
        ctx.ellipse(x, y + 72 + bob, 48, 14, 0, 0, Math.PI * 2);
        ctx.fill();

        // Robot legs
        ctx.fillStyle = '#495057';
        ctx.fillRect(x - 38, y + 40 + bob + stomp, 22, 32);
        ctx.fillRect(x + 16, y + 40 + bob - stomp, 22, 32);
        ctx.fillStyle = '#343a40';
        ctx.fillRect(x - 42, y + 68 + bob, 30, 10);
        ctx.fillRect(x + 12, y + 68 + bob, 30, 10);

        // Robot torso
        const bodyGrad = ctx.createLinearGradient(x - 50, y - 30, x + 50, y + 50);
        bodyGrad.addColorStop(0, '#adb5bd');
        bodyGrad.addColorStop(0.5, '#6c757d');
        bodyGrad.addColorStop(1, '#495057');
        ctx.fillStyle = bodyGrad;
        ctx.fillRect(x - 48, y - 20 + bob, 96, 65);
        ctx.strokeStyle = '#343a40';
        ctx.lineWidth = 3;
        ctx.strokeRect(x - 48, y - 20 + bob, 96, 65);

        // Rivets
        ctx.fillStyle = '#dee2e6';
        for (let i = 0; i < 6; i++) {
            ctx.beginPath();
            ctx.arc(x - 36 + i * 14, y + 5 + bob, 2.5, 0, Math.PI * 2);
            ctx.fill();
        }

        // Robot arms
        const armBob = Math.sin(zombie.animTimer * 4) * 6;
        ctx.fillStyle = '#6c757d';
        ctx.fillRect(x - 68, y - 5 + bob + armBob, 22, 14);
        ctx.fillRect(x + 46, y - 5 + bob - armBob, 22, 14);
        ctx.fillStyle = '#495057';
        ctx.fillRect(x - 72, y + 8 + bob + armBob, 14, 22);
        ctx.fillRect(x + 58, y + 8 + bob - armBob, 14, 22);

        // Cockpit dome
        ctx.fillStyle = 'rgba(72, 202, 228, 0.25)';
        ctx.beginPath();
        ctx.ellipse(x, y - 42 + bob, 32, 22, 0, Math.PI, 0);
        ctx.fill();
        ctx.strokeStyle = '#495057';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Dr. Zomboss in white lab coat
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(x - 10, y - 58 + bob, 20, 22);
        ctx.fillRect(x - 14, y - 48 + bob, 8, 14);
        ctx.fillRect(x + 6, y - 48 + bob, 8, 14);

        ctx.fillStyle = '#7a8c6f';
        ctx.beginPath();
        ctx.ellipse(x, y - 62 + bob, 10, 11, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#2d3436';
        ctx.fillRect(x - 8, y - 66 + bob, 6, 4);
        ctx.fillRect(x + 2, y - 66 + bob, 6, 4);

        ctx.fillStyle = '#e63946';
        ctx.beginPath();
        ctx.arc(x - 5, y - 64 + bob, 1.5, 0, Math.PI * 2);
        ctx.arc(x + 5, y - 64 + bob, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Robot eyes
        ctx.fillStyle = '#e63946';
        ctx.shadowColor = '#e63946';
        ctx.shadowBlur = 8;
        ctx.fillRect(x - 22, y - 8 + bob, 10, 6);
        ctx.fillRect(x + 12, y - 8 + bob, 10, 6);
        ctx.shadowBlur = 0;

        // Spawn chute glow
        if (!zombie.dying && zombie.spawnTimer < 0.4) {
            ctx.fillStyle = 'rgba(230, 57, 70, 0.5)';
            ctx.beginPath();
            ctx.ellipse(x - 30, y + 35 + bob, 12, 8, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        if (!zombie.dying) {
            const barW = 90;
            this.drawZombieHealthBar(ctx, x, y - 88 + bob, zombie, barW, 8);
            ctx.font = 'bold 11px Fredoka, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#fff';
            ctx.fillText(data.name, x, y - 94 + bob);
        }

        ctx.restore();
    }

    drawGargantuar(ctx, zombie, bob) {
        const data = ZOMBIE_TYPES[zombie.type];
        const scale = data.scale || 1.55;
        const isGiga = zombie.type === 'gigagargantuar';
        const throwBoost = zombie.throwAnim > 0 ? Math.sin(zombie.throwAnim * 14) * 0.35 : 0;
        const poleSwing = zombie.eatAnim > 0
            ? Math.sin(zombie.eatAnim) * 0.3
            : Math.sin(zombie.walkAnim) * 0.08 + throwBoost;

        ctx.save();
        ctx.translate(zombie.x, zombie.y);
        ctx.scale(scale, scale);
        ctx.translate(-zombie.x, -zombie.y);

        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.beginPath();
        ctx.ellipse(zombie.x, zombie.y + 28, 22, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = data.color;
        ctx.fillRect(zombie.x - 14, zombie.y - 32 + bob, 28, 52);

        ctx.fillStyle = '#6b6355';
        ctx.beginPath();
        ctx.ellipse(zombie.x, zombie.y - 42 + bob, 20, 22, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#3d3d3d';
        ctx.fillRect(zombie.x - 16, zombie.y - 48 + bob, 12, 7);
        ctx.fillRect(zombie.x + 4, zombie.y - 48 + bob, 12, 7);

        ctx.fillStyle = isGiga ? '#ff0f0f' : '#c1121f';
        ctx.beginPath();
        ctx.arc(zombie.x - 10, zombie.y - 44 + bob, isGiga ? 4 : 3, 0, Math.PI * 2);
        ctx.arc(zombie.x + 10, zombie.y - 44 + bob, isGiga ? 4 : 3, 0, Math.PI * 2);
        ctx.fill();

        const armSwing = zombie.eatAnim > 0 ? 0 : Math.sin(zombie.walkAnim) * 5 - throwBoost * 12;
        ctx.fillStyle = data.color;
        ctx.fillRect(zombie.x - 26, zombie.y - 8 + bob + armSwing, 12, 8);
        ctx.fillRect(zombie.x + 14, zombie.y - 8 + bob - armSwing, 12, 8);

        if (zombie.instantPlantHits >= 1) {
            this.drawArmBandages(ctx, zombie.x - 20, zombie.y - 4 + bob + armSwing);
        }

        ctx.save();
        ctx.translate(zombie.x + (isGiga ? 24 : 20), zombie.y - 5 + bob);
        ctx.rotate(-0.5 + poleSwing);
        ctx.fillStyle = isGiga ? '#3d2817' : '#5c4033';
        ctx.fillRect(-3, isGiga ? -68 : -55, 6, isGiga ? 74 : 60);
        ctx.fillStyle = isGiga ? '#6b4f3a' : '#8b7355';
        ctx.beginPath();
        ctx.moveTo(0, isGiga ? -72 : -58);
        ctx.lineTo(isGiga ? -10 : -8, isGiga ? -58 : -48);
        ctx.lineTo(isGiga ? 10 : 8, isGiga ? -58 : -48);
        ctx.closePath();
        ctx.fill();
        if (isGiga) {
            ctx.fillStyle = '#adb5bd';
            ctx.beginPath();
            ctx.moveTo(0, -70);
            ctx.lineTo(-5, -62);
            ctx.lineTo(5, -62);
            ctx.closePath();
            ctx.fill();
        }
        ctx.restore();

        ctx.fillStyle = '#4a4235';
        ctx.fillRect(zombie.x - 10, zombie.y + 18 + bob, 9, 10);
        ctx.fillRect(zombie.x + 1, zombie.y + 18 + bob - armSwing * 0.5, 9, 10);

        if (!zombie.dying) {
            const barW = isGiga ? 52 : 44;
            const barY = isGiga ? 82 : 72;
            this.drawZombieHealthBar(ctx, zombie.x, zombie.y - barY + bob, zombie, barW, 6);
        }

        ctx.restore();
    }

    drawHypnotizedOverlay(ctx, zombie, bob) {
        const isBoss = zombie.isBoss;
        const isLarge = isBoss || isGargantuarType(zombie.type);
        const rx = isBoss ? 52 : (isGargantuarType(zombie.type) ? 40 : 24);
        const ry = isBoss ? 64 : (isGargantuarType(zombie.type) ? 50 : 34);
        const eyeY = isBoss ? zombie.y - 72 + bob : zombie.y - 39 + bob;
        const eyeSpread = isBoss ? 18 : (isGargantuarType(zombie.type) ? 14 : 9);
        const eyeR = isBoss ? 7 : (isGargantuarType(zombie.type) ? 5.5 : 4.5);

        ctx.fillStyle = 'rgba(255, 77, 141, 0.22)';
        ctx.beginPath();
        ctx.ellipse(zombie.x, zombie.y, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ff4d8d';
        ctx.lineWidth = isLarge ? 3 : 2;
        for (const eyeX of [-eyeSpread, eyeSpread]) {
            ctx.beginPath();
            ctx.arc(zombie.x + eyeX, eyeY, eyeR, 0.2, Math.PI * 1.8);
            ctx.stroke();
        }
    }

    drawImp(ctx, zombie, bob) {
        const data = ZOMBIE_TYPES.imp;
        const scale = data.scale || 0.62;

        ctx.save();
        ctx.translate(zombie.x, zombie.y);
        ctx.scale(scale, scale);
        ctx.translate(-zombie.x, -zombie.y);

        ctx.fillStyle = 'rgba(0,0,0,0.12)';
        ctx.beginPath();
        ctx.ellipse(zombie.x, zombie.y + 28, 16, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = data.color;
        ctx.fillRect(zombie.x - 12, zombie.y - 30 + bob, 24, 45);

        ctx.fillStyle = '#7a8c6f';
        ctx.beginPath();
        ctx.ellipse(zombie.x, zombie.y - 38 + bob, 16, 18, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#2d3436';
        ctx.fillRect(zombie.x - 14, zombie.y - 42 + bob, 10, 6);
        ctx.fillRect(zombie.x + 4, zombie.y - 42 + bob, 10, 6);

        ctx.fillStyle = '#e63946';
        ctx.beginPath();
        ctx.arc(zombie.x - 9, zombie.y - 39 + bob, 2.5, 0, Math.PI * 2);
        ctx.arc(zombie.x + 9, zombie.y - 39 + bob, 2.5, 0, Math.PI * 2);
        ctx.fill();

        const armSwing = zombie.eatAnim > 0 ? 0 : Math.sin(zombie.walkAnim) * 5;
        ctx.fillStyle = data.color;
        ctx.fillRect(zombie.x - 20, zombie.y - 10 + bob + armSwing, 10, 6);
        ctx.fillRect(zombie.x + 10, zombie.y - 10 + bob - armSwing, 10, 6);

        ctx.fillStyle = '#4a4235';
        ctx.fillRect(zombie.x - 9, zombie.y + 14 + bob, 8, 8);
        ctx.fillRect(zombie.x + 1, zombie.y + 14 + bob - armSwing * 0.4, 8, 8);

        if (!zombie.dying) {
            this.drawZombieHealthBar(ctx, zombie.x, zombie.y - 58 + bob, zombie, 26, 4);
        }

        if (zombie.hypnotized && !zombie.dying) {
            this.drawHypnotizedOverlay(ctx, zombie, bob);
        }

        ctx.restore();
    }

    drawZombie(ctx, zombie) {
        const data = ZOMBIE_TYPES[zombie.type];
        const walkBob = zombie.type === 'allstar' ? 5 : 3;
        const bob = zombie.eatAnim > 0
            ? Math.sin(zombie.eatAnim) * 4
            : Math.sin(zombie.walkAnim * (zombie.type === 'allstar' ? 1.6 : 1)) * walkBob;

        if (zombie.type === 'zomboss') {
            this.drawZomboss(ctx, zombie);
            this.drawFrozenOverlay(ctx, zombie, 70, 95);
            if (zombie.hypnotized && !zombie.dying) {
                const bob = Math.sin(zombie.animTimer * 2) * 4;
                this.drawHypnotizedOverlay(ctx, zombie, bob);
            }
            return;
        }

        if (isGargantuarType(zombie.type)) {
            const auraW = zombie.type === 'gigagargantuar' ? 50 : 42;
            const auraH = zombie.type === 'gigagargantuar' ? 62 : 55;
            ctx.save();
            ctx.translate(zombie.x, zombie.y);
            if (zombie.dying) {
                ctx.rotate(zombie.fallAngle);
                ctx.globalAlpha = zombie.deathTimer / 0.6;
            }
            ctx.translate(-zombie.x, -zombie.y);
            if (zombie.slowTimer > 0 && !zombie.dying) {
                ctx.fillStyle = 'rgba(72, 202, 228, 0.35)';
                ctx.beginPath();
                ctx.ellipse(zombie.x, zombie.y, auraW, auraH, 0, 0, Math.PI * 2);
                ctx.fill();
            }
            this.drawGargantuar(ctx, zombie, bob);
            this.drawFrozenOverlay(ctx, zombie, auraW, auraH);
            if (zombie.hypnotized && !zombie.dying) {
                this.drawHypnotizedOverlay(ctx, zombie, bob);
            }
            ctx.restore();
            return;
        }

        if (zombie.type === 'imp') {
            ctx.save();
            ctx.translate(zombie.x, zombie.y);
            if (zombie.dying) {
                ctx.rotate(zombie.fallAngle);
                ctx.globalAlpha = zombie.deathTimer / 0.6;
            }
            ctx.translate(-zombie.x, -zombie.y);
            if (zombie.slowTimer > 0 && !zombie.dying) {
                ctx.fillStyle = 'rgba(72, 202, 228, 0.35)';
                ctx.beginPath();
                ctx.ellipse(zombie.x, zombie.y, 18, 24, 0, 0, Math.PI * 2);
                ctx.fill();
            }
            this.drawImp(ctx, zombie, bob);
            this.drawFrozenOverlay(ctx, zombie, 18, 24);
            ctx.restore();
            return;
        }

        const inPool = this.isPoolRow(zombie.row) && this.canZombieSwimInPool(zombie.type);
        const drawBob = inPool
            ? Math.sin(this.time * 3 + zombie.row) * 3
            : bob;

        ctx.save();
        ctx.translate(zombie.x, zombie.y);
        if (zombie.dying) {
            ctx.rotate(zombie.fallAngle);
            ctx.globalAlpha = zombie.deathTimer / 0.6;
        }
        ctx.translate(-zombie.x, -zombie.y);

        if (inPool && !zombie.dying) {
            this.drawDuckyTube(ctx, zombie.x, zombie.y, drawBob);
        }

        if (zombie.slowTimer > 0 && !zombie.dying) {
            ctx.fillStyle = 'rgba(72, 202, 228, 0.35)';
            ctx.beginPath();
            ctx.ellipse(zombie.x, zombie.y, 30, 40, 0, 0, Math.PI * 2);
            ctx.fill();
            for (let i = 0; i < 3; i++) {
                const sx = zombie.x + Math.sin(this.time * 4 + i * 2) * 20;
                const sy = zombie.y - 20 + i * 8;
                ctx.fillStyle = 'rgba(202, 240, 248, 0.6)';
                ctx.beginPath();
                ctx.arc(sx, sy, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        const bodyLift = inPool ? -6 : 0;
        ctx.fillStyle = data.color;
        ctx.fillRect(zombie.x - 12, zombie.y - 30 + drawBob + bodyLift, 24, inPool ? 38 : 45);

        ctx.fillStyle = '#7a8c6f';
        ctx.beginPath();
        ctx.ellipse(zombie.x, zombie.y - 38 + drawBob + bodyLift, 16, 18, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#2d3436';
        ctx.fillRect(zombie.x - 14, zombie.y - 42 + drawBob + bodyLift, 10, 6);
        ctx.fillRect(zombie.x + 4, zombie.y - 42 + drawBob + bodyLift, 10, 6);

        ctx.fillStyle = '#e63946';
        ctx.beginPath();
        ctx.arc(zombie.x - 9, zombie.y - 39 + drawBob + bodyLift, 2, 0, Math.PI * 2);
        ctx.arc(zombie.x + 9, zombie.y - 39 + drawBob + bodyLift, 2, 0, Math.PI * 2);
        ctx.fill();

        if (zombie.butterTimer > 0 && !zombie.dying) {
            ctx.fillStyle = '#ffd60a';
            ctx.beginPath();
            ctx.ellipse(zombie.x, zombie.y - 52 + drawBob + bodyLift, 18, 10, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffee32';
            ctx.fillRect(zombie.x - 7, zombie.y - 57 + drawBob + bodyLift, 14, 7);
        }

        ctx.fillStyle = data.color;
        const armSwing = zombie.eatAnim > 0 ? 0 : Math.sin(zombie.walkAnim) * 4;
        ctx.fillRect(zombie.x - 20, zombie.y - 10 + drawBob + bodyLift + armSwing, 10, 6);
        ctx.fillRect(zombie.x + 10, zombie.y - 10 + drawBob + bodyLift - armSwing, 10, 6);

        if (data.hat === 'cone') {
            ctx.fillStyle = '#ff9f1c';
            ctx.beginPath();
            ctx.moveTo(zombie.x, zombie.y - 58 + drawBob + bodyLift);
            ctx.lineTo(zombie.x - 14, zombie.y - 48 + drawBob + bodyLift);
            ctx.lineTo(zombie.x + 14, zombie.y - 48 + drawBob + bodyLift);
            ctx.closePath();
            ctx.fill();
        } else if (data.hat === 'bucket') {
            ctx.fillStyle = '#adb5bd';
            ctx.fillRect(zombie.x - 14, zombie.y - 58 + drawBob + bodyLift, 28, 14);
            ctx.fillStyle = '#6c757d';
            ctx.fillRect(zombie.x - 16, zombie.y - 46 + drawBob + bodyLift, 32, 4);
        } else if (data.hat === 'allstar') {
            const hy = zombie.y - 54 + drawBob + bodyLift;
            ctx.fillStyle = '#2d6a4f';
            ctx.beginPath();
            ctx.ellipse(zombie.x, hy, 18, 14, 0, Math.PI, 0);
            ctx.fill();
            ctx.fillStyle = '#f8f9fa';
            ctx.fillRect(zombie.x - 3, hy - 12, 6, 16);
            ctx.strokeStyle = '#dee2e6';
            ctx.lineWidth = 1.5;
            for (let i = -1; i <= 1; i++) {
                ctx.beginPath();
                ctx.moveTo(zombie.x + i * 7 - 2, hy + 2);
                ctx.lineTo(zombie.x + i * 7 - 2, hy + 12);
                ctx.stroke();
            }
            ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
            ctx.fillRect(zombie.x - 14, hy + 4, 28, 3);
        } else if (data.hat === 'flag') {
            this.drawFlag(ctx, zombie, drawBob + bodyLift);
        }

        if (!zombie.dying) {
            const barW = zombie.type === 'allstar' ? 36 : 30;
            const barY = zombie.type === 'allstar' ? 70 : 65;
            this.drawZombieHealthBar(ctx, zombie.x, zombie.y - barY + drawBob + bodyLift, zombie, barW, 5);
        }

        this.drawFrozenOverlay(ctx, zombie, 30, 40);

        if (zombie.hypnotized && !zombie.dying) {
            this.drawHypnotizedOverlay(ctx, zombie, drawBob + bodyLift);
        }

        ctx.restore();
    }

    drawProjectile(ctx, proj) {
        for (let i = 0; i < proj.trail.length; i++) {
            const t = proj.trail[i];
            const alpha = (i / proj.trail.length) * 0.4;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = proj.color;
            ctx.beginPath();
            ctx.arc(t.x, t.y, proj.projType === 'butter' ? 6 : 4, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        ctx.fillStyle = proj.color;
        ctx.shadowColor = proj.color;
        ctx.shadowBlur = 6;

        if (proj.projType === 'cabbage') {
            ctx.beginPath();
            ctx.arc(proj.x, proj.y, 9, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#40916c';
            ctx.beginPath();
            ctx.ellipse(proj.x - 4, proj.y - 3, 5, 3, -0.6, 0, Math.PI * 2);
            ctx.fill();
        } else if (proj.projType === 'kernel') {
            ctx.beginPath();
            ctx.ellipse(proj.x, proj.y, 6, 8, 0, 0, Math.PI * 2);
            ctx.fill();
        } else if (proj.projType === 'butter') {
            ctx.fillRect(proj.x - 9, proj.y - 6, 18, 12);
        } else if (proj.projType === 'spore') {
            ctx.fillStyle = proj.color;
            ctx.beginPath();
            ctx.arc(proj.x - 3, proj.y, 5, 0, Math.PI * 2);
            ctx.arc(proj.x + 4, proj.y - 2, 4, 0, Math.PI * 2);
            ctx.arc(proj.x + 1, proj.y + 3, 4.5, 0, Math.PI * 2);
            ctx.fill();
        } else if (proj.cob) {
            ctx.fillStyle = '#ffba08';
            ctx.beginPath();
            ctx.ellipse(proj.x, proj.y, 14, 18, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#e9c46a';
            ctx.beginPath();
            ctx.ellipse(proj.x - 5, proj.y - 4, 8, 10, -0.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#8b5e34';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(proj.x - 8, proj.y - 2);
            ctx.lineTo(proj.x + 10, proj.y + 4);
            ctx.stroke();
        } else if (proj.projType === 'melon' || proj.projType === 'wintermelon') {
            ctx.beginPath();
            ctx.arc(proj.x, proj.y, 11, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = proj.projType === 'wintermelon' ? '#0096c7' : '#1b4332';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(proj.x - 7, proj.y - 4);
            ctx.lineTo(proj.x + 7, proj.y + 2);
            ctx.moveTo(proj.x - 3, proj.y + 6);
            ctx.lineTo(proj.x + 8, proj.y - 5);
            ctx.stroke();
            if (proj.projType === 'wintermelon') {
                ctx.fillStyle = 'rgba(202, 240, 248, 0.75)';
                ctx.beginPath();
                ctx.arc(proj.x - 4, proj.y - 3, 3, 0, Math.PI * 2);
                ctx.arc(proj.x + 5, proj.y + 2, 2.5, 0, Math.PI * 2);
                ctx.fill();
            }
        } else {
            if (proj.fire) {
                ctx.shadowColor = proj.color;
                ctx.shadowBlur = proj.color === '#f8f9fa' ? 16 : 12;
            }
            ctx.beginPath();
            ctx.arc(proj.x, proj.y, proj.fire ? 8 : 7, 0, Math.PI * 2);
            ctx.fill();
            if (proj.fire && proj.color === '#f8f9fa') {
                ctx.shadowBlur = 0;
                ctx.strokeStyle = '#adb5bd';
                ctx.lineWidth = 1.5;
                ctx.stroke();
            }
            if (proj.fire) {
                ctx.fillStyle = '#ffee32';
                ctx.beginPath();
                ctx.arc(proj.x - 2, proj.y - 2, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        ctx.shadowBlur = 0;

        if (proj.frozen) {
            ctx.strokeStyle = '#caf0f8';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }

    drawSun(ctx, s) {
        const pulse = 1 + Math.sin(this.time * 4) * 0.08;
        const r = s.radius * pulse;

        ctx.fillStyle = 'rgba(255, 214, 10, 0.25)';
        ctx.beginPath();
        ctx.arc(s.x, s.y, r + 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffd60a';
        ctx.shadowColor = '#ffd60a';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#ffee32';
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2 + this.time * 2;
            const len = r + 6 + Math.sin(this.time * 6 + i) * 2;
            ctx.beginPath();
            ctx.moveTo(s.x + Math.cos(angle) * r * 0.6, s.y + Math.sin(angle) * r * 0.6);
            ctx.lineTo(s.x + Math.cos(angle) * len, s.y + Math.sin(angle) * len);
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#ffee32';
            ctx.stroke();
        }
    }

    drawParticle(ctx, p) {
        ctx.globalAlpha = Math.min(1, p.life * 2);
        ctx.fillStyle = p.color;

        if (p.shape === 'star') {
            this.drawStar(ctx, p.x, p.y, p.size, p.angle || 0);
        } else if (p.shape === 'rect') {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.angle || 0);
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
            ctx.restore();
        } else {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }

    drawStar(ctx, x, y, size, angle) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
            const r = i % 2 === 0 ? size : size * 0.4;
            const px = Math.cos(a) * r;
            const py = Math.sin(a) * r;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    drawMuzzleFlash(ctx, mf) {
        const alpha = mf.life / 0.12;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = mf.color;
        ctx.beginPath();
        ctx.ellipse(mf.x, mf.y, 8 + (1 - alpha) * 6, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    drawExplosionRing(ctx, ring) {
        ctx.globalAlpha = ring.life * 2;
        ctx.strokeStyle = ring.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
    }

    drawFloatingText(ctx, ft) {
        const alpha = Math.min(1, ft.life / ft.maxLife * 2);
        ctx.globalAlpha = alpha;
        ctx.font = `bold ${ft.size}px Fredoka, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fillText(ft.text, ft.x + 1, ft.y + 1);
        ctx.fillStyle = ft.color;
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.globalAlpha = 1;
    }

    drawCobAimPreview(ctx) {
        const col = Math.floor((this.mouseX - this.lawnX) / this.cellW);
        const row = Math.floor((this.mouseY - this.lawnY) / this.cellH);
        if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) return;

        const radius = this.cobCannonAiming
            ? (this.getPlantStats(this.cobCannonAiming).blastRadius ?? 1)
            : 1;
        const pulse = 0.25 + Math.sin(this.time * 8) * 0.12;
        for (let dr = -radius; dr <= radius; dr++) {
            for (let dc = -radius; dc <= radius; dc++) {
                const r = row + dr;
                const c = col + dc;
                if (r < 0 || r >= this.rows || c < 0 || c >= this.cols) continue;
                const x = this.lawnX + c * this.cellW;
                const y = this.lawnY + r * this.cellH;
                ctx.fillStyle = `rgba(255, 186, 8, ${pulse + (dr === 0 && dc === 0 ? 0.2 : 0)})`;
                ctx.fillRect(x + 2, y + 2, this.cellW - 4, this.cellH - 4);
                ctx.strokeStyle = '#ffba08';
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 4]);
                ctx.strokeRect(x + 4, y + 4, this.cellW - 8, this.cellH - 8);
            }
        }
        ctx.setLineDash([]);

        ctx.font = '2rem sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🌽', this.mouseX, this.mouseY);
    }

    drawPlacementPreview(ctx) {
        const col = Math.floor((this.mouseX - this.lawnX) / this.cellW);
        const row = Math.floor((this.mouseY - this.lawnY) / this.cellH);

        if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) return;

        const x = this.lawnX + col * this.cellW;
        const y = this.lawnY + row * this.cellH;
        const isWater = this.isWaterCell(row, col);
        const hasCrater = this.hasCraterAt(row, col);
        const data = PLANT_TYPES[this.selectedPlant];
        const invalid = !this.selectedPlant || !this.canPlacePlant(row, col, this.selectedPlant);
        const cobPair = this.selectedPlant === 'cobcannon' ? this.getKernelPairForCobCannon(row, col) : null;
        const requiredCarrier = this.getRequiredCarrier(row, col);
        const needsCarrier = requiredCarrier
            && this.selectedPlant !== requiredCarrier
            && !this.hasCarrierAt(row, col, requiredCarrier);
        const carrierHint = requiredCarrier === 'lilypad' ? '🪷' : '🏺';

        const pulse = 0.3 + Math.sin(this.time * 6) * 0.1;
        ctx.fillStyle = invalid ? `rgba(230, 57, 70, ${pulse + 0.1})` : `rgba(255, 214, 10, ${pulse})`;
        ctx.fillRect(x, y, this.cellW - 2, this.cellH - 2);

        ctx.strokeStyle = invalid ? '#e63946' : '#ffd60a';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.strokeRect(x + 2, y + 2, this.cellW - 6, this.cellH - 6);
        ctx.setLineDash([]);

        if (cobPair && !invalid) {
            for (let dc = 0; dc < 2; dc++) {
                const cx = this.lawnX + (cobPair.leftCol + dc) * this.cellW;
                const cy = this.lawnY + row * this.cellH;
                ctx.fillStyle = `rgba(255, 214, 10, ${pulse + 0.05})`;
                ctx.fillRect(cx + 2, cy + 2, this.cellW - 4, this.cellH - 4);
                ctx.strokeStyle = '#ffd60a';
                ctx.lineWidth = 2;
                ctx.strokeRect(cx + 4, cy + 4, this.cellW - 8, this.cellH - 8);
            }
            ctx.font = '2rem sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.globalAlpha = 0.8;
            ctx.fillText('🌽', this.lawnX + cobPair.leftCol * this.cellW + this.cellW, y + this.cellH / 2);
            ctx.globalAlpha = 1;
        } else if (!invalid) {
            ctx.font = '2rem sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.globalAlpha = 0.7;
            ctx.fillText(data.icon, x + this.cellW / 2, y + this.cellH / 2);
            ctx.globalAlpha = 1;
        } else if (needsCarrier) {
            ctx.font = 'bold 14px Fredoka, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = requiredCarrier === 'lilypad'
                ? 'rgba(202, 240, 248, 0.8)'
                : 'rgba(255, 214, 10, 0.85)';
            ctx.fillText(carrierHint, x + this.cellW / 2, y + this.cellH / 2);
        } else if (isWater && this.selectedPlant === 'lilypad') {
            ctx.font = 'bold 14px Fredoka, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = 'rgba(202, 240, 248, 0.8)';
            ctx.fillText('🌊', x + this.cellW / 2, y + this.cellH / 2);
        } else if (isWater && this.selectedPlant === 'tanglekelp') {
            ctx.font = 'bold 14px Fredoka, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = 'rgba(202, 240, 248, 0.8)';
            ctx.fillText('🌿', x + this.cellW / 2, y + this.cellH / 2);
        } else if (!isWater && PLANT_TYPES[this.selectedPlant]?.waterOnly) {
            ctx.font = 'bold 14px Fredoka, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = 'rgba(202, 240, 248, 0.8)';
            ctx.fillText('🌊', x + this.cellW / 2, y + this.cellH / 2);
        } else if (this.selectedPlant === 'wintermelon') {
            ctx.font = 'bold 14px Fredoka, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = 'rgba(202, 240, 248, 0.8)';
            const hasMelon = this.getPlantsAt(row, col).some((p) => p.type === 'melonpult' && p.hp > 0);
            ctx.fillText(hasMelon ? '❄️' : '🍈', x + this.cellW / 2, y + this.cellH / 2);
        } else if (this.selectedPlant === 'gatlingpea') {
            ctx.font = 'bold 14px Fredoka, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = 'rgba(183, 228, 199, 0.9)';
            const hasPea = this.getPlantsAt(row, col).some((p) => p.type === 'peashooter' && p.hp > 0);
            ctx.fillText(hasPea ? '🔫' : '🌱', x + this.cellW / 2, y + this.cellH / 2);
        } else if (this.selectedPlant === 'twinsunflower') {
            ctx.font = 'bold 14px Fredoka, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = 'rgba(255, 214, 10, 0.9)';
            const hasSunflower = this.getPlantsAt(row, col).some((p) => p.type === 'sunflower' && p.hp > 0);
            ctx.fillText(hasSunflower ? '🌻🌻' : '🌻', x + this.cellW / 2, y + this.cellH / 2);
        } else if (this.selectedPlant === 'cobcannon') {
            ctx.font = 'bold 14px Fredoka, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = 'rgba(255, 186, 8, 0.9)';
            const pair = this.getKernelPairForCobCannon(row, col);
            ctx.fillText(pair ? '🌽🌽' : '🌽', x + this.cellW / 2, y + this.cellH / 2);
        } else if (this.selectedPlant === 'coffeebean') {
            ctx.font = 'bold 14px Fredoka, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = 'rgba(111, 78, 55, 0.9)';
            const mushroom = this.getPlantsAt(row, col).find((p) => PLANT_TYPES[p.type]?.mushroom && p.hp > 0);
            const canWake = mushroom && !mushroom.coffeeAwake && this.levelConfig.theme !== 'night';
            ctx.fillText(canWake ? '☕' : '🍄', x + this.cellW / 2, y + this.cellH / 2);
        } else if (hasCrater) {
            ctx.font = 'bold 14px Fredoka, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = 'rgba(90, 24, 154, 0.8)';
            ctx.fillText('🕳️', x + this.cellW / 2, y + this.cellH / 2);
        }
        ctx.globalAlpha = 1;
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new PvZGame();
});