// ground.js — beweegt de ground als een tegel

const GROUND_H = 80; // hoogte in px

let groundImg    = new Image();
let groundOffset = 0;

groundImg.src = "assets/Ground.svg";

function drawGround(canvasId, offset) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  canvas.width  = window.innerWidth;
  canvas.height = GROUND_H;

  const ctx = canvas.getContext("2d");

  if (!groundImg.complete || groundImg.naturalWidth === 0) return;

  const iw = groundImg.naturalWidth;
  const x  = -(offset % iw);

  for (let i = x; i < canvas.width + iw; i += iw) {
    ctx.drawImage(groundImg, i, 0, iw, GROUND_H);
  }
}

function updateGround(speed) {
  groundOffset += speed;
  drawGround("ground-canvas-s3", groundOffset);
}

function resetGround() {
  groundOffset = 0;
}

// teken statisch op scherm 1 en 4
groundImg.onload = () => {
  drawGround("ground-canvas-s1", 0);
  drawGround("ground-canvas-s4", 0);
};
