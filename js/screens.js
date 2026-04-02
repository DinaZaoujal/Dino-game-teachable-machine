// screens.js — beheert schermwissels

function showScreen(n) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + n).classList.add('active');
}

function goToInstructions() {
  showScreen(2);
}
