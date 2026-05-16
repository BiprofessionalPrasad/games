import React from 'react';
import '../styles/Boardwalk.css';

const Boardwalk: React.FC = () => {
  return (
    <div className="boardwalk-container">
      <div className="sky">
        <div className="cloud cloud-1"></div>
        <div className="cloud cloud-2"></div>
        <div className="sun"></div>
      </div>
      
      <div className="sea">
        <div className="wave wave-1"></div>
        <div className="wave wave-2"></div>
      </div>

      <div className="ferris-wheel">
        <div className="wheel-rim"></div>
        <div className="spoke" style={{ transform: 'rotate(0deg)' }}></div>
        <div className="spoke" style={{ transform: 'rotate(45deg)' }}></div>
        <div className="spoke" style={{ transform: 'rotate(90deg)' }}></div>
        <div className="spoke" style={{ transform: 'rotate(135deg)' }}></div>
        <div className="pod" style={{ '--angle': '0deg' } as React.CSSProperties}></div>
        <div className="pod" style={{ '--angle': '45deg' } as React.CSSProperties}></div>
        <div className="pod" style={{ '--angle': '90deg' } as React.CSSProperties}></div>
        <div className="pod" style={{ '--angle': '135deg' } as React.CSSProperties}></div>
        <div className="pod" style={{ '--angle': '180deg' } as React.CSSProperties}></div>
        <div className="pod" style={{ '--angle': '225deg' } as React.CSSProperties}></div>
        <div className="pod" style={{ '--angle': '270deg' } as React.CSSProperties}></div>
        <div className="pod" style={{ '--angle': '315deg' } as React.CSSProperties}></div>
      </div>

      <div className="seagull gulls-1">V</div>
      <div className="seagull gulls-2">V</div>

      <div className="boardwalk-floor">
        <div className="plank"></div>
        <div className="plank"></div>
        <div className="plank"></div>
        <div className="plank"></div>
        <div className="plank"></div>
      </div>
    </div>
  );
};

export default Boardwalk;
