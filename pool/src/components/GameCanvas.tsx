import React, { useEffect, useRef, useState } from 'react';
import { type Ball, TABLE_WIDTH, TABLE_HEIGHT, BALL_RADIUS, type Vector2D, POCKETS, POCKET_RADIUS } from '../types/game';
import { updateBallPosition, resolveBallCollision, checkBallPocketed } from '../engine/physics';

const INITIAL_BALLS: Ball[] = [
  { id: 0, type: 'cue', position: { x: 200, y: 200 }, velocity: { x: 0, y: 0 }, radius: BALL_RADIUS, mass: 1, isPocketed: false },
  // Simple triangle rack
  { id: 1, type: 'red', position: { x: 550, y: 200 }, velocity: { x: 0, y: 0 }, radius: BALL_RADIUS, mass: 1, isPocketed: false },
  { id: 2, type: 'yellow', position: { x: 570, y: 190 }, velocity: { x: 0, y: 0 }, radius: BALL_RADIUS, mass: 1, isPocketed: false },
  { id: 3, type: 'yellow', position: { x: 570, y: 210 }, velocity: { x: 0, y: 0 }, radius: BALL_RADIUS, mass: 1, isPocketed: false },
  { id: 4, type: 'black', position: { x: 590, y: 200 }, velocity: { x: 0, y: 0 }, radius: BALL_RADIUS, mass: 1, isPocketed: false },
  { id: 5, type: 'red', position: { x: 590, y: 180 }, velocity: { x: 0, y: 0 }, radius: BALL_RADIUS, mass: 1, isPocketed: false },
  { id: 6, type: 'red', position: { x: 590, y: 220 }, velocity: { x: 0, y: 0 }, radius: BALL_RADIUS, mass: 1, isPocketed: false },
];

const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [balls, setBalls] = useState<Ball[]>(INITIAL_BALLS);
  const [mousePos, setMousePos] = useState<Vector2D | null>(null);
  const [isStriking, setIsStriking] = useState(false);
  const [strikePower, setStrikePower] = useState(0);
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [scores, setScores] = useState({ 1: 0, 2: 0 });
  const [message, setMessage] = useState('Player 1\'s Turn');
  const [wasMoving, setWasMoving] = useState(false);
  const [gameMode, setGameMode] = useState<'1P' | '2P'>('2P');

  const cueBall = balls.find(b => b.type === 'cue');
  const isMoving = balls.some(b => !b.isPocketed && (Math.abs(b.velocity.x) > 0 || Math.abs(b.velocity.y) > 0));

  // AI Logic for 1P Mode
  useEffect(() => {
    if (gameMode === '1P' && currentPlayer === 2 && !isMoving && !wasMoving && cueBall && !cueBall.isPocketed) {
      const aiShotTimeout = setTimeout(() => {
        const targetBalls = balls.filter(b => b.type !== 'cue' && !b.isPocketed);
        if (targetBalls.length === 0) return;

        // Simple AI: pick a random target ball and shoot towards it
        const target = targetBalls[Math.floor(Math.random() * targetBalls.length)];
        const dx = target.position.x - cueBall.position.x;
        const dy = target.position.y - cueBall.position.y;
        const angle = Math.atan2(dy, dx);
        const power = 10 + Math.random() * 10;

        const velocity = {
          x: Math.cos(angle) * power,
          y: Math.sin(angle) * power,
        };

        setBalls(prev => prev.map(b => b.type === 'cue' ? { ...b, velocity } : b));
        setMessage('AI is taking a shot...');
      }, 1500);

      return () => clearTimeout(aiShotTimeout);
    }
  }, [currentPlayer, isMoving, gameMode, cueBall]);

  useEffect(() => {
    let animationFrameId: number;

    const update = () => {
      setBalls((prevBalls) => {
        let nextBalls = prevBalls.map(b => {
          if (b.isPocketed) return b;
          const updated = updateBallPosition(b);
          if (checkBallPocketed(updated)) {
            return { ...updated, isPocketed: true, velocity: { x: 0, y: 0 } };
          }
          return updated;
        });

        for (let i = 0; i < nextBalls.length; i++) {
          if (nextBalls[i].isPocketed) continue;
          for (let j = i + 1; j < nextBalls.length; j++) {
            if (nextBalls[j].isPocketed) continue;
            const [b1, b2] = resolveBallCollision(nextBalls[i], nextBalls[j]);
            nextBalls[i] = b1;
            nextBalls[j] = b2;
          }
        }

        return nextBalls;
      });

      animationFrameId = requestAnimationFrame(update);
    };

    animationFrameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // Handle turn switching and scoring
  useEffect(() => {
    if (wasMoving && !isMoving) {
      // Balls stopped moving
      const pocketedThisTurn = balls.filter(b => b.isPocketed && b.type !== 'cue');
      // Simple scoring for now: +1 per ball pocketed
      // In a real game, we'd check which types were pocketed
      
      const cueBallPocketed = cueBall?.isPocketed;

      if (cueBallPocketed) {
        setMessage('Foul! Cue ball pocketed. Player ' + (currentPlayer === 1 ? 2 : 1) + '\'s Turn');
        setCurrentPlayer(p => p === 1 ? 2 : 1);
        // Reset cue ball
        setBalls(prev => prev.map(b => b.type === 'cue' ? { ...b, isPocketed: false, position: { x: 200, y: 200 }, velocity: { x: 0, y: 0 } } : b));
      } else if (pocketedThisTurn.length > 0) {
        // Just increment score for demo
        setScores(prev => ({ ...prev, [currentPlayer]: prev[currentPlayer as 1 | 2] + pocketedThisTurn.length }));
        setMessage('Nice shot! Player ' + currentPlayer + ' continues.');
        // Player stays current
      } else {
        setCurrentPlayer(p => p === 1 ? 2 : 1);
        setMessage('Player ' + (currentPlayer === 1 ? 2 : 1) + '\'s Turn');
      }
    }
    setWasMoving(isMoving);
  }, [isMoving]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseDown = () => {
    if (!isMoving && cueBall && !cueBall.isPocketed) {
      setIsStriking(true);
      setStrikePower(0);
    }
  };

  const handleMouseUp = () => {
    if (isStriking && cueBall && mousePos) {
      const dx = cueBall.position.x - mousePos.x;
      const dy = cueBall.position.y - mousePos.y;
      const angle = Math.atan2(dy, dx);
      
      const power = Math.min(strikePower / 10, 25);
      const velocity = {
        x: Math.cos(angle) * power,
        y: Math.sin(angle) * power,
      };

      setBalls(prev => prev.map(b => b.type === 'cue' ? { ...b, velocity } : b));
      setIsStriking(false);
      setStrikePower(0);
    }
  };

  useEffect(() => {
    if (isStriking) {
      const interval = setInterval(() => {
        setStrikePower(p => Math.min(p + 3, 250));
      }, 20);
      return () => clearInterval(interval);
    }
  }, [isStriking]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, TABLE_WIDTH, TABLE_HEIGHT);

    // Draw Table
    ctx.fillStyle = '#0a5c0a';
    ctx.fillRect(0, 0, TABLE_WIDTH, TABLE_HEIGHT);

    // Draw Pockets
    ctx.fillStyle = '#111';
    POCKETS.forEach(pocket => {
      ctx.beginPath();
      ctx.arc(pocket.x, pocket.y, POCKET_RADIUS, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw Aiming Line and Cue Stick
    if (!isMoving && cueBall && !cueBall.isPocketed && mousePos) {
      const dx = cueBall.position.x - mousePos.x;
      const dy = cueBall.position.y - mousePos.y;
      const angle = Math.atan2(dy, dx);
      const dist = 50 + strikePower / 2;

      ctx.beginPath();
      ctx.setLineDash([5, 5]);
      ctx.moveTo(cueBall.position.x, cueBall.position.y);
      ctx.lineTo(cueBall.position.x + Math.cos(angle) * 300, cueBall.position.y + Math.sin(angle) * 300);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.save();
      ctx.translate(cueBall.position.x, cueBall.position.y);
      ctx.rotate(angle);
      ctx.fillStyle = '#4a2c0f';
      ctx.fillRect(-dist - 250, -3, 250, 6);
      ctx.fillStyle = '#d4af37';
      ctx.fillRect(-dist, -3, 8, 6);
      ctx.restore();
    }

    // Draw Balls
    balls.forEach((ball) => {
      if (ball.isPocketed) return;

      ctx.beginPath();
      ctx.arc(ball.position.x, ball.position.y, ball.radius, 0, Math.PI * 2);
      
      switch (ball.type) {
        case 'cue': ctx.fillStyle = 'white'; break;
        case 'black': ctx.fillStyle = 'black'; break;
        case 'red': ctx.fillStyle = 'red'; break;
        case 'yellow': ctx.fillStyle = 'yellow'; break;
      }
      
      ctx.fill();
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Add a little highlight
      ctx.beginPath();
      ctx.arc(ball.position.x - ball.radius * 0.3, ball.position.y - ball.radius * 0.3, ball.radius * 0.2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fill();
      ctx.closePath();
    });

    // Draw Power Meter
    if (isStriking) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(20, 20, 150, 25);
      const gradient = ctx.createLinearGradient(20, 0, 170, 0);
      gradient.addColorStop(0, 'green');
      gradient.addColorStop(0.5, 'yellow');
      gradient.addColorStop(1, 'red');
      ctx.fillStyle = gradient;
      ctx.fillRect(20, 20, (strikePower / 250) * 150, 25);
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.strokeRect(20, 20, 150, 25);
    }
  }, [balls, mousePos, isStriking, strikePower, cueBall, isMoving]);

  const resetGame = () => {
    setBalls(INITIAL_BALLS);
    setScores({ 1: 0, 2: 0 });
    setCurrentPlayer(1);
    setMessage('Player 1\'s Turn');
    setWasMoving(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#333', color: 'white', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ marginBottom: '10px', display: 'flex', gap: '20px' }}>
        <button 
          onClick={() => setGameMode('1P')} 
          style={{ padding: '8px 16px', backgroundColor: gameMode === '1P' ? '#d4af37' : '#555', border: 'none', borderRadius: '4px', cursor: 'pointer', color: 'white' }}
        >1 Player</button>
        <button 
          onClick={() => setGameMode('2P')} 
          style={{ padding: '8px 16px', backgroundColor: gameMode === '2P' ? '#d4af37' : '#555', border: 'none', borderRadius: '4px', cursor: 'pointer', color: 'white' }}
        >2 Players</button>
        <button 
          onClick={resetGame} 
          style={{ padding: '8px 16px', backgroundColor: '#800', border: 'none', borderRadius: '4px', cursor: 'pointer', color: 'white' }}
        >Reset Game</button>
      </div>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', width: TABLE_WIDTH }}>
        <div>Player 1: {scores[1]}</div>
        <div style={{ fontWeight: 'bold', color: '#d4af37' }}>{message}</div>
        <div>{gameMode === '1P' ? 'Computer' : 'Player 2'}: {scores[2]}</div>
      </div>
      <canvas
        ref={canvasRef}
        width={TABLE_WIDTH}
        height={TABLE_HEIGHT}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        style={{ border: '10px solid #4a2c0f', borderRadius: '5px', boxShadow: '0 0 20px rgba(0,0,0,0.5)', cursor: isMoving ? 'wait' : 'crosshair' }}
      />
      <div style={{ marginTop: '20px', fontSize: '14px', color: '#aaa' }}>
        Click and Hold to increase power. Release to shoot. Aim with mouse.
      </div>
    </div>
  );
};

export default GameCanvas;
