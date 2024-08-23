const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth; // Set canvas width to full window width
canvas.height = window.innerHeight; // Set canvas height to full window height

let bikeX = canvas.width / 2 - 30; // Center bike horizontally
const bikeY = canvas.height - 140; // Position bike two rows above the control buttons
const bikeWidth = 60; // Updated bike width
const bikeHeight = 60; // Updated bike height
let obstacles = [];
let score = 0;
let distance = 0; // Distance in meters
let hearts = 3; // Number of hearts
let gameOver = false;
let startTime; // To track time
let bgOffset = 0; // For background scrolling
const bgImage = new Image();
bgImage.src = 'bg.jpg'; // Background image

function drawBackground() {
    bgOffset += 2; // Scrolling speed
    const bgAspect = bgImage.width / bgImage.height;
    const canvasAspect = canvas.width / canvas.height;

    let drawWidth, drawHeight;

    if (bgAspect > canvasAspect) {
        // Background is wider than canvas
        drawHeight = canvas.height;
        drawWidth = canvas.height * bgAspect;
    } else {
        // Background is taller than canvas
        drawWidth = canvas.width;
        drawHeight = canvas.width / bgAspect;
    }

    // Draw the background image twice for continuous scrolling
    ctx.drawImage(bgImage, 0, bgOffset % drawHeight, drawWidth, drawHeight);
    ctx.drawImage(bgImage, 0, (bgOffset % drawHeight) - drawHeight, drawWidth, drawHeight);
}

function drawBike() {
    const bikeImage = new Image();
    bikeImage.src = 'Biker.png';
    ctx.drawImage(bikeImage, bikeX, bikeY, bikeWidth, bikeHeight);
}

function createObstacle() {
    const obstacleType = Math.floor(Math.random() * 3); // Randomly choose obstacle type
    const obstacleX = Math.random() * (canvas.width - 40); // Random horizontal position
    let obstacleImage;

    switch (obstacleType) {
        case 0:
            obstacleImage = new Image();
            obstacleImage.src = 'Rock.png';
            break;
        case 1:
            obstacleImage = new Image();
            obstacleImage.src = 'Rabbit.png';
            break;
        case 2:
            obstacleImage = new Image();
            obstacleImage.src = 'Boy1.png';
            break;
    }

    obstacles.push({ x: obstacleX, y: -40, width: 40, height: 40, image: obstacleImage }); // Start off-screen
}

function drawObstacles() {
    obstacles.forEach(obstacle => {
        ctx.drawImage(obstacle.image, obstacle.x, obstacle.y, 40, 40); // Draw obstacles with images
        obstacle.y += 2; // Move obstacles from top to bottom
    });
}

function checkCollision() {
    for (let obstacle of obstacles) {
        if (obstacle.y + 40 > bikeY && 
            bikeX < obstacle.x + 40 && 
            bikeX + bikeWidth > obstacle.x) {
            hearts--; // Lose a heart
            if (hearts <= 0) {
                gameOver = true; // End game if no hearts left
            }
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
    document.getElementById('distance').innerText = `📏 Distance: ${distance} m`;
    document.getElementById('time').innerText = `⏱️ Time: ${formatTime(Math.floor((Date.now() - startTime) / 1000))}`; // Update time display
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground(); // Draw scrolling background
    if (!gameOver) {
        drawBike();
        drawObstacles();
        checkCollision();
        updateScore();
        if (Math.random() < 0.02) createObstacle(); // Randomly create obstacles
        requestAnimationFrame(gameLoop);
    } else {
        ctx.fillStyle = 'black';
        ctx.fillText('Game Over!', canvas.width / 2 - 40, canvas.height / 2);
        ctx.fillText(`Distance: ${distance} m`, canvas.width / 2 - 50, canvas.height / 2 + 20);
        document.getElementById('restart').style.display = 'block'; // Show restart button
    }
}

function moveLeft() {
    if (bikeX > 0) bikeX -= 15; // Move bike left
}

function moveRight() {
    if (bikeX < canvas.width - bikeWidth) bikeX += 15; // Move bike right
}

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
gameLoop();