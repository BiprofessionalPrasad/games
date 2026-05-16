import React, { useEffect, useRef } from 'react';

const GameState = {
    MENU: 'MENU',
    DIFFICULTY: 'DIFFICULTY',
    PLAYING: 'PLAYING',
    GAMEOVER: 'GAMEOVER',
    VICTORY: 'VICTORY',
    SETTINGS: 'SETTINGS'
};

const DEFAULT_CONTROLS = {
    left: 'ArrowLeft',
    right: 'ArrowRight',
    jump: 'Space',
    slide: 'ArrowDown',
    special: 'KeyE'
};

class PowerUp {
    constructor(canvasWidth, canvasHeight) {
        this.width = 30;
        this.height = 30;
        this.x = canvasWidth + Math.random() * 500;
        this.y = canvasHeight - 100 - this.height - Math.random() * 50;
        this.collected = false;
        this.type = 'SPARKLE_STAR';
    }

    update(scrollSpeed) {
        this.x -= scrollSpeed;
    }

    draw(ctx) {
        ctx.fillStyle = 'yellow';
        ctx.beginPath();
        ctx.arc(this.x + 15, this.y + 15, 15, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Obstacle {
    constructor(canvasWidth, canvasHeight, type) {
        this.type = type;
        this.width = 40;
        this.height = 40;
        this.x = canvasWidth + Math.random() * 500;
        this.y = canvasHeight - 100 - this.height;
        
        switch (type) {
            case 'BRANCH':
                this.color = 'brown';
                this.y = canvasHeight - 140;
                this.height = 20;
                break;
            case 'PIT':
                this.color = 'black';
                this.width = 60;
                this.height = 20;
                this.y = canvasHeight - 100;
                break;
            case 'MARSHMALLOW':
                this.color = 'white';
                break;
        }
    }

    update(scrollSpeed) {
        this.x -= scrollSpeed;
    }

    draw(ctx) {
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
    constructor(canvasWidth, canvasHeight, type) {
        this.type = type;
        this.width = 30;
        this.height = 30;
        this.x = canvasWidth + Math.random() * 500;
        this.y = canvasHeight - 100 - this.height - Math.random() * 50;
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

    draw(ctx) {
        if (this.type === 'RAINBOW') {
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
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.scrollSpeed = 3;
        this.collectibles = [];
        this.obstacles = [];
        this.powerups = [];
        this.spawnTimer = 0;
    }

    update(player, currentState, setGameState) {
        this.spawnTimer++;
        if (this.spawnTimer > 60) {
            const types = ['RAINBOW', 'ICECREAM', 'COOKIE'];
            const type = types[Math.floor(Math.random() * types.length)];
            this.collectibles.push(new Collectible(this.canvasWidth, this.canvasHeight, type));
            
            const obsTypes = ['BRANCH', 'PIT', 'MARSHMALLOW'];
            const obsType = obsTypes[Math.floor(Math.random() * obsTypes.length)];
            this.obstacles.push(new Obstacle(this.canvasWidth, this.canvasHeight, obsType));
            
            if (Math.random() < 0.1) {
                this.powerups.push(new PowerUp(this.canvasWidth, this.canvasHeight));
            }
            
            this.spawnTimer = 0;
        }

        const currentSpeed = this.scrollSpeed + (this.distance * 0.1);

        for (let i = this.collectibles.length - 1; i >= 0; i--) {
            const c = this.collectibles[i];
            c.update(currentSpeed);
            if (!c.collected &&
                c.x < player.x + player.width &&
                c.x + c.width > player.x &&
                c.y < player.y + player.height &&
                c.y + c.height > player.y) {
                c.collected = true;
                this.gameData.score += c.points;
                this.gameData.tokens += Math.floor(c.tokens);
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
                setGameState(GameState.GAMEOVER);
            } else if (collision === 'SLOW') {
                player.speed = 2;
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
                this.unicorn.isStumbling = true;
                setTimeout(() => { this.unicorn.isStumbling = false; }, 3000);
            }
            if (p.x + p.width < 0 || p.collected) {
                this.powerups.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        this.collectibles.forEach(c => c.draw(ctx));
        this.obstacles.forEach(o => o.draw(ctx));
        this.powerups.forEach(p => p.draw(ctx));
    }
}

class Player {
    constructor(canvasHeight) {
        this.canvasHeight = canvasHeight;
        this.width = 40;
        this.height = 60;
        this.x = 100;
        this.y = canvasHeight - 100 - this.height;
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

    update(keys, controls) {
        if (keys[controls.left]) {
            this.vx = -this.speed;
        } else if (keys[controls.right]) {
            this.vx = this.speed;
        } else {
            this.vx = 0;
        }

        if (keys[controls.jump] && this.isGrounded) {
            this.vy = this.jumpPower;
            this.isGrounded = false;
        }

        if (keys[controls.slide]) {
            this.isSliding = true;
            this.height = this.originalHeight / 2;
            this.y = this.canvasHeight - 100 - this.height;
        } else {
            if (this.isSliding) {
                this.isSliding = false;
                this.height = this.originalHeight;
                this.y = this.canvasHeight - 100 - this.height;
            }
        }
        
        if (keys[controls.special]) {
            this.speed = 8;
        } else {
            this.speed = 5;
        }

        this.vy += this.gravity;
        this.y += this.vy;
        this.x += this.vx;

        if (this.y > this.canvasHeight - 100 - this.height) {
            this.y = this.canvasHeight - 100 - this.height;
            this.vy = 0;
            this.isGrounded = true;
        }

        if (this.x < 0) this.x = 0;
        if (this.x > 800 - this.width) this.x = 800 - this.width;
    }

    draw(ctx) {
        ctx.fillStyle = 'blue';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

class Unicorn {
    constructor(canvasHeight) {
        this.width = 60;
        this.height = 80;
        this.x = -100;
        this.y = canvasHeight - 100 - this.height;
        this.speed = 2;
        this.isStumbling = false;
    }

    update(player, setGameState) {
        let currentSpeed = this.speed;
        if (this.isStumbling) {
            currentSpeed = 0.5;
        }

        const targetX = player.x;
        const dx = targetX - this.x;
        if (dx > 0) {
            this.x += currentSpeed;
        } else {
            this.x -= currentSpeed;
        }

        if (this.x < player.x + player.width &&
            this.x + this.width > player.x &&
            this.y < player.y + player.height &&
            this.y + this.height > player.y) {
            setGameState(GameState.GAMEOVER);
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.isStumbling ? 'gray' : 'purple';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

const Game = () => {
    const canvasRef = useRef(null);
    const gameRef = useRef({
        state: GameState.MENU,
        score: 0,
        tokens: 0,
        distance: 0,
        difficulty: 'Medium',
        tokenGoal: 100,
        unicornSpeed: 2,
        controls: { ...DEFAULT_CONTROLS },
        remappingKey: null,
        keys: {},
        player: null,
        unicorn: null,
        world: null,
        lastTime: 0,
    });

    const setGameState = (state) => {
        gameRef.current.state = state;
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        canvas.width = 800;
        canvas.height = 600;

        const handleKeyDown = (e) => {
            gameRef.current.keys[e.code] = true;
            const g = gameRef.current;
            
            if (g.state === GameState.SETTINGS && g.remappingKey) {
                g.controls[g.remappingKey] = e.code;
                g.remappingKey = null;
                return;
            }

            if (g.state === GameState.MENU && e.code === 'Enter') {
                setGameState(GameState.DIFFICULTY);
            } else if (g.state === GameState.MENU && e.code === 'KeyS') {
                setGameState(GameState.SETTINGS);
            } else if (g.state === GameState.DIFFICULTY) {
                if (e.code === 'Digit1') {
                    g.difficulty = 'Easy';
                    g.tokenGoal = 50;
                    g.unicornSpeed = 1.5;
                    setGameState(GameState.PLAYING);
                    resetGame();
                } else if (e.code === 'Digit2') {
                    g.difficulty = 'Medium';
                    g.tokenGoal = 100;
                    g.unicornSpeed = 2;
                    setGameState(GameState.PLAYING);
                    resetGame();
                } else if (e.code === 'Digit3') {
                    g.difficulty = 'Hard';
                    g.tokenGoal = 150;
                    g.unicornSpeed = 2.5;
                    setGameState(GameState.PLAYING);
                    resetGame();
                }
            } else if ((g.state === GameState.GAMEOVER || g.state === GameState.VICTORY) && e.code === 'Enter') {
                setGameState(GameState.MENU);
            } else if (g.state === GameState.SETTINGS && e.code === 'Enter') {
                setGameState(GameState.MENU);
            }
        };

        const handleKeyUp = (e) => {
            gameRef.current.keys[e.code] = false;
        };

        const handleSettingsKeys = (e) => {
            if (gameRef.current.state === GameState.SETTINGS) {
                if (e.code === 'Digit1') gameRef.current.remappingKey = 'left';
                if (e.code === 'Digit2') gameRef.current.remappingKey = 'right';
                if (e.code === 'Digit3') gameRef.current.remappingKey = 'jump';
                if (e.code === 'Digit4') gameRef.current.remappingKey = 'slide';
                if (e.code === 'Digit5') gameRef.current.remappingKey = 'special';
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        window.addEventListener('keydown', handleSettingsKeys);

        function resetGame() {
            const g = gameRef.current;
            g.score = 0;
            g.tokens = 0;
            g.distance = 0;
            g.player = new Player(canvas.height);
            g.unicorn = new Unicorn(canvas.height);
            g.unicorn.speed = g.unicornSpeed;
            g.world = new World(canvas.width, canvas.height);
            g.world.gameData = g; // Allow world to update game data
            g.world.unicorn = g.unicorn;
        }

        function gameLoop(time) {
            const g = gameRef.current;
            const deltaTime = time - g.lastTime;
            g.lastTime = time;

            update();
            draw();

            requestAnimationFrame(gameLoop);
        }

        function update() {
            const g = gameRef.current;
            switch (g.state) {
                case GameState.PLAYING:
                    g.distance += 1/60;
                    g.score += 5 / 60;
                    g.player.update(g.keys, g.controls);
                    g.unicorn.update(g.player, setGameState);
                    g.world.update(g.player, g.state, setGameState);
                    
                    if (g.tokens >= g.tokenGoal) {
                        setGameState(GameState.VICTORY);
                    }
                    break;
            }
        }

        function draw() {
            const g = gameRef.current;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            switch (g.state) {
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
            ctx.fillRect(0, canvas.height - 100, canvas.width, 100);
            
            gameRef.current.world.draw(ctx);
            gameRef.current.player.draw(ctx);
            gameRef.current.unicorn.draw(ctx);
            
            ctx.fillStyle = 'black';
            ctx.font = '20px Comic Sans MS';
            ctx.textAlign = 'left';
            ctx.fillText(`Score: ${Math.floor(gameRef.current.score)}`, 20, 30);
            ctx.fillText(`Tokens: ${Math.floor(gameRef.current.tokens)} / ${gameRef.current.tokenGoal}`, 20, 60);
            ctx.fillText(`Distance: ${Math.floor(gameRef.current.distance)}m`, 20, 90);
        }

        function drawGameOver() {
            ctx.fillStyle = 'red';
            ctx.font = '48px Comic Sans MS';
            ctx.textAlign = 'center';
            ctx.fillText('GAME OVER!', canvas.width / 2, canvas.height / 2 - 50);
            ctx.fillStyle = 'black';
            ctx.font = '24px Comic Sans MS';
            ctx.fillText(`Final Score: ${Math.floor(gameRef.current.score)}`, canvas.width / 2, canvas.height / 2 + 20);
            ctx.fillText(`Tokens Earned: ${Math.floor(gameRef.current.tokens)}`, canvas.width / 2, canvas.height / 2 + 50);
            ctx.fillText('Press ENTER to Return to Menu', canvas.width / 2, canvas.height / 2 + 100);
        }

        function drawVictory() {
            ctx.fillStyle = 'gold';
            ctx.font = '48px Comic Sans MS';
            ctx.textAlign = 'center';
            ctx.fillText('VICTORY!', canvas.width / 2, canvas.height / 2 - 50);
            ctx.fillStyle = 'black';
            ctx.font = '24px Comic Sans MS';
            ctx.fillText(`You collected ${Math.floor(gameRef.current.tokens)} tokens!`, canvas.width / 2, canvas.height / 2 + 20);
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
            for (let key in gameRef.current.controls) {
                const label = key.charAt(0).toUpperCase() + key.slice(1);
                ctx.fillText(`${label}: ${gameRef.current.controls[key]} ${gameRef.current.remappingKey === key ? ' <--- PRESS NEW KEY' : ''}`, 200, canvas.height / 2 - 100 + offset);
                offset += 40;
            }
            ctx.textAlign = 'center';
            ctx.fillText('Press 1-5 to remap a control', canvas.width / 2, canvas.height / 2 + 100);
            ctx.fillText('Press ENTER to return to Menu', canvas.width / 2, canvas.height / 2 + 130);
        }

        requestAnimationFrame(gameLoop);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            window.removeEventListener('keydown', handleSettingsKeys);
        };
    }, []);

    return (
        <canvas 
            ref={canvasRef} 
            style={{ 
                backgroundColor: '#87CEEB', 
                boxShadow: '0 0 20px rgba(0,0,0,0.2)', 
                border: '4px solid #fff', 
                borderRadius: '10px' 
            }}
        />
    );
};

export default Game;
