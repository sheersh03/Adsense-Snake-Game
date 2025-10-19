// Game constants
const GRID_SIZE = 20;
const GAME_SPEED = 100; // milliseconds
const CANVAS_SIZE = 400;
const INITIAL_SNAKE_LENGTH = 3;

// Game variables
let canvas, ctx;
let snake = [];
let food = {};
let direction = 'right';
let nextDirection = 'right';
let gameInterval;
let score = 0;
let gameRunning = false;
let gamePaused = false;

// DOM elements
const scoreElement = document.getElementById('score');
const finalScoreElement = document.getElementById('final-score');
const startButton = document.getElementById('start-btn');
const restartButton = document.getElementById('restart-btn');
const playAgainButton = document.getElementById('play-again-btn');
const pauseButton = document.getElementById('pause-btn');
const mobileControls = document.getElementById('mobile-controls');
const mobileControlButtons = document.querySelectorAll('.mobile-control-btn');
const gameOverScreen = document.getElementById('game-over');
const gameContainer = document.querySelector('.game-container');

// AdSense and Cookie Banner elements
const cookieBanner = document.getElementById('cookie-banner');
const cookieAcceptBtn = document.getElementById('cookie-accept');
const cookieDeclineBtn = document.getElementById('cookie-decline');
const stickyAd = document.getElementById('sticky-ad');
const closeStickyAdBtn = document.getElementById('close-sticky-ad');

// Cookie management
const COOKIE_CONSENT_KEY = 'snakeGameCookieConsent';
const STICKY_AD_CLOSED_KEY = 'snakeGameStickyAdClosed';

function applyConsent(granted) {
    if (typeof gtag !== 'function') return;
    gtag('consent', 'update', {
        ad_storage: granted ? 'granted' : 'denied',
        analytics_storage: granted ? 'granted' : 'denied'
    });
}

function setCookie(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = name + '=' + value + ';expires=' + expires.toUTCString() + ';path=/';
}

function getCookie(name) {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

// Check for permanent cookie consent
function checkCookieConsent() {
    // Check permanent cookie - persists across page refreshes
    const consent = getCookie(COOKIE_CONSENT_KEY);

    if (!consent) {
        // No consent given yet - show banner
        if (cookieBanner) {
            cookieBanner.classList.remove('hidden');
        }
        applyConsent(false);
        return;
    }

    if (consent === 'accepted') {
        // Consent already given - load ads automatically
        applyConsent(true);
        initializeAds();
        if (cookieBanner) {
            cookieBanner.classList.add('hidden');
        }
        return;
    }

    if (consent === 'declined') {
        applyConsent(false);
        if (cookieBanner) {
            cookieBanner.classList.add('hidden');
        }
    }
    // If declined, banner stays hidden but no ads load
}

function initializeAds() {
    // Initialize AdSense ads
    try {
        const adElements = document.querySelectorAll('.adsbygoogle');
        adElements.forEach((ad) => {
            if (!ad.dataset.adsbygoogleStatus) {
                (window.adsbygoogle = window.adsbygoogle || []).push({});
            }
        });

        // Show sticky ad after a delay if not closed
        const stickyAdClosed = getCookie(STICKY_AD_CLOSED_KEY);
        if (!stickyAdClosed) {
            setTimeout(() => {
                if (stickyAd) {
                    stickyAd.classList.remove('hidden');
                }
            }, 3000); // Show after 3 seconds
        }
    } catch (error) {
        console.error('AdSense initialization error:', error);
    }
}

function handleCookieAccept() {
    // Store consent in permanent cookie (365 days) - persists across refreshes
    setCookie(COOKIE_CONSENT_KEY, 'accepted', 365);
    if (cookieBanner) {
        cookieBanner.classList.add('hidden');
    }
    applyConsent(true);
    initializeAds();
}

function handleCookieDecline() {
    // Store decline in permanent cookie (365 days) - persists across refreshes
    setCookie(COOKIE_CONSENT_KEY, 'declined', 365);
    if (cookieBanner) {
        cookieBanner.classList.add('hidden');
    }
    applyConsent(false);
}

function closeStickyAd() {
    if (stickyAd) {
        stickyAd.classList.add('hidden');
        setCookie(STICKY_AD_CLOSED_KEY, 'true', 1); // Remember for 1 day
    }
}

// Initialize the game
window.onload = function() {
    canvas = document.getElementById('game-board');
    ctx = canvas.getContext('2d');

    // Set canvas dimensions
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;

    // Add event listeners
    document.addEventListener('keydown', handleKeyPress);
    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', restartGame);
    playAgainButton.addEventListener('click', function() {
        // Refresh the entire page when Play Again is clicked
        window.location.reload();
    });
    pauseButton.addEventListener('click', togglePause);
    mobileControlButtons.forEach(button => {
        const directionValue = button.dataset.direction;
        if (!directionValue) return;

        const handleInput = (event) => {
            event.preventDefault();
            attemptDirectionChange(directionValue);
        };

        button.addEventListener('touchstart', handleInput, { passive: false });
        button.addEventListener('click', handleInput);
    });

    // Cookie banner event listeners
    if (cookieAcceptBtn) {
        cookieAcceptBtn.addEventListener('click', handleCookieAccept);
    }
    if (cookieDeclineBtn) {
        cookieDeclineBtn.addEventListener('click', handleCookieDecline);
    }
    if (closeStickyAdBtn) {
        closeStickyAdBtn.addEventListener('click', closeStickyAd);
    }

    // Check cookie consent and show banner if needed
    checkCookieConsent();

    // Draw initial board
    drawBoard();
};

function resetGameState() {
    score = 0;
    scoreElement.textContent = score;
    direction = 'right';
    nextDirection = 'right';
    gamePaused = false;

    initSnake();
    generateFood();

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBoard();
    drawFood();
    drawSnake();
}

function stopGameLoop() {
    clearInterval(gameInterval);
    gameInterval = null;
    gameRunning = false;

    // Unlock body scroll when game stops
    document.body.classList.remove('game-active');
}

function startGameLoop() {
    clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, GAME_SPEED);
    gameRunning = true;
    gamePaused = false;

    // Lock body scroll during gameplay
    document.body.classList.add('game-active');
}

function transitionToPlayingState() {
    gameContainer.classList.remove('hidden');
    gameOverScreen.classList.add('hidden');
    startButton.classList.add('hidden');
    restartButton.classList.remove('hidden');
    pauseButton.classList.remove('hidden');
    pauseButton.textContent = 'Pause';
    pauseButton.disabled = false;
    if (mobileControls) {
        mobileControls.classList.remove('hidden');
    }
}

function transitionToGameOverState() {
    gameContainer.classList.add('hidden');
    gameOverScreen.classList.remove('hidden');
    pauseButton.classList.add('hidden');
    pauseButton.textContent = 'Pause';
    pauseButton.disabled = false;
    gamePaused = false;
    if (mobileControls) {
        mobileControls.classList.add('hidden');
    }
}

function togglePause() {
    if (!gameRunning && !gamePaused) {
        return;
    }

    gamePaused = !gamePaused;
    pauseButton.textContent = gamePaused ? 'Resume' : 'Pause';
}

function attemptDirectionChange(newDirection) {
    if (!gameRunning) return;

    const oppositeDirections = {
        up: 'down',
        down: 'up',
        left: 'right',
        right: 'left'
    };

    if (!oppositeDirections[newDirection]) return;

    if (direction === oppositeDirections[newDirection]) {
        return;
    }

    nextDirection = newDirection;
}

// Draw the game board
function drawBoard() {
    ctx.fillStyle = '#e8e8e8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid lines
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
    
    // Draw vertical lines
    for (let x = 0; x <= canvas.width; x += CANVAS_SIZE / GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    // Draw horizontal lines
    for (let y = 0; y <= canvas.height; y += CANVAS_SIZE / GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

// Initialize the snake
function initSnake() {
    snake = [];
    for (let i = 0; i < INITIAL_SNAKE_LENGTH; i++) {
        snake.push({
            x: Math.floor(GRID_SIZE / 2) - i,
            y: Math.floor(GRID_SIZE / 2)
        });
    }
}

// Generate food at a random position
function generateFood() {
    // Generate random coordinates
    let foodX, foodY;
    let validPosition = false;
    
    while (!validPosition) {
        foodX = Math.floor(Math.random() * GRID_SIZE);
        foodY = Math.floor(Math.random() * GRID_SIZE);
        
        // Check if the position is not occupied by the snake
        validPosition = true;
        for (let segment of snake) {
            if (segment.x === foodX && segment.y === foodY) {
                validPosition = false;
                break;
            }
        }
    }
    
    food = { x: foodX, y: foodY };
}

// Draw the snake
function drawSnake() {
    snake.forEach((segment, index) => {
        // Head is a different color
        if (index === 0) {
            ctx.fillStyle = '#2E7D32'; // Dark green for head
        } else {
            ctx.fillStyle = '#4CAF50'; // Green for body
        }
        
        const segmentSize = CANVAS_SIZE / GRID_SIZE;
        const x = segment.x * segmentSize;
        const y = segment.y * segmentSize;
        
        // Draw rectangle for the snake segments
        ctx.beginPath();
        ctx.rect(x, y, segmentSize, segmentSize);
        ctx.fill();
        
        // Draw eyes on the head
        if (index === 0) {
            ctx.fillStyle = 'white';
            
            // Position eyes based on direction
            const eyeSize = segmentSize / 6;
            const eyeOffset = segmentSize / 4;
            
            let leftEyeX, leftEyeY, rightEyeX, rightEyeY;
            
            switch (direction) {
                case 'up':
                    leftEyeX = x + eyeOffset;
                    leftEyeY = y + eyeOffset;
                    rightEyeX = x + segmentSize - eyeOffset - eyeSize;
                    rightEyeY = y + eyeOffset;
                    break;
                case 'down':
                    leftEyeX = x + eyeOffset;
                    leftEyeY = y + segmentSize - eyeOffset - eyeSize;
                    rightEyeX = x + segmentSize - eyeOffset - eyeSize;
                    rightEyeY = y + segmentSize - eyeOffset - eyeSize;
                    break;
                case 'left':
                    leftEyeX = x + eyeOffset;
                    leftEyeY = y + eyeOffset;
                    rightEyeX = x + eyeOffset;
                    rightEyeY = y + segmentSize - eyeOffset - eyeSize;
                    break;
                case 'right':
                    leftEyeX = x + segmentSize - eyeOffset - eyeSize;
                    leftEyeY = y + eyeOffset;
                    rightEyeX = x + segmentSize - eyeOffset - eyeSize;
                    rightEyeY = y + segmentSize - eyeOffset - eyeSize;
                    break;
            }
            
            ctx.beginPath();
            ctx.arc(leftEyeX + eyeSize/2, leftEyeY + eyeSize/2, eyeSize, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(rightEyeX + eyeSize/2, rightEyeY + eyeSize/2, eyeSize, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}

// Draw the food
function drawFood() {
    const foodSize = CANVAS_SIZE / GRID_SIZE;
    const x = food.x * foodSize;
    const y = food.y * foodSize;
    
    // Draw apple-like food
    ctx.fillStyle = '#F44336'; // Red
    ctx.beginPath();
    ctx.arc(x + foodSize/2, y + foodSize/2, foodSize/2 - 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw stem
    ctx.fillStyle = '#795548'; // Brown
    ctx.fillRect(x + foodSize/2 - 1, y + 2, 2, 4);
}

// Move the snake
function moveSnake() {
    // Update direction
    direction = nextDirection;
    
    // Calculate new head position
    const head = { ...snake[0] };
    
    switch (direction) {
        case 'up':
            head.y -= 1;
            break;
        case 'down':
            head.y += 1;
            break;
        case 'left':
            head.x -= 1;
            break;
        case 'right':
            head.x += 1;
            break;
    }
    
    // Check for collisions
    if (checkCollision(head)) {
        gameOver();
        return;
    }
    
    // Add new head
    snake.unshift(head);
    
    // Check if snake ate food
    if (head.x === food.x && head.y === food.y) {
        // Increase score
        score += 10;
        scoreElement.textContent = score;
        
        // Generate new food
        generateFood();
    } else {
        // Remove tail if no food was eaten
        snake.pop();
    }
}

// Check for collisions
function checkCollision(head) {
    // Check wall collision
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        return true;
    }
    
    // Check self collision
    for (let segment of snake) {
        if (head.x === segment.x && head.y === segment.y) {
            return true;
        }
    }
    
    return false;
}

// Handle keyboard input
function handleKeyPress(event) {
    const key = event.key.toLowerCase();

    // List of game control keys
    const gameKeys = ['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'];

    // Prevent default browser behavior (scrolling) for game keys
    if (gameKeys.includes(key)) {
        event.preventDefault();
        event.stopPropagation();
    }

    // Only process game input if game is running
    if (!gameRunning) return;

    switch (key) {
        case 'arrowup':
        case 'w':
            attemptDirectionChange('up');
            break;
        case 'arrowdown':
        case 's':
            attemptDirectionChange('down');
            break;
        case 'arrowleft':
        case 'a':
            attemptDirectionChange('left');
            break;
        case 'arrowright':
        case 'd':
            attemptDirectionChange('right');
            break;
    }
}

// Game loop
function gameLoop() {
    if (gamePaused) {
        return;
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw board
    drawBoard();
    
    // Move snake
    moveSnake();
    
    // Draw food
    drawFood();
    
    // Draw snake
    drawSnake();
}

// Start the game
function startGame() {
    if (gameRunning) return;

    stopGameLoop();
    transitionToPlayingState();
    resetGameState();
    startGameLoop();
}

// Restart the game
function restartGame() {
    stopGameLoop();
    transitionToPlayingState();
    resetGameState();
    startGameLoop();
}

// Game over
function gameOver() {
    stopGameLoop();
    finalScoreElement.textContent = score;
    transitionToGameOverState();
}
