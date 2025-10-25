/**
 * ModeToggle Component
 * Switches between Live Mode (real/simulated data) and Demo Mode (mock data)
 */

import { useState, useEffect } from 'react';
import './ModeToggle.css';

function ModeToggle({ onModeChange }) {
  const [isLiveMode, setIsLiveMode] = useState(true);

  const toggleMode = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/control/demo-mode', {
        method: 'POST'
      });
      const data = await response.json();
      
      // Demo mode in backend is opposite of live mode in frontend
      setIsLiveMode(!data.demo_mode);
      
      if (onModeChange) {
        onModeChange(!data.demo_mode);
      }
    } catch (error) {
      console.error('Failed to toggle mode:', error);
    }
  };

  return (
    <div className="mode-toggle-container">
      <div className={`mode-toggle ${isLiveMode ? 'live' : 'demo'}`} onClick={toggleMode}>
        <div className="mode-toggle-track">
          <div className="mode-toggle-thumb">
            {isLiveMode ? '🔴' : '🎬'}
          </div>
        </div>
        <span className="mode-label">
          {isLiveMode ? 'LIVE MODE' : 'DEMO MODE'}
        </span>
      </div>
      <div className="mode-description">
        {isLiveMode 
          ? 'Real-time data from sensors and APIs' 
          : 'Mock dataset for offline demonstration'}
      </div>
    </div>
  );
}

export default ModeToggle;
