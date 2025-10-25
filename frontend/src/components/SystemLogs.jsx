/**
 * SystemLogs Component
 * Displays last 5 system events in a terminal-like panel
 * Bottom-right fixed position
 */

import { useState, useEffect, useRef } from 'react';
import './SystemLogs.css';

function SystemLogs({ embedded = false }) {
  const [logs, setLogs] = useState([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const logsEndRef = useRef(null);

  // Function to add log entry
  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const newLog = {
      id: Date.now(),
      timestamp,
      message,
      type
    };

    setLogs(prevLogs => {
      const updatedLogs = [...prevLogs, newLog];
      // Keep only last 50 logs in memory, but display last 5
      return updatedLogs.slice(-50);
    });
  };

  // Expose addLog function globally for other components to use
  useEffect(() => {
    window.addSystemLog = addLog;

    // Add initial log
    addLog('System initialized', 'success');

    return () => {
      delete window.addSystemLog;
    };
  }, []);

  // Auto-scroll to bottom when new log added
  useEffect(() => {
    if (logsEndRef.current && !isCollapsed) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isCollapsed]);

  // Listen for WebSocket events
  useEffect(() => {
    const handleWSMessage = () => {
      addLog('WebSocket message received', 'info');
    };

    const handleWSConnect = () => {
      addLog('WebSocket connected', 'success');
    };

    const handleWSDisconnect = () => {
      addLog('WebSocket disconnected', 'error');
    };

    // These would be triggered by App.jsx
    window.addEventListener('ws-message', handleWSMessage);
    window.addEventListener('ws-connect', handleWSConnect);
    window.addEventListener('ws-disconnect', handleWSDisconnect);

    return () => {
      window.removeEventListener('ws-message', handleWSMessage);
      window.removeEventListener('ws-connect', handleWSConnect);
      window.removeEventListener('ws-disconnect', handleWSDisconnect);
    };
  }, []);

  const getLogIcon = (type) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✗';
      case 'warning':
        return '⚠';
      default:
        return '•';
    }
  };

  const displayedLogs = logs.slice(-5); // Show last 5 logs

  return (
    <div className={`system-logs ${isCollapsed ? 'collapsed' : ''} ${embedded ? 'embedded' : ''}`}>
      <div 
        className="system-logs-header" 
        onClick={() => !embedded && setIsCollapsed(!isCollapsed)}
        role="button"
      >
        <span className="system-logs-title">⚙️ System Logs</span>
        {!embedded && (
          <span className="system-logs-toggle">{isCollapsed ? '▲' : '▼'}</span>
        )}
      </div>
      
      {(!isCollapsed || embedded) && (
        <div className="system-logs-content">
          {displayedLogs.length === 0 ? (
            <div className="system-logs-empty">No events yet...</div>
          ) : (
            displayedLogs.map(log => (
              <div key={log.id} className={`log-entry log-${log.type}`}>
                <span className="log-icon">{getLogIcon(log.type)}</span>
                <span className="log-timestamp">[{log.timestamp}]</span>
                <span className="log-message">{log.message}</span>
              </div>
            ))
          )}
          <div ref={logsEndRef} />
        </div>
      )}
    </div>
  );
}

export default SystemLogs;
