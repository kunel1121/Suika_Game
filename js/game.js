import { setupStageButtons, setupReset, setLiveScoreText, setupModalHandlers } from "./ui.js";
import { gameOverSequence, setupScoreUI, attachModalHandlers } from "./score.js";

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const W = canvas.width;
const H = canvas.height;

let fruits = [];
let spawnStage = 1;
let running = true;

const gravity = 0.45;
const damping = 0.98;
const mergeDistanceBias = 6;

setupStageButtons(s=>spawnStage=s);
setupReset(()=>resetGame());
setupModalHandlers(()=>{}, ()=>{});
setupScoreUI();
attachModalHandlers(()=>{ resetGame(); startLoop(); });

canvas.addEventListener('click', e=>{
  if(!running) return;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  spawnFruit(x, 30, spawnStage);
});

document.addEventListener('keydown', e=>{
  if(e.key === 'r') resetGame();
});

function resetGame(){
  fruits = [];
  running = true;
  setLiveScoreText(0);
}

function spawnFruit(x, y, stage){
  const r = stageToRadius(stage);
  if(isSpawnBlocked(x, r)) {
    endGame();
    return;
  }
  const f = {
    id: cryptoRandomId(),
    x, y, vx:0, vy:0, r,
    stage, merged:false
  };
  fruits.push(f);
}

function isSpawnBlocked(x, r){
  for(const f of fruits){
    const dx = f.x - x;
    const dy = f.y - r - f.r;
    const dist = Math.hypot(dx, dy);
    if(dist < f.r + r - 2) return true;
  }
  if(r*2 > H) return true;
  return false;
}

function stageToRadius(stage){
  return 10 + stage * 8;
}

function cryptoRandomId(){
  return Math.random().toString(36).slice(2,9);
}

function simulate(dt){
  for(const f of fruits){
    f.vy += gravity;
    f.vx *= 0.999;
    f.vy *= 0.999;
    f.x += f.vx * dt;
    f.y += f.vy * dt;
    if(f.x - f.r < 0){
      f.x = f.r;
      f.vx = -f.vx * 0.6;
    } else if(f.x + f.r > W){
      f.x = W - f.r;
      f.vx = -f.vx * 0.6;
    }
    if(f.y + f.r > H){
      f.y = H - f.r;
      f.vy = -f.vy * 0.4;
      f.vx *= 0.95;
      if(Math.abs(f.vy) < 0.6) f.vy = 0;
    }
  }

  for(let i=0;i<fruits.length;i++){
    for(let j=i+1;j<fruits.length;j++){
      const a = fruits[i], b = fruits[j];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.hypot(dx, dy);
      const minDist = a.r + b.r;
      if(dist === 0) continue;
      if(dist < minDist){
        const overlap = (minDist - dist);
        const nx = dx / dist, ny = dy / dist;
        const totalMass = a.r + b.r;
        const shiftA = overlap * (b.r / totalMass);
        const shiftB = overlap * (a.r / totalMass);
        a.x -= nx * shiftA;
        a.y -= ny * shiftA;
        b.x += nx * shiftB;
        b.y += ny * shiftB;
        const relvx = b.vx - a.vx;
        const relvy = b.vy - a.vy;
        const vn = relvx * nx + relvy * ny;
        if(vn < 0){
          const impulse = (-(1.6) * vn) / (1/a.r + 1/b.r);
          a.vx -= (impulse * nx) / a.r;
          a.vy -= (impulse * ny) / a.r;
          b.vx += (impulse * nx) / b.r;
          b.vy += (impulse * ny) / b.r;
        }
        tryMerge(a,b);
      }
    }
  }

  for(const f of fruits){
    f.vx *= damping;
    f.vy *= damping;
  }
}

function tryMerge(a,b){
  if(a.merged || b.merged) return;
  if(a.stage !== b.stage) return;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dist = Math.hypot(dx, dy);
  if(dist < Math.max(4, (a.r + b.r)/2) - mergeDistanceBias/2){
    if(a.stage >= 8) return;
    a.merged = true;
    b.merged = true;
    const nx = (a.x * a.r + b.x * b.r) / (a.r + b.r);
    const ny = (a.y * a.r + b.y * b.r) / (a.r + b.r);
    const nvx = (a.vx + b.vx) / 2;
    const nvy = (a.vy + b.vy) / 2;
    const newStage = Math.min(8, a.stage + 1);
    const newR = stageToRadius(newStage);
    const merged = {
      id: cryptoRandomId(),
      x: nx,
      y: ny,
      vx: nvx,
      vy: nvy - 1.5,
      r: newR,
      stage: newStage,
      merged: false
    };
    fruits.push(merged);
    a.toRemove = true;
    b.toRemove = true;
  }
}

function cleanupRemoved(){
  fruits = fruits.filter(f=>!f.toRemove);
}

function draw(){
  ctx.clearRect(0,0,W,H);
  for(const f of fruits){
    drawFruit(f);
  }
}

function drawFruit(f){
  ctx.save();
  const grd = ctx.createRadialGradient(f.x - f.r*0.3, f.y - f.r*0.3, f.r*0.1, f.x, f.y, f.r);
  const palette = paletteForStage(f.stage);
  grd.addColorStop(0, palette[0]);
  grd.addColorStop(1, palette[1]);
  ctx.fillStyle = grd;
  ctx.beginPath();
  ctx.arc(f.x, f.y, f.r, 0, Math.PI*2);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.25)";
  ctx.beginPath();
  ctx.arc(f.x - f.r*0.3, f.y - f.r*0.45, f.r*0.28, 0, Math.PI*2);
  ctx.fill();
  ctx.fillStyle = "#333";
  ctx.font = `${Math.max(10, f.r/1.4)}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(f.stage, f.x, f.y);
  ctx.restore();
}

function paletteForStage(s){
  switch(s){
    case 1: return ['#fff',' #ff8fb8'];
    case 2: return ['#ffd1d1','#ff9a9a'];
    case 3: return ['#ffe0a3','#ffb84d'];
    case 4: return ['#ffdca8','#ffb86b'];
    case 5: return ['#e6ffd9','#97e56b'];
    case 6: return ['#d1ffd9','#7fe36b'];
    case 7: return ['#dff7ff','#6bd0ff'];
    case 8: return ['#c5ffd9','#2ecc71'];
    default: return ['#eee','#ccc'];
  }
}

let lastTime = performance.now();
let acc = 0;
const step = 1/60;

function loop(now){
  const delta = (now - lastTime)/1000;
  lastTime = now;
  if(!running) return;
  acc += delta;
  while(acc > step){
    simulate(1);
    acc -= step;
  }
  cleanupRemoved();
  draw();
  setLiveScoreText(calculateLiveScore());
  if(checkGameOverCondition()){
    endGame();
    return;
  }
  requestAnimationFrame(loop);
}

function startLoop(){
  lastTime = performance.now();
  acc = 0;
  requestAnimationFrame(loop);
}

function calculateLiveScore(){
  let s = 0;
  for(const f of fruits) s += (f.stage || 0);
  return s;
}

function checkGameOverCondition(){
  const topY = 40;
  for(const f of fruits){
    if(f.y - f.r < topY) return true;
  }
  return false;
}

function endGame(){
  running = false;
  const finalScore = calculateLiveScore();
  gameOverSequence(finalScore);
}

startLoop();
