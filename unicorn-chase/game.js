/**
 * Fairly Land Chase - Game Logic
 */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

const GameState = {
    MENU: 'MENU',
    DIFFICULTY: 'DIFFICULTY',
    PLAYING: 'PLAYING',
    GAMEOVER: 'GAMEOVER',
    VICTORY: 'VICTORY',
    SETTINGS: 'SETTINGS'
};

let currentState = GameState.MENU;
let score = 0;
let tokens = 0;
let distance = 0;
let difficulty = 'Medium';
let tokenGoal = 100;
let unicornSpeed = 2;

const controls = {
    left: 'ArrowLeft',
    right: 'ArrowRight',
    jump: 'Space',
    slide: 'ArrowDown',
    special: 'KeyE'
};

let remappingKey = null;

const keys = {};

window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    
    if (currentState === GameState.SETTINGS && remappingKey) {
        controls[remappingKey] = e.code;
        remappingKey = null;
        return;
    }

    // State transitions
    if (currentState === GameState.MENU && e.code === 'Enter') {
        currentState = GameState.DIFFICULTY;
    } else if (currentState === GameState.MENU && e.code === 'KeyS') {
        currentState = GameState.SETTINGS;
    } else if (currentState === GameState.DIFFICULTY) {
        if (e.code === 'Digit1') {
            difficulty = 'Easy';
            tokenGoal = 50;
            unicornSpeed = 1.5;
            currentState = GameState.PLAYING;
            resetGame();
        } else if (e.code === 'Digit2') {
            difficulty = 'Medium';
            tokenGoal = 100;
            unicornSpeed = 2;
            currentState = GameState.PLAYING;
            resetGame();
        } else if (e.code === 'Digit3') {
            difficulty = 'Hard';
            tokenGoal = 150;
            unicornSpeed = 2.5;
            currentState = GameState.PLAYING;
            resetGame();
        }
    } else if ((currentState === GameState.GAMEOVER || currentState === GameState.VICTORY) && e.code === 'Enter') {
        currentState = GameState.MENU;
    } else if (currentState === GameState.SETTINGS && e.code === 'Enter') {
        currentState = GameState.MENU;
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

function resetGame() {
    score = 0;
    tokens = 0;
    distance = 0;
    player.x = 100;
    player.y = canvas.height - 100 - player.height;
    player.vx = 0;
    player.vy = 0;
    unicorn.x = -100;
    unicorn.speed = unicornSpeed;
    unicorn.isStumbling = false;
    world.collectibles = [];
    world.obstacles = [];
    world.powerups = [];
    world.spawnTimer = 0;
}

class PowerUp {
    constructor() {
        this.width = 30;
        this.height = 30;
        this.x = canvas.width + Math.random() * 500;
        this.y = canvas.height - 100 - this.height - Math.random() * 50;
        this.collected = false;
        this.type = 'SPARKLE_STAR';
    }

    update(scrollSpeed) {
        this.x -= scrollSpeed;
    }

    draw() {
        ctx.fillStyle = 'yellow';
        ctx.beginPath();
        ctx.arc(this.x + 15, this.y + 15, 15, 0, Math.PI * 2);
        ctx.fill();
    }
}
class Obstacle {
    constructor(type) {
        this.type = type;
        this.width = 40;
        this.height = 40;
        this.x = canvas.width + Math.random() * 500;
        this.y = canvas.height - 100 - this.height;
        
        switch (type) {
            case 'BRANCH':
                this.color = 'brown';
                this.y = canvas.height - 140; // Higher up
                this.height = 20;
                break;
            case 'PIT':
                this.color = 'black';
                this.width = 60;
                this.height = 20;
                this.y = canvas.height - 100;
                break;
            case 'MARSHMALLOW':
                this.color = 'white';
                break;
        }
    }

    update(scrollSpeed) {
        this.x -= scrollSpeed;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    checkCollision(player) {
        if (this.x < player.x + player.width &&
            this.x + this.width > player.x &&
            this.y < player.y + player.height &&
            this.y + this.height > player.y) {
            
            if (this.type === 'BRANCH' && !player.isSliding) {
                return 'HIT';
            } else if (this.type === 'PIT' && player.isGrounded) {
                return 'HIT';
            } else if (this.type === 'MARSHMALLOW') {
                return 'SLOW';
            }
        }
        return null;
    }
}
class Collectible {
    constructor(type) {
        this.type = type;
        this.width = 30;
        this.height = 30;
        this.x = canvas.width + Math.random() * 500;
        this.y = canvas.height - 100 - this.height - Math.random() * 50;
        this.collected = false;

        switch (type) {
            case 'RAINBOW':
                this.color = 'rainbow';
                this.points = 10;
                this.tokens = 1;
                break;
            case 'ICECREAM':
                this.color = 'pink';
                this.points = 20;
                this.tokens = 2;
                break;
            case 'COOKIE':
                this.color = 'brown';
                this.points = 15;
                this.tokens = 1.5;
                break;
        }
    }

    update(scrollSpeed) {
        this.x -= scrollSpeed;
    }

    draw() {
        if (this.type === 'RAINBOW') {
            // Simple rainbow representation
            const colors = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'];
            for (let i = 0; i < 7; i++) {
                ctx.fillStyle = colors[i];
                ctx.fillRect(this.x + i * 4, this.y, 4, this.height);
            }
        } else {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
}

class World {
    constructor() {
        this.scrollSpeed = 3;
        this.collectibles = [];
        this.obstacles = [];
        this.powerups = [];
        this.spawnTimer = 0;
    }

    update() {
        this.spawnTimer++;
        if (this.spawnTimer > 60) {
            const types = ['RAINBOW', 'ICECREAM', 'COOKIE'];
            const type = types[Math.floor(Math.random() * types.length)];
            this.collectibles.push(new Collectible(type));
            
            const obsTypes = ['BRANCH', 'PIT', 'MARSHMALLOW'];
            const obsType = obsTypes[Math.floor(Math.random() * obsTypes.length)];
            this.obstacles.push(new Obstacle(obsType));
            
            if (Math.random() < 0.1) {
                this.powerups.push(new PowerUp());
            }
            
            this.spawnTimer = 0;
        }

        const currentSpeed = this.speed();

        for (let i = this.collectibles.length - 1; i >= 0; i--) {
            const c = this.collectibles[i];
            c.update(currentSpeed);
            
            // Collision with player
            if (!c.collected &&
                c.x < player.x + player.width &&
                c.x + c.width > player.x &&
                c.y < player.y + player.height &&
                c.y + c.height > player.y) {
                c.collected = true;
                score += c.points;
                tokens += Math.floor(c.tokens);
            }

            if (c.x + c.width < 0 || c.collected) {
                this.collectibles.splice(i, 1);
            }
        }

        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const o = this.obstacles[i];
            o.update(currentSpeed);
            
            const collision = o.checkCollision(player);
            if (collision === 'HIT') {
                currentState = GameState.GAMEOVER;
            } else if (collision === 'SLOW') {
                player.speed = 2; // Slow down
                setTimeout(() => { player.speed = 5; }, 1000);
            }

            if (o.x + o.width < 0) {
                this.obstacles.splice(i, 1);
            }
        }

        for (let i = this.powerups.length - 1; i >= 0; i--) {
            const p = this.powerups[i];
            p.update(currentSpeed);
            
            if (!p.collected &&
                p.x < player.x + player.width &&
                p.x + p.width > player.x &&
                p.y < player.y + player.height &&
                p.y + p.height > player.y) {
                p.collected = true;
                unicorn.isStumbling = true;
                setTimeout(() => { unicorn.isStumbling = false; }, 3000);
            }

            if (p.x + p.width < 0 || p.collected) {
                this.powerups.splice(i, 1);
            }
        }
    }

    speed() {
        return this.scrollSpeed + (distance * 0.1); // Gradually increase speed
    }

    draw() {
        this.collectibles.forEach(c => c.draw());
        this.obstacles.forEach(o => o.draw());
        this.powerups.forEach(p => p.draw());
    }
}

const world = new World();

class Player {
    constructor() {
        this.width = 40;
        this.height = 60;
        this.x = 100;
        this.y = canvas.height - 100 - this.height;
        this.vx = 0;
        this.vy = 0;
        this.speed = 5;
        this.jumpPower = -15;
        this.gravity = 0.8;
        this.isGrounded = true;
        this.isSliding = false;
        this.slideTimer = 0;
        this.originalHeight = 60;
    }

    update() {
        // Horizontal movement
        if (keys[controls.left]) {
            this.vx = -this.speed;
        } else if (keys[controls.right]) {
            this.vx = this.speed;
        } else {
            this.vx = 0;
        }

        // Jump
        if ((keys[controls.jump]) && this.isGrounded) {
            this.vy = this.jumpPower;
            this.isGrounded = false;
        }

        // Slide/Duck
        if (keys[controls.slide]) {
            this.isSliding = true;
            this.height = this.originalHeight / 2;
            this.y = canvas.height - 100 - this.height;
        } else {
            if (this.isSliding) {
                this.isSliding = false;
                this.height = this.originalHeight;
                this.y = canvas.height - 100 - this.height;
            }
        }
        
        // Special Power-up (Sprinting/Pushing)
        if (keys[controls.special]) {
            this.speed = 8;
        } else {
            this.speed = 5;
        }

        // Gravity and physics
        this.vy += this.gravity;
        this.y += this.vy;
        this.x += this.vx;

        // Ground collision
        if (this.y > canvas.height - 100 - this.height) {
            this.y = canvas.height - 100 - this.height;
            this.vy = 0;
            this.isGrounded = true;
        }

        // Screen boundaries
        if (this.x < 0) this.x = 0;
        if (this.x > canvas.width - this.width) this.x = canvas.width - this.width;
    }

    draw() {
        ctx.fillStyle = 'blue';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

class Unicorn {
    constructor() {
        this.width = 60;
        this.height = 80;
        this.x = -100; // Start off-screen
        this.y = canvas.height - 100 - this.height;
        this.speed = unicornSpeed;
        this.isStumbling = false;
    }

    update() {
        let currentSpeed = this.speed;
        if (this.isStumbling) {
            currentSpeed = 0.5; // Slow down when stumbling
        }

        // Move towards the player
        const targetX = player.x;
        const dx = targetX - this.x;
        
        if (dx > 0) {
            this.x += currentSpeed;
        } else {
            this.x -= currentSpeed;
        }

        // Simple collision check with player
        if (this.x < player.x + player.width &&
            this.x + this.width > player.x &&
            this.y < player.y + player.height &&
            this.y + this.height > player.y) {
            currentState = GameState.GAMEOVER;
        }
    }

    draw() {
        ctx.fillStyle = this.isStumbling ? 'gray' : 'purple'; // Represent unicorn as purple block for now
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

const unicorn = new Unicorn();
function update() {
    switch (currentState) {
        case GameState.MENU:
            // Menu update logic
            break;
        case GameState.DIFFICULTY:
            // Difficulty selection update logic
            break;
        case GameState.PLAYING:
            // Core gameplay update logic
            distance += 1/60; // Assume 60fps
            score += 5 / 60; // 5 points per second
            player.update();
            unicorn.update();
            world.update();
            
            if (tokens >= tokenGoal) {
                currentState = GameState.VICTORY;
            }
            break;
        case GameState.GAMEOVER:
            // Game over update logic
            break;
        case GameState.VICTORY:
            // Victory update logic
            break;
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    switch (currentState) {
        case GameState.MENU:
            drawMenu();
            break;
        case GameState.DIFFICULTY:
            drawDifficulty();
            break;
        case GameState.PLAYING:
            drawGameplay();
            break;
        case GameState.GAMEOVER:
            drawGameOver();
            break;
        case GameState.VICTORY:
            drawVictory();
            break;
        case GameState.SETTINGS:
            drawSettings();
            break;
    }
}

function drawMenu() {
    ctx.fillStyle = 'black';
    ctx.font = '48px Comic Sans MS';
    ctx.textAlign = 'center';
    ctx.fillText('Fairly Land Chase', canvas.width / 2, canvas.height / 2 - 50);
    ctx.font = '24px Comic Sans MS';
    ctx.fillText('Press ENTER to Start', canvas.width / 2, canvas.height / 2 + 20);
    ctx.fillText('Press S for Settings', canvas.width / 2, canvas.height / 2 + 50);
}

function drawDifficulty() {
    ctx.fillStyle = 'black';
    ctx.font = '48px Comic Sans MS';
    ctx.textAlign = 'center';
    ctx.fillText('Select Difficulty', canvas.width / 2, canvas.height / 2 - 100);
    
    ctx.font = '24px Comic Sans MS';
    ctx.fillText('1: Easy', canvas.width / 2, canvas.height / 2 - 30);
    ctx.fillText('2: Medium', canvas.width / 2, canvas.height / 2 + 10);
    ctx.fillText('3: Hard', canvas.width / 2, canvas.height / 2 + 50);
}

function drawGameplay() {
    ctx.fillStyle = 'green';
    ctx.fillRect(0, canvas.height - 100, canvas.width, 100); // Floor
    
    world.draw();
    player.draw();
    unicorn.draw();
    
    ctx.fillStyle = 'black';
    ctx.font = '20px Comic Sans MS';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${Math.floor(score)}`, 20, 30);
    ctx.fillText(`Tokens: ${Math.floor(tokens)} / ${tokenGoal}`, 20, 60);
    ctx.fillText(`Distance: ${Math.floor(distance)}m`, 20, 90);
}

function drawGameOver() {
    ctx.fillStyle = 'red';
    ctx.font = '48px Comic Sans MS';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER!', canvas.width / 2, canvas.height / 2 - 50);
    ctx.fillStyle = 'black';
    ctx.font = '24px Comic Sans MS';
    ctx.fillText(`Final Score: ${Math.floor(score)}`, canvas.width / 2, canvas.height / 2 + 20);
    ctx.fillText(`Tokens Earned: ${Math.floor(tokens)}`, canvas.width / 2, canvas.height / 2 + 50);
    ctx.fillText('Press ENTER to Return to Menu', canvas.width / 2, canvas.height / 2 + 100);
}

function drawVictory() {
    ctx.fillStyle = 'gold';
    ctx.font = '48px Comic Sans MS';
    ctx.textAlign = 'center';
    ctx.fillText('VICTORY!', canvas.width / 2, canvas.height / 2 - 50);
    ctx.fillStyle = 'black';
    ctx.font = '24px Comic Sans MS';
    ctx.fillText(`You collected ${Math.floor(tokens)} tokens!`, canvas.width / 2, canvas.height / 2 + 20);
    ctx.fillText('Press ENTER to Return to Menu', canvas.width / 2, canvas.height / 2 + 100);
}

function drawSettings() {
    ctx.fillStyle = 'black';
    ctx.font = '48px Comic Sans MS';
    ctx.textAlign = 'center';
    ctx.fillText('Settings', canvas.width / 2, canvas.height / 2 - 150);
    
    ctx.font = '24px Comic Sans MS';
    ctx.textAlign = 'left';
    
    let offset = 0;
    for (let key in controls) {
        const label = key.charAt(0).toUpperCase() + key.slice(1);
        ctx.fillText(`${label}: ${controls[key]} ${remappingKey === key ? ' <--- PRESS NEW KEY' : ''}`, 200, canvas.height / 2 - 100 + offset);
        offset += 40;
    }
    
    ctx.textAlign = 'center';
    ctx.fillText('Press 1-5 to remap a control', canvas.width / 2, canvas.height / 2 + 100);
    ctx.fillText('Press ENTER to return to Menu', canvas.width / 2, canvas.height / 2 + 130);
}

window.addEventListener('keydown', (e) => {
    if (currentState === GameState.SETTINGS) {
        if (e.code === 'Digit1') remappingKey = 'left';
        if (e.code === 'Digit2') remappingKey = 'right';
        if (e.code === 'Digit3') remappingKey = 'jump';
        if (e.code === 'Digit4') remappingKey = 'slide';
        if (e.code === 'Digit5') remappingKey = 'special';
    }
});

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
