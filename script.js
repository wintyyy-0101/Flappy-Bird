
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const startBtn = document.getElementById('startBtn');
const overlay = document.getElementById('overlay');
const restartBtn = document.getElementById('restartBtn');
const finalScore = document.getElementById('finalScore');

let bird = { x: 80, y: 300, r: 18, vy: 0, frame: 0 };
let gravity = 0.5;
let flap = -8;
let pipes = [];
let clouds = [];
let explosions = [];
let frame = 0;
let score = 0;
let gameOver = false;
let started = false;
let groundY = 580;
let groundOffset = 0;

function drawBackground() {
  let sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
  sky.addColorStop(0, "#6ec6ff");
  sky.addColorStop(1, "#b3e5fc");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // clouds
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  clouds.forEach(cloud => {
    ctx.beginPath();
    ctx.ellipse(cloud.x, cloud.y, cloud.size * 2, cloud.size, 0, 0, Math.PI * 2);
    ctx.fill();
  });

  // moving ground
  ctx.fillStyle = "#8d6e63";
  ctx.fillRect(0, groundY, canvas.width, 40);
  ctx.fillStyle = "#6d4c41";
  for (let i = 0; i < canvas.width / 40 + 1; i++) {
    ctx.fillRect((i * 40 + groundOffset) % canvas.width, groundY, 20, 40);
  }
}

function drawBird() {
  ctx.save();
  ctx.translate(bird.x, bird.y);
  ctx.rotate(bird.vy * 0.04);

  // body
  ctx.fillStyle = "#ffeb3b";
  ctx.shadowColor = "rgba(0,0,0,0.4)";
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.arc(0, 0, bird.r, 0, Math.PI * 2);
  ctx.fill();

  // wing animation
  let wingY = Math.sin(bird.frame / 5) * 3;
  ctx.beginPath();
  ctx.fillStyle = "#f4b400";
  ctx.ellipse(-5, wingY + 5, 8, 4, Math.PI / 6, 0, Math.PI * 2);
  ctx.fill();

  // eye
  ctx.beginPath();
  ctx.fillStyle = "#000";
  ctx.arc(7, -4, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawPipes() {
  pipes.forEach(pipe => {
    let gradient = ctx.createLinearGradient(pipe.x, 0, pipe.x + pipe.width, 0);
    gradient.addColorStop(0, "#2e7d32");
    gradient.addColorStop(1, "#388e3c");
    ctx.fillStyle = gradient;
    ctx.fillRect(pipe.x, 0, pipe.width, pipe.top);
    ctx.fillRect(pipe.x, pipe.top + pipe.gap, pipe.width, canvas.height - pipe.top - pipe.gap);
  });
}

function drawExplosion() {
  explosions.forEach((ex, index) => {
    ctx.beginPath();
    ctx.fillStyle = `rgba(255, ${200 + ex.life}, 0, ${ex.alpha})`;
    ctx.arc(ex.x, ex.y, ex.size, 0, Math.PI * 2);
    ctx.fill();
    ex.size += 2;
    ex.alpha -= 0.04;
    if (ex.alpha <= 0) explosions.splice(index, 1);
  });
}

function update() {
  if (!started) return;
  frame++;
  bird.frame++;
  bird.vy += gravity;
  bird.y += bird.vy;
  groundOffset -= 2;
  if (groundOffset <= -40) groundOffset = 0;

  // pipes
  if (frame % 90 === 0) {
    let top = Math.random() * 250 + 50;
    pipes.push({ x: canvas.width, width: 60, top: top, gap: 150 });
  }
  pipes.forEach(pipe => (pipe.x -= 3));
  if (pipes.length && pipes[0].x + pipes[0].width < 0) {
    pipes.shift();
    score++;
    scoreDisplay.textContent = score;
  }

  // clouds
  if (frame % 120 === 0)
    clouds.push({ x: canvas.width, y: Math.random() * 200 + 20, size: Math.random() * 20 + 20 });
  clouds.forEach(cloud => (cloud.x -= 1.2));
  if (clouds.length && clouds[0].x < -50) clouds.shift();

  // collisions
  pipes.forEach(pipe => {
    if (
      bird.x + bird.r > pipe.x &&
      bird.x - bird.r < pipe.x + pipe.width &&
      (bird.y - bird.r < pipe.top || bird.y + bird.r > pipe.top + pipe.gap)
    ) {
      triggerExplosion();
      endGame();
    }
  });

  if (bird.y + bird.r > groundY || bird.y - bird.r < 0) {
    triggerExplosion();
    endGame();
  }

  draw();
  if (!gameOver) requestAnimationFrame(update);
}

function draw() {
  drawBackground();
  drawPipes();
  drawBird();
  drawExplosion();
  // Draw "Made By" credit at the bottom of the canvas
ctx.save();
ctx.font = "16px Poppins, sans-serif";
ctx.fillStyle = "#fff";
ctx.shadowColor = "rgba(0,0,0,0.5)";
ctx.shadowBlur = 3;
ctx.textAlign = "center";
ctx.fillText("Made By: Bit", canvas.width / 2, canvas.height - 10);
ctx.restore();
}

function triggerExplosion() {
  for (let i = 0; i < 10; i++) {
    explosions.push({
      x: bird.x,
      y: bird.y,
      size: 10,
      alpha: 1,
      life: Math.random() * 55
    });
  }
}

function endGame() {
  gameOver = true;
  overlay.style.display = "flex";
  finalScore.textContent = score;
}

function reset() {
  bird.y = 300;
  bird.vy = 0;
  pipes = [];
  clouds = [];
  explosions = [];
  score = 0;
  scoreDisplay.textContent = "0";
  frame = 0;
  gameOver = false;
  overlay.style.display = "none";
}

function startGame() {
  reset();
  started = true;
  startBtn.style.display = "none";
  update();
}

function flapBird() {
  if (started && !gameOver) bird.vy = flap;
}

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", startGame);
window.addEventListener("keydown", e => { if (e.code === "Space") flapBird(); });
window.addEventListener("mousedown", flapBird);
