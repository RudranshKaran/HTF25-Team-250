/**
 * NotificationHub - Centralized notification management system
 * Replaces toast-only system with organized, categorized alert hub
 */

import React, { useState, useEffect, useCallback } from 'react';
import './NotificationHub.css';

const NotificationHub = ({ 
  isOpen, 
  onClose, 
  alerts, 
  onMarkAsRead, 
  onDismiss,
  onViewOnMap 
}) => {
  const [filter, setFilter] = useState({ severity: 'all', category: 'all' });
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState({
    crowd_density: true,
    metro_flow: true,
    combined: true,
    system: true
  });

  // Mark visible alerts as read when hub is opened
  useEffect(() => {
    if (isOpen && alerts.some(a => !a.read)) {
      const timer = setTimeout(() => {
        const unreadIds = alerts.filter(a => !a.read).map(a => a.id);
        if (unreadIds.length > 0) {
          onMarkAsRead(unreadIds);
        }
      }, 1000); // Mark as read after 1 second of viewing
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, alerts, onMarkAsRead]);

  // Filter alerts based on criteria
  const filteredAlerts = alerts.filter(alert => {
    // Severity filter
    if (filter.severity !== 'all' && alert.level !== filter.severity) {
      return false;
    }
    
    // Category filter
    if (filter.category !== 'all' && alert.category !== filter.category) {
      return false;
    }
    
    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        alert.message.toLowerCase().includes(search) ||
        alert.zone?.toLowerCase().includes(search) ||
        alert.recommendation?.toLowerCase().includes(search)
      );
    }
    
    return true;
  });

  // Group alerts by category
  const groupedAlerts = filteredAlerts.reduce((groups, alert) => {
    const category = alert.category || 'system';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(alert);
    return groups;
  }, {});

  // Category metadata
  const categoryInfo = {
    crowd_density: { icon: '👥', label: 'Crowd Density', color: '#ff6b6b' },
    metro_flow: { icon: '🚇', label: 'Metro Flow', color: '#4ecdc4' },
    combined: { icon: '⚠️', label: 'Combined Alerts', color: '#ff9f43' },
    system: { icon: '⚙️', label: 'System', color: '#95a5a6' }
  };

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const getSeverityBadge = (level) => {
    const badges = {
      critical: { icon: '🚨', label: 'CRITICAL', class: 'critical' },
      warning: { icon: '⚠️', label: 'WARNING', class: 'warning' },
      info: { icon: 'ℹ️', label: 'INFO', class: 'info' }
    };
    return badges[level] || badges.info;
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    // Less than 1 minute
    if (diff < 60000) {
      return 'Just now';
    }
    // Less than 1 hour
    if (diff < 3600000) {
      const mins = Math.floor(diff / 60000);
      return `${mins}m ago`;
    }
    // Less than 24 hours
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours}h ago`;
    }
    // Show time
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="notification-hub-backdrop" onClick={onClose} />
      
      {/* Hub Panel */}
      <div className={`notification-hub ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="hub-header">
          <h2>🔔 Notification Center</h2>
          <button className="hub-close" onClick={onClose}>✕</button>
        </div>

        {/* Filters */}
        <div className="hub-filters">
          <div className="filter-row">
            <div className="filter-group">
              <label>Severity:</label>
              <select 
                value={filter.severity} 
                onChange={(e) => setFilter({ ...filter, severity: e.target.value })}
              >
                <option value="all">All</option>
                <option value="critical">Critical</option>
                <option value="warning">Warning</option>
                <option value="info">Info</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Category:</label>
              <select 
                value={filter.category} 
                onChange={(e) => setFilter({ ...filter, category: e.target.value })}
              >
                <option value="all">All</option>
                <option value="crowd_density">Crowd Density</option>
                <option value="metro_flow">Metro Flow</option>
                <option value="combined">Combined</option>
                <option value="system">System</option>
              </select>
            </div>
          </div>
          
          <input
            type="text"
            className="search-input"
            placeholder="🔍 Search alerts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Alert Count */}
        <div className="hub-stats">
          <span>{filteredAlerts.length} alert{filteredAlerts.length !== 1 ? 's' : ''}</span>
          <span className="unread-count">
            {alerts.filter(a => !a.read).length} unread
          </span>
        </div>

        {/* Alerts by Category */}
        <div className="hub-content">
          {Object.keys(groupedAlerts).length === 0 ? (
            <div className="no-alerts">
              <p>✅ No alerts to display</p>
              <span>All systems operational</span>
            </div>
          ) : (
            Object.entries(groupedAlerts).map(([category, categoryAlerts]) => {
              const info = categoryInfo[category] || categoryInfo.system;
              const isExpanded = expandedCategories[category];
              
              return (
                <div key={category} className="category-section">
                  <div 
                    className="category-header"
                    onClick={() => toggleCategory(category)}
                  >
                    <span className="category-title">
                      <span className="category-icon">{info.icon}</span>
                      {info.label}
                      <span className="category-count">({categoryAlerts.length})</span>
                    </span>
                    <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
                  </div>
                  
                  {isExpanded && (
                    <div className="category-alerts">
                      {categoryAlerts.map((alert) => {
                        const severityBadge = getSeverityBadge(alert.level);
                        
                        return (
                          <div 
                            key={alert.id} 
                            className={`alert-item ${alert.level} ${alert.read ? 'read' : 'unread'}`}
                          >
                            {!alert.read && <div className="unread-indicator" />}
                            
                            <div className="alert-item-header">
                              <span className={`severity-badge ${severityBadge.class}`}>
                                {severityBadge.icon} {severityBadge.label}
                              </span>
                              <span className="alert-timestamp">
                                {formatTimestamp(alert.timestamp)}
                              </span>
                            </div>
                            
                            <div className="alert-zone">📍 {alert.zone}</div>
                            
                            <div className="alert-message">{alert.message}</div>
                            
                            {alert.recommendation && (
                              <div className="alert-recommendation">
                                💡 {alert.recommendation}
                              </div>
                            )}
                            
                            {alert.value && (
                              <div className="alert-value">
                                Value: <strong>{alert.value}</strong>
                                {alert.threshold && ` (Threshold: ${alert.threshold})`}
                              </div>
                            )}
                            
                            {/* Quick Actions */}
                            <div className="alert-actions">
                              {alert.location && (
                                <button 
                                  className="action-btn view-map"
                                  onClick={() => onViewOnMap(alert)}
                                  title="View on map"
                                >
                                  🗺️ View on Map
                                </button>
                              )}
                              <button 
                                className="action-btn dismiss"
                                onClick={() => onDismiss(alert.id)}
                                title="Dismiss alert"
                              >
                                ✕ Dismiss
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationHub;

