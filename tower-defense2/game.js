// Game constants
const TILE_SIZE = 40;
const PATH_COLOR = '#3498db';
const TOWER_COLORS = {
    basic: '#2ecc71',
    rapid: '#e74c3c',
    strong: '#f39c12'
};

// Game state
let gameState = {
    money: 100,
    lives: 10,
    wave: 1,
    score: 0,
    paused: false,
    selectedTower: 'basic',
    towers: [],
    enemies: [],
    projectiles: [],
    path: []
};

// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// DOM elements
const livesElement = document.getElementById('lives');
const moneyElement = document.getElementById('money');
const waveElement = document.getElementById('wave');
const scoreElement = document.getElementById('score');
const startWaveBtn = document.getElementById('startWaveBtn');
const pauseBtn = document.getElementById('pauseBtn');

// Initialize game
function init() {
    createPath();
    setupEventListeners();
    gameLoop();
}

// Create the path for enemies to follow
function createPath() {
    // Simple path going from left to right with some turns
    gameState.path = [
        {x: 0, y: 7},   // Start on the left
        {x: 5, y: 7},   // Move right
        {x: 5, y: 3},   // Move up
        {x: 15, y: 3},  // Move right
        {x: 15, y: 10}, // Move down
        {x: 10, y: 10}, // Move left
        {x: 10, y: 14}, // Move down
        {x: 19, y: 14}  // Move right to exit
    ];
}

// Setup event listeners
function setupEventListeners() {
    // Canvas click for placing towers
    canvas.addEventListener('click', handleCanvasClick);

    // Tower selection
    document.querySelectorAll('.tower-option').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('.tower-option').forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            gameState.selectedTower = option.dataset.type;
        });
    });

    // Control buttons
    startWaveBtn.addEventListener('click', startWave);
    pauseBtn.addEventListener('click', togglePause);
}

// Handle canvas clicks for tower placement
function handleCanvasClick(event) {
    if (gameState.paused) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / TILE_SIZE);
    const y = Math.floor((event.clientY - rect.top) / TILE_SIZE);

    // Check if clicked on path
    const isOnPath = gameState.path.some(point => point.x === x && point.y === y);

    if (isOnPath) {
        placeTower(x, y);
    }
}

// Place a tower at the specified position
function placeTower(x, y) {
    // Check if there's already a tower here
    const existingTower = gameState.towers.find(tower => tower.x === x && tower.y === y);
    if (existingTower) return;

    // Check if it's on the path
    const isOnPath = gameState.path.some(point => point.x === x && point.y === y);
    if (!isOnPath) return;

    // Check if player has enough money
    const towerCost = getTowerCost(gameState.selectedTower);
    if (gameState.money < towerCost) return;

    // Create tower
    const tower = {
        x: x,
        y: y,
        type: gameState.selectedTower,
        range: getTowerRange(gameState.selectedTower),
        damage: getTowerDamage(gameState.selectedTower),
        fireRate: getTowerFireRate(gameState.selectedTower),
        lastFired: 0,
        color: TOWER_COLORS[gameState.selectedTower]
    };

    gameState.towers.push(tower);
    gameState.money -= towerCost;
    updateUI();
}

// Get tower properties
function getTowerCost(type) {
    switch(type) {
        case 'basic': return 10;
        case 'rapid': return 20;
        case 'strong': return 30;
        default: return 10;
    }
}

function getTowerRange(type) {
    switch(type) {
        case 'basic': return 2;
        case 'rapid': return 1.5;
        case 'strong': return 3;
        default: return 2;
    }
}

function getTowerDamage(type) {
    switch(type) {
        case 'basic': return 10;
        case 'rapid': return 5;
        case 'strong': return 20;
        default: return 10;
    }
}

function getTowerFireRate(type) {
    switch(type) {
        case 'basic': return 1000; // ms
        case 'rapid': return 300;  // ms
        case 'strong': return 1500; // ms
        default: return 1000;
    }
}

// Start a new wave of enemies
function startWave() {
    // For simplicity, spawn a few enemies
    for (let i = 0; i < 5 + gameState.wave; i++) {
        setTimeout(() => {
            spawnEnemy();
        }, i * 1000);
    }

    gameState.wave++;
    updateUI();
}

// Spawn an enemy
function spawnEnemy() {
    const enemy = {
        x: gameState.path[0].x * TILE_SIZE + TILE_SIZE/2,
        y: gameState.path[0].y * TILE_SIZE + TILE_SIZE/2,
        pathIndex: 0,
        health: 50 + gameState.wave * 10,
        maxHealth: 50 + gameState.wave * 10,
        speed: 1 + gameState.wave * 0.1,
        reward: 10
    };

    gameState.enemies.push(enemy);
}

// Toggle pause state
function togglePause() {
    gameState.paused = !gameState.paused;
    pauseBtn.textContent = gameState.paused ? 'Resume' : 'Pause';
}

// Main game loop
function gameLoop() {
    if (!gameState.paused) {
        update();
    }
    draw();
    requestAnimationFrame(gameLoop);
}

// Update game state
function update() {
    updateTowers();
    updateEnemies();
    updateProjectiles();
}

// Update towers (shooting)
function updateTowers() {
    const now = Date.now();

    gameState.towers.forEach(tower => {
        if (now - tower.lastFired > tower.fireRate) {
            // Find enemy in range
            const enemy = findEnemyInRange(tower);
            if (enemy) {
                shootProjectile(tower, enemy);
                tower.lastFired = now;
            }
        }
    });
}

// Find enemy in range of tower
function findEnemyInRange(tower) {
    for (let enemy of gameState.enemies) {
        const distance = Math.sqrt(
            Math.pow(tower.x * TILE_SIZE + TILE_SIZE/2 - enemy.x, 2) +
            Math.pow(tower.y * TILE_SIZE + TILE_SIZE/2 - enemy.y, 2)
        );

        if (distance <= tower.range * TILE_SIZE) {
            return enemy;
        }
    }
    return null;
}

// Shoot projectile from tower to enemy
function shootProjectile(tower, enemy) {
    const projectile = {
        x: tower.x * TILE_SIZE + TILE_SIZE/2,
        y: tower.y * TILE_SIZE + TILE_SIZE/2,
        targetX: enemy.x,
        targetY: enemy.y,
        speed: 5,
        damage: tower.damage,
        targetEnemy: enemy
    };

    gameState.projectiles.push(projectile);
}

// Update enemies (movement)
function updateEnemies() {
    for (let i = gameState.enemies.length - 1; i >= 0; i--) {
        const enemy = gameState.enemies[i];

        // Move towards next path point
        if (enemy.pathIndex < gameState.path.length - 1) {
            const target = gameState.path[enemy.pathIndex + 1];
            const targetX = target.x * TILE_SIZE + TILE_SIZE/2;
            const targetY = target.y * TILE_SIZE + TILE_SIZE/2;

            const dx = targetX - enemy.x;
            const dy = targetY - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 5) {
                // Reached path point, move to next
                enemy.pathIndex++;
            } else {
                // Move towards target
                enemy.x += (dx / distance) * enemy.speed;
                enemy.y += (dy / distance) * enemy.speed;
            }
        } else {
            // Reached end of path - remove enemy and lose life
            gameState.enemies.splice(i, 1);
            gameState.lives--;
            if (gameState.lives <= 0) {
                gameState.lives = 0;
                // Game over
            }
            updateUI();
        }
    }
}

// Update projectiles (movement and collision)
function updateProjectiles() {
    for (let i = gameState.projectiles.length - 1; i >= 0; i--) {
        const projectile = gameState.projectiles[i];

        // Move towards target
        const dx = projectile.targetX - projectile.x;
        const dy = projectile.targetY - projectile.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 5) {
            // Hit target
            // Apply damage to enemy
            const enemyIndex = gameState.enemies.indexOf(projectile.targetEnemy);
            if (enemyIndex !== -1) {
                projectile.targetEnemy.health -= projectile.damage;

                if (projectile.targetEnemy.health <= 0) {
                    // Enemy defeated
                    gameState.money += projectile.targetEnemy.reward;
                    gameState.score += projectile.targetEnemy.maxHealth;
                    gameState.enemies.splice(enemyIndex, 1);
                }
            }

            // Remove projectile
            gameState.projectiles.splice(i, 1);
            updateUI();
        } else {
            // Move projectile
            projectile.x += (dx / distance) * projectile.speed;
            projectile.y += (dy / distance) * projectile.speed;

            // Update target position in case enemy moved
            if (projectile.targetEnemy) {
                projectile.targetX = projectile.targetEnemy.x;
                projectile.targetY = projectile.targetEnemy.y;
            }
        }
    }
}

// Draw everything
function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    drawGrid();

    // Draw path
    drawPath();

    // Draw towers
    drawTowers();

    // Draw enemies
    drawEnemies();

    // Draw projectiles
    drawProjectiles();
}

// Draw grid
function drawGrid() {
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 0.5;

    // Vertical lines
    for (let x = 0; x <= canvas.width; x += TILE_SIZE) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y <= canvas.height; y += TILE_SIZE) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

// Draw path
function drawPath() {
    ctx.fillStyle = PATH_COLOR;

    for (let i = 0; i < gameState.path.length; i++) {
        const point = gameState.path[i];
        ctx.fillRect(
            point.x * TILE_SIZE,
            point.y * TILE_SIZE,
            TILE_SIZE,
            TILE_SIZE
        );
    }

    // Draw path lines to visualize the route
    ctx.strokeStyle = '#1f618d';
    ctx.lineWidth = 3;
    ctx.beginPath();

    for (let i = 0; i < gameState.path.length; i++) {
        const point = gameState.path[i];
        const x = point.x * TILE_SIZE + TILE_SIZE/2;
        const y = point.y * TILE_SIZE + TILE_SIZE/2;

        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }

    ctx.stroke();
}

// Draw towers
function drawTowers() {
    gameState.towers.forEach(tower => {
        // Draw tower
        ctx.fillStyle = tower.color;
        ctx.fillRect(
            tower.x * TILE_SIZE + 5,
            tower.y * TILE_SIZE + 5,
            TILE_SIZE - 10,
            TILE_SIZE - 10
        );

        // Draw range circle when hovering (simplified)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(
            tower.x * TILE_SIZE + TILE_SIZE/2,
            tower.y * TILE_SIZE + TILE_SIZE/2,
            tower.range * TILE_SIZE,
            0,
            Math.PI * 2
        );
        ctx.stroke();
    });
}

// Draw enemies
function drawEnemies() {
    gameState.enemies.forEach(enemy => {
        // Draw enemy
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, TILE_SIZE/3, 0, Math.PI * 2);
        ctx.fill();

        // Draw health bar
        const barWidth = TILE_SIZE;
        const barHeight = 5;
        const healthPercent = enemy.health / enemy.maxHealth;

        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(enemy.x - barWidth/2, enemy.y - TILE_SIZE/2 - 10, barWidth * healthPercent, barHeight);

        ctx.strokeStyle = '#c0392b';
        ctx.lineWidth = 1;
        ctx.strokeRect(enemy.x - barWidth/2, enemy.y - TILE_SIZE/2 - 10, barWidth, barHeight);
    });
}

// Draw projectiles
function drawProjectiles() {
    gameState.projectiles.forEach(projectile => {
        ctx.fillStyle = '#f1c40f';
        ctx.beginPath();
        ctx.arc(projectile.x, projectile.y, 3, 0, Math.PI * 2);
        ctx.fill();
    });
}

// Update UI elements
function updateUI() {
    livesElement.textContent = gameState.lives;
    moneyElement.textContent = gameState.money;
    waveElement.textContent = gameState.wave;
    scoreElement.textContent = gameState.score;
}

// Initialize the game when page loads
window.onload = init;