// game.js — game logica: dino, cactus, collision, score

const GRAVITY    = 0.8;
const JUMP_FORCE = -17;

let dinoY   = 0;
let jumping = false;
let velY    = 0;
let cactusX = window.innerWidth + 200;
let speed   = 5;
let score   = 0;
let running = false;
let loopId;

async function startGame() {
  // reset
  score    = 0;
  speed    = 5;
  dinoY    = 0;
  velY     = 0;
  jumping  = false;
  running  = true;
  cactusX  = window.innerWidth + 200;

  resetGround();
  document.getElementById("score-val").textContent = "0";

  // startpositie elementen
  const dinoEl   = document.getElementById("dino");
  const cactusEl = document.getElementById("cactus");
  dinoEl.style.bottom   = GROUND_H + "px";
  cactusEl.style.bottom = GROUND_H + "px";
  cactusEl.style.left   = cactusX + "px";

  showScreen(3);

  // laad TM als nog niet gedaan
  if (!tmReady) await initTM();

  if (loopId) cancelAnimationFrame(loopId);
  gameLoop();
}

function gameLoop() {
  if (!running) return;
  moveDino();
  moveCactus();
  updateGround(speed);
  checkCollision();
  loopId = requestAnimationFrame(gameLoop);
}

function jump() {
  if (!jumping) {
    jumping = true;
    velY    = JUMP_FORCE;
  }
}

function moveDino() {
  const el = document.getElementById("dino");
  if (!el) return;

  if (jumping) {
    velY  += GRAVITY;
    dinoY -= velY;
    if (dinoY <= 0) {
      dinoY   = 0;
      jumping = false;
      velY    = 0;
    }
  }

  el.style.bottom = (GROUND_H + dinoY) + "px";
}

function moveCactus() {
  const el = document.getElementById("cactus");
  if (!el) return;

  cactusX -= speed;

  if (cactusX < -130) {
    cactusX = window.innerWidth + Math.random() * 400 + 200;
    score++;
    speed += 0.3;
    document.getElementById("score-val").textContent = score;
  }

  el.style.left   = cactusX + "px";
  el.style.bottom = GROUND_H + "px";
}

function checkCollision() {
  const d = document.getElementById("dino").getBoundingClientRect();
  const c = document.getElementById("cactus").getBoundingClientRect();
  const m = 32;

  if (
    d.right  - m > c.left  + m &&
    d.left   + m < c.right - m &&
    d.bottom - m > c.top   + m
  ) {
    triggerGameOver();
  }
}

function triggerGameOver() {
  running = false;
  cancelAnimationFrame(loopId);
  document.getElementById("final-score").textContent = score;
  showScreen(4);
  drawGround("ground-canvas-s4", 0);
}

function restartGame() {
  startGame();
}

// spatiebalk backup
document.addEventListener("keydown", e => {
  if (e.code === "Space" && running) jump();
});
