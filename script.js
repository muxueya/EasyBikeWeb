const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth; // Set canvas width to full window width
canvas.height = window.innerHeight; // Set canvas height to full window height

let bikeX, bikeY;
const bikeWidth = 60; // Updated bike width
const bikeHeight = 80; // Updated bike height
let obstacles = [];
let flowers = []; // Array to hold flowers
let distance = 0; // Distance in meters
let hearts = 5; // Start with five hearts
let gameOver = false;
let startTime; // To track time
let bgOffset = 0; // For background scrolling
const bgImage = new Image();
bgImage.src = 'bg.jpg'; // Background image
const flowerImage = new Image();
flowerImage.src = 'Flower.png'; // Flower image
const bikeImage = new Image();
bikeImage.src = 'Biker.png'; // Biker image
const rockImage = new Image();
rockImage.src = 'Rock.png'; // Rock image
const rabbitRightImage = new Image();
rabbitRightImage.src = 'Rabbit_right.png'; // Rabbit right image
const rabbitLeftImage = new Image();
rabbitLeftImage.src = 'Rabbit_left.png'; // Rabbit left image
const pedestrianImage = new Image();
pedestrianImage.src = 'Boy1.png'; // Pedestrian image
let difficulty; // Difficulty level

// Obstacle configurations based on difficulty
const obstacleTypes = {
    easy: [{ type: 'rock', heartsLost: 1 }],
    medium: [
        { type: 'rock', heartsLost: 1 },
        { type: 'rabbit', heartsLost: 2 }
    ],
    hard: [
        { type: 'rock', heartsLost: 1 },
        { type: 'rabbit', heartsLost: 2 },
        { type: 'pedestrian', heartsLost: 3 }
    ]
};

// Message variables
let message = ''; // Message to display for hearts lost or gained
let messageColor = ''; // Color of the message
let messageTimeout; // Timeout for clearing the message

// Start the game with the selected difficulty
function startGame(selectedDifficulty) {
    difficulty = selectedDifficulty;
    hearts = 5; // Reset hearts
    distance = 0; // Reset distance
    obstacles = []; // Clear obstacles
    flowers = []; // Clear flowers
    bgOffset = 0; // Reset background offset
    bikeX = canvas.width / 2 - 30; // Center bike horizontally
    bikeY = canvas.height - 140; // Position bike two rows above the control buttons
    gameOver = false; // Reset game over state
    startTime = Date.now(); // Start timer
    document.getElementById('menu').style.display = 'none'; // Hide menu
    document.getElementById('menu-container').classList.add('hidden'); // Hide the menu
    document.getElementById('game').style.display = 'block'; // Show game
    gameLoop(); // Start game loop
}

// Difficulty button event listeners
document.getElementById('easyBtn').addEventListener('click', () => startGame('easy'));
document.getElementById('mediumBtn').addEventListener('click', () => startGame('medium'));
document.getElementById('hardBtn').addEventListener('click', () => startGame('hard'));

function drawBackground() {
    bgOffset += 2; // Scrolling speed
    const bgAspect = bgImage.width / bgImage.height;
    const canvasAspect = canvas.width / canvas.height;

    let drawWidth, drawHeight;

    // Calculate dimensions for background image
    if (bgAspect > canvasAspect) {
        drawHeight = canvas.height;
        drawWidth = canvas.height * bgAspect;
    } else {
        drawWidth = canvas.width;
        drawHeight = canvas.width / bgAspect;
    }

    // Draw the background image twice for seamless scrolling
    ctx.drawImage(bgImage, 0, bgOffset % drawHeight, drawWidth, drawHeight);
    ctx.drawImage(bgImage, 0, (bgOffset % drawHeight) - drawHeight, drawWidth, drawHeight);
}

function drawBike() {
    ctx.drawImage(bikeImage, bikeX, bikeY, bikeWidth, bikeHeight); // Draw biker
}

function createObstacle() {
    const obstacleOptions = obstacleTypes[difficulty]; // Get obstacle options based on difficulty
    const obstacleChoice = obstacleOptions[Math.floor(Math.random() * obstacleOptions.length)];
    const obstacleX = Math.random() * (canvas.width - 40); // Random horizontal position

    // Create the obstacle object with its properties
    obstacles.push({
        x: obstacleX,
        y: -40,
        width: 40,
        height: 40,
        image: obstacleChoice.type === 'rock' ? rockImage :
               obstacleChoice.type === 'rabbit' ? rabbitRightImage : // Start with right image for rabbit
               pedestrianImage, // Assign appropriate image based on type
        heartsLost: obstacleChoice.heartsLost, // Store hearts lost value
        isRabbit: obstacleChoice.type === 'rabbit', // Flag for rabbit
        isPedestrian: obstacleChoice.type === 'pedestrian', // Flag for pedestrian
        direction: 1, // Initial horizontal direction for jumping
        bounceOffset: 0 // Initial vertical bounce offset
    });
}

function createFlower() {
    const flowerX = Math.random() * (canvas.width - 30); // Random horizontal position
    flowers.push({
        x: flowerX,
        y: -30,
        width: 30,
        height: 30,
        image: flowerImage // Use flower image
    });
}


function drawObstacles() {
    obstacles.forEach(obstacle => {
        // Update rabbit image based on direction
        if (obstacle.isRabbit) {
            obstacle.image = obstacle.direction === 1 ? rabbitRightImage : rabbitLeftImage; // Change image based on direction
            obstacle.x += obstacle.direction * 2; // Move rabbit horizontally
            obstacle.y += 2; // Move rabbits down
            obstacle.bounceOffset = Math.sin(Date.now() / 100) * 5; // Bounce effect

            // Reverse direction if it hits the canvas edges
            if (obstacle.x < 0 || obstacle.x > canvas.width - 40) {
                obstacle.direction *= -1; // Change direction
            }
            // Draw the obstacle with bounce effect
            ctx.drawImage(obstacle.image, obstacle.x, obstacle.y + obstacle.bounceOffset, 40, 40); // Draw obstacles with bounce effect

        } 
        // Check if the obstacle is a pedestrian
        else if (obstacle.isPedestrian) {
            // Draw pedestrians with size 60x80
            ctx.drawImage(obstacle.image, obstacle.x, obstacle.y, 60, 80); // Draw pedestrian with updated size
            // Move pedestrians slightly faster down
            obstacle.y += 2.5; // Move pedestrians down faster
        } else {
            // Draw other obstacles with size 40x40
            ctx.drawImage(obstacle.image, obstacle.x, obstacle.y, 40, 40); // Draw other obstacles with size 40x40
            // Move other obstacles down slightly
            obstacle.y += 2; // Move other obstacles down
        }
    });
}


function drawFlowers() {
    flowers.forEach(flower => {
        ctx.drawImage(flower.image, flower.x, flower.y, flower.width, flower.height); // Draw flowers
        flower.y += 2; // Move flowers from top to bottom
    });
}

function drawMessage() {
    if (message) {
        ctx.fillStyle = messageColor; // Set the message color
        ctx.font = 'bold 48px Arial'; // Set font style and size
        ctx.textAlign = 'center'; // Center the text
        ctx.fillText(message, canvas.width / 2, canvas.height / 2); // Draw the message
    }
}

function showMessage(text, color) {
    message = text; // Set the message text
    messageColor = color; // Set the message color
    clearTimeout(messageTimeout); // Clear any existing timeout
    messageTimeout = setTimeout(() => {
        message = ''; // Clear the message after a delay
    }, 1000); // Message displays for 1 second
}

function checkCollision() {
    for (let obstacle of obstacles) {
        if (obstacle.y + 40 > bikeY && 
            bikeX < obstacle.x + 40 && 
            bikeX + bikeWidth > obstacle.x) {
            hearts -= obstacle.heartsLost; // Lose hearts based on obstacle type
            showMessage(`-${obstacle.heartsLost}`, 'blue'); // Show hearts lost message
            if (hearts <= 0) {
                gameOver = true; // End game if no hearts left
            }
            // Remove the collided obstacle
            obstacles = obstacles.filter(o => o !== obstacle);
            break; // Exit loop after collision
        }
    }

    // Check for flower collection
    for (let flower of flowers) {
        if (flower.y + flower.height > bikeY &&
            bikeX < flower.x + flower.width &&
            bikeX + bikeWidth > flower.x) {
            if (hearts < 5) {
                hearts += 1; // Regain a heart if less than 5
                showMessage(`+1`, 'orange'); // Show flower collected message
            }
            // Remove the collected flower
            flowers = flowers.filter(f => f !== flower);
            break; // Exit loop after collecting flower
        }
    }
}

function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function updateScore() {
    distance++; // Increase distance over time
    document.getElementById('hearts').innerText = `❤️ Hearts: ${hearts}`; // Update hearts display
    document.getElementById('distance').innerText = `📏 Distance: ${distance} m`;
    document.getElementById('time').innerText = `⏱️ Time: ${formatTime(Math.floor((Date.now() - startTime) / 1000))}`; // Update time display
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground(); // Draw scrolling background
    if (!gameOver) {
        drawBike();
        drawObstacles();
        drawFlowers(); // Draw flowers
        checkCollision();
        updateScore();
        drawMessage(); // Draw the message for hearts lost or gained
        // Randomly create obstacles and flowers
        if (Math.random() < 0.05) createObstacle(); // Increased obstacle generation rate
        if (Math.random() < 0.01) createFlower(); // Decreased flower generation rate to 10%
        requestAnimationFrame(gameLoop);
    } else {
        // Show the game over container
        document.getElementById('finalDistance').innerText = `Distance: ${distance} m`; // Update distance
        document.getElementById('gameOverContainer').classList.remove('hidden'); // Show the container
        document.getElementById('game').style.display = 'none'; // Hide the game canvas
    }
}

document.getElementById('restartBtn').addEventListener('click', () => {
    location.reload(); // Reload the page to restart the game
});

function moveLeft() {
    if (bikeX > 0) bikeX -= 15; // Move bike left
}

function moveRight() {
    if (bikeX < canvas.width - bikeWidth) bikeX += 15; // Move bike right
}

// Event listeners for control buttons
document.getElementById('leftBtn').innerText = '←'; // Change button text for left
document.getElementById('rightBtn').innerText = '→'; // Change button text for right
document.getElementById('leftBtn').addEventListener('click', moveLeft);
document.getElementById('rightBtn').addEventListener('click', moveRight);
document.getElementById('restartBtn').addEventListener('click', () => location.reload()); // Reload page to restart

window.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') moveLeft();
    if (event.key === 'ArrowRight') moveRight();
});

// Initialize game
startTime = Date.now(); // Start timer