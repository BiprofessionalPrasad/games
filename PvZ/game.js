// Plants vs Zombies - Enhanced Canvas Game

const PLANT_TYPES = {
    sunflower: { name: 'Sunflower', cost: 50, cooldown: 5, hp: 80, icon: '🌻', color: '#ffd60a' },
    peashooter: { name: 'Peashooter', cost: 100, cooldown: 7, hp: 80, icon: '🌱', color: '#52b788' },
    wallnut: { name: 'Wall-nut', cost: 50, cooldown: 20, hp: 400, icon: '🥜', color: '#bc6c25' },
    cherrybomb: { name: 'Cherry Bomb', cost: 150, cooldown: 30, hp: 1, icon: '🍒', color: '#e63946' },
    snowpea: { name: 'Snow Pea', cost: 175, cooldown: 7, hp: 80, icon: '❄️', color: '#48cae4' },
};

const ZOMBIE_TYPES = {
    regular: { name: 'Zombie', hp: 100, speed: 0.3, damage: 15, color: '#6b705c', hat: null, score: 10 },
    cone: { name: 'Conehead', hp: 200, speed: 0.28, damage: 15, color: '#6b705c', hat: 'cone', score: 25 },
    bucket: { name: 'Buckethead', hp: 350, speed: 0.25, damage: 18, color: '#6b705c', hat: 'bucket', score: 40 },
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

        this.cols = 9;
        this.rows = 5;
        this.cellW = 80;
        this.cellH = 100;
        this.lawnX = 60;
        this.lawnY = 50;

        this.canvas.width = this.lawnX + this.cols * this.cellW + 20;
        this.canvas.height = this.lawnY + this.rows * this.cellH + 120;

        this.sun = 150;
        this.score = 0;
        this.kills = 0;
        this.selectedPlant = null;
        this.plants = [];
        this.zombies = [];
        this.projectiles = [];
        this.suns = [];
        this.particles = [];
        this.floatingTexts = [];
        this.muzzleFlashes = [];
        this.clouds = [];
        this.explosionRings = [];

        this.wave = 1;
        this.zombiesInWave = 0;
        this.zombiesSpawned = 0;
        this.waveTimer = 0;
        this.spawnTimer = 0;
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
        this.init();
    }

    initClouds() {
        for (let i = 0; i < 5; i++) {
            this.clouds.push({
                x: Math.random() * 800,
                y: 15 + Math.random() * 40,
                w: 60 + Math.random() * 50,
                speed: 8 + Math.random() * 12,
                opacity: 0.4 + Math.random() * 0.3,
            });
        }
    }

    init() {
        this.setupPlantBar();
        this.setupEventListeners();
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
    }

    setupEventListeners() {
        document.getElementById('startBtn').addEventListener('click', () => {
            this.audio.init();
            this.startGame();
        });
        document.getElementById('restartBtn').addEventListener('click', () => this.startGame());
        document.getElementById('resumeBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('muteBtn').addEventListener('click', () => {
            const muted = this.audio.toggleMute();
            document.getElementById('muteBtn').textContent = muted ? '🔇' : '🔊';
        });

        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;
            this.updateCursor();
        });

        window.addEventListener('keydown', (e) => {
            if (e.key === 'p' || e.key === 'P') this.togglePause();
            if (e.key === 'Escape') this.deselectPlant();
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
        this.canvas.style.cursor = overSun ? 'pointer' : (this.selectedPlant ? 'crosshair' : 'default');
    }

    deselectPlant() {
        this.selectedPlant = null;
        document.querySelectorAll('.plant-card').forEach((c) => c.classList.remove('selected'));
    }

    startGame() {
        document.getElementById('menuScreen').classList.remove('active');
        document.getElementById('gameScreen').classList.add('active');
        document.getElementById('gameOverOverlay').classList.add('hidden');
        document.getElementById('pauseOverlay').classList.add('hidden');

        this.sun = 150;
        this.score = 0;
        this.kills = 0;
        this.selectedPlant = null;
        this.plants = [];
        this.zombies = [];
        this.projectiles = [];
        this.suns = [];
        this.particles = [];
        this.floatingTexts = [];
        this.muzzleFlashes = [];
        this.explosionRings = [];
        this.wave = 1;
        this.zombiesInWave = 5;
        this.zombiesSpawned = 0;
        this.waveTimer = 0;
        this.spawnTimer = 2;
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

        this.updateHUD();
        this.showWaveBanner();
        this.lastTime = performance.now();
        requestAnimationFrame((t) => this.gameLoop(t));
    }

    showWaveBanner() {
        const banner = document.getElementById('waveBanner');
        banner.textContent = `Wave ${this.wave}`;
        banner.classList.remove('show');
        void banner.offsetWidth;
        banner.classList.add('show');
        this.audio.play('wave');
    }

    selectPlant(type) {
        if (!this.isPlaying || this.isPaused || this.isGameOver) return;
        const data = PLANT_TYPES[type];
        if (this.sun < data.cost || this.cooldowns[type] > 0) return;

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

        for (let i = this.suns.length - 1; i >= 0; i--) {
            const s = this.suns[i];
            const dist = Math.hypot(x - s.x, y - s.y);
            if (dist < s.radius + 10) {
                this.sun += s.value;
                this.suns.splice(i, 1);
                this.spawnParticles(s.x, s.y, '#ffd60a', 10, 'sparkle');
                this.addFloatingText(s.x, s.y - 20, `+${s.value}`, '#ffd60a', 1);
                this.pulseSunCounter();
                this.audio.play('sun');
                this.updateHUD();
                return;
            }
        }

        if (!this.selectedPlant) return;

        const col = Math.floor((x - this.lawnX) / this.cellW);
        const row = Math.floor((y - this.lawnY) / this.cellH);

        if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) return;

        const data = PLANT_TYPES[this.selectedPlant];
        if (this.sun < data.cost || this.cooldowns[this.selectedPlant] > 0) return;

        const occupied = this.plants.some((p) => p.row === row && p.col === col && p.hp > 0);
        if (occupied) return;

        const px = this.lawnX + col * this.cellW + this.cellW / 2;
        const py = this.lawnY + row * this.cellH + this.cellH / 2;

        this.plants.push({
            type: this.selectedPlant,
            row,
            col,
            x: px,
            y: py,
            hp: data.hp,
            maxHp: data.hp,
            shootTimer: 0,
            sunTimer: 0,
            explodeTimer: this.selectedPlant === 'cherrybomb' ? 1.5 : 0,
            spawnScale: 0,
            spawnAnim: 0.4,
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

        if (this.screenShake > 0) this.screenShake = Math.max(0, this.screenShake - dt * 8);
        if (this.screenFlash > 0) this.screenFlash = Math.max(0, this.screenFlash - dt * 3);

        for (const c of this.clouds) {
            c.x += c.speed * dt;
            if (c.x > this.canvas.width + c.w) c.x = -c.w;
        }

        this.skySunTimer -= dt;
        if (this.skySunTimer <= 0) {
            this.skySunTimer = 8 + Math.random() * 7;
            this.spawnSkySun();
        }

        for (const plant of this.plants) {
            if (plant.hp <= 0) continue;

            if (plant.spawnAnim > 0) {
                plant.spawnAnim -= dt;
                plant.spawnScale = 1 - plant.spawnAnim / 0.4;
            } else {
                plant.spawnScale = 1;
            }

            if (plant.type === 'sunflower') {
                plant.sunTimer += dt;
                if (plant.sunTimer >= 7) {
                    plant.sunTimer = 0;
                    this.suns.push({
                        x: plant.x,
                        y: plant.y,
                        targetY: plant.y + 30,
                        value: 25,
                        radius: 18,
                        life: 8,
                        falling: true,
                    });
                }
            }

            if (plant.type === 'peashooter' || plant.type === 'snowpea') {
                plant.shootTimer += dt;
                const interval = plant.type === 'snowpea' ? 1.8 : 1.5;
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
                            damage: 20,
                            frozen: plant.type === 'snowpea',
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
        }

        this.plants = this.plants.filter((p) => p.hp > 0);

        for (const proj of this.projectiles) {
            proj.trail.push({ x: proj.x, y: proj.y });
            if (proj.trail.length > 6) proj.trail.shift();
            proj.x += proj.speed * 60 * dt;
        }
        this.projectiles = this.projectiles.filter((p) => p.x < this.canvas.width);

        for (const proj of this.projectiles) {
            for (const zombie of this.zombies) {
                if (zombie.row !== proj.row || zombie.hp <= 0 || zombie.dying) continue;
                if (Math.abs(proj.x - zombie.x) < 20 && Math.abs(proj.y - zombie.y) < 30) {
                    zombie.hp -= proj.damage;
                    if (proj.frozen) zombie.slowTimer = 3;
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
            for (const plant of this.plants) {
                if (plant.row !== zombie.row || plant.hp <= 0) continue;
                if (Math.abs(zombie.x - plant.x) < 35) {
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

            if (zombie.x < this.lawnX - 30) {
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

        this.updateWaves(dt);
        this.updateHUD();
    }

    killZombie(zombie) {
        const data = ZOMBIE_TYPES[zombie.type];
        this.score += data.score;
        this.kills++;
        zombie.dying = true;
        zombie.deathTimer = 0.6;
        zombie.fallAngle = 0;
        this.spawnParticles(zombie.x, zombie.y, '#6b705c', 14, 'debris');
        this.addFloatingText(zombie.x, zombie.y - 30, `+${data.score}`, '#95d5b2', 0.8, 16);
        this.audio.play('death');
    }

    explodeCherryBomb(plant) {
        this.spawnParticles(plant.x, plant.y, '#e63946', 40, 'explosion');
        this.explosionRings.push({ x: plant.x, y: plant.y, radius: 10, life: 0.5, color: '#e63946' });
        this.explosionRings.push({ x: plant.x, y: plant.y, radius: 5, life: 0.35, color: '#ffd60a' });
        this.addScreenShake(12);
        this.addScreenFlash('#e63946', 0.5);
        this.audio.play('explode');

        for (const zombie of this.zombies) {
            const rowDist = Math.abs(zombie.row - plant.row);
            const colApprox = Math.floor((zombie.x - this.lawnX) / this.cellW);
            const colDist = Math.abs(colApprox - plant.col);
            if (rowDist <= 1 && colDist <= 1.5 && !zombie.dying) {
                zombie.hp = 0;
                this.killZombie(zombie);
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
        if (this.zombiesSpawned < this.zombiesInWave) {
            this.spawnTimer -= dt;
            if (this.spawnTimer <= 0) {
                this.spawnZombie();
                this.zombiesSpawned++;
                this.spawnTimer = 2 + Math.random() * 3;
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
                this.zombiesSpawned = 0;
                this.waveTimer = 0;
                this.spawnTimer = 1;
                this.showWaveBanner();
            }
        }
    }

    spawnZombie() {
        const row = Math.floor(Math.random() * this.rows);
        let type = 'regular';
        const roll = Math.random();
        if (this.wave >= 3 && roll < 0.3) type = 'cone';
        if (this.wave >= 5 && roll < 0.15) type = 'bucket';

        const data = ZOMBIE_TYPES[type];
        this.zombies.push({
            type,
            row,
            x: this.lawnX + this.cols * this.cellW + 20,
            y: this.lawnY + row * this.cellH + this.cellH / 2,
            hp: data.hp,
            maxHp: data.hp,
            speed: data.speed + this.wave * 0.02,
            damage: data.damage,
            slowTimer: 0,
            walkAnim: 0,
            eatAnim: 0,
            dying: false,
            deathTimer: 0,
            fallAngle: 0,
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
        const remaining = this.zombiesInWave - this.zombiesSpawned + this.zombies.length;
        document.getElementById('zombieCount').textContent = Math.max(0, remaining);
    }

    updatePlantBar() {
        document.querySelectorAll('.plant-card').forEach((card) => {
            const type = card.dataset.type;
            const data = PLANT_TYPES[type];
            const disabled = this.sun < data.cost || this.cooldowns[type] > 0;
            card.classList.toggle('disabled', disabled);

            const overlay = card.querySelector('.cooldown-overlay');
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
        this.drawClouds(ctx);
        this.drawLawn(ctx);
        this.drawHouse(ctx);

        for (const plant of this.plants) this.drawPlant(ctx, plant);
        for (const proj of this.projectiles) this.drawProjectile(ctx, proj);
        for (const zombie of this.zombies) this.drawZombie(ctx, zombie);
        for (const s of this.suns) this.drawSun(ctx, s);
        for (const ring of this.explosionRings) this.drawExplosionRing(ctx, ring);
        for (const mf of this.muzzleFlashes) this.drawMuzzleFlash(ctx, mf);
        for (const p of this.particles) this.drawParticle(ctx, p);
        for (const ft of this.floatingTexts) this.drawFloatingText(ctx, ft);

        if (this.selectedPlant) this.drawPlacementPreview(ctx);

        if (this.screenFlash > 0) {
            ctx.fillStyle = this.flashColor;
            ctx.globalAlpha = this.screenFlash * 0.4;
            ctx.fillRect(-20, -20, this.canvas.width + 40, this.canvas.height + 40);
            ctx.globalAlpha = 1;
        }

        ctx.restore();
    }

    drawBackground(ctx) {
        const grad = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
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
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const x = this.lawnX + col * this.cellW;
                const y = this.lawnY + row * this.cellH;
                const shade = (row + col) % 2 === 0 ? '#52b788' : '#40916c';
                ctx.fillStyle = shade;
                ctx.fillRect(x, y, this.cellW - 2, this.cellH - 2);

                ctx.strokeStyle = 'rgba(45, 106, 79, 0.5)';
                ctx.lineWidth = 1;
                ctx.strokeRect(x, y, this.cellW - 2, this.cellH - 2);

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

        const fenceGrad = ctx.createLinearGradient(this.lawnX - 4, 0, this.lawnX, 0);
        fenceGrad.addColorStop(0, '#2d4a2e');
        fenceGrad.addColorStop(1, '#386641');
        ctx.fillStyle = fenceGrad;
        ctx.fillRect(this.lawnX - 4, this.lawnY, 4, this.rows * this.cellH);
    }

    drawPlant(ctx, plant) {
        const data = PLANT_TYPES[plant.type];
        const bob = Math.sin(this.time * 2 + plant.col) * 2;
        const scale = plant.spawnScale || 1;

        ctx.save();
        ctx.translate(plant.x, plant.y);
        ctx.scale(scale, scale);
        ctx.translate(-plant.x, -plant.y);

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
            ctx.restore();
        }
    }

    drawZombie(ctx, zombie) {
        const data = ZOMBIE_TYPES[zombie.type];
        const bob = zombie.eatAnim > 0
            ? Math.sin(zombie.eatAnim) * 4
            : Math.sin(zombie.walkAnim) * 3;

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
        const occupied = this.plants.some((p) => p.row === row && p.col === col && p.hp > 0);
        const data = PLANT_TYPES[this.selectedPlant];

        const pulse = 0.3 + Math.sin(this.time * 6) * 0.1;
        ctx.fillStyle = occupied ? `rgba(230, 57, 70, ${pulse + 0.1})` : `rgba(255, 214, 10, ${pulse})`;
        ctx.fillRect(x, y, this.cellW - 2, this.cellH - 2);

        ctx.strokeStyle = occupied ? '#e63946' : '#ffd60a';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.strokeRect(x + 2, y + 2, this.cellW - 6, this.cellH - 6);
        ctx.setLineDash([]);

        ctx.font = '2rem sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.globalAlpha = 0.7;
        ctx.fillText(data.icon, x + this.cellW / 2, y + this.cellH / 2);
        ctx.globalAlpha = 1;
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new PvZGame();
});