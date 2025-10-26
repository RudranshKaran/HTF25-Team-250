/**
 * NotificationBell - Bell icon with badge counter for header
 * Toggles NotificationHub visibility
 */

import React from 'react';
import './NotificationBell.css';

const NotificationBell = ({ unreadCount, onClick, hasNewCritical }) => {
  return (
    <button 
      className={`notification-bell ${hasNewCritical ? 'critical-pulse' : ''}`}
      onClick={onClick}
      title={`${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`}
    >
      <span className="bell-icon">🔔</span>
      {unreadCount > 0 && (
        <span className={`bell-badge ${hasNewCritical ? 'critical' : ''}`}>
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
};

export default NotificationBell;

