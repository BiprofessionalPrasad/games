import React, { useEffect, useState } from 'react';
import '../styles/Contestant.css';

interface ContestantProps {
  name: string;
  score: number;
  isUser?: boolean;
  isWinner?: boolean;
}

const Contestant: React.FC<ContestantProps> = ({ name, score, isUser, isWinner }) => {
  const [isEating, setIsEating] = useState(false);

  useEffect(() => {
    if (score > 0) {
      setIsEating(true);
      const timer = setTimeout(() => setIsEating(false), 150);
      return () => clearTimeout(timer);
    }
  }, [score]);

  // Goofy: change skin color based on score (getting "fuller")
  const hue = Math.max(0, 50 - score * 2); // Goes from healthy to "I'm gonna burst" red
  const scale = 1 + (score * 0.005); // Grows slightly larger

  return (
    <div className={`contestant-wrapper ${isWinner ? 'winner-glow' : ''}`}>
      <div className="score-bubble">{score}</div>
      
      <div 
        className={`character ${isEating ? 'eating-bob' : ''}`}
        style={{ 
          filter: `hue-rotate(${hue}deg)`,
          transform: `scale(${scale})`
        }}
      >
        <div className="hair"></div>
        <div className="face">
          <div className="eye left-eye"></div>
          <div className="eye right-eye"></div>
          <div className={`mouth ${isEating ? 'mouth-open' : 'mouth-closed'}`}>
            <div className="hotdog-bit">🌭</div>
          </div>
        </div>
        <div className="body">
          {isUser && <div className="user-tag">YOU</div>}
        </div>
      </div>
      
      <div className="name-tag">{name}</div>
    </div>
  );
};

export default Contestant;
