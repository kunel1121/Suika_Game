export function showGameOverModal(score) {
  document.getElementById('finalScore').textContent = score;
  document.getElementById('gameoverModal').style.display = 'flex';
}
export function hideGameOverModal() {
  document.getElementById('gameoverModal').style.display = 'none';
}
export function setLiveScoreText(v) {
  document.getElementById('liveScore').textContent = `점수: ${v}`;
}
export function setupStageButtons(onChange) {
  const buttons = document.querySelectorAll('.stage-btn');
  buttons.forEach(b=>{
    b.addEventListener('click',()=>{
      buttons.forEach(x=>x.classList.remove('active'));
      b.classList.add('active');
      const s = parseInt(b.dataset.stage,10);
      onChange(s);
    });
  });
}
export function setupReset(onReset) {
  const btn = document.getElementById('resetBtn');
  btn.addEventListener('click',onReset);
}
export function setupModalHandlers(onSave, onRestart) {
  document.getElementById('saveScore').addEventListener('click',onSave);
  document.getElementById('restartBtn').addEventListener('click',onRestart);
}
