export function showGameOverModal(score) {
  document.getElementById("finalScore").textContent = score;
  document.getElementById("gameoverModal").style.display = "flex";
}

export function hideGameOverModal() {
  document.getElementById("gameoverModal").style.display = "none";
}
