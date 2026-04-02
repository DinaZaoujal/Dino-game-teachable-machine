// teachable.js — laadt Teachable Machine model en detecteert poses

const MODEL_URL  = "./my_model/";
const JUMP_CLASS = "hand_up";   // verander naar jouw klasse naam
const THRESHOLD  = 0.8;

let tmModel   = null;
let tmWebcam  = null;
let tmReady   = false;
let tmLoading = false;

async function initTM() {
  if (tmReady || tmLoading) return;
  tmLoading = true;

  try {
    tmModel = await tmPose.load(MODEL_URL + "model.json", MODEL_URL + "metadata.json");

    tmWebcam = new tmPose.Webcam(240, 240, true);
    await tmWebcam.setup();
    await tmWebcam.play();

    tmReady   = true;
    tmLoading = false;

    requestAnimationFrame(tmLoop);
  } catch (e) {
    tmLoading = false;
    console.warn("TM model niet geladen:", e);
    // spel werkt nog via spatiebalk
  }
}

async function tmLoop() {
  if (!tmReady || !tmModel) {
    requestAnimationFrame(tmLoop);
    return;
  }

  tmWebcam.update();

  const { pose, posenetOutput } = await tmModel.estimatePose(tmWebcam.canvas);
  const predictions = await tmModel.predict(posenetOutput);

  // beste voorspelling
  const best  = predictions.reduce((a, b) => a.probability > b.probability ? a : b);
  const label = best.className + "  " + (best.probability * 100).toFixed(0) + "%";

  document.getElementById("s1-pred").textContent = label;
  document.getElementById("s3-pred").textContent = label;

  // teken skeleton op scherm 3 canvas bovenop de camera
  const canvas = document.getElementById("s3-canvas");
  if (canvas && document.getElementById("screen-3").classList.contains("active")) {
    const ctx = canvas.getContext("2d");
    // camera opnieuw tekenen als basis
    if (camVideo && camVideo.readyState >= 2) {
      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(camVideo, -canvas.width, 0, canvas.width, canvas.height);
      ctx.restore();
    }
    // pose skeleton
    if (pose) {
      tmPose.drawKeypoints(pose.keypoints, 0.5, ctx);
      tmPose.drawSkeleton(pose.keypoints, 0.5, ctx);
    }
  }

  // spring detectie — roept jump() aan uit game.js
  if (typeof running !== "undefined" && running) {
    if (best.className === JUMP_CLASS && best.probability > THRESHOLD) {
      jump();
    }
  }

  requestAnimationFrame(tmLoop);
}
