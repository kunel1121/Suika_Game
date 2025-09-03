import { gameOverHandler } from "./score.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let score = 0;
let gameOver = false;

function drawGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "black";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score, 10, 30);

  if (!gameOver) {
    score++;
    requestAnimationFrame(drawGame);
  } else {
    gameOverHandler(score);
  }
}

// 테스트용: 5초 후 게임오버
setTimeout(() => { gameOver = true; }, 5000);

drawGame();
