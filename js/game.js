// game.js

const GRAVITY    = 0.5;
const JUMP_FORCE = -20;

let dinoY        = 0;
let velY         = 0;
let jumping      = false;
let cactusX      = 0;
let cactus2X     = 0;
let cactus2Active = false;
let speed        = 3;
let score        = 0;
let running      = false;
let loopId       = null;
let cactusScored  = false;
let cactus2Scored = false;

async function startGame() {
  score         = 0;
  speed         = 3;
  dinoY         = 0;
  velY          = 0;
  jumping       = false;
  running       = true;
  cactusScored  = false;
  cactus2Scored = false;
  cactus2Active = false;
  cactusX       = window.innerWidth + 200;
  cactus2X      = window.innerWidth + 999;

  resetGround();
  document.getElementById('score-val').textContent = '0';

  const dinoEl    = document.getElementById('dino');
  const cactusEl  = document.getElementById('cactus');
  const cactus2El = document.getElementById('cactus2');

  dinoEl.style.bottom    = GROUND_H + 'px';
  cactusEl.style.bottom  = GROUND_H + 'px';
  cactusEl.style.left    = cactusX + 'px';
  cactus2El.style.bottom = GROUND_H + 'px';
  cactus2El.style.left   = '-200px';
  cactus2El.style.display = 'none';

  showScreen(3);

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
  const el = document.getElementById('dino');
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
  el.style.bottom = (GROUND_H + dinoY) + 'px';
}

function moveCactus() {
  const el      = document.getElementById('cactus');
  const el2     = document.getElementById('cactus2');
  const dinoEl  = document.getElementById('dino');
  if (!el || !el2 || !dinoEl) return;

  // -- cactus 1 --
  cactusX -= speed;

  if (!cactusScored && cactusX < dinoEl.offsetLeft) {
    score++;
    cactusScored = true;
    speed += 0.15;
    document.getElementById('score-val').textContent = score;

    // vanaf score 4: activeer dubbele cactus op volgende spawn
    if (score >= 4) {
      cactus2Active = true;
    }
  }

  if (cactusX < -120) {
    cactusX      = window.innerWidth + Math.random() * 600 + 400;
    cactusScored = false;

    // zet cactus2 vlak achter cactus1 als double-mode aan
    if (cactus2Active) {
      cactus2X = cactusX + 60; // 60px achter de eerste
      el2.style.display = 'block';
      cactus2Scored = false;
    }
  }

  el.style.left   = cactusX + 'px';
  el.style.bottom = GROUND_H + 'px';

  // -- cactus 2 --
  if (cactus2Active && el2.style.display !== 'none') {
    cactus2X -= speed;

    if (!cactus2Scored && cactus2X < dinoEl.offsetLeft) {
      cactus2Scored = true;
      // geen extra score punt, die zit al bij cactus 1
    }

    if (cactus2X < -120) {
      el2.style.display = 'none';
      cactus2X = window.innerWidth + 999;
    }

    el2.style.left   = cactus2X + 'px';
    el2.style.bottom = GROUND_H + 'px';
  }
}

function checkCollision() {
  const d  = document.getElementById('dino').getBoundingClientRect();
  const c  = document.getElementById('cactus').getBoundingClientRect();
  const c2 = document.getElementById('cactus2').getBoundingClientRect();
  const m  = 10;

  const hitC1 =
    d.right  - m > c.left  + m &&
    d.left   + m < c.right - m &&
    d.bottom - m > c.top   + m;

  const hitC2 = cactus2Active &&
    document.getElementById('cactus2').style.display !== 'none' &&
    d.right  - m > c2.left  + m &&
    d.left   + m < c2.right - m &&
    d.bottom - m > c2.top   + m;

  if (hitC1 || hitC2) {
    triggerGameOver();
  }
}

function triggerGameOver() {
  running = false;
  cancelAnimationFrame(loopId);
  document.getElementById('final-score').textContent = score;
  showScreen(4);
  drawGround('ground-canvas-s4', 0);
}

function restartGame() {
  startGame();
}

document.addEventListener('keydown', e => {
  if (e.code === 'Space' && running) jump();
});