// main.js — start alles op bij het laden van de pagina

window.addEventListener("load", async () => {

  // knop verbindingen
  document.getElementById("s1-start-btn").addEventListener("click", goToInstructions);
  document.getElementById("play-btn").addEventListener("click", startGame);
  document.getElementById("retry-btn").addEventListener("click", restartGame);

  // ground tekenen op start scherm
  if (groundImg.complete && groundImg.naturalWidth > 0) {
    drawGround("ground-canvas-s1", 0);
  }

  // camera starten — vraagt toestemming aan de browser
  await startCamera();

  // Teachable Machine model laden
  await initTM();

});
