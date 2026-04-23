// teachable.js

const MODEL_URL = "./my_model/";

let model, webcam, maxPredictions;
let tmReady  = false;
let tmLoading = false;

async function initTM() {
  if (tmReady || tmLoading) return;
  tmLoading = true;

  try {
    const modelURL    = MODEL_URL + "model.json";
    const metadataURL = MODEL_URL + "metadata.json";

    model          = await tmPose.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    const size = 200;
    webcam = new tmPose.Webcam(size, size, true);
    await webcam.setup();
    await webcam.play();

    tmReady = true;
    requestAnimationFrame(tmLoop);
  } catch (err) {
    console.error("TM init mislukt:", err);
    const el = document.getElementById('s1-pred');
    if (el) el.textContent = "❌ model niet gevonden";
  }

  tmLoading = false;
}

async function tmLoop() {
  if (!tmReady) return;
  webcam.update();
  await tmPredict();
  requestAnimationFrame(tmLoop);
}

function getActiveWebcamCanvas() {
  const active = document.querySelector('.screen.active');
  if (!active) return null;
  const map = {
    'screen-1': 's1-canvas',
    'screen-3': 's3-canvas',
    'screen-4': 's4-canvas',
  };
  const id = map[active.id];
  return id ? document.getElementById(id) : null;
}

async function tmPredict() {
  const { pose, posenetOutput } = await model.estimatePose(webcam.canvas);
  const prediction = await model.predict(posenetOutput);

  // Teken gespiegelde webcam + skelet op het actieve canvas
  const canvas = getActiveWebcamCanvas();
  if (canvas) {
    const w = webcam.canvas.width;
    const h = webcam.canvas.height;
    if (canvas.width !== w)  canvas.width  = w;
    if (canvas.height !== h) canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(webcam.canvas, -w, 0, w, h);
    ctx.restore();
    if (pose) {
      tmPose.drawKeypoints(pose.keypoints, 0.5, ctx);
      tmPose.drawSkeleton(pose.keypoints, 0.5, ctx);
    }
  }

  // Beste voorspelling bepalen
  let best = { className: '', probability: 0 };
  for (let i = 0; i < maxPredictions; i++) {
    if (prediction[i].probability > best.probability) best = prediction[i];
  }

  const predText = best.className
    ? `${best.className}: ${(best.probability * 100).toFixed(0)}%`
    : '';

  // Voorspellingstekst tonen op actief scherm
  const active = document.querySelector('.screen.active');
  if (active?.id === 'screen-1') {
    const el = document.getElementById('s1-pred');
    if (el) el.textContent = predText;
  } else if (active?.id === 'screen-3') {
    const el = document.getElementById('s3-pred');
    if (el) el.textContent = predText;
  }

  // ── Pose acties ──
  if (best.probability > 0.8) {
    // Class 4 (wave) → start knop automatisch op scherm 1
    if (active?.id === 'screen-1' && best.className === 'Class 4') {
      goToInstructions();
    }

    // Class 5 (2 handen omhoog) → springen tijdens het spel
    if (running && best.className === 'Class 5') {
      jump();
    }
  }
}
