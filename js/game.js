const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// 캔버스 크기
canvas.width = 300;
canvas.height = 450;

let fruits = [];
let gameOver = false;
let animationId = null;

class Fruit {
  constructor(x, stage) {
    this.x = x;
    this.y = 50;
    this.stage = stage; // 단계 1~8
    this.radius = 12 + stage * 5; // 단계별 크기
    this.dy = 0; // 낙하 속도
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = [
      "#ff4d4d", "#ff9933", "#ffff66", "#66cc66", 
      "#3399ff", "#9966ff", "#ff66cc", "#00cccc"
    ][this.stage - 1];
    ctx.fill();
    ctx.closePath();
  }

  update() {
    if (gameOver) return;

    let onSurface = false;

    // 바닥 충돌
    if (this.y + this.radius >= canvas.height) {
      this.y = canvas.height - this.radius;
      this.dy = 0;
      onSurface = true;
    }

    // 다른 과일과 충돌
    for (let other of fruits) {
      if (other !== this) {
        let dx = this.x - other.x;
        let dy = this.y - other.y;
        let dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.radius + other.radius) {
          // 같은 단계 과일이면 합체
          if (this.stage === other.stage && this.stage < 8) {
            other.stage++;
            other.radius = 12 + other.stage * 5;
            fruits.splice(fruits.indexOf(this), 1);
            return; // 합체 후 종료
          } else {
            // 다른 단계 과일이면 튀지 않고 멈춤
            this.dy = 0;
            onSurface = true;
          }
        }
      }
    }

    // 중력 적용
    if (!onSurface) {
      this.dy += 0.3;
      this.y += this.dy;
    }

    this.draw();
  }
}

// 클릭 시 과일 생성 (1~3 단계 랜덤)
canvas.addEventListener("click", (e) => {
  if (gameOver) return;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const stage = Math.floor(Math.random() * 3) + 1;
  fruits.push(new Fruit(x, stage));
});

// 게임 루프
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let fruit of fruits) {
    fruit.update();
  }

  // 게임오버 조건: 천장 닿음
  if (fruits.some(f => f.y - f.radius <= 0)) {
    gameOver = true;
    cancelAnimationFrame(animationId);

    // 점수 계산: 모든 과일 단계 합
    let score = fruits.reduce((sum, f) => sum + f.stage, 0);
    document.getElementById("finalScore").textContent = score;
    document.getElementById("gameoverModal").style.display = "flex";
    return;
  }

  animationId = requestAnimationFrame(animate);
}

// 다시하기 버튼
document.getElementById("restartBtn").addEventListener("click", () => {
  document.getElementById("gameoverModal").style.display = "none";
  fruits = [];
  gameOver = false;
  animate();
});

// 점수 저장 버튼 (firebase.js와 연동 가능)
document.getElementById("saveScore").addEventListener("click", () => {
  const name = document.getElementById("playerName").value.trim();
  if (!name) return alert("이름을 입력하세요!");
  console.log("점수 저장:", name, document.getElementById("finalScore").textContent);
  document.getElementById("gameoverModal").style.display = "none";
  fruits = [];
  gameOver = false;
  animate();
});

// 첫 실행
animate();
