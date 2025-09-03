const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// 캔버스 크기 줄임
canvas.width = 300;
canvas.height = 450;

let fruits = [];
let gameOver = false;
let animationId = null;

class Fruit {
  constructor(x, stage) {
    this.x = x;
    this.y = 50;
    this.stage = stage; // 단계 (1~8)
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
    if (!gameOver) {
      this.dy += 0.3; // 중력
      this.y += this.dy;

      // 바닥 충돌
      if (this.y + this.radius > canvas.height) {
        this.y = canvas.height - this.radius;
        this.dy = 0;
      }

      // 다른 과일과 충돌
      for (let other of fruits) {
        if (other !== this) {
          let dx = this.x - other.x;
          let dy = this.y - other.y;
          let dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < this.radius + other.radius) {
            // 살짝 겹쳤을 때, 겹침 해소 (위로 강제 튀는거 방지)
            let overlap = (this.radius + other.radius) - dist;
            let angle = Math.atan2(dy, dx);

            this.x += Math.cos(angle) * (overlap / 2);
            this.y += Math.sin(angle) * (overlap / 2);
            this.dy *= 0.3; // 충돌 후 속도 줄이기

            // 같은 단계면 합체
            if (this.stage === other.stage && this.stage < 8) {
              other.stage++;
              other.radius = 12 + other.stage * 5;
              fruits.splice(fruits.indexOf(this), 1);
            }
          }
        }
      }
    }

    this.draw();
  }
}

// 클릭 시 과일 생성
canvas.addEventListener("click", (e) => {
  if (gameOver) return;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const stage = Math.floor(Math.random() * 3) + 1; // 1~3단계 랜덤
  fruits.push(new Fruit(x, stage));
});

// 게임 루프
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let fruit of fruits) {
    fruit.update();
  }

  // 게임오버 조건 (천장 닿음)
  if (fruits.some(f => f.y - f.radius <= 0)) {
    gameOver = true;
    cancelAnimationFrame(animationId);

    // 점수 계산 (과일 단계 합)
    let score = fruits.reduce((sum, f) => sum + f.stage, 0);
    document.getElementById("finalScore").textContent = score;
    document.getElementById("gameoverModal").style.display = "flex";
    return;
  }

  animationId = requestAnimationFrame(animate);
}

// 다시하기 버튼
document.getElementById("saveScore").addEventListener("click", () => {
  document.getElementById("gameoverModal").style.display = "none";
  fruits = [];
  gameOver = false;
  animate();
});

// 첫 실행
animate();
