import React, { useState, useEffect, useCallback } from 'react';
import './NotificationCenter.css';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);

  // Add notification
  const addNotification = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    const notification = { id, message, type, duration };
    
    setNotifications(prev => [...prev, notification]);

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Expose methods globally
  useEffect(() => {
    window.showNotification = addNotification;
    window.hideNotification = removeNotification;

    return () => {
      delete window.showNotification;
      delete window.hideNotification;
    };
  }, [addNotification, removeNotification]);

  const getIcon = (type) => {
    switch (type) {
      case 'success': return '✓';
      case 'error': return '✕';
      case 'warning': return '⚠';
      case 'info': return 'ℹ';
      default: return '•';
    }
  };

  return (
    <div className="notification-center">
      {notifications.map((notif) => (
        <div key={notif.id} className={`notification notification-${notif.type}`}>
          <span className="notification-icon">{getIcon(notif.type)}</span>
          <span className="notification-message">{notif.message}</span>
          <button
            className="notification-close"
            onClick={() => removeNotification(notif.id)}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};

// Helper functions for external use
export const notify = {
  success: (message, duration) => window.showNotification?.(message, 'success', duration),
  error: (message, duration) => window.showNotification?.(message, 'error', duration),
  warning: (message, duration) => window.showNotification?.(message, 'warning', duration),
  info: (message, duration) => window.showNotification?.(message, 'info', duration),
};

export default NotificationCenter;

