// teachable.js — laadt Teachable Machine Image model

// 1. ZET HIER DE NAMEN VAN JOUW CLASSES UIT TEACHABLE MACHINE
const MODEL_URL  = "./my_model/";  // Dit komt overeen met 'const URL' uit jouw snippet
const JUMP_CLASS = "Springen";    // Vervang dit door de className uit jouw model
const WAVE_CLASS = "Zwaaien";     // Vervang dit door de className voor de start-actie

// Hoe zeker moet de computer zijn? (0.8 = 80%)
const THRESHOLD  = 0.8;

let tmModel   = null;
let tmReady   = false;
let tmLoading = false;
let lastActionTime = 0; // Houdt bij wanneer de laatste menu-actie was

async function initTM() {
  if (tmReady || tmLoading) return;
  tmLoading = true;
  try {
    const modelPath = MODEL_URL + "model.json";
    const metadataPath = MODEL_URL + "metadata.json";
    
    // Dit is gelijk aan tmImage.load(modelURL, metadataURL) uit jouw snippet
    tmModel = await tmImage.load(modelPath, metadataPath);
    
    // Handig voor debugging: zie welke klasses er in je model zitten
    console.log("Beschikbare klasses in model:", tmModel.getClassLabels());
    console.log("TM Model succesvol geladen!");

    tmReady   = true;
    tmLoading = false;

    requestAnimationFrame(tmLoop);
  } catch (e) {
    tmLoading = false;
    console.error("TM model niet geladen. Controleer of de map 'my_model' bestaat met de juiste bestanden.", e);
    document.getElementById("s1-pred").textContent = "❌ Model niet gevonden in /my_model/";
  }
}

async function tmLoop() {
  // Controleer welke schermen actief zijn voor navigatie
  const s1Active = document.getElementById("screen-1").classList.contains("active");
  const s2Active = document.getElementById("screen-2").classList.contains("active");
  const s4Active = document.getElementById("screen-4").classList.contains("active");

  if (!running && !s1Active && !s2Active && !s4Active) {
    requestAnimationFrame(tmLoop);
    return;
  }

  if (!camVideo || camVideo.readyState < 2) {
    requestAnimationFrame(tmLoop);
    return;
  }

  // In jouw snippet staat 'model.predict(webcam.canvas)'.
  // Wij gebruiken hier 'camVideo' omdat we die stream al hebben in camera.js.
  const predictions = await tmModel.predict(camVideo);
  const best = predictions.reduce((a, b) => a.probability > b.probability ? a : b);

  // Debug: haal de volgende regel uit commentaar om alle klasses in je console te zien
  // console.log("Gezien:", best.className, best.probability.toFixed(2));

  const label = best.className + "  " + (best.probability * 100).toFixed(0) + "%";

  document.getElementById("s1-pred").textContent = label;
  document.getElementById("s3-pred").textContent = label;

  // Teken de camera op het canvas van scherm 3 (zonder skelet)
  const canvas = document.getElementById("s3-canvas");
  if (canvas && document.getElementById("screen-3").classList.contains("active")) {
    const ctx = canvas.getContext("2d");
    if (camVideo && camVideo.readyState >= 2) {
      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(camVideo, -canvas.width, 0, canvas.width, canvas.height);
      ctx.restore();
    }
  }

  // Gebaar detectie voor navigatie en gameplay
  const now = Date.now();
  if (best.probability > THRESHOLD) {
    if (running) {
      // Tijdens het spel: Springen (geen cooldown nodig)
      if (best.className === JUMP_CLASS) jump();
    } else if (now - lastActionTime > 1500) {
      // In de menu's: Navigeren met een cooldown van 1.5 seconden
      if (best.className === WAVE_CLASS) {
        if (s1Active) {
          goToInstructions();
          lastActionTime = now;
        } else if (s2Active) {
          startGame();
          lastActionTime = now;
        } else if (s4Active) {
          restartGame();
          lastActionTime = now;
        }
      }
    }
  }

  requestAnimationFrame(tmLoop);
}
