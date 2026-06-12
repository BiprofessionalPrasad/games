// Plants vs Zombies - Enhanced Canvas Game

const PLANT_TYPES = {
    sunflower: { name: 'Sunflower', cost: 50, cooldown: 5, hp: 80, icon: '🌻', color: '#ffd60a' },
    peashooter: { name: 'Peashooter', cost: 100, cooldown: 7, hp: 80, icon: '🌱', color: '#52b788' },
    wallnut: { name: 'Wall-nut', cost: 50, cooldown: 20, hp: 400, icon: '🥜', color: '#bc6c25' },
    cherrybomb: { name: 'Cherry Bomb', cost: 150, cooldown: 30, hp: 1, icon: '🍒', color: '#e63946' },
    potatomine: { name: 'Potato Mine', cost: 25, cooldown: 10, hp: 80, icon: '🥔', color: '#c4a35a', armTime: 7 },
    snowpea: { name: 'Snow Pea', cost: 175, cooldown: 7, hp: 80, icon: '❄️', color: '#48cae4' },
};

const ZOMBIE_TYPES = {
    regular: { name: 'Zombie', hp: 100, speed: 0.3, damage: 15, color: '#6b705c', hat: null, score: 10 },
    cone: { name: 'Conehead', hp: 200, speed: 0.28, damage: 15, color: '#6b705c', hat: 'cone', score: 25 },
    bucket: { name: 'Buckethead', hp: 350, speed: 0.25, damage: 18, color: '#6b705c', hat: 'bucket', score: 40 },
    gargantuar: { name: 'Gargantuar', hp: 600, speed: 0.16, damage: 25, color: '#5a5340', hat: 'gargantuar', score: 75, instantPlantHitsToKill: 2 },
    flag: { name: 'Flag Zombie', hp: 100, speed: 0.32, damage: 15, color: '#6b705c', hat: 'flag', score: 15 },
};

const MAX_PLANT_LEVEL = 3;

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
    cherrybomb: { upgradeable: false },
    potatomine: { upgradeable: false },
};

function getUpgradeCost(type, currentLevel) {
    if (!PLANT_UPGRADES[type]?.upgradeable || currentLevel >= MAX_PLANT_LEVEL) return null;
    return Math.floor(PLANT_TYPES[type].cost * (0.5 + currentLevel * 0.35));
}

function buildPoolWaterCells() {
    const cells = [];
    for (let r = 1; r <= 4; r++) {
        for (let c = 2; c <= 6; c++) cells.push(`${r},${c}`);
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
        description: 'No sky sun — use Sunflowers!',
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
        description: 'Pool blocks center tiles',
        theme: 'pool',
        rows: 6,
        cols: 9,
        startingSun: 150,
        skySun: true,
        waterCells: buildPoolWaterCells(),
        zombieSpeedMult: 1,
    },
    roof: {
        id: 'roof',
        name: 'Roof',
        icon: '🏠',
        description: 'Steep roof, faster zombies',
        theme: 'roof',
        rows: 5,
        cols: 9,
        startingSun: 200,
        skySun: false,
        waterCells: [],
        zombieSpeedMult: 1.15,
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
        this.selectedUpgradePlant = null;
        this.hoveredPlant = null;
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

        this.wave = 1;
        this.zombiesInWave = 0;
        this.zombiesSpawned = 0;
        this.waveTimer = 0;
        this.spawnTimer = 0;
        this.waveAssaultActive = false;
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

    isWaterCell(row, col) {
        return this.waterCells.has(`${row},${col}`);
    }

    canPlantAt(row, col) {
        return row >= 0 && row < this.rows && col >= 0 && col < this.cols && !this.isWaterCell(row, col);
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
        for (const [type, data] of Object.entries(PLANT_TYPES)) {
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
            this.startGame();
        });
        document.getElementById('restartBtn').addEventListener('click', () => this.startGame());
        document.getElementById('menuBtn').addEventListener('click', () => this.returnToMenu());
        document.getElementById('resumeBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('muteBtn').addEventListener('click', () => {
            const muted = this.audio.toggleMute();
            document.getElementById('muteBtn').textContent = muted ? '🔇' : '🔊';
        });
        document.getElementById('upgradeModeBtn').addEventListener('click', () => this.toggleUpgradeMode());
        document.getElementById('closeUpgradeBtn').addEventListener('click', () => this.hideUpgradePanel());
        document.getElementById('confirmUpgradeBtn').addEventListener('click', () => this.confirmUpgrade());
        document.getElementById('closeAdminBtn').addEventListener('click', () => this.toggleAdminPanel(false));
        document.getElementById('adminGiveSunBtn').addEventListener('click', () => this.adminGiveSun(200));
        document.getElementById('adminSpawnZombieBtn').addEventListener('click', () => this.adminSpawnZombie('regular'));
        document.getElementById('adminSpawnConeBtn').addEventListener('click', () => this.adminSpawnZombie('cone'));
        document.getElementById('adminSpawnBucketBtn').addEventListener('click', () => this.adminSpawnZombie('bucket'));
        document.getElementById('adminSpawnGargBtn').addEventListener('click', () => this.adminSpawnZombie('gargantuar'));
        document.getElementById('adminForceWaveBtn').addEventListener('click', () => this.adminForceWave());

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

    adminGiveSun(amount) {
        if (!this.isPlaying || this.isGameOver) return;
        this.sun += amount;
        this.pulseSunCounter();
        this.updateHUD();
    }

    adminSpawnZombie(type) {
        if (!this.isPlaying || this.isGameOver) return;
        this.spawnZombie(type);
        this.updateHUD();
    }

    adminForceWave() {
        if (!this.isPlaying || this.isGameOver) return;
        if (!this.waveAssaultActive) this.beginWaveAssault();
    }

    getPlantAt(x, y) {
        for (let i = this.plants.length - 1; i >= 0; i--) {
            const p = this.plants[i];
            if (p.hp <= 0) continue;
            if (Math.hypot(x - p.x, y - p.y) < 38) return p;
        }
        return null;
    }

    getPlantStats(plant) {
        const idx = (plant.level || 1) - 1;
        const up = PLANT_UPGRADES[plant.type];
        if (!up?.upgradeable) return {};

        switch (plant.type) {
            case 'sunflower':
                return { sunInterval: up.sunInterval[idx], sunValue: up.sunValue[idx] };
            case 'peashooter':
                return { shootInterval: up.shootInterval[idx], damage: up.damage[idx] };
            case 'wallnut':
                return { maxHp: up.maxHp[idx] };
            case 'snowpea':
                return {
                    shootInterval: up.shootInterval[idx],
                    damage: up.damage[idx],
                    slowDuration: up.slowDuration[idx],
                };
            default:
                return {};
        }
    }

    canUpgradePlant(plant) {
        if (!plant || !PLANT_UPGRADES[plant.type]?.upgradeable) return false;
        if ((plant.level || 1) >= MAX_PLANT_LEVEL) return false;
        const cost = getUpgradeCost(plant.type, plant.level || 1);
        return cost !== null && this.sun >= cost;
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
        document.getElementById('upgradePlantLevel').textContent =
            level >= MAX_PLANT_LEVEL ? `Level ${level} — MAX` : `Level ${level} → ${level + 1}`;

        const btn = document.getElementById('confirmUpgradeBtn');
        const desc = document.getElementById('upgradeDescription');

        if (level >= MAX_PLANT_LEVEL) {
            desc.textContent = up.descriptions[MAX_PLANT_LEVEL - 1] + ' (max level reached)';
            btn.textContent = 'Max Level';
            btn.disabled = true;
        } else {
            desc.textContent = up.descriptions[level];
            btn.textContent = `Upgrade — ☀ ${cost}`;
            btn.disabled = this.sun < cost;
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

        this.sun -= cost;
        plant.level = level + 1;
        plant.upgradeAnim = 0.5;

        const stats = this.getPlantStats(plant);
        if (plant.type === 'wallnut' && stats.maxHp) {
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
        document.getElementById('gameOverOverlay').classList.add('hidden');
        document.getElementById('pauseOverlay').classList.add('hidden');
        document.getElementById('levelBadge').classList.remove('visible');
        document.getElementById('gameScreen').classList.remove('active');
        document.getElementById('menuScreen').classList.add('active');
    }

    startGame() {
        document.getElementById('menuScreen').classList.remove('active');
        document.getElementById('gameScreen').classList.add('active');
        document.getElementById('gameOverOverlay').classList.add('hidden');
        document.getElementById('pauseOverlay').classList.add('hidden');

        this.applyLevel(this.currentLevel);

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
        this.selectedUpgradePlant = null;
        this.hoveredPlant = null;
        this.plants = [];
        this.zombies = [];
        this.projectiles = [];
        this.suns = [];
        this.particles = [];
        this.floatingTexts = [];
        this.muzzleFlashes = [];
        this.explosionRings = [];
        this.initLawnmowers();
        this.wave = 1;
        this.zombiesInWave = 5;
        this.zombiesSpawned = 0;
        this.waveTimer = 0;
        this.spawnTimer = 0;
        this.waveAssaultActive = false;
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

        this.toggleUpgradeMode(false);
        this.toggleShovelMode(false);
        this.toggleAdminPanel(false);
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

    startWave() {
        this.waveAssaultActive = false;
        this.flagZombieSpawned = false;
        this.zombiesSpawned = 0;
        this.spawnTimer = 0;
        this.spawnFlagZombie();
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
        const row = Math.floor(Math.random() * this.rows);
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
            walkAnim: 0,
            eatAnim: 0,
            dying: false,
            deathTimer: 0,
            fallAngle: 0,
            flagRaised: false,
            raiseTimer: 0,
        });
        this.flagZombieSpawned = true;
    }

    selectPlant(type) {
        if (!this.isPlaying || this.isPaused || this.isGameOver) return;
        const data = PLANT_TYPES[type];
        if (this.sun < data.cost || this.cooldowns[type] > 0) return;

        if (this.upgradeMode) this.toggleUpgradeMode(false);
        if (this.shovelMode) this.toggleShovelMode(false);
        this.hideUpgradePanel();
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

        if (!this.selectedPlant) return;

        const col = Math.floor((x - this.lawnX) / this.cellW);
        const row = Math.floor((y - this.lawnY) / this.cellH);

        if (!this.canPlantAt(row, col)) return;

        const data = PLANT_TYPES[this.selectedPlant];
        if (this.sun < data.cost || this.cooldowns[this.selectedPlant] > 0) return;

        const occupied = this.plants.some((p) => p.row === row && p.col === col && p.hp > 0);
        if (occupied) return;

        const px = this.lawnX + col * this.cellW + this.cellW / 2;
        const py = this.lawnY + row * this.cellH + this.cellH / 2;

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
        });

        this.sun -= data.cost;
        this.cooldowns[this.selectedPlant] = data.cooldown;
        this.spawnParticles(px, py, data.color, 12, 'burst');
        this.audio.play('plant');
        this.deselectPlant();
        this.updateHUD();
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
        this.sun += s.value;
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
        for (const key of Object.keys(this.cooldowns)) {
            if (this.cooldowns[key] > 0) this.cooldowns[key] = Math.max(0, this.cooldowns[key] - dt);
        }
        this.updatePlantBar();
        this.checkSunAutoCollect();

        if (this.screenShake > 0) this.screenShake = Math.max(0, this.screenShake - dt * 8);
        if (this.screenFlash > 0) this.screenFlash = Math.max(0, this.screenFlash - dt * 3);

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

            if (plant.type === 'sunflower') {
                plant.sunTimer += dt;
                const interval = stats.sunInterval || 7;
                if (plant.sunTimer >= interval) {
                    plant.sunTimer = 0;
                    this.suns.push({
                        x: plant.x,
                        y: plant.y,
                        targetY: plant.y + 30,
                        value: stats.sunValue || 25,
                        radius: 18,
                        life: 8,
                        falling: true,
                    });
                }
            }

            if (plant.type === 'peashooter' || plant.type === 'snowpea') {
                plant.shootTimer += dt;
                const interval = stats.shootInterval || (plant.type === 'snowpea' ? 1.8 : 1.5);
                if (plant.shootTimer >= interval) {
                    const hasZombie = this.zombies.some(
                        (z) => z.row === plant.row && z.x > plant.x && z.hp > 0 && !z.dying
                    );
                    if (hasZombie) {
                        plant.shootTimer = 0;
                        this.projectiles.push({
                            x: plant.x + 20,
                            y: plant.y - 5,
                            row: plant.row,
                            speed: 4,
                            damage: stats.damage || 20,
                            frozen: plant.type === 'snowpea',
                            slowDuration: stats.slowDuration || 3,
                            color: plant.type === 'snowpea' ? '#48cae4' : '#52b788',
                            trail: [],
                        });
                        this.muzzleFlashes.push({
                            x: plant.x + 22,
                            y: plant.y - 2,
                            life: 0.12,
                            color: plant.type === 'snowpea' ? '#caf0f8' : '#b7e4c7',
                        });
                        this.audio.play('shoot');
                    }
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
        }

        this.plants = this.plants.filter((p) => p.hp > 0);

        if (this.selectedUpgradePlant && !this.plants.includes(this.selectedUpgradePlant)) {
            this.hideUpgradePanel();
        }

        for (const proj of this.projectiles) {
            proj.trail.push({ x: proj.x, y: proj.y });
            if (proj.trail.length > 6) proj.trail.shift();
            proj.x += proj.speed * 60 * dt;
        }
        this.projectiles = this.projectiles.filter((p) => p.x < this.canvas.width);

        for (const proj of this.projectiles) {
            for (const zombie of this.zombies) {
                if (zombie.row !== proj.row || zombie.hp <= 0 || zombie.dying) continue;
                const hitW = zombie.type === 'gargantuar' ? 30 : 20;
                const hitH = zombie.type === 'gargantuar' ? 45 : 30;
                if (Math.abs(proj.x - zombie.x) < hitW && Math.abs(proj.y - zombie.y) < hitH) {
                    zombie.hp -= proj.damage;
                    if (proj.frozen) zombie.slowTimer = proj.slowDuration || 3;
                    proj.hit = true;
                    this.spawnParticles(proj.x, proj.y, proj.color, 5);
                    this.audio.play('hit');
                    if (zombie.hp <= 0) this.killZombie(zombie);
                    break;
                }
            }
        }
        this.projectiles = this.projectiles.filter((p) => !p.hit);

        for (const zombie of this.zombies) {
            if (zombie.dying) {
                zombie.deathTimer -= dt;
                zombie.fallAngle += dt * 4;
                continue;
            }
            if (zombie.hp <= 0) continue;

            const speedMult = zombie.slowTimer > 0 ? 0.5 : 1;
            if (zombie.slowTimer > 0) zombie.slowTimer -= dt;

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

            for (const plant of this.plants) {
                if (plant.row !== zombie.row || plant.hp <= 0) continue;
                const eatRange = zombie.type === 'gargantuar' ? 50 : 35;
                if (Math.abs(zombie.x - plant.x) >= eatRange) continue;

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

                eating = true;
                plant.hp -= zombie.damage * dt;
                zombie.eatAnim += dt * 8;
                break;
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
                if (zombie.row !== mower.row || zombie.dying || zombie.hp <= 0) continue;
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

    killZombie(zombie) {
        const data = ZOMBIE_TYPES[zombie.type];
        this.score += data.score;
        this.kills++;
        zombie.dying = true;
        zombie.deathTimer = 0.6;
        zombie.fallAngle = 0;
        const debris = zombie.type === 'gargantuar' ? 22 : 14;
        const particleColor = zombie.type === 'gargantuar' ? '#5a5340' : '#6b705c';
        this.spawnParticles(zombie.x, zombie.y, particleColor, debris, zombie.type === 'gargantuar' ? 'debris' : 'default');
        if (zombie.type === 'gargantuar') this.addScreenShake(6);
        this.addFloatingText(zombie.x, zombie.y - 30, `+${data.score}`, '#95d5b2', 0.8, 16);
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
            this.spawnParticles(zombie.x, zombie.y - 15, '#e63946', 14, 'explosion');
            this.audio.play('hit');
            this.addScreenShake(5);
        }
    }

    explodeArea(plant, color) {
        this.spawnParticles(plant.x, plant.y, color, 40, 'explosion');
        this.explosionRings.push({ x: plant.x, y: plant.y, radius: 10, life: 0.5, color });
        this.explosionRings.push({ x: plant.x, y: plant.y, radius: 5, life: 0.35, color: '#ffd60a' });
        this.addScreenShake(12);
        this.addScreenFlash(color, 0.5);
        this.audio.play('explode');

        for (const zombie of this.zombies) {
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
            if (zombie.dying || zombie.row !== plant.row) continue;
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
                if (this.wave > 10) {
                    this.endGame(true);
                    return;
                }
                this.zombiesInWave = 4 + this.wave * 2;
                this.waveTimer = 0;
                this.startWave();
            }
        }
    }

    spawnZombie(forcedType = null) {
        const row = Math.floor(Math.random() * this.rows);
        let type = forcedType || 'regular';
        if (!forcedType) {
            const roll = Math.random();
            if (this.wave >= 7 && roll < 0.1) type = 'gargantuar';
            else if (this.wave >= 5 && roll < 0.18) type = 'bucket';
            else if (this.wave >= 3 && roll < 0.3) type = 'cone';
        }

        const data = ZOMBIE_TYPES[type];
        if (!data) return;
        const speedMult = this.levelConfig.zombieSpeedMult || 1;
        this.zombies.push({
            type,
            row,
            x: this.lawnX + this.cols * this.cellW + 20,
            y: this.lawnY + row * this.cellH + this.cellH / 2,
            hp: data.hp,
            maxHp: data.hp,
            speed: (data.speed + this.wave * 0.02) * speedMult,
            damage: data.damage,
            slowTimer: 0,
            walkAnim: 0,
            eatAnim: 0,
            dying: false,
            deathTimer: 0,
            fallAngle: 0,
            instantPlantHits: type === 'gargantuar' ? 0 : undefined,
        });
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
            ? 'You survived all 10 waves! Your lawn is safe.'
            : 'The zombies ate your brains!';
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('finalWave').textContent = won ? 10 : this.wave;
        document.getElementById('finalKills').textContent = this.kills;
        if (won) this.audio.play('win');
        else this.audio.play('death');
    }

    updateHUD() {
        document.getElementById('sunAmount').textContent = Math.floor(this.sun);
        document.getElementById('waveNum').textContent = this.wave;
        document.getElementById('scoreAmount').textContent = this.score;
        if (!this.waveAssaultActive) {
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
        if (level >= MAX_PLANT_LEVEL) {
            btn.disabled = true;
            return;
        }
        const cost = getUpgradeCost(plant.type, level);
        btn.textContent = `Upgrade — ☀ ${cost}`;
        btn.disabled = this.sun < cost;
    }

    updatePlantBar() {
        document.querySelectorAll('.plant-card').forEach((card) => {
            const type = card.dataset.type;
            if (!type || !PLANT_TYPES[type]) return;

            const data = PLANT_TYPES[type];
            const disabled = this.sun < data.cost || this.cooldowns[type] > 0;
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

        for (const plant of this.plants) this.drawPlant(ctx, plant);
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
            const maxed = (plant.level || 1) >= MAX_PLANT_LEVEL;

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

        if (plant.type === 'potatomine') {
            this.drawPotatoMine(ctx, plant, bob);
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

        if (plant.type === 'wallnut') {
            ctx.fillStyle = '#bc6c25';
            ctx.beginPath();
            ctx.ellipse(plant.x, plant.y + bob, 28, 24, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#8b5e34';
            ctx.lineWidth = 3;
            ctx.stroke();

            const hpPct = plant.hp / plant.maxHp;
            if (hpPct < 0.66) {
                ctx.strokeStyle = '#5c3d1e';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(plant.x - 10, plant.y + bob);
                ctx.lineTo(plant.x + 5, plant.y + bob + 8);
                ctx.stroke();
            }
            if (hpPct < 0.33) {
                ctx.beginPath();
                ctx.moveTo(plant.x + 8, plant.y + bob - 5);
                ctx.lineTo(plant.x - 5, plant.y + bob + 12);
                ctx.stroke();
            }
            this.drawPlantLevel(ctx, plant, bob);
            ctx.restore();
            return;
        }

        if (plant.type === 'sunflower') {
            ctx.fillStyle = '#6a994e';
            ctx.fillRect(plant.x - 4, plant.y + 10, 8, 20);
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2 + this.time;
                const px = plant.x + Math.cos(angle) * 18;
                const py = plant.y + bob + Math.sin(angle) * 18;
                ctx.fillStyle = '#ffd60a';
                ctx.beginPath();
                ctx.ellipse(px, py, 8, 12, angle, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.fillStyle = '#8b5e00';
            ctx.beginPath();
            ctx.arc(plant.x, plant.y + bob, 12, 0, Math.PI * 2);
            ctx.fill();
            this.drawPlantLevel(ctx, plant, bob);
            ctx.restore();
            return;
        }

        if (plant.type === 'peashooter' || plant.type === 'snowpea') {
            ctx.fillStyle = '#6a994e';
            ctx.fillRect(plant.x - 4, plant.y + 8, 8, 18);

            const bodyColor = plant.type === 'snowpea' ? '#48cae4' : '#52b788';
            ctx.fillStyle = bodyColor;
            ctx.beginPath();
            ctx.ellipse(plant.x, plant.y + bob, 16, 18, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = plant.type === 'snowpea' ? '#0096c7' : '#2d6a4f';
            ctx.beginPath();
            ctx.ellipse(plant.x + 18, plant.y + bob - 2, 10, 8, 0, 0, Math.PI * 2);
            ctx.fill();

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
        }
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

    drawGargantuar(ctx, zombie, bob) {
        const data = ZOMBIE_TYPES.gargantuar;
        const scale = 1.55;
        const poleSwing = zombie.eatAnim > 0 ? Math.sin(zombie.eatAnim) * 0.3 : Math.sin(zombie.walkAnim) * 0.08;

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

        ctx.fillStyle = '#c1121f';
        ctx.beginPath();
        ctx.arc(zombie.x - 10, zombie.y - 44 + bob, 3, 0, Math.PI * 2);
        ctx.arc(zombie.x + 10, zombie.y - 44 + bob, 3, 0, Math.PI * 2);
        ctx.fill();

        const armSwing = zombie.eatAnim > 0 ? 0 : Math.sin(zombie.walkAnim) * 5;
        ctx.fillStyle = data.color;
        ctx.fillRect(zombie.x - 26, zombie.y - 8 + bob + armSwing, 12, 8);
        ctx.fillRect(zombie.x + 14, zombie.y - 8 + bob - armSwing, 12, 8);

        if (zombie.instantPlantHits >= 1) {
            this.drawArmBandages(ctx, zombie.x - 20, zombie.y - 4 + bob + armSwing);
        }

        ctx.save();
        ctx.translate(zombie.x + 20, zombie.y - 5 + bob);
        ctx.rotate(-0.5 + poleSwing);
        ctx.fillStyle = '#5c4033';
        ctx.fillRect(-3, -55, 6, 60);
        ctx.fillStyle = '#8b7355';
        ctx.beginPath();
        ctx.moveTo(0, -58);
        ctx.lineTo(-8, -48);
        ctx.lineTo(8, -48);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        ctx.fillStyle = '#4a4235';
        ctx.fillRect(zombie.x - 10, zombie.y + 18 + bob, 9, 10);
        ctx.fillRect(zombie.x + 1, zombie.y + 18 + bob - armSwing * 0.5, 9, 10);

        if (!zombie.dying) {
            const barW = 44;
            const hpPct = zombie.hp / zombie.maxHp;
            ctx.fillStyle = 'rgba(0,0,0,0.55)';
            ctx.fillRect(zombie.x - barW / 2, zombie.y - 72 + bob, barW, 6);
            ctx.fillStyle = hpPct > 0.5 ? '#52b788' : hpPct > 0.25 ? '#ffd60a' : '#e63946';
            ctx.fillRect(zombie.x - barW / 2, zombie.y - 72 + bob, barW * hpPct, 6);
        }

        ctx.restore();
    }

    drawZombie(ctx, zombie) {
        const data = ZOMBIE_TYPES[zombie.type];
        const bob = zombie.eatAnim > 0
            ? Math.sin(zombie.eatAnim) * 4
            : Math.sin(zombie.walkAnim) * 3;

        if (zombie.type === 'gargantuar') {
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
                ctx.ellipse(zombie.x, zombie.y, 42, 55, 0, 0, Math.PI * 2);
                ctx.fill();
            }
            this.drawGargantuar(ctx, zombie, bob);
            ctx.restore();
            return;
        }

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
        ctx.arc(zombie.x - 9, zombie.y - 39 + bob, 2, 0, Math.PI * 2);
        ctx.arc(zombie.x + 9, zombie.y - 39 + bob, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = data.color;
        const armSwing = zombie.eatAnim > 0 ? 0 : Math.sin(zombie.walkAnim) * 4;
        ctx.fillRect(zombie.x - 20, zombie.y - 10 + bob + armSwing, 10, 6);
        ctx.fillRect(zombie.x + 10, zombie.y - 10 + bob - armSwing, 10, 6);

        if (data.hat === 'cone') {
            ctx.fillStyle = '#ff9f1c';
            ctx.beginPath();
            ctx.moveTo(zombie.x, zombie.y - 58 + bob);
            ctx.lineTo(zombie.x - 14, zombie.y - 48 + bob);
            ctx.lineTo(zombie.x + 14, zombie.y - 48 + bob);
            ctx.closePath();
            ctx.fill();
        } else if (data.hat === 'bucket') {
            ctx.fillStyle = '#adb5bd';
            ctx.fillRect(zombie.x - 14, zombie.y - 58 + bob, 28, 14);
            ctx.fillStyle = '#6c757d';
            ctx.fillRect(zombie.x - 16, zombie.y - 46 + bob, 32, 4);
        } else if (data.hat === 'flag') {
            this.drawFlag(ctx, zombie, bob);
        }

        if (!zombie.dying) {
            const barW = 30;
            const hpPct = zombie.hp / zombie.maxHp;
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(zombie.x - barW / 2, zombie.y - 65 + bob, barW, 5);
            ctx.fillStyle = hpPct > 0.5 ? '#52b788' : hpPct > 0.25 ? '#ffd60a' : '#e63946';
            ctx.fillRect(zombie.x - barW / 2, zombie.y - 65 + bob, barW * hpPct, 5);
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
            ctx.arc(t.x, t.y, 4, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        ctx.fillStyle = proj.color;
        ctx.shadowColor = proj.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, 7, 0, Math.PI * 2);
        ctx.fill();
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

    drawPlacementPreview(ctx) {
        const col = Math.floor((this.mouseX - this.lawnX) / this.cellW);
        const row = Math.floor((this.mouseY - this.lawnY) / this.cellH);

        if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) return;

        const x = this.lawnX + col * this.cellW;
        const y = this.lawnY + row * this.cellH;
        const isWater = this.isWaterCell(row, col);
        const occupied = this.plants.some((p) => p.row === row && p.col === col && p.hp > 0);
        const data = PLANT_TYPES[this.selectedPlant];
        const invalid = occupied || isWater;

        const pulse = 0.3 + Math.sin(this.time * 6) * 0.1;
        ctx.fillStyle = invalid ? `rgba(230, 57, 70, ${pulse + 0.1})` : `rgba(255, 214, 10, ${pulse})`;
        ctx.fillRect(x, y, this.cellW - 2, this.cellH - 2);

        ctx.strokeStyle = invalid ? '#e63946' : '#ffd60a';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.strokeRect(x + 2, y + 2, this.cellW - 6, this.cellH - 6);
        ctx.setLineDash([]);

        if (!invalid) {
            ctx.font = '2rem sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.globalAlpha = 0.7;
            ctx.fillText(data.icon, x + this.cellW / 2, y + this.cellH / 2);
            ctx.globalAlpha = 1;
        } else if (isWater) {
            ctx.font = 'bold 14px Fredoka, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = 'rgba(202, 240, 248, 0.8)';
            ctx.fillText('🌊', x + this.cellW / 2, y + this.cellH / 2);
        }
        ctx.globalAlpha = 1;
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new PvZGame();
});