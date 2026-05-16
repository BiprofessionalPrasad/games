import { useEffect } from 'react';
import { useGame } from './hooks/useGame';
import Boardwalk from './components/Boardwalk';
import Contestant from './components/Contestant';
import Timer from './components/Timer';
import './App.css';

function App() {
  const { gameState, timer, contestants, startGame, userEat, winner } = useGame();

  // Listen for Spacebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        userEat();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [userEat]);

  return (
    <div className="game-app" onClick={userEat}>
      <Boardwalk />
      
      <div className="ui-layer">
        <header>
          <h1 className="game-title">🌭 BOARDWALK EAT-OFF 🌭</h1>
          <Timer seconds={timer} />
        </header>

        <main className="contestants-area">
          {contestants.map(c => (
            <Contestant 
              key={c.id}
              name={c.name}
              score={c.score}
              isUser={!c.isAI}
              isWinner={gameState === 'finished' && winner?.id === c.id}
            />
          ))}
        </main>

        {gameState === 'idle' && (
          <div className="overlay">
            <div className="modal">
              <h2>READY TO MUNCH?</h2>
              <p>Eat the most hotdogs in 60 seconds!</p>
              <p>Controls: <b>SPACEBAR</b> or <b>CLICK</b> like crazy!</p>
              <button className="start-btn" onClick={(e) => { e.stopPropagation(); startGame(); }}>
                START CONTEST!
              </button>
            </div>
          </div>
        )}

        {gameState === 'finished' && (
          <div className="overlay">
            <div className="modal result-modal">
              <h2>CONTEST OVER!</h2>
              <div className="winner-announcement">
                {winner?.id === 'user' ? "🏆 YOU WON! 🏆" : `😭 ${winner?.name} WON! 😭`}
              </div>
              <div className="leaderboard">
                {contestants.sort((a, b) => b.score - a.score).map((c, i) => (
                  <div key={c.id} className="leaderboard-entry">
                    <span>{i + 1}. {c.name}</span>
                    <span>{c.score} hotdogs</span>
                  </div>
                ))}
              </div>
              <button className="start-btn" onClick={(e) => { e.stopPropagation(); startGame(); }}>
                PLAY AGAIN
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="controls-hint">
        PRESS SPACE OR CLICK TO EAT!
      </div>
    </div>
  );
}

export default App;
