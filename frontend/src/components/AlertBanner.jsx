/**
 * AlertBanner - Displays critical alerts and warnings
 * Stacks multiple alerts and allows dismissal
 */

import { useState, useEffect } from 'react';
import './AlertBanner.css';

function AlertBanner({ alerts }) {
  const [visibleAlerts, setVisibleAlerts] = useState([]);

  useEffect(() => {
    // Add new alerts to visible list with unique IDs
    if (alerts && alerts.length > 0) {
      const newAlerts = alerts.map((alert, idx) => ({
        ...alert,
        id: `${Date.now()}-${idx}`,
        timestamp: alert.timestamp || new Date().toISOString()
      }));
      
      // Add to visible alerts (limit to 5 most recent)
      setVisibleAlerts(prev => {
        const updated = [...newAlerts, ...prev].slice(0, 5);
        return updated;
      });
    }
  }, [alerts]);

  const dismissAlert = (alertId) => {
    setVisibleAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const dismissAll = () => {
    setVisibleAlerts([]);
  };

  if (visibleAlerts.length === 0) return null;

  return (
    <div className="alert-container">
      <div className="alert-header">
        <span>⚠️ Active Alerts ({visibleAlerts.length})</span>
        <button className="alert-dismiss-all" onClick={dismissAll}>
          Dismiss All
        </button>
      </div>
      
      <div className="alert-list">
        {visibleAlerts.map((alert) => (
          <div 
            key={alert.id} 
            className={`alert-banner ${alert.level}`}
          >
            <div className="alert-icon">
              {alert.level === 'critical' ? '🚨' : '⚠️'}
            </div>
            
            <div className="alert-content">
              <div className="alert-title">
                <span className="alert-level">{alert.level.toUpperCase()}</span>
                <span className="alert-category">{alert.category.replace(/_/g, ' ')}</span>
              </div>
              
              <div className="alert-zone">{alert.zone}</div>
              
              <div className="alert-message">{alert.message}</div>
              
              {alert.recommendation && (
                <div className="alert-recommendation">
                  💡 {alert.recommendation}
                </div>
              )}
              
              <div className="alert-time">
                {new Date(alert.timestamp).toLocaleTimeString()}
              </div>
            </div>
            
            <button 
              className="alert-dismiss" 
              onClick={() => dismissAlert(alert.id)}
              aria-label="Dismiss alert"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AlertBanner;

