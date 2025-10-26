/**
 * AlertBanner - Displays only CRITICAL alerts as single-line banner
 * Enhanced version: Shows only most recent critical alert
 */

import { useState, useEffect } from 'react';
import './AlertBanner.css';

function AlertBanner({ alerts, onDismiss }) {
  const [currentAlert, setCurrentAlert] = useState(null);

  useEffect(() => {
    // Show only the most recent CRITICAL alert
    if (alerts && alerts.length > 0) {
      // Filter for critical alerts only
      const criticalAlerts = alerts.filter(alert => alert.level === 'critical');
      
      if (criticalAlerts.length > 0) {
        // Get the most recent one
        const mostRecent = criticalAlerts[0];
        const newAlert = {
          ...mostRecent,
          id: mostRecent.id || `${Date.now()}`,
          timestamp: mostRecent.timestamp || new Date().toISOString()
        };
        
        // Only update if it's a different alert
        if (!currentAlert || currentAlert.id !== newAlert.id) {
          setCurrentAlert(newAlert);
          
          // Auto-dismiss after 15 seconds
          const timer = setTimeout(() => {
            setCurrentAlert(null);
          }, 15000);
          
          return () => clearTimeout(timer);
        }
      } else {
        setCurrentAlert(null);
      }
    } else {
      setCurrentAlert(null);
    }
  }, [alerts, currentAlert]);

  const handleDismiss = () => {
    if (currentAlert && onDismiss) {
      onDismiss(currentAlert.id);
    }
    setCurrentAlert(null);
  };

  if (!currentAlert) return null;

  return (
    <div className="alert-container">
      <div className={`alert-banner critical-single`}>
        <div className="alert-icon-pulse">
          🚨
        </div>
        
        <div className="alert-content-inline">
          <span className="alert-level-badge">CRITICAL</span>
          <span className="alert-zone-inline">📍 {currentAlert.zone}</span>
          <span className="alert-message-inline">{currentAlert.message}</span>
        </div>
        
        <button 
          className="alert-dismiss-btn" 
          onClick={handleDismiss}
          aria-label="Dismiss critical alert"
          title="Dismiss alert"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export default AlertBanner;

