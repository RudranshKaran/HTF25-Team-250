import React, { useState } from 'react';
import './QuickActions.css';
import { notify } from './NotificationCenter';
import audioManager from '../utils/audioManager';

const QuickActions = ({ onAction }) => {
  const [isMinimized, setIsMinimized] = useState(false);

  const handleAction = async (action, label) => {
    audioManager.playClick();
    
    try {
      let endpoint = '';
      let method = 'POST';
      
      switch (action) {
        case 'pause':
          endpoint = 'http://localhost:8000/api/control/toggle';
          break;
        case 'reset-history':
          endpoint = 'http://localhost:8000/api/control/reset-history';
          break;
        case 'export':
          // Handle export differently
          const response = await fetch('http://localhost:8000/api/export');
          const data = await response.json();
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `crowd-safety-export-${Date.now()}.json`;
          a.click();
          URL.revokeObjectURL(url);
          notify.success('Data exported successfully');
          audioManager.playSuccess();
          return;
        case 'demo':
          endpoint = 'http://localhost:8000/api/control/demo-mode';
          break;
        case 'sound':
          // Toggle sound
          const enabled = audioManager.isEnabled();
          audioManager.setEnabled(!enabled);
          notify.info(`Sound ${!enabled ? 'enabled' : 'disabled'}`);
          return;
        case 'refresh':
          // Refresh data
          onAction?.('refresh');
          notify.info('Refreshing data...');
          return;
        default:
          return;
      }

      if (endpoint) {
        await fetch(endpoint, { method });
        notify.success(`${label} completed`);
        audioManager.playSuccess();
        onAction?.(action);
      }
    } catch (error) {
      notify.error(`Failed: ${label}`);
      console.error(error);
    }
  };

  return (
    <div className={`quick-actions ${isMinimized ? 'minimized' : ''}`}>
      <button 
        className="quick-actions-toggle"
        onClick={() => setIsMinimized(!isMinimized)}
        title="Toggle Quick Actions"
      >
        ⚡
      </button>

      {!isMinimized && (
        <div className="quick-actions-menu">
          <button 
            className="action-btn action-pause"
            onClick={() => handleAction('pause', 'Pause/Resume')}
            title="Pause/Resume (Space)"
          >
            ⏯️
            <span>Pause</span>
          </button>

          <button 
            className="action-btn action-demo"
            onClick={() => handleAction('demo', 'Demo Mode')}
            title="Toggle Demo Mode (D)"
          >
            🎬
            <span>Demo</span>
          </button>

          <button 
            className="action-btn action-export"
            onClick={() => handleAction('export', 'Export')}
            title="Export Data (E)"
          >
            💾
            <span>Export</span>
          </button>

          <button 
            className="action-btn action-sound"
            onClick={() => handleAction('sound', 'Sound')}
            title="Toggle Sound (M)"
          >
            🔊
            <span>Sound</span>
          </button>

          <button 
            className="action-btn action-refresh"
            onClick={() => handleAction('refresh', 'Refresh')}
            title="Refresh Data (R)"
          >
            🔄
            <span>Refresh</span>
          </button>

          <button 
            className="action-btn action-clear"
            onClick={() => handleAction('reset-history', 'Clear History')}
            title="Clear History"
          >
            🗑️
            <span>Clear</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default QuickActions;

