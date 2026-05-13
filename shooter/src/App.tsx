import React, { useState, useEffect, useRef } from 'react';
import './index.css';

type BackgroundType = 'forest' | 'city' | 'desert' | 'night' | 'military';
type EntityType = 'target' | 'duck' | 'zombie';
type TargetRole = 'good' | 'bad';
type GameStatus = 'idle' | 'playing' | 'gameover';

const BACKGROUNDS: BackgroundType[] = ['forest', 'city', 'desert', 'night', 'military'];

interface GameEntity {
  id: number;
  type: EntityType;
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
  role?: TargetRole;
}

interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
}

const App: React.FC = () => {
  const [background, setBackground] = useState<BackgroundType>('forest');
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState<GameStatus>('idle');
  const [timeLeft, setTimeLeft] = useState(60);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [scopePos, setScopePos] = useState({ x: 0, y: 0 });
  const arenaRef = useRef<HTMLCanvasElement>(null);
  const entitiesRef = useRef<GameEntity[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const nextIdRef = useRef(1);

  // Initialize Canvas size
  useEffect(() => {
    const handleResize = () => {
      if (arenaRef.current) {
        arenaRef.current.width = window.innerWidth;
        arenaRef.current.height = window.innerHeight;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Scope damping
  useEffect(() => {
    let animationFrameId: number;
    const updateScope = () => {
      setScopePos(prev => {
        const dx = mousePos.x - prev.x;
        const dy = mousePos.y - prev.y;
        return {
          x: prev.x + dx * 0.1,
          y: prev.y + dy * 0.1
        };
      });
      animationFrameId = requestAnimationFrame(updateScope);
    };
    updateScope();
    return () => cancelAnimationFrame(animationFrameId);
  }, [mousePos]);

  // Timer logic
  useEffect(() => {
    if (status === 'playing') {
      const timer = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(timer);
            setStatus('gameover');
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [status]);

  // Entity Spawning
  useEffect(() => {
    if (status !== 'playing') return;

    const spawnInterval = setInterval(() => {
      const typeRand = Math.random();
      let newEntity: GameEntity;

      if (typeRand < 0.7) {
        newEntity = {
          id: nextIdRef.current++,
          type: 'target',
          x: Math.random() * (window.innerWidth - 60),
          y: Math.random() * (window.innerHeight - 200) + 100,
          width: 60,
          height: 80,
          vx: (Math.random() - 0.5) * 4,
          vy: 0,
          role: Math.random() > 0.5 ? 'bad' : 'good'
        };
      } else if (typeRand < 0.85) {
        newEntity = {
          id: nextIdRef.current++,
          type: 'duck',
          x: -100,
          y: Math.random() * 200 + 50,
          width: 50,
          height: 40,
          vx: Math.random() * 5 + 3,
          vy: (Math.random() - 0.5) * 2
        };
      } else {
        newEntity = {
          id: nextIdRef.current++,
          type: 'zombie',
          x: window.innerWidth + 100,
          y: window.innerHeight - 120,
          width: 60,
          height: 90,
          vx: -(Math.random() * 2 + 1),
          vy: 0
        };
      }
      entitiesRef.current.push(newEntity);
    }, 1200);

    const flipInterval = setInterval(() => {
      entitiesRef.current.forEach(e => {
        if (e.type === 'target' && Math.random() < 0.4) {
          e.role = e.role === 'good' ? 'bad' : 'good';
        }
      });
    }, 1500);

    return () => {
      clearInterval(spawnInterval);
      clearInterval(flipInterval);
    };
  }, [status]);

  // Game Loop
  useEffect(() => {
    let animationFrameId: number;
    const canvas = arenaRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (status === 'playing') {
        // Update & Draw Entities
        entitiesRef.current = entitiesRef.current.filter(e => {
          e.x += e.vx;
          e.y += e.vy;

          ctx.save();
          if (e.type === 'target') {
            ctx.fillStyle = e.role === 'bad' ? '#e74c3c' : '#2ecc71';
            ctx.fillRect(e.x, e.y, e.width, e.height);
            ctx.fillStyle = '#f39c12'; // Head
            ctx.fillRect(e.x + 10, e.y - 20, 40, 20);
          } else if (e.type === 'duck') {
            ctx.fillStyle = '#f1c40f';
            ctx.beginPath();
            ctx.ellipse(e.x + 25, e.y + 20, 25, 15, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(e.x + 45, e.y + 10, 10, 0, Math.PI * 2);
            ctx.fill();
          } else if (e.type === 'zombie') {
            ctx.fillStyle = '#8e44ad';
            ctx.fillRect(e.x, e.y, e.width, e.height);
            ctx.fillStyle = '#27ae60';
            ctx.fillRect(e.x + 10, e.y + 10, 40, 30);
          }
          ctx.restore();

          return e.x > -200 && e.x < canvas.width + 200;
        });

        // Update & Draw Floating Texts
        floatingTextsRef.current = floatingTextsRef.current.filter(t => {
          t.y -= 2;
          t.life -= 1;
          ctx.save();
          ctx.globalAlpha = t.life / 60;
          ctx.fillStyle = t.color;
          ctx.font = 'bold 20px "Courier New"';
          ctx.fillText(t.text, t.x, t.y);
          ctx.restore();
          return t.life > 0;
        });
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [status]);

  const handleShoot = () => {
    if (status !== 'playing') return;

    const { x, y } = scopePos;
    const hitIndex = entitiesRef.current.findIndex(e => 
      x >= e.x && x <= e.x + e.width && y >= e.y && y <= e.y + e.height
    );

    if (hitIndex !== -1) {
      const hit = entitiesRef.current[hitIndex];
      let pts = 0;
      let color = '#fff';

      if (hit.type === 'target') {
        pts = hit.role === 'bad' ? 10 : -20;
        color = pts > 0 ? '#2ecc71' : '#e74c3c';
      } else if (hit.type === 'duck') {
        pts = 50;
        color = '#f1c40f';
      } else if (hit.type === 'zombie') {
        pts = 30;
        color = '#8e44ad';
      }

      setScore(s => s + pts);
      floatingTextsRef.current.push({
        id: Date.now(),
        x: hit.x,
        y: hit.y,
        text: pts > 0 ? `+${pts}` : `${pts}`,
        color,
        life: 60
      });
      entitiesRef.current.splice(hitIndex, 1);
    }
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(60);
    setStatus('playing');
    entitiesRef.current = [];
    floatingTextsRef.current = [];
  };

  return (
    <div 
      className="game-container" 
      style={{ background: `var(--bg-${background})` }}
      onClick={handleShoot}
    >
      <div className="background-selector">
        {BACKGROUNDS.map(bg => (
          <button key={bg} onClick={(e) => { e.stopPropagation(); setBackground(bg); }}>
            {bg.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="ui-layer">
        <div className="score-board">SCORE: {score}</div>
        <div className="score-board">TIME: {timeLeft}s</div>
      </div>

      <canvas ref={arenaRef} className="arena" />

      {status === 'idle' && (
        <div className="modal">
          <h1>SNIPER ELITE RETRO</h1>
          <p>Shoot RED targets. Avoid GREEN.</p>
          <p>Bonus: Ducks (Yellow) & Zombies (Purple)</p>
          <button onClick={(e) => { e.stopPropagation(); startGame(); }}>START MISSION</button>
        </div>
      )}

      {status === 'gameover' && (
        <div className="modal">
          <h1>MISSION COMPLETE</h1>
          <p>FINAL SCORE: {score}</p>
          <button onClick={(e) => { e.stopPropagation(); startGame(); }}>RETRY</button>
        </div>
      )}

      <div className="scope-container">
        <div 
          className="scope" 
          style={{ 
            left: `${scopePos.x}px`, 
            top: `${scopePos.y}px`,
            display: status === 'playing' ? 'block' : 'none'
          }} 
        />
      </div>
    </div>
  );
};

export default App;
