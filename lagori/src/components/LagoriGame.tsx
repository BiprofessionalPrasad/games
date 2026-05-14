import React, { useState, useEffect, useRef, useCallback } from 'react';
import { type GameState, type StoneData, type BallData, type PlayerData } from '../types';
import './LagoriGame.css';

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const STACK_X = GAME_WIDTH / 2;
const STACK_Y = GAME_HEIGHT / 2;

const LagoriGame: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('IDLE');
  const [stones, setStones] = useState<StoneData[]>(() => {
    const initialStones: StoneData[] = [];
    for (let i = 0; i < 7; i++) {
      initialStones.push({
        id: i,
        position: { x: STACK_X, y: STACK_Y },
        isStacked: true,
        order: i,
        rotation: 0
      });
    }
    return initialStones;
  });
  const [ball, setBall] = useState<BallData>({
    position: { x: GAME_WIDTH / 2, y: GAME_HEIGHT - 50 },
    velocity: { x: 0, y: 0 },
    isHeld: true,
    heldBy: 'PLAYER'
  });
  const [player, setPlayer] = useState<PlayerData>({
    position: { x: GAME_WIDTH / 2, y: GAME_HEIGHT - 50 },
    score: 0,
    stonesHeld: 0
  });
  const [opponent, setOpponent] = useState<PlayerData>({
    position: { x: GAME_WIDTH / 2, y: 50 },
    score: 0,
    stonesHeld: 0
  });
  const [aimAngle, setAimAngle] = useState(0);
  const [power, setPower] = useState(0);
  const [isCharging, setIsCharging] = useState(false);
  const [keys, setKeys] = useState<Set<string>>(new Set());

  const gameRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(null);
  const updateRef = useRef<() => void>(null);

  const startGame = () => {
    setGameState('BREAKING');
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (gameState === 'BREAKING' && ball.isHeld && ball.heldBy === 'PLAYER') {
      const rect = gameRef.current?.getBoundingClientRect();
      if (rect) {
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const dx = mouseX - ball.position.x;
        const dy = mouseY - ball.position.y;
        setAimAngle(Math.atan2(dy, dx));
      }
    }
  };

  const handleMouseDown = () => {
    if (gameState === 'BREAKING' && ball.isHeld && ball.heldBy === 'PLAYER') {
      setIsCharging(true);
      setPower(0);
    }
  };

  const handleMouseUp = () => {
    if (gameState === 'BREAKING' && ball.isHeld && ball.heldBy === 'PLAYER' && isCharging) {
      const shotPower = 5 + (power / 100) * 15;
      setBall(prev => ({
        ...prev,
        isHeld: false,
        heldBy: null,
        velocity: {
          x: Math.cos(aimAngle) * shotPower,
          y: Math.sin(aimAngle) * shotPower
        }
      }));
      setIsCharging(false);
    }
  };

  useEffect(() => {
    let interval: number;
    if (isCharging) {
      interval = window.setInterval(() => {
        setPower(p => (p + 2) % 100);
      }, 20);
    }
    return () => clearInterval(interval);
  }, [isCharging]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    setKeys(prev => new Set(prev).add(e.key));
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    setKeys(prev => {
      const newKeys = new Set(prev);
      newKeys.delete(e.key);
      return newKeys;
    });
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  const resetGame = useCallback(() => {
    setGameState('IDLE');
    setStones(prev => prev.map((s, i) => ({
      ...s,
      isStacked: true,
      position: { x: STACK_X, y: STACK_Y },
      order: i,
      rotation: 0
    })));
    setBall({
      position: { x: GAME_WIDTH / 2, y: GAME_HEIGHT - 50 },
      velocity: { x: 0, y: 0 },
      isHeld: true,
      heldBy: 'PLAYER'
    });
    setPlayer({
      position: { x: GAME_WIDTH / 2, y: GAME_HEIGHT - 50 },
      score: 0,
      stonesHeld: 0
    });
    setOpponent({
      position: { x: GAME_WIDTH / 2, y: 50 },
      score: 0,
      stonesHeld: 0
    });
    setPower(0);
    setIsCharging(false);
  }, []);

  const update = useCallback(() => {
    if (gameState === 'PLAYING') {
      // 1. Human Player Movement
      let playerPos = { ...player.position };
      let dx = 0;
      let dy = 0;
      const speed = 5;
      if (keys.has('ArrowLeft') || keys.has('a')) dx -= speed;
      if (keys.has('ArrowRight') || keys.has('d')) dx += speed;
      if (keys.has('ArrowUp') || keys.has('w')) dy -= speed;
      if (keys.has('ArrowDown') || keys.has('s')) dy += speed;

      playerPos.x = Math.max(15, Math.min(GAME_WIDTH - 15, playerPos.x + dx));
      playerPos.y = Math.max(15, Math.min(GAME_HEIGHT - 15, playerPos.y + dy));

      let stonesPicked = 0;
      let stonesStacked = 0;

      setStones(prevStones => {
        let hasPicked = false;
        let nextStones = prevStones.map(s => {
          if (!s.isStacked && s.position.x !== -100 && !hasPicked) {
            const dist = Math.sqrt(Math.pow(playerPos.x - s.position.x, 2) + Math.pow(playerPos.y - s.position.y, 2));
            if (dist < 30) {
              hasPicked = true;
              stonesPicked++;
              return { ...s, position: { x: -100, y: -100 } };
            }
          }
          return s;
        });

        const distToCenter = Math.sqrt(Math.pow(playerPos.x - STACK_X, 2) + Math.pow(playerPos.y - STACK_Y, 2));
        if (distToCenter < 50 && (player.stonesHeld + stonesPicked) > 0) {
          const stackedCount = nextStones.filter(s => s.isStacked).length;
          const stoneToStack = nextStones.find(s => s.position.x === -100);
          if (stoneToStack) {
            stonesStacked++;
            nextStones = nextStones.map(s => s.id === stoneToStack.id ? {
              ...s,
              isStacked: true,
              position: { x: STACK_X, y: STACK_Y },
              order: stackedCount,
              rotation: 0
            } : s);
          }
        }
        return nextStones;
      });

      setPlayer(prev => ({
        ...prev,
        position: playerPos,
        stonesHeld: prev.stonesHeld + stonesPicked - stonesStacked
      }));

      // 2. Ball Physics
      setBall(prev => {
        if (prev.isHeld) {
          const holder = prev.heldBy === 'PLAYER' ? playerPos : opponent.position;
          return { ...prev, position: holder };
        }

        const newX = prev.position.x + prev.velocity.x;
        const newY = prev.position.y + prev.velocity.y;
        let newVelX = prev.velocity.x * 0.99;
        let newVelY = prev.velocity.y * 0.99;

        if (newX < 10 || newX > GAME_WIDTH - 10) newVelX *= -1;
        if (newY < 10 || newY > GAME_HEIGHT - 10) newVelY *= -1;

        // Opponent picking up ball
        const distToOpponent = Math.sqrt(Math.pow(newX - opponent.position.x, 2) + Math.pow(newY - opponent.position.y, 2));
        if (distToOpponent < 30) {
          return { ...prev, isHeld: true, heldBy: 'OPPONENT', velocity: { x: 0, y: 0 } };
        }

        // Hitting Player
        const distToPlayer = Math.sqrt(Math.pow(newX - playerPos.x, 2) + Math.pow(newY - playerPos.y, 2));
        if (distToPlayer < 25) {
          setGameState('GAME_OVER');
        }

        return { ...prev, position: { x: newX, y: newY }, velocity: { x: newVelX, y: newVelY } };
      });

      // 3. Computer AI
      setOpponent(prev => {
        let odx = 0;
        let ody = 0;
        const ospeed = 3.8;

        if (ball.isHeld && ball.heldBy === 'OPPONENT') {
          const angle = Math.atan2(playerPos.y - prev.position.y, playerPos.x - prev.position.x);
          odx = Math.cos(angle) * ospeed;
          ody = Math.sin(angle) * ospeed;

          const distToPlayer = Math.sqrt(Math.pow(playerPos.x - prev.position.x, 2) + Math.pow(playerPos.y - prev.position.y, 2));
          if (distToPlayer < 300) {
            setBall(b => ({
              ...b,
              isHeld: false,
              heldBy: null,
              velocity: { x: Math.cos(angle) * 13, y: Math.sin(angle) * 13 }
            }));
          }
        } else if (!ball.isHeld) {
          const angle = Math.atan2(ball.position.y - prev.position.y, ball.position.x - prev.position.x);
          odx = Math.cos(angle) * ospeed;
          ody = Math.sin(angle) * ospeed;
        }

        return { ...prev, position: { x: prev.position.x + odx, y: prev.position.y + ody } };
      });

      if (stones.every(s => s.isStacked)) {
        setGameState('GAME_OVER');
      }
    }

    if (gameState === 'BREAKING' && !ball.isHeld) {
      setBall(prev => {
        const newX = prev.position.x + prev.velocity.x;
        const newY = prev.position.y + prev.velocity.y;
        let newVelX = prev.velocity.x;
        let newVelY = prev.velocity.y;

        if (newX < 0 || newX > GAME_WIDTH) newVelX *= -1;
        if (newY < 0 || newY > GAME_HEIGHT) newVelY *= -1;

        const distToStack = Math.sqrt(Math.pow(newX - STACK_X, 2) + Math.pow(newY - STACK_Y, 2));

        if (distToStack < 40) {
          setGameState('PLAYING');
          const spreadPower = Math.sqrt(newVelX * newVelX + newVelY * newVelY) * 20;
          setStones(prevStones => prevStones.map(s => ({
            ...s,
            isStacked: false,
            rotation: Math.random() * 360,
            position: {
              x: STACK_X + (Math.random() - 0.5) * spreadPower,
              y: STACK_Y + (Math.random() - 0.5) * spreadPower
            }
          })));
          newVelX *= -0.4;
          newVelY *= -0.4;
        }

        if (Math.abs(newVelX) < 0.1 && Math.abs(newVelY) < 0.1) {
           setTimeout(resetGame, 0); // Call resetGame safely
        }

        return { ...prev, position: { x: newX, y: newY }, velocity: { x: newVelX, y: newVelY } };
      });
    }
  }, [gameState, ball, keys, player, opponent, resetGame]);

  useEffect(() => {
    updateRef.current = update;
  }, [update]);

  useEffect(() => {
    const loop = () => {
      if (updateRef.current) updateRef.current();
      requestRef.current = requestAnimationFrame(loop);
    };
    requestRef.current = requestAnimationFrame(loop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <div
      className="lagori-game"
      ref={gameRef}
      style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      <div className="game-area">
        <div className="hud">
          <div className="hud-item">
            <span className="hud-label">Stones Held</span>
            <div className="stone-counter">
              {Array.from({ length: Math.max(0, player.stonesHeld) }).map((_, i) => (
                <div key={i} className="stone-mini" />
              ))}
            </div>
          </div>
          <div className="hud-item">
            <span className="hud-label">To Stack</span>
            <span>{stones.filter(s => !s.isStacked).length}</span>
          </div>
        </div>

        {gameState === 'IDLE' && (
          <div className="overlay">
            <h1>LAGORI</h1>
            <p>Traditional Indian game: Break the stack of stones with the ball, then try to restack them all before the computer hits you!</p>
            <button onClick={startGame}>Start Game</button>
          </div>
        )}

        {gameState === 'GAME_OVER' && (
          <div className="overlay">
            <h1>{stones.every(s => s.isStacked) ? 'YOU WIN!' : 'GAME OVER'}</h1>
            <p>{stones.every(s => s.isStacked) ? 'Fantastic! You successfully restacked the Lagori!' : 'Oh no! The computer hit you. Better luck next time!'}</p>
            <button onClick={resetGame}>Play Again</button>
          </div>
        )}

        {gameState === 'BREAKING' && ball.isHeld && (
          <>
            <div
              className="aim-line"
              style={{
                left: ball.position.x,
                top: ball.position.y,
                transform: `rotate(${aimAngle}rad)`
              }}
            />
            {isCharging && (
              <div className="power-meter">
                <div className="power-fill" style={{ width: `${power}%` }} />
              </div>
            )}
          </>
        )}

        <div className="stack">
          {stones.map((stone) => (
            <div
              key={stone.id}
              className={`stone ${stone.isStacked ? 'stacked' : 'dispersed'}`}
              style={{
                left: stone.position.x,
                top: stone.isStacked ? stone.position.y - (stone.order * 15) : stone.position.y,
                zIndex: stone.order,
                '--rotation': `${stone.rotation || 0}deg`
              } as React.CSSProperties}
            />
          ))}
        </div>

        <div
          className="ball"
          style={{ left: ball.position.x, top: ball.position.y }}
        />

        <div
          className="player"
          style={{ left: player.position.x, top: player.position.y }}
        />

        <div
          className="opponent"
          style={{ left: opponent.position.x, top: opponent.position.y }}
        />
      </div>
    </div>
  );
};

export default LagoriGame;
