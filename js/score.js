import { saveScore, loadScores } from "./firebase.js";
import { showGameOverModal } from "./ui.js";

export function gameOverHandler(score) {
  showGameOverModal(score);

  document.getElementById("saveScore").onclick = () => {
    const name = document.getElementById("playerName").value || "익명";
    saveScore(name, score);
    document.getElementById("gameoverModal").style.display = "none";
  };
}

// 실시간 순위 업데이트
const rankingList = document.getElementById("rankingList");
loadScores(scores => {
  rankingList.innerHTML = "";
  scores.forEach(s => {
    const li = document.createElement("li");
    li.textContent = `${s.name} - ${s.score}`;
    rankingList.appendChild(li);
  });
});
