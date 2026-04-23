// Ice Hockey Game
class IceHockeyGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Game settings
        this.canvasWidth = 800;
        this.canvasHeight = 500;
        this.canvas.width = this.canvasWidth;
        this.canvas.height = this.canvasHeight;
        
        // Game state
        this.gameMode = '1player'; // '1player' or '2player'
        this.difficulty = 'medium'; // 'easy', 'medium', 'hard'
        this.puckColor = '#000000';
        this.isPaused = false;
        this.isGameOver = false;
        this.gameTime = 180; // 3 minutes in seconds
        this.lastTime = 0;
        this.timerInterval = null;
        
        // Scores
        this.score1 = 0;
        this.score2 = 0;
        
        // Physics constants
        this.friction = 0.985;
        this.playerSpeed = 5;
        this.playerMaxSpeed = 8;
        this.puckMaxSpeed = 15;
        
        // Input state
        this.keys = {};
        
        // Game objects
        this.puck = null;
        this.player1 = null;
        this.player2 = null;
        
        // Goal dimensions
        this.goalWidth = 120;
        this.goalHeight = 20;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.resetGameObjects();
    }
    
    setupEventListeners() {
        // Keyboard events
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            this.keys[e.code] = true;
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
            this.keys[e.code] = false;
        });
        
        // Menu buttons
        document.getElementById('btn1Player').addEventListener('click', () => this.setGameMode('1player'));
        document.getElementById('btn2Player').addEventListener('click', () => this.setGameMode('2player'));
        
        document.getElementById('btnEasy').addEventListener('click', () => this.setDifficulty('easy'));
        document.getElementById('btnMedium').addEventListener('click', () => this.setDifficulty('medium'));
        document.getElementById('btnHard').addEventListener('click', () => this.setDifficulty('hard'));
        
        // Color picker
        document.querySelectorAll('.color-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.setPuckColor(e.target.dataset.color));
        });
        
        // Start button
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        
        // Game controls
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('menuBtn').addEventListener('click', () => this.returnToMenu());
        
        // Pause screen
        document.getElementById('resumeBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('pauseMenuBtn').addEventListener('click', () => this.returnToMenu());
        
        // Game over screen
        document.getElementById('playAgainBtn').addEventListener('click', () => this.startGame());
        document.getElementById('gameOverMenuBtn').addEventListener('click', () => this.returnToMenu());
    }
    
    setGameMode(mode) {
        this.gameMode = mode;
        document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(mode === '1player' ? 'btn1Player' : 'btn2Player').classList.add('active');
        
        // Show/hide difficulty section
        document.getElementById('difficultySection').style.display = mode === '1player' ? 'block' : 'none';
    }
    
    setDifficulty(diff) {
        this.difficulty = diff;
        document.querySelectorAll('.diff-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById('btn' + diff.charAt(0).toUpperCase() + diff.slice(1)).classList.add('active');
    }
    
    setPuckColor(color) {
        this.puckColor = color;
        document.querySelectorAll('.color-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-color="${color}"]`).classList.add('active');
    }
    
    resetGameObjects() {
        // Puck
        this.puck = {
            x: this.canvasWidth / 2,
            y: this.canvasHeight / 2,
            radius: 12,
            vx: 0,
            vy: 0
        };
        
        // Player 1 (Blue, bottom)
        this.player1 = {
            x: this.canvasWidth / 2,
            y: this.canvasHeight - 80,
            radius: 22,
            vx: 0,
            vy: 0,
            color: '#2196F3',
            score: 0
        };
        
        // Player 2 (Red, top)
        this.player2 = {
            x: this.canvasWidth / 2,
            y: 80,
            radius: 22,
            vx: 0,
            vy: 0,
            color: '#F44336',
            score: 0
        };
    }
    
    startGame() {
        // Reset game state
        this.score1 = 0;
        this.score2 = 0;
        this.gameTime = 180;
        this.isPaused = false;
        this.isGameOver = false;
        
        this.updateScoreDisplay();
        this.resetGameObjects();
        
        // Show game screen
        document.getElementById('menuScreen').classList.add('hidden');
        document.getElementById('gameScreen').classList.remove('hidden');
        document.getElementById('pauseScreen').classList.add('hidden');
        document.getElementById('gameOverScreen').classList.add('hidden');
        
        // Start timer
        this.startTimer();
        
        // Start game loop
        this.lastTime = performance.now();
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    startTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            if (!this.isPaused && !this.isGameOver) {
                this.gameTime--;
                this.updateTimerDisplay();
                if (this.gameTime <= 0) {
                    this.endGame();
                }
            }
        }, 1000);
    }
    
    updateTimerDisplay() {
        const minutes = Math.floor(this.gameTime / 60);
        const seconds = this.gameTime % 60;
        document.getElementById('gameTimer').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    togglePause() {
        this.isPaused = !this.isPaused;
        if (this.isPaused) {
            document.getElementById('pauseScreen').classList.remove('hidden');
        } else {
            document.getElementById('pauseScreen').classList.add('hidden');
            this.lastTime = performance.now();
        }
    }
    
    returnToMenu() {
        this.isPaused = false;
        this.isGameOver = true;
        if (this.timerInterval) clearInterval(this.timerInterval);
        
        document.getElementById('gameScreen').classList.add('hidden');
        document.getElementById('pauseScreen').classList.add('hidden');
        document.getElementById('gameOverScreen').classList.add('hidden');
        document.getElementById('menuScreen').classList.remove('hidden');
    }
    
    endGame() {
        this.isGameOver = true;
        if (this.timerInterval) clearInterval(this.timerInterval);
        
        const winnerText = document.getElementById('winnerText');
        const finalScore = document.getElementById('finalScore');
        
        if (this.score1 > this.score2) {
            winnerText.textContent = this.gameMode === '1player' ? '🎉 You Win!' : '🎉 Blue Wins!';
            winnerText.style.color = '#4fc3f7';
        } else if (this.score2 > this.score1) {
            winnerText.textContent = this.gameMode === '1player' ? '😔 Computer Wins!' : '🎉 Red Wins!';
            winnerText.style.color = this.gameMode === '1player' ? '#ff6b6b' : '#ff6b6b';
        } else {
            winnerText.textContent = '🤝 It\'s a Tie!';
            winnerText.style.color = '#ffd700';
        }
        
        finalScore.textContent = `Final Score: ${this.score1} - ${this.score2}`;
        document.getElementById('gameOverScreen').classList.remove('hidden');
    }
    
    updateScoreDisplay() {
        document.getElementById('score1').textContent = this.score1;
        document.getElementById('score2').textContent = this.score2;
    }
    
    // AI for computer player
    updateAI() {
        if (this.gameMode !== '1player') return;
        
        const ai = this.player2;
        const puck = this.puck;
        
        // Difficulty settings
        const speeds = { easy: 2.5, medium: 4, hard: 5.5 };
        const reactionDelay = { easy: 20, medium: 10, hard: 5 };
        const maxSpeed = speeds[this.difficulty];
        const delay = reactionDelay[this.difficulty];
        
        // AI decision making
        let targetX = puck.x;
        let targetY = puck.y;
        
        // Defensive position when puck is in own half
        if (puck.y > this.canvasHeight / 2) {
            targetX = this.canvasWidth / 2;
            targetY = 100;
        } else {
            // Chase puck
            // Add some "mistake" based on difficulty
            if (this.difficulty === 'easy' && Math.random() < 0.1) {
                targetX += (Math.random() - 0.5) * 100;
            }
        }
        
        // Move towards target
        const dx = targetX - ai.x;
        const dy = targetY - ai.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 5) {
            ai.vx = (dx / distance) * maxSpeed;
            ai.vy = (dy / distance) * maxSpeed;
        } else {
            ai.vx *= 0.8;
            ai.vy *= 0.8;
        }
        
        // Predictive movement for hard difficulty
        if (this.difficulty === 'hard' && puck.vy < 0) {
            ai.vx += puck.vx * 0.3;
        }
    }
    
    updatePlayer1() {
        const player = this.player1;
        let ax = 0;
        let ay = 0;
        
        if (this.keys['w'] || this.keys['arrowup']) ay -= 1;
        if (this.keys['s'] || this.keys['arrowdown']) ay += 1;
        if (this.keys['a'] || this.keys['arrowleft']) ax -= 1;
        if (this.keys['d'] || this.keys['arrowright']) ax += 1;
        
        // Normalize acceleration
        if (ax !== 0 || ay !== 0) {
            const len = Math.sqrt(ax * ax + ay * ay);
            ax = (ax / len) * this.playerSpeed;
            ay = (ay / len) * this.playerSpeed;
        }
        
        player.vx += ax * 0.5;
        player.vy += ay * 0.5;
        
        // Apply friction
        player.vx *= 0.9;
        player.vy *= 0.9;
        
        // Limit speed
        const speed = Math.sqrt(player.vx * player.vx + player.vy * player.vy);
        if (speed > this.playerMaxSpeed) {
            player.vx = (player.vx / speed) * this.playerMaxSpeed;
            player.vy = (player.vy / speed) * this.playerMaxSpeed;
        }
    }
    
    updatePlayer2() {
        if (this.gameMode === '1player') {
            this.updateAI();
            return;
        }
        
        const player = this.player2;
        let ax = 0;
        let ay = 0;
        
        if (this.keys['arrowup']) ay -= 1;
        if (this.keys['arrowdown']) ay += 1;
        if (this.keys['arrowleft']) ax -= 1;
        if (this.keys['arrowright']) ax += 1;
        
        // Normalize acceleration
        if (ax !== 0 || ay !== 0) {
            const len = Math.sqrt(ax * ax + ay * ay);
            ax = (ax / len) * this.playerSpeed;
            ay = (ay / len) * this.playerSpeed;
        }
        
        player.vx += ax * 0.5;
        player.vy += ay * 0.5;
        
        // Apply friction
        player.vx *= 0.9;
        player.vy *= 0.9;
        
        // Limit speed
        const speed = Math.sqrt(player.vx * player.vx + player.vy * player.vy);
        if (speed > this.playerMaxSpeed) {
            player.vx = (player.vx / speed) * this.playerMaxSpeed;
            player.vy = (player.vy / speed) * this.playerMaxSpeed;
        }
    }
    
    updatePhysics() {
        // Update players
        this.updatePlayer1();
        this.updatePlayer2();
        
        // Update positions
        this.player1.x += this.player1.vx;
        this.player1.y += this.player1.vy;
        this.player2.x += this.player2.vx;
        this.player2.y += this.player2.vy;
        
        // Keep players in bounds
        this.keepPlayerInBounds(this.player1);
        this.keepPlayerInBounds(this.player2);
        
        // Update puck
        this.puck.vx *= this.friction;
        this.puck.vy *= this.friction;
        this.puck.x += this.puck.vx;
        this.puck.y += this.puck.vy;
        
        // Puck collision with walls
        this.handlePuckWallCollision();
        
        // Puck collision with players
        this.handlePuckPlayerCollision(this.player1);
        this.handlePuckPlayerCollision(this.player2);
        
        // Check goals
        this.checkGoals();
    }
    
    keepPlayerInBounds(player) {
        const margin = player.radius;
        
        // Check goal areas (allow players to enter goals slightly)
        const goalLeft = (this.canvasWidth - this.goalWidth) / 2;
        const goalRight = (this.canvasWidth + this.goalWidth) / 2;
        
        // X bounds
        if (player.x < margin) player.x = margin;
        if (player.x > this.canvasWidth - margin) player.x = this.canvasWidth - margin;
        
        // Y bounds
        if (player.y < margin) player.y = margin;
        if (player.y > this.canvasHeight - margin) player.y = this.canvasHeight - margin;
    }
    
    handlePuckWallCollision() {
        const puck = this.puck;
        const goalLeft = (this.canvasWidth - this.goalWidth) / 2;
        const goalRight = (this.canvasWidth + this.goalWidth) / 2;
        
        // Left and right walls
        if (puck.x - puck.radius < 0) {
            if (puck.y < goalLeft || puck.y > goalRight || 
                (puck.y > goalLeft && puck.y < goalRight && (puck.y < 0 || puck.y > this.canvasHeight))) {
                puck.x = puck.radius;
                puck.vx = -puck.vx * 0.8;
            }
        }
        if (puck.x + puck.radius > this.canvasWidth) {
            puck.x = this.canvasWidth - puck.radius;
            puck.vx = -puck.vx * 0.8;
        }
        
        // Top and bottom walls (check for goals)
        if (puck.y - puck.radius < 0) {
            // Check if in goal area
            if (puck.x >= goalLeft && puck.x <= goalRight) {
                // Goal scored by player 1
                this.scoreGoal(1);
            } else {
                puck.y = puck.radius;
                puck.vy = -puck.vy * 0.8;
            }
        }
        if (puck.y + puck.radius > this.canvasHeight) {
            // Check if in goal area
            if (puck.x >= goalLeft && puck.x <= goalRight) {
                // Goal scored by player 2
                this.scoreGoal(2);
            } else {
                puck.y = this.canvasHeight - puck.radius;
                puck.vy = -puck.vy * 0.8;
            }
        }
    }
    
    handlePuckPlayerCollision(player) {
        const puck = this.puck;
        const dx = puck.x - player.x;
        const dy = puck.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = puck.radius + player.radius;
        
        if (distance < minDistance) {
            // Collision detected
            const angle = Math.atan2(dy, dx);
            const overlap = minDistance - distance;
            
            // Separate puck from player
            puck.x += Math.cos(angle) * overlap;
            puck.y += Math.sin(angle) * overlap;
            
            // Calculate new velocity
            const speed = Math.sqrt(player.vx * player.vx + player.vy * player.vy);
            const hitPower = Math.max(speed * 0.5 + 8, 10);
            
            puck.vx = Math.cos(angle) * hitPower + player.vx * 0.5;
            puck.vy = Math.sin(angle) * hitPower + player.vy * 0.5;
            
            // Limit puck speed
            const puckSpeed = Math.sqrt(puck.vx * puck.vx + puck.vy * puck.vy);
            if (puckSpeed > this.puckMaxSpeed) {
                puck.vx = (puck.vx / puckSpeed) * this.puckMaxSpeed;
                puck.vy = (puck.vy / puckSpeed) * this.puckMaxSpeed;
            }
        }
    }
    
    scoreGoal(scoringPlayer) {
        if (scoringPlayer === 1) {
            this.score1++;
        } else {
            this.score2++;
        }
        
        this.updateScoreDisplay();
        
        // Reset positions
        this.resetPositions();
        
        // Check for game over (first to 5 or time up)
        if (this.score1 >= 5 || this.score2 >= 5) {
            this.endGame();
        }
    }
    
    resetPositions() {
        this.puck.x = this.canvasWidth / 2;
        this.puck.y = this.canvasHeight / 2;
        this.puck.vx = 0;
        this.puck.vy = 0;
        
        this.player1.x = this.canvasWidth / 2;
        this.player1.y = this.canvasHeight - 80;
        this.player1.vx = 0;
        this.player1.vy = 0;
        
        this.player2.x = this.canvasWidth / 2;
        this.player2.y = 80;
        this.player2.vx = 0;
        this.player2.vy = 0;
    }
    
    checkGoals() {
        // Handled in wall collision
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#e8f4f8';
        this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        
        // Draw rink
        this.drawRink();
        
        // Draw players
        this.drawPlayer(this.player1);
        this.drawPlayer(this.player2);
        
        // Draw puck
        this.drawPuck();
    }
    
    drawRink() {
        const ctx = this.ctx;
        const w = this.canvasWidth;
        const h = this.canvasHeight;
        
        // Ice texture effect
        const gradient = ctx.createLinearGradient(0, 0, 0, h);
        gradient.addColorStop(0, '#f0f8ff');
        gradient.addColorStop(0.5, '#e8f4f8');
        gradient.addColorStop(1, '#f0f8ff');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
        
        // Border
        ctx.strokeStyle = '#1565C0';
        ctx.lineWidth = 8;
        ctx.strokeRect(4, 4, w - 8, h - 8);
        
        // Center line
        ctx.strokeStyle = '#C62828';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, h / 2);
        ctx.lineTo(w, h / 2);
        ctx.stroke();
        
        // Center circle
        ctx.strokeStyle = '#1565C0';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, 60, 0, Math.PI * 2);
        ctx.stroke();
        
        // Center dot
        ctx.fillStyle = '#1565C0';
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Face-off circles
        ctx.strokeStyle = '#1565C0';
        ctx.lineWidth = 2;
        
        // Top face-off circles
        ctx.beginPath();
        ctx.arc(w / 4, h / 4, 35, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(w * 3 / 4, h / 4, 35, 0, Math.PI * 2);
        ctx.stroke();
        
        // Bottom face-off circles
        ctx.beginPath();
        ctx.arc(w / 4, h * 3 / 4, 35, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(w * 3 / 4, h * 3 / 4, 35, 0, Math.PI * 2);
        ctx.stroke();
        
        // Goals
        const goalLeft = (w - this.goalWidth) / 2;
        const goalRight = (w + this.goalWidth) / 2;
        
        // Top goal
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(goalLeft, 0, this.goalWidth, 15);
        ctx.strokeStyle = '#C62828';
        ctx.lineWidth = 3;
        ctx.strokeRect(goalLeft, 0, this.goalWidth, 15);
        
        // Bottom goal
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(goalLeft, h - 15, this.goalWidth, 15);
        ctx.strokeStyle = '#1565C0';
        ctx.lineWidth = 3;
        ctx.strokeRect(goalLeft, h - 15, this.goalWidth, 15);
        
        // Goal nets (grid pattern)
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.lineWidth = 1;
        
        // Top goal net
        for (let i = goalLeft; i <= goalRight; i += 10) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, 15);
            ctx.stroke();
        }
        for (let i = 0; i <= 15; i += 5) {
            ctx.beginPath();
            ctx.moveTo(goalLeft, i);
            ctx.lineTo(goalRight, i);
            ctx.stroke();
        }
        
        // Bottom goal net
        for (let i = goalLeft; i <= goalRight; i += 10) {
            ctx.beginPath();
            ctx.moveTo(i, h - 15);
            ctx.lineTo(i, h);
            ctx.stroke();
        }
        for (let i = h - 15; i <= h; i += 5) {
            ctx.beginPath();
            ctx.moveTo(goalLeft, i);
            ctx.lineTo(goalRight, i);
            ctx.stroke();
        }
    }
    
    drawPlayer(player) {
        const ctx = this.ctx;
        
        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.beginPath();
        ctx.ellipse(player.x + 3, player.y + 3, player.radius, player.radius * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Player body
        const gradient = ctx.createRadialGradient(
            player.x - 5, player.y - 5, 0,
            player.x, player.y, player.radius
        );
        gradient.addColorStop(0, this.lightenColor(player.color, 30));
        gradient.addColorStop(1, player.color);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Border
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(player.x - 6, player.y - 6, player.radius * 0.4, 0, Math.PI * 2);
        ctx.fill();
    }
    
    drawPuck() {
        const ctx = this.ctx;
        const puck = this.puck;
        
        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(puck.x + 2, puck.y + 2, puck.radius, puck.radius * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Puck body
        const gradient = ctx.createRadialGradient(
            puck.x - 3, puck.y - 3, 0,
            puck.x, puck.y, puck.radius
        );
        gradient.addColorStop(0, this.lightenColor(this.puckColor, 40));
        gradient.addColorStop(0.7, this.puckColor);
        gradient.addColorStop(1, this.darkenColor(this.puckColor, 20));
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(puck.x, puck.y, puck.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Border
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(puck.x - 4, puck.y - 4, puck.radius * 0.3, 0, Math.PI * 2);
        ctx.fill();
    }
    
    lightenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255))
            .toString(16).slice(1);
    }
    
    darkenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        return '#' + (0x1000000 + (R > 0 ? R : 0) * 0x10000 +
            (G > 0 ? G : 0) * 0x100 +
            (B > 0 ? B : 0))
            .toString(16).slice(1);
    }
    
    gameLoop(currentTime) {
        if (this.isGameOver) return;
        
        if (!this.isPaused) {
            this.updatePhysics();
            this.draw();
        }
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }
}

// Initialize game when page loads
window.addEventListener('DOMContentLoaded', () => {
    new IceHockeyGame();
});
