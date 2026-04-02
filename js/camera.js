// camera.js — beheert de camera stream en tekent die op alle schermen

let rawStream = null;
let camVideo  = null;

async function startCamera() {
  try {
    rawStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });

    camVideo = document.createElement("video");
    camVideo.srcObject   = rawStream;
    camVideo.autoplay    = true;
    camVideo.muted       = true;
    camVideo.playsInline = true;
    await camVideo.play();

    requestAnimationFrame(cameraDrawLoop);
  } catch (e) {
    console.warn("Camera geblokkeerd:", e);
    document.getElementById("s1-pred").textContent = "❌ camera geblokkeerd";
  }
}

function cameraDrawLoop() {
  if (camVideo && camVideo.readyState >= 2) {
    drawCameraToCanvas("s1-canvas", 380, 260);
    drawCameraToCanvas("s3-canvas", 240, 240);
    drawCameraToCanvas("s4-canvas", 240, 240);
  }
  requestAnimationFrame(cameraDrawLoop);
}

function drawCameraToCanvas(id, w, h) {
  const canvas = document.getElementById(id);
  if (!canvas) return;
  if (canvas.width !== w) {
    canvas.width  = w;
    canvas.height = h;
  }
  const ctx = canvas.getContext("2d");
  // gespiegeld tekenen (selfie effect)
  ctx.save();
  ctx.scale(-1, 1);
  ctx.drawImage(camVideo, -w, 0, w, h);
  ctx.restore();
}
