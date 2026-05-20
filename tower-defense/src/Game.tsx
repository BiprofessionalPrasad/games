import React, { useEffect, useRef, useState } from 'react';
import { GAME_WIDTH, GAME_HEIGHT, GRID_SIZE, MARS_PATH, PATH_WIDTH, getPointOnFullPath } from './constants';
import { PLANT_STATS } from './types';
import type { Plant, PlantType } from './types';
import { ZOMBIE_STATS } from './zombieTypes';
import type { Zombie, ZombieType } from './zombieTypes';
import type { Projectile } from './projectileTypes';

const Game: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [credits, setCredits] = useState(150);
  const [health, setHealth] = useState(100);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [zombies, setZombies] = useState<Zombie[]>([]);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [selectedPlantType, setSelectedPlantType] = useState<PlantType | null>(null);
  const [gameOver, setGameOver] = useState(false);

  const plantsRef = useRef<Plant[]>([]);
  const zombiesRef = useRef<Zombie[]>([]);
  const projectilesRef = useRef<Projectile[]>([]);
  const lastSpawnTime = useRef(Date.now());
  const gameOverRef = useRef(false);

  useEffect(() => { plantsRef.current = plants; }, [plants]);
  useEffect(() => { zombiesRef.current = zombies; }, [zombies]);
  useEffect(() => { projectilesRef.current = projectiles; }, [projectiles]);
  useEffect(() => { gameOverRef.current = gameOver; }, [gameOver]);

  const restartGame = () => {
    setCredits(150);
    setHealth(100);
    setPlants([]);
    setZombies([]);
    setProjectiles([]);
    setGameOver(false);
    lastSpawnTime.current = Date.now();
  };

  const isPointOnPath = (x: number, y: number) => {
    for (let t = 0; t <= 1; t += 0.01) {
      const pathPoint = getPointOnFullPath(t);
      const dist = Math.sqrt(Math.pow(x - pathPoint.x, 2) + Math.pow(y - pathPoint.y, 2));
      if (dist < PATH_WIDTH / 1.2) return true;
    }
    return false;
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameOver || !selectedPlantType) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const gridX = Math.floor(x / GRID_SIZE);
    const gridY = Math.floor(y / GRID_SIZE);
    const centerX = gridX * GRID_SIZE + GRID_SIZE / 2;
    const centerY = gridY * GRID_SIZE + GRID_SIZE / 2;
    const cost = PLANT_STATS[selectedPlantType].cost;

    if (credits < cost || isPointOnPath(centerX, centerY) || plants.some(p => p.x === gridX && p.y === gridY)) return;

    const newPlant: Plant = {
      id: Math.random().toString(36).substr(2, 9),
      type: selectedPlantType,
      x: gridX,
      y: gridY,
      lastShot: Date.now(),
      lastProduction: Date.now()
    };
    setPlants([...plants, newPlant]);
    setCredits(credits - cost);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const spawnZombie = () => {
      const types: ZombieType[] = ['SOFTWARE_ENGINEER', 'ELECTRICIAN', 'PLUMBER'];
      const type = types[Math.floor(Math.random() * types.length)];
      const stats = ZOMBIE_STATS[type];
      const newZombie: Zombie = {
        id: Math.random().toString(36).substr(2, 9),
        type,
        progress: 0,
        health: stats.health,
        maxHealth: stats.health,
        speed: stats.speed
      };
      setZombies(prev => [...prev, newZombie]);
    };

    const updateCombat = () => {
      const now = Date.now();
      const newProjectiles: Projectile[] = [...projectilesRef.current];

      plantsRef.current.forEach(plant => {
        if (plant.type === 'SOLAR_ARRAY') return;
        const stats = PLANT_STATS[plant.type];
        if (now - plant.lastShot >= stats.interval) {
          const plantX = plant.x * GRID_SIZE + GRID_SIZE / 2;
          const plantY = plant.y * GRID_SIZE + GRID_SIZE / 2;
          let target: Zombie | null = null;
          let maxProgress = -1;

          zombiesRef.current.forEach(zombie => {
            const zPos = getPointOnFullPath(zombie.progress);
            const dist = Math.sqrt(Math.pow(plantX - zPos.x, 2) + Math.pow(plantY - zPos.y, 2));
            if (dist <= (stats.range || 0) && zombie.progress > maxProgress) {
              maxProgress = zombie.progress;
              target = zombie;
            }
          });

          if (target) {
            newProjectiles.push({
              id: Math.random().toString(36).substr(2, 9),
              x: plantX,
              y: plantY,
              targetId: (target as Zombie).id,
              damage: stats.damage || 0,
              speed: 7,
              type: plant.type === 'CARROT_SHOOTER' ? 'CARROT' : 'PEPPERCORN'
            });
            plant.lastShot = now;
          }
        }
      });

      const remainingProjectiles: Projectile[] = [];
      const damagedZombies: { [id: string]: number } = {};

      newProjectiles.forEach(p => {
        const target = zombiesRef.current.find(z => z.id === p.targetId);
        if (!target) return;
        const zPos = getPointOnFullPath(target.progress);
        const dx = zPos.x - p.x;
        const dy = zPos.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 15) {
          damagedZombies[target.id] = (damagedZombies[target.id] || 0) + p.damage;
        } else {
          remainingProjectiles.push({
            ...p,
            x: p.x + (dx / dist) * p.speed,
            y: p.y + (dy / dist) * p.speed
          });
        }
      });

      if (Object.keys(damagedZombies).length > 0) {
        setZombies(prev => prev.map(z => 
          damagedZombies[z.id] ? { ...z, health: z.health - damagedZombies[z.id] } : z
        ).filter(z => z.health > 0));
      }
      setProjectiles(remainingProjectiles);
    };

    const render = () => {
      if (gameOverRef.current) {
        animationFrameId = window.requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      
      // Background
      ctx.fillStyle = '#c1440e';
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      
      // Path
      ctx.strokeStyle = '#5d2e0a';
      ctx.lineWidth = PATH_WIDTH;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(MARS_PATH[0].start.x, MARS_PATH[0].start.y);
      for (const segment of MARS_PATH) {
        ctx.bezierCurveTo(segment.cp1.x, segment.cp1.y, segment.cp2.x, segment.cp2.y, segment.end.x, segment.end.y);
      }
      ctx.stroke();

      // House at the end
      const endPos = MARS_PATH[MARS_PATH.length-1].end;
      ctx.fillStyle = '#34495e';
      ctx.fillRect(endPos.x - 40, endPos.y - 40, 80, 80);
      ctx.fillStyle = '#ecf0f1';
      ctx.fillRect(endPos.x - 20, endPos.y - 10, 40, 20); // Window

      // Spawning
      const now = Date.now();
      if (now - lastSpawnTime.current > 3000) {
        spawnZombie();
        lastSpawnTime.current = now;
      }

      // Logic
      const remainingZombies: Zombie[] = [];
      let damageToBase = 0;
      zombiesRef.current.forEach(zombie => {
        const newProgress = zombie.progress + zombie.speed;
        if (newProgress >= 1) damageToBase += 10;
        else remainingZombies.push({ ...zombie, progress: newProgress });
      });
      if (damageToBase > 0) {
        setHealth(h => {
          const newH = Math.max(0, h - damageToBase);
          if (newH <= 0) setGameOver(true);
          return newH;
        });
      }
      zombiesRef.current = remainingZombies;
      setZombies(remainingZombies);

      updateCombat();

      // Draw Entities
      zombiesRef.current.forEach(zombie => {
        const pos = getPointOnFullPath(zombie.progress);
        const stats = ZOMBIE_STATS[zombie.type];
        ctx.fillStyle = stats.color;
        ctx.beginPath(); ctx.arc(pos.x, pos.y, 18, 0, Math.PI * 2); ctx.fill();
        ctx.font = '20px Arial'; ctx.textAlign = 'center'; ctx.fillText(stats.label, pos.x, pos.y + 7);
        ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(pos.x - 20, pos.y - 30, 40, 6);
        ctx.fillStyle = '#2ecc71'; ctx.fillRect(pos.x - 20, pos.y - 30, 40 * (zombie.health / zombie.maxHealth), 6);
      });

      plantsRef.current.forEach(plant => {
        const stats = PLANT_STATS[plant.type];
        const x = plant.x * GRID_SIZE + GRID_SIZE / 2;
        const y = plant.y * GRID_SIZE + GRID_SIZE / 2;
        ctx.shadowBlur = 10; ctx.shadowColor = stats.color;
        ctx.fillStyle = stats.color;
        ctx.beginPath(); ctx.arc(x, y, GRID_SIZE / 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = 'white'; ctx.lineWidth = 3; ctx.stroke();
        
        // Solar production bar
        if (plant.type === 'SOLAR_ARRAY') {
           const progress = Math.min((now - plant.lastProduction) / stats.interval, 1);
           ctx.fillStyle = 'white'; ctx.fillRect(x - 20, y + 25, 40 * progress, 4);
        }
      });

      projectilesRef.current.forEach(p => {
        ctx.fillStyle = p.type === 'CARROT' ? '#e67e22' : '#27ae60';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.type === 'CARROT' ? 6 : 10, 0, Math.PI * 2); ctx.fill();
      });

      // Production
      let extraCredits = 0;
      plantsRef.current.forEach(plant => {
        if (plant.type === 'SOLAR_ARRAY' && now - plant.lastProduction >= PLANT_STATS.SOLAR_ARRAY.interval) {
          extraCredits += PLANT_STATS.SOLAR_ARRAY.production;
          plant.lastProduction = now;
        }
      });
      if (extraCredits > 0) setCredits(prev => prev + extraCredits);

      animationFrameId = window.requestAnimationFrame(render);
    };

    render();
    return () => window.cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#1a1a1a', minHeight: '100vh', color: 'white', padding: '20px', fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif' }}>
      <h1 style={{ margin: '0 0 20px 0', fontSize: '2.5rem', textShadow: '0 0 10px #c1440e' }}>MARS DEFENSE</h1>
      
      <div style={{ display: 'flex', gap: '30px', marginBottom: '15px' }}>
        <div style={{ fontSize: '1.5rem', background: '#34495e', padding: '10px 25px', borderRadius: '10px', borderBottom: '4px solid #2c3e50' }}>💰 {credits}</div>
        <div style={{ fontSize: '1.5rem', background: '#c0392b', padding: '10px 25px', borderRadius: '10px', borderBottom: '4px solid #962d22' }}>🏠 {health}%</div>
      </div>

      <div style={{ position: 'relative' }}>
        <canvas ref={canvasRef} width={GAME_WIDTH} height={GAME_HEIGHT} onClick={handleCanvasClick} style={{ border: '8px solid #34495e', borderRadius: '12px', boxShadow: '0 0 40px rgba(193, 68, 14, 0.3)', cursor: selectedPlantType ? 'crosshair' : 'default' }} />
        
        {gameOver && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', borderRadius: '8px' }}>
            <h2 style={{ fontSize: '4rem', color: '#e74c3c', margin: '0' }}>GAME OVER</h2>
            <p style={{ fontSize: '1.5rem', marginBottom: '30px' }}>The zombies reached the house!</p>
            <button onClick={restartGame} style={{ padding: '15px 40px', fontSize: '1.5rem', cursor: 'pointer', background: '#2ecc71', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>RETRY MISSION</button>
          </div>
        )}
      </div>

      <div style={{ marginTop: '25px', display: 'flex', gap: '20px' }}>
        {(['SOLAR_ARRAY', 'CARROT_SHOOTER', 'PEPPERCORN_MORTAR'] as PlantType[]).map(type => (
          <button
            key={type}
            disabled={credits < PLANT_STATS[type].cost || gameOver}
            onClick={() => setSelectedPlantType(type)}
            style={{
              padding: '15px 25px',
              cursor: 'pointer',
              background: selectedPlantType === type ? '#3498db' : '#2c3e50',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              opacity: (credits < PLANT_STATS[type].cost && !gameOver) ? 0.5 : 1,
              transform: selectedPlantType === type ? 'translateY(-5px)' : 'none',
              transition: 'all 0.2s',
              fontWeight: 'bold',
              boxShadow: selectedPlantType === type ? '0 5px 15px rgba(52, 152, 219, 0.4)' : 'none'
            }}
          >
            {type.replace('_', ' ')}<br/>
            <span style={{ fontSize: '0.8rem', color: '#bdc3c7' }}>Cost: {PLANT_STATS[type].cost}</span>
          </button>
        ))}
        <button onClick={() => setSelectedPlantType(null)} style={{ padding: '15px 25px', cursor: 'pointer', background: '#7f8c8d', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>CANCEL</button>
      </div>
    </div>
  );
};

export default Game;
