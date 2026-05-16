import React, { useState, useEffect, useCallback } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { PuzzleManager } from '../utils/puzzleManager';
import type { Puzzle } from '../types';
import confetti from 'canvas-confetti';
import { Howl } from 'howler';

// Sounds
const moveSound = new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'] });
const successSound = new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3'] });
const failSound = new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3'] });

const ChessGame: React.FC = () => {
  const [game, setGame] = useState(new Chess());
  const [currentPuzzle, setCurrentPuzzle] = useState<Puzzle | null>(null);
  const [moveIndex, setMoveIndex] = useState(0);
  const [status, setStatus] = useState<'playing' | 'solved' | 'failed'>('playing');
  const [solutionMoves, setSolutionMoves] = useState<string[]>([]);

  const loadPuzzle = useCallback(() => {
    const puzzle = PuzzleManager.getRandomPuzzle();
    const newGame = new Chess(puzzle.FEN);
    const moves = puzzle.Moves.split(' ');
    
    // Make the first move (opponent)
    newGame.move(moves[0]);
    
    setCurrentPuzzle(puzzle);
    setSolutionMoves(moves);
    setGame(newGame);
    setMoveIndex(1); // Next move is user's (index 1)
    setStatus('playing');
  }, []);

  useEffect(() => {
    loadPuzzle();
  }, [loadPuzzle]);

  function makeAMove(move: any) {
    try {
      const result = game.move(move);
      if (result) {
        setGame(new Chess(game.fen()));
        moveSound.play();
        return result;
      }
    } catch (e) {
      return null;
    }
    return null;
  }

  function onDrop({ sourceSquare, targetSquare }: { sourceSquare: string, targetSquare: string | null }) {
    if (status !== 'playing' || !targetSquare) return false;

    const moveAttempt = {
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q', // always promote to queen for simplicity in a puzzler
    };

    // Check if this move matches the solution
    const expectedMove = solutionMoves[moveIndex];
    const gameCopy = new Chess(game.fen());
    const result = gameCopy.move(moveAttempt);

    if (result && result.lan === expectedMove) {
      // Correct move!
      makeAMove(moveAttempt);
      
      const nextMoveIndex = moveIndex + 1;
      if (nextMoveIndex >= solutionMoves.length) {
        // Puzzle solved!
        setStatus('solved');
        successSound.play();
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 }
        });
      } else {
        // Opponent's turn
        setTimeout(() => {
          makeAMove(solutionMoves[nextMoveIndex]);
          setMoveIndex(nextMoveIndex + 1);
        }, 500);
      }
      return true;
    } else {
      // Wrong move
      failSound.play();
      // We don't make the move on the board if it's wrong
      return false;
    }
  }

  const handleGiveUp = () => {
    if (status === 'playing' && currentPuzzle) {
      // Show the next correct move
      const nextMove = solutionMoves[moveIndex];
      makeAMove(nextMove);
      setStatus('failed');
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      gap: '15px', 
      padding: '20px',
      backgroundColor: 'white',
      borderRadius: '24px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
      margin: '20px'
    }}>
      <h1 style={{ 
        color: '#ff4081', 
        fontSize: '2.5rem', 
        margin: '0',
        textShadow: '2px 2px #fce4ec'
      }}>
        Chess Puzzle! 🧩
      </h1>
      
      <p style={{ fontSize: '1.2rem', color: '#546e7a', margin: '0' }}>
        Find the best move! Can you win? 🏆
      </p>

      <div style={{ 
        width: '400px', 
        maxWidth: '90vw', 
        border: '12px solid #ffeb3b', 
        borderRadius: '16px', 
        boxShadow: '0 8px 0 #fdd835',
        marginBottom: '10px'
      }}>
        <Chessboard 
          options={{
            position: game.fen(),
            onPieceDrop: onDrop,
            boardOrientation: currentPuzzle?.FEN.split(' ')[1] === 'w' ? 'black' : 'white',
            boardStyle: {
              borderRadius: '4px',
            },
            darkSquareStyle: { backgroundColor: '#779556' },
            lightSquareStyle: { backgroundColor: '#ebecd0' }
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
        {status === 'playing' ? (
          <button 
            onClick={handleGiveUp}
            style={{
              padding: '12px 24px',
              fontSize: '1.3rem',
              backgroundColor: '#ff9800',
              color: 'white',
              border: 'none',
              borderRadius: '50px',
              cursor: 'pointer',
              fontWeight: 'bold',
              boxShadow: '0 4px 0 #e65100'
            }}
          >
            I give up! 🤔
          </button>
        ) : (
          <button 
            onClick={loadPuzzle}
            style={{
              padding: '12px 24px',
              fontSize: '1.3rem',
              backgroundColor: '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: '50px',
              cursor: 'pointer',
              fontWeight: 'bold',
              boxShadow: '0 4px 0 #1b5e20'
            }}
          >
            Next Puzzle! 🚀
          </button>
        )}
      </div>

      <div style={{ height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {status === 'solved' && <p style={{ color: '#4caf50', fontWeight: 'bold', fontSize: '1.5rem', margin: 0 }}>You did it! Great job! 🌟</p>}
        {status === 'failed' && <p style={{ color: '#f44336', fontWeight: 'bold', fontSize: '1.5rem', margin: 0 }}>Keep practicing! 💪</p>}
      </div>
      
      <div style={{ fontSize: '1rem', color: '#90a4ae', marginTop: '5px' }}>
        Puzzle Rating: {currentPuzzle?.Rating}
      </div>
    </div>
  );
};

export default ChessGame;
