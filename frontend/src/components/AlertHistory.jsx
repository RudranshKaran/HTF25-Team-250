/**
 * AlertHistory - Historical alert log panel
 * Shows past alerts with filtering and clear options
 */

import { useState, useEffect } from 'react';
import './AlertHistory.css';

function AlertHistory() {
  const [alertHistory, setAlertHistory] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [filter, setFilter] = useState('all'); // all, warning, critical

  // Fetch alert history from backend
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/history');
        const data = await response.json();
        setAlertHistory(data.alert_history || []);
      } catch (error) {
        console.error('Failed to fetch alert history:', error);
      }
    };

    // Fetch initially and then every 30 seconds
    fetchHistory();
    const interval = setInterval(fetchHistory, 30000);

    return () => clearInterval(interval);
  }, []);

  // Filter alerts
  const filteredAlerts = filter === 'all' 
    ? alertHistory 
    : alertHistory.filter(alert => alert.level === filter);

  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="alert-history-panel">
      <div className="history-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="history-title">
          📜 Alert History ({alertHistory.length})
        </div>
        <div className="history-actions">
          {!isExpanded && alertHistory.length > 0 && (
            <span className="latest-alert-preview">
              Last: {alertHistory[alertHistory.length - 1]?.level?.toUpperCase()}
            </span>
          )}
          <span className="history-toggle">{isExpanded ? '▼' : '▲'}</span>
        </div>
      </div>

      {isExpanded && (
        <div className="history-content">
          {/* Filter Buttons */}
          <div className="history-filters">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({alertHistory.length})
            </button>
            <button 
              className={`filter-btn warning ${filter === 'warning' ? 'active' : ''}`}
              onClick={() => setFilter('warning')}
            >
              ⚠️  Warning ({alertHistory.filter(a => a.level === 'warning').length})
            </button>
            <button 
              className={`filter-btn critical ${filter === 'critical' ? 'active' : ''}`}
              onClick={() => setFilter('critical')}
            >
              🚨 Critical ({alertHistory.filter(a => a.level === 'critical').length})
            </button>
          </div>

          {/* Alert List */}
          <div className="history-list">
            {filteredAlerts.length > 0 ? (
              filteredAlerts.map((alert, index) => (
                <div key={index} className={`history-item ${alert.level}`}>
                  <div className="history-item-icon">
                    {alert.level === 'critical' ? '🚨' : '⚠️'}
                  </div>
                  <div className="history-item-content">
                    <div className="history-item-header">
                      <span className="history-item-level">
                        {alert.level?.toUpperCase()}
                      </span>
                      <span className="history-item-category">
                        {alert.category?.replace(/_/g, ' ')}
                      </span>
                      <span className="history-item-time">
                        {formatTime(alert.timestamp)}
                      </span>
                    </div>
                    <div className="history-item-zone">{alert.zone}</div>
                    <div className="history-item-message">{alert.message}</div>
                    {alert.value && (
                      <div className="history-item-value">
                        Value: {typeof alert.value === 'number' ? alert.value : alert.value}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-alerts">
                {filter === 'all' 
                  ? 'No alerts recorded yet. System monitoring active.' 
                  : `No ${filter} alerts found.`}
              </div>
            )}
          </div>

          {alertHistory.length > 0 && (
            <div className="history-footer">
              <span className="history-info">
                Showing last {alertHistory.length} alert{alertHistory.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AlertHistory;

