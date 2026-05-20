const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let lastTime = performance.now();

// WebAudio helper
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playTone(freq, duration = 0.08, type = 'sine', gain = 0.08){
  try{
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.value = gain;
    o.connect(g); g.connect(audioCtx.destination);
    o.start();
    const now = audioCtx.currentTime;
    g.gain.setValueAtTime(gain, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + duration);
    o.stop(now + duration + 0.02);
  }catch(e){ /* ignore audio errors */ }
}
function playSound(name){
  if(!audioCtx) return;
  if(audioCtx.state === 'suspended') audioCtx.resume();
  switch(name){
    case 'place': playTone(880, 0.06, 'square', 0.06); break;
    case 'shoot': playTone(1200, 0.03, 'sawtooth', 0.04); break;
    case 'explode': playTone(220, 0.16, 'sawtooth', 0.12); break;
    case 'gameover': playTone(120, 0.6, 'sine', 0.12); break;
    default: playTone(440, 0.04, 'sine', 0.03);
  }
}

const state = {
  money: 200,
  lives: 10,
  wave: 1,
  towers: [],
  enemies: [],
  bullets: [],
  spawnTimer: 0,
  spawnedThisWave: 0,
  waveSize: 0,
  waveCooldown: 0,
  selectedTower: null,
  gameOver: false
};

// Simple straight path (left -> right)
const path = [{x:50,y:300},{x:750,y:300}];

class Enemy {
  constructor(hpMult=1){
    this.x = path[0].x;
    this.y = path[0].y;
    this.speed = 60 + Math.random()*10; // px/s
    this.hp = Math.round(100 * hpMult);
    this.waypoint = 1;
    this.dead = false;
  }
  update(dt){
    const t = path[this.waypoint];
    const dx = t.x - this.x; const dy = t.y - this.y;
    const dist = Math.hypot(dx,dy);
    if(dist < 2){
      if(this.waypoint < path.length-1) this.waypoint++;
      else { this.dead = true; state.lives--; if(state.lives <= 0) state.gameOver = true; }
    } else {
      this.x += (dx/dist) * this.speed * dt;
      this.y += (dy/dist) * this.speed * dt;
    }
  }
  draw(ctx){
    ctx.fillStyle = 'red';
    ctx.beginPath(); ctx.arc(this.x,this.y,12,0,Math.PI*2); ctx.fill();
    // HP
    ctx.fillStyle = 'black'; ctx.fillRect(this.x-12, this.y-18, 24,4);
    ctx.fillStyle = 'lime'; ctx.fillRect(this.x-12, this.y-18, 24 * Math.max(0,this.hp)/100,4);
  }
}

class Tower {
  constructor(x,y){
    this.x = x; this.y = y;
    this.range = 120;
    this.fireRate = 0.8;
    this.cooldown = 0;
    this.level = 1;
    this.damage = 50;
  }
  upgrade(){
    this.level += 1;
    this.range += 20;
    this.damage = Math.round(this.damage * 1.4);
    this.fireRate = Math.max(0.25, this.fireRate * 0.85);
  }
  getUpgradeCost(){ return 75 * this.level; }
  getSellValue(){ return Math.round(25 * this.level); }
  update(dt){
    this.cooldown -= dt;
    if(this.cooldown <= 0){
      // find nearest enemy in range
      let target = null; let bestDist = 1e9;
      for(const e of state.enemies){ if(!e.dead){ const d = Math.hypot(e.x-this.x,e.y-this.y); if(d <= this.range && d < bestDist){ bestDist = d; target = e; } } }
      if(target){ state.bullets.push(new Bullet(this.x,this.y,target,this.damage)); this.cooldown = this.fireRate; playSound('shoot'); }
    }
  }
  draw(ctx){
    ctx.fillStyle = (state.selectedTower === this) ? '#6cf' : '#28a';
    ctx.fillRect(this.x-12,this.y-12,24,24);
    // range (faint)
    ctx.strokeStyle = 'rgba(40,130,200,0.12)'; ctx.beginPath(); ctx.arc(this.x,this.y,this.range,0,Math.PI*2); ctx.stroke();
  }
}

class Bullet {
  constructor(x,y,target,damage){ this.x=x; this.y=y; this.target=target; this.speed=350; this.damage=damage||50; this.dead=false; }
  update(dt){
    if(this.target.dead){ this.dead = true; return; }
    const dx = this.target.x - this.x; const dy = this.target.y - this.y; const dist = Math.hypot(dx,dy);
    if(dist < 6){ this.target.hp -= this.damage; this.dead = true; if(this.target.hp <= 0){ this.target.dead = true; state.money += 50; playSound('explode'); } }
    else { this.x += (dx/dist) * this.speed * dt; this.y += (dy/dist) * this.speed * dt; }
  }
  draw(ctx){ ctx.fillStyle = 'black'; ctx.beginPath(); ctx.arc(this.x,this.y,4,0,Math.PI*2); ctx.fill(); }
}

function startWave(){
  state.spawnedThisWave = 0;
  state.waveSize = 5 + (state.wave - 1) * 2;
  state.spawnTimer = 0;
  state.waveCooldown = 0;
}

function spawnEnemy(){
  // enemy HP scales with wave
  const hpMult = 1 + (state.wave-1) * 0.12;
  state.enemies.push(new Enemy(hpMult));
  state.spawnedThisWave += 1;
}

function update(dt){
  if(state.gameOver) return;

  // spawning
  if(state.spawnedThisWave < state.waveSize){
    state.spawnTimer += dt;
    const spawnInterval = Math.max(0.6, 1.8 - (state.wave-1)*0.08);
    if(state.spawnTimer >= spawnInterval){ spawnEnemy(); state.spawnTimer = 0; }
  } else {
    // wave finished spawning; if all enemies dead, start next wave after cooldown
    if(state.enemies.length === 0){ state.waveCooldown += dt; if(state.waveCooldown >= 2.0){ state.wave += 1; startWave(); } }
  }

  for(const t of state.towers) t.update(dt);
  for(const e of state.enemies) e.update(dt);
  for(const b of state.bullets) b.update(dt);

  // cleanup
  state.enemies = state.enemies.filter(e => !e.dead);
  state.bullets = state.bullets.filter(b => !b.dead);

  if(state.lives <= 0){ state.gameOver = true; playSound('gameover'); }
}

function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  // draw path
  ctx.strokeStyle = '#444'; ctx.lineWidth = 24; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(path[0].x,path[0].y);
  for(let i=1;i<path.length;i++) ctx.lineTo(path[i].x,path[i].y);
  ctx.stroke();

  // draw towers, enemies, bullets
  for(const t of state.towers) t.draw(ctx);
  for(const e of state.enemies) e.draw(ctx);
  for(const b of state.bullets) b.draw(ctx);

  // UI
  ctx.fillStyle = 'white'; ctx.font = '16px Arial';
  ctx.fillText(`Money: ${state.money}`, 10,20);
  ctx.fillText(`Lives: ${state.lives}`, 10,40);
  ctx.fillText(`Towers: ${state.towers.length}`, 10,60);
  ctx.fillText(`Wave: ${state.wave}`, canvas.width - 100, 20);
  ctx.fillText(`Enemies: ${state.enemies.length}`, canvas.width - 100, 40);

  if(state.gameOver){
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = 'white'; ctx.font = '36px Arial'; ctx.textAlign = 'center';
    ctx.fillText('Game Over', canvas.width/2, canvas.height/2 - 20);
    ctx.font = '18px Arial'; ctx.fillText('Reload the page to play again', canvas.width/2, canvas.height/2 + 20);
    ctx.textAlign = 'start';
  }
}

function gameLoop(ts){
  const dt = Math.min(0.05, (ts - lastTime)/1000);
  lastTime = ts;
  update(dt);
  draw();
  requestAnimationFrame(gameLoop);
}

function findTowerAt(x,y){
  for(const t of state.towers){ const d = Math.hypot(t.x-x,t.y-y); if(d <= 16) return t; }
  return null;
}

canvas.addEventListener('click', (ev) => {
  const rect = canvas.getBoundingClientRect();
  const x = ev.clientX - rect.left; const y = ev.clientY - rect.top;
  if(state.gameOver) return;
  // if clicking on a tower -> select it
  const found = findTowerAt(x,y);
  if(found){ state.selectedTower = found; updateUI(); return; }
  // otherwise place tower
  const cost = 50;
  if(state.money >= cost){ state.towers.push(new Tower(x,y)); state.money -= cost; updateUI(); playSound('place'); }
});

// simple UI bindings (index.html provides these elements)
const towerInfoEl = document.getElementById('towerInfo');
const btnUpgrade = document.getElementById('btnUpgrade');
const btnSell = document.getElementById('btnSell');
const btnDeselect = document.getElementById('btnDeselect');

btnUpgrade.addEventListener('click', ()=>{
  const t = state.selectedTower; if(!t) return; const cost = t.getUpgradeCost(); if(state.money >= cost){ state.money -= cost; t.upgrade(); updateUI(); }
});

btnSell.addEventListener('click', ()=>{
  const t = state.selectedTower; if(!t) return; const value = t.getSellValue();
  const idx = state.towers.indexOf(t);
  if(idx >= 0){ state.towers.splice(idx,1); state.money += value; state.selectedTower = null; updateUI(); }
});

btnDeselect.addEventListener('click', ()=>{ state.selectedTower = null; updateUI(); });

function updateUI(){
  if(state.selectedTower){
    const t = state.selectedTower;
    towerInfoEl.textContent = `Tower L${t.level} — Range: ${t.range} — Damage: ${t.damage} — Upgrade cost: ${t.getUpgradeCost()} — Sell: ${t.getSellValue()}`;
    btnUpgrade.textContent = `Upgrade (cost: ${t.getUpgradeCost()})`;
    btnSell.textContent = `Sell (get ${t.getSellValue()})`;
    btnUpgrade.disabled = false;
    btnSell.disabled = false;
    btnDeselect.disabled = false;
  } else {
    towerInfoEl.textContent = 'No tower selected';
    btnUpgrade.textContent = 'Upgrade (cost: 75)';
    btnUpgrade.disabled = true;
    btnSell.textContent = 'Sell';
    btnSell.disabled = true;
    btnDeselect.disabled = false;
  }
}

// Initialize
startWave();
requestAnimationFrame((t)=>{ lastTime=t; requestAnimationFrame(gameLoop); updateUI(); });
