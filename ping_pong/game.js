const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

// Game constants (now configurable per player)
const PADDLE_WIDTH = 15;
let BALL_SIZE = 10;
const WINNING_SCORE = 10;

// Per-player settings
let leftPaddleHeight = 100;
let rightPaddleHeight = 100;
let leftPaddleSpeed = 10;
let rightPaddleSpeed = 10;
let leftAISpeed = 4;
let rightAISpeed = 4;

let leftScore = 0;
let rightScore = 0;
let vsComputer = false;

// Game state
const game = {
    leftPaddleY: 0,
    rightPaddleY: 0,
    ballX: 0,
    ballY: 0,
    ballDX: 0,
    ballDY: 0,
    ballColor: 'white',
    leftPlayerName: 'Left',
    rightPlayerName: 'Right',
    isPaused: true
};

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Initial positions (use current per-player paddle heights)
    game.leftPaddleY = canvas.height / 2 - leftPaddleHeight / 2;
    game.rightPaddleY = canvas.height / 2 - rightPaddleHeight / 2;
    resetBall();
}

function resetBall() {
    game.ballX = canvas.width / 2;
    game.ballY = canvas.height / 2;
    game.ballColor = 'white';

    // Random direction
    const direction = Math.random() > 0.5 ? 1 : -1;
    game.ballDX = (4 + Math.random() * 2) * direction;
    game.ballDY = (4 + Math.random() * 2) * (Math.random() > 0.5 ? 1 : -1);
}

const keys = {};

window.addEventListener('keydown', (e) => keys[e.code] = true);
window.addEventListener('keyup', (e) => keys[e.code] = false);

function update() {
    if (game.isPaused) return;

    // Move paddles (using per-player speeds and heights)
    if (keys['KeyW'] && game.leftPaddleY > 0) {
        game.leftPaddleY -= leftPaddleSpeed;
    }
    if (keys['KeyS'] && game.leftPaddleY < canvas.height - leftPaddleHeight) {
        game.leftPaddleY += leftPaddleSpeed;
    }
    if (keys['ArrowUp'] && game.rightPaddleY > 0) {
        game.rightPaddleY -= rightPaddleSpeed;
    }
    if (keys['ArrowDown'] && game.rightPaddleY < canvas.height - rightPaddleHeight) {
        game.rightPaddleY += rightPaddleSpeed;
    }

    // AI for right paddle (uses right player's speed settings)
    if (vsComputer) {
        const paddleCenter = game.rightPaddleY + rightPaddleHeight / 2;
        const targetY = game.ballY + BALL_SIZE / 2;
        if (paddleCenter < targetY - 10) {
            game.rightPaddleY += rightAISpeed;
        } else if (paddleCenter > targetY + 10) {
            game.rightPaddleY -= rightAISpeed;
        }
    }

    // Move ball
    game.ballX += game.ballDX;
    game.ballY += game.ballDY;

    // Wall collision (top/bottom)
    if (game.ballY <= 0 || game.ballY + BALL_SIZE >= canvas.height) {
        game.ballDY *= -1;
    }

    // Paddle collision (left)
    if (game.ballX <= PADDLE_WIDTH) {
        if (game.ballY >= game.leftPaddleY && game.ballY <= game.leftPaddleY + leftPaddleHeight) {
            game.ballDX *= -1.1; // Increase speed slightly
            game.ballX = PADDLE_WIDTH + 1; // Prevent sticking
            game.ballColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
        } else if (game.ballX < 0) {
            rightScore++;
            updateScore();
            resetBall();
        }
    }

    // Paddle collision (right)
    if (game.ballX + BALL_SIZE >= canvas.width - PADDLE_WIDTH) {
        if (game.ballY >= game.rightPaddleY && game.ballY <= game.rightPaddleY + rightPaddleHeight) {
            game.ballDX *= -1.1; // Increase speed slightly
            game.ballX = canvas.width - PADDLE_WIDTH - BALL_SIZE - 1; // Prevent sticking
            game.ballColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
        } else if (game.ballX > canvas.width) {
            leftScore++;
            updateScore();
            resetBall();
        }
    }
}

function updateScore() {
    scoreElement.innerText = `${game.leftPlayerName} ${leftScore} - ${rightScore} ${game.rightPlayerName}`;

    if (leftScore >= WINNING_SCORE) {
        showVictory(game.leftPlayerName);
    } else if (rightScore >= WINNING_SCORE) {
        showVictory(game.rightPlayerName);
    }
}

function showVictory(winner) {
    game.isPaused = true;
    document.getElementById('victory-screen').style.display = 'flex';
    document.getElementById('winner-text').innerText = `${winner} Wins!`;
}

function draw() {
    // Clear canvas
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Center line
    ctx.setLineDash([20, 20]);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Left paddle (uses left player's height)
    ctx.fillStyle = 'white';
    ctx.fillRect(0, game.leftPaddleY, PADDLE_WIDTH, leftPaddleHeight);

    // Right paddle (uses right player's height)
    ctx.fillRect(canvas.width - PADDLE_WIDTH, game.rightPaddleY, PADDLE_WIDTH, rightPaddleHeight);

    // Ball
    ctx.fillStyle = game.ballColor;
    ctx.beginPath();
    ctx.arc(game.ballX + BALL_SIZE/2, game.ballY + BALL_SIZE/2, BALL_SIZE/2, 0, Math.PI * 2);
    ctx.fill();
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

window.addEventListener('resize', resize);
resize();

// Setup Screen Logic
const mode2pBtn = document.getElementById('mode-2p');
const modeCpuBtn = document.getElementById('mode-cpu');
const instructionsEl = document.getElementById('instructions');
const rightNameInput = document.getElementById('right-name');

// Settings inputs
const leftPaddleHeightInput = document.getElementById('left-paddle-height');
const leftPaddleSpeedInput = document.getElementById('left-paddle-speed');
const rightPaddleHeightInput = document.getElementById('right-paddle-height');
const rightPaddleSpeedInput = document.getElementById('right-paddle-speed');
const ballSizeInput = document.getElementById('ball-size');

const leftPaddleHeightValue = document.getElementById('left-paddle-height-value');
const leftPaddleSpeedValue = document.getElementById('left-paddle-speed-value');
const rightPaddleHeightValue = document.getElementById('right-paddle-height-value');
const rightPaddleSpeedValue = document.getElementById('right-paddle-speed-value');
const ballSizeValue = document.getElementById('ball-size-value');

// Update displayed values when sliders change
leftPaddleHeightInput.addEventListener('input', () => {
    leftPaddleHeightValue.textContent = leftPaddleHeightInput.value;
});

leftPaddleSpeedInput.addEventListener('input', () => {
    leftPaddleSpeedValue.textContent = leftPaddleSpeedInput.value;
});

rightPaddleHeightInput.addEventListener('input', () => {
    rightPaddleHeightValue.textContent = rightPaddleHeightInput.value;
});

rightPaddleSpeedInput.addEventListener('input', () => {
    rightPaddleSpeedValue.textContent = rightPaddleSpeedInput.value;
});

ballSizeInput.addEventListener('input', () => {
    ballSizeValue.textContent = ballSizeInput.value;
});

function updateModeUI() {
    mode2pBtn.classList.toggle('active', !vsComputer);
    modeCpuBtn.classList.toggle('active', vsComputer);
    rightNameInput.style.display = vsComputer ? 'none' : '';
    instructionsEl.innerHTML = vsComputer
        ? '<p>Left: <strong>W</strong> (Up) | <strong>S</strong> (Down)</p><p>Right: <strong>Computer</strong></p>'
        : '<p>Left: <strong>W</strong> (Up) | <strong>S</strong> (Down)</p><p>Right: <strong>↑</strong> (Up) | <strong>↓</strong> (Down)</p>';
}

mode2pBtn.addEventListener('click', () => {
    vsComputer = false;
    updateModeUI();
});

modeCpuBtn.addEventListener('click', () => {
    vsComputer = true;
    updateModeUI();
});

document.getElementById('start-btn').addEventListener('click', () => {
    const leftName = document.getElementById('left-name').value.trim();
    const rightName = vsComputer ? 'Computer' : document.getElementById('right-name').value.trim();

    if (leftName) game.leftPlayerName = leftName;
    if (rightName) game.rightPlayerName = rightName;

    // Apply per-player settings
    leftPaddleHeight = parseInt(leftPaddleHeightInput.value);
    leftPaddleSpeed = parseInt(leftPaddleSpeedInput.value);
    rightPaddleHeight = parseInt(rightPaddleHeightInput.value);
    rightPaddleSpeed = parseInt(rightPaddleSpeedInput.value);
    BALL_SIZE = parseInt(ballSizeInput.value);

    // AI speeds scale with respective paddle speeds
    leftAISpeed = Math.max(2, Math.min(8, leftPaddleSpeed * 0.4));
    rightAISpeed = Math.max(2, Math.min(8, rightPaddleSpeed * 0.4));

    // Reposition paddles with new heights
    game.leftPaddleY = canvas.height / 2 - leftPaddleHeight / 2;
    game.rightPaddleY = canvas.height / 2 - rightPaddleHeight / 2;

    document.getElementById('setup-screen').style.display = 'none';
    game.isPaused = false;
});

// Restart Logic
document.getElementById('restart-btn').addEventListener('click', () => {
    leftScore = 0;
    rightScore = 0;
    updateScore();
    document.getElementById('victory-screen').style.display = 'none';
    document.getElementById('setup-screen').style.display = 'flex';
    game.isPaused = true;
    resetBall();
    updateModeUI();
    updateDateTime();
});

function updateDateTime() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    document.getElementById('current-date').innerText = now.toLocaleDateString('en-US', options);
}

updateDateTime();
gameLoop();
