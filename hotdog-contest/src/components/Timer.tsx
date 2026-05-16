import React from 'react';
import '../styles/Timer.css';

interface TimerProps {
  seconds: number;
}

const Timer: React.FC<TimerProps> = ({ seconds }) => {
  const isUrgent = seconds <= 10;
  
  return (
    <div className={`timer-container ${isUrgent ? 'urgent' : ''}`}>
      <div className="timer-label">TIME LEFT</div>
      <div className="timer-value">{seconds}s</div>
    </div>
  );
};

export default Timer;
