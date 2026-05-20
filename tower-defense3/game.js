const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let lastTime = performance.now();

const state = {
  money: 200,
  lives: 10,
  wave: 1,
  towers: [],
  enemies: [],
  bullets: [],
  spawnTimer: 0
};

// Simple straight path (left -> right)
const path = [{x:50,y:300},{x:750,y:300}];

class Enemy {
  constructor(){
    this.x = path[0].x;
    this.y = path[0].y;
    this.speed = 60; // px/s
    this.hp = 100;
    this.waypoint = 1;
    this.dead = false;
  }
  update(dt){
    const t = path[this.waypoint];
    const dx = t.x - this.x; const dy = t.y - this.y;
    const dist = Math.hypot(dx,dy);
    if(dist < 2){
      if(this.waypoint < path.length-1) this.waypoint++;
      else { this.dead = true; state.lives--; }
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
    this.x = x; this.y = y; this.range = 120; this.fireRate = 0.8; this.cooldown = 0;
  }
  update(dt){
    this.cooldown -= dt;
    if(this.cooldown <= 0){
      // find nearest enemy in range
      let target = null; let bestDist = 1e9;
      for(const e of state.enemies){ if(!e.dead){ const d = Math.hypot(e.x-this.x,e.y-this.y); if(d <= this.range && d < bestDist){ bestDist = d; target = e; } } }
      if(target){ state.bullets.push(new Bullet(this.x,this.y,target)); this.cooldown = this.fireRate; }
    }
  }
  draw(ctx){
    ctx.fillStyle = '#28a'; ctx.fillRect(this.x-12,this.y-12,24,24);
    // range (faint)
    ctx.strokeStyle = 'rgba(40,130,200,0.12)'; ctx.beginPath(); ctx.arc(this.x,this.y,this.range,0,Math.PI*2); ctx.stroke();
  }
}

class Bullet {
  constructor(x,y,target){ this.x=x; this.y=y; this.target=target; this.speed=350; this.damage=50; this.dead=false; }
  update(dt){
    if(this.target.dead){ this.dead = true; return; }
    const dx = this.target.x - this.x; const dy = this.target.y - this.y; const dist = Math.hypot(dx,dy);
    if(dist < 6){ this.target.hp -= this.damage; this.dead = true; if(this.target.hp <= 0){ this.target.dead = true; state.money += 50; } }
    else { this.x += (dx/dist) * this.speed * dt; this.y += (dy/dist) * this.speed * dt; }
  }
  draw(ctx){ ctx.fillStyle = 'black'; ctx.beginPath(); ctx.arc(this.x,this.y,4,0,Math.PI*2); ctx.fill(); }
}

function spawnEnemy(){ state.enemies.push(new Enemy()); }

function update(dt){
  // spawn logic: 1 enemy every 1.8s while wave < 10 (simple)
  state.spawnTimer += dt;
  if(state.spawnTimer >= 1.8){ spawnEnemy(); state.spawnTimer = 0; }

  for(const t of state.towers) t.update(dt);
  for(const e of state.enemies) e.update(dt);
  for(const b of state.bullets) b.update(dt);

  // cleanup
  state.enemies = state.enemies.filter(e => !e.dead);
  state.bullets = state.bullets.filter(b => !b.dead);
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
}

function gameLoop(ts){
  const dt = Math.min(0.05, (ts - lastTime)/1000);
  lastTime = ts;
  update(dt);
  draw();
  requestAnimationFrame(gameLoop);
}

canvas.addEventListener('click', (ev) => {
  const rect = canvas.getBoundingClientRect();
  const x = ev.clientX - rect.left; const y = ev.clientY - rect.top;
  const cost = 50;
  if(state.money >= cost){ state.towers.push(new Tower(x,y)); state.money -= cost; }
});

// start
requestAnimationFrame((t)=>{ lastTime=t; requestAnimationFrame(gameLoop); });
