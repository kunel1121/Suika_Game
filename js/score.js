import { saveScoreToDB, subscribeTopScores } from "./firebase.js";
import { showGameOverModal, hideGameOverModal } from "./ui.js";

let lastScore = 0;

export function gameOverSequence(score) {
  lastScore = score;
  showGameOverModal(score);
}

export function setupScoreUI() {
  setupModalSave();
  subscribeTopScores(updateRanking);
}

function updateRanking(list) {
  const ol = document.getElementById('rankingList');
  ol.innerHTML = '';
  list.forEach(item=>{
    const li = document.createElement('li');
    const name = item.name || '익명';
    li.textContent = `${name} - ${item.score}`;
    ol.appendChild(li);
  });
}

function setupModalSave() {
  const saveBtn = document.getElementById('saveScore');
  saveBtn.onclick = async ()=>{
    const nameInput = document.getElementById('playerName');
    const name = (nameInput.value || '익명').slice(0,20);
    try{
      await saveScoreToDB(name, lastScore);
    }catch(e){
      console.error(e);
    }
    hideGameOverModal();
  };
}

export function attachModalHandlers(restartCallback) {
  document.getElementById('restartBtn').addEventListener('click',()=>{
    hideGameOverModal();
    restartCallback();
  });
}
