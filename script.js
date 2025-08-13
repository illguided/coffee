// Get the game elements
const gameBoard = document.getElementById('game-board');
const coffeeBean = document.getElementById('coffee-bean');
const startMessage = document.getElementById('start-message');
const scoreDisplay = document.getElementById('score');

// Game variables
let isGameRunning = false;
let coffeeBeanBottom = 10;
let gravity = 1.5;
let isJumping = false;
let score = 0;
let obstacles = [];

// Game dimensions (we'll use these for collision detection)
const gameWidth = 600;
const gameHeight = 600;
const coffeeBeanSize = 40;

// Jump function
function jump() {
    if (isJumping) return;
    isJumping = true;
    let jumpCount = 0;
    let upInterval = setInterval(() => {
        if (jumpCount >= 20) {
            clearInterval(upInterval);
            isJumping = false;
        }
        coffeeBeanBottom += 10;
        jumpCount++;
    }, 15);
}

// Create new obstacles
function createObstacle() {
    // Generate a random height for the top rock
    let rockHeight = Math.floor(Math.random() * 250) + 50;
    
    // Set a random height for the bottom tree
    let treeHeight = Math.floor(Math.random() * 250) + 50;

    // Ensure there's a gap in the middle
    let totalHeight = rockHeight + treeHeight;
    let remainingHeight = gameHeight - totalHeight;
    
    // If the gap is too small, adjust the heights
    if (remainingHeight < 150) {
        let adjustment = (150 - remainingHeight) / 2;
        rockHeight -= adjustment;
        treeHeight -= adjustment;
    }

    // Create the rock obstacle (from the top)
    let rock = document.createElement('img');
    rock.src = 'rock.svg';
    rock.classList.add('obstacle', 'rock');
    rock.style.height = rockHeight + 'px';
    rock.style.width = '60px'; // Maintaining a consistent width
    rock.style.left = gameWidth + 'px';
    rock.style.top = '0';
    
    // Create the tree obstacle (from the bottom)
    let tree = document.createElement('img');
    tree.src = 'tree.svg';
    tree.classList.add('obstacle', 'tree');
    tree.style.height = treeHeight + 'px';
    tree.style.width = '60px'; // Maintaining a consistent width
    tree.style.left = gameWidth + 'px';
    tree.style.bottom = '0';

    gameBoard.appendChild(rock);
    gameBoard.appendChild(tree);
    obstacles.push(rock, tree);
}

// The core game loop
function gameLoop() {
    if (!isGameRunning) return;

    // Apply gravity
    if (coffeeBeanBottom > 10 && !isJumping) {
        coffeeBeanBottom -= gravity;
    }

    // Update coffee bean position
    coffeeBean.style.bottom = coffeeBeanBottom + 'px';

    // Move obstacles and check for collisions
    obstacles.forEach(obstacle => {
        let obstacleLeft = parseInt(obstacle.style.left);
        obstacle.style.left = (obstacleLeft - 2) + 'px';

        // Collision Check Logic
        let coffeeBeanLeft = 10;
        let coffeeBeanRight = coffeeBeanLeft + coffeeBeanSize;
        let coffeeBeanTop = coffeeBeanBottom + coffeeBeanSize;

        let obstacleRight = obstacleLeft + parseInt(obstacle.style.width);
        let obstacleHeight = parseInt(obstacle.style.height);

        // This collision logic is more accurate than a simple bounding box check
        if (
            coffeeBeanRight > obstacleLeft && coffeeBeanLeft < obstacleRight &&
            ((obstacle.classList.contains('tree') && coffeeBeanBottom < obstacleHeight) ||
            (obstacle.classList.contains('rock') && coffeeBeanTop > (gameHeight - obstacleHeight)))
        ) {
            endGame();
        }

        // Remove obstacles when they leave the screen
        if (obstacleLeft < -parseInt(obstacle.style.width)) {
            obstacle.remove();
        }
    });
    
    // Clear obstacles from the array once they are off-screen
    obstacles = obstacles.filter(obstacle => parseInt(obstacle.style.left) > -parseInt(obstacle.style.width));

    // Update score based on removed obstacles
    score = Math.floor(obstacles.length / 2);
    scoreDisplay.textContent = 'Score: ' + score;

    requestAnimationFrame(gameLoop);
}

// Start the game
function startGame() {
    if (isGameRunning) return;
    isGameRunning = true;
    startMessage.style.display = 'none';
    score = 0;
    scoreDisplay.textContent = 'Score: 0';
    coffeeBeanBottom = 10;
    coffeeBean.style.bottom = coffeeBeanBottom + 'px';

    // Remove old obstacles
    obstacles.forEach(obstacle => obstacle.remove());
    obstacles = [];

    // Set up obstacle generation
    let obstacleTimer = setInterval(() => {
        if (!isGameRunning) {
            clearInterval(obstacleTimer);
            return;
        }
        createObstacle();
    }, 2000);

    gameLoop();
}

// End the game
function endGame() {
    isGameRunning = false;
    startMessage.textContent = 'Game Over! Click to Restart.';
    startMessage.style.display = 'block';
    
    // Animate the end state (optional)
    coffeeBean.style.animation = 'shake 0.5s ease-in-out infinite';
}

// Event listeners
document.addEventListener('click', () => {
    if (!isGameRunning) {
        startGame();
    } else {
        jump();
    }
});