import { useState, useEffect, useCallback, useRef } from 'react';

export type GameState = 'idle' | 'playing' | 'finished';

export interface Contestant {
  id: string;
  name: string;
  score: number;
  isAI: boolean;
  biteSpeed?: number; // MS per hotdog for AI
}

export const useGame = () => {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [timer, setTimer] = useState(60);
  const [contestants, setContestants] = useState<Contestant[]>([
    { id: 'user', name: 'You', score: 0, isAI: false },
    { id: 'ai1', name: 'Joey Chest-Nut', score: 0, isAI: true, biteSpeed: 1200 },
    { id: 'ai2', name: 'Kobayashi-ish', score: 0, isAI: true, biteSpeed: 1500 },
    { id: 'ai3', name: 'Hungry Harry', score: 0, isAI: true, biteSpeed: 2000 },
  ]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const aiIntervals = useRef<{ [key: string]: NodeJS.Timeout }>({});

  const startGame = useCallback(() => {
    setGameState('playing');
    setTimer(60);
    setContestants(prev => prev.map(c => ({ ...c, score: 0 })));
  }, []);

  const stopGame = useCallback(() => {
    setGameState('finished');
    if (timerRef.current) clearInterval(timerRef.current);
    Object.values(aiIntervals.current).forEach(clearInterval);
    aiIntervals.current = {};
  }, []);

  const eat = useCallback((id: string) => {
    if (gameState !== 'playing') return;
    setContestants(prev => prev.map(c => 
      c.id === id ? { ...c, score: c.score + 1 } : c
    ));
  }, [gameState]);

  // Game Timer
  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            stopGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, stopGame]);

  // AI Logic
  useEffect(() => {
    if (gameState === 'playing') {
      contestants.filter(c => c.isAI).forEach(ai => {
        aiIntervals.current[ai.id] = setInterval(() => {
          // Randomize speed slightly for "goofiness"
          const variation = Math.random() * 400 - 200;
          eat(ai.id);
        }, (ai.biteSpeed || 1500) + (Math.random() * 200 - 100));
      });
    }
    return () => {
      Object.values(aiIntervals.current).forEach(clearInterval);
      aiIntervals.current = {};
    };
  }, [gameState, contestants.filter(c => c.isAI).length]); // Re-run if AI count changes (unlikely)

  return {
    gameState,
    timer,
    contestants,
    startGame,
    userEat: () => eat('user'),
    winner: gameState === 'finished' ? [...contestants].sort((a, b) => b.score - a.score)[0] : null
  };
};
