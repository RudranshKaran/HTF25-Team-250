import React, { useState } from 'react';
import AlertHistory from '../AlertHistory';
import './AlertsMonitoringView.css';

const AlertsMonitoringView = ({ alerts, allNotifications }) => {
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  // Get active critical alerts
  const activeAlerts = alerts || [];
  const criticalCount = activeAlerts.filter(a => a.level === 'critical').length;
  const warningCount = activeAlerts.filter(a => a.level === 'warning').length;

  // Get all notifications with filters
  const notifications = allNotifications || [];
  const filteredNotifications = notifications.filter(notif => {
    const levelMatch = filterLevel === 'all' || notif.level === filterLevel;
    const categoryMatch = filterCategory === 'all' || notif.category === filterCategory;
    return levelMatch && categoryMatch;
  });

  // Calculate statistics
  const totalAlerts = notifications.length;
  const criticalTotal = notifications.filter(n => n.level === 'critical').length;
  const warningTotal = notifications.filter(n => n.level === 'warning').length;
  const infoTotal = notifications.filter(n => n.level === 'info').length;

  return (
    <div className="alerts-monitoring-view">
      {/* Active Alerts Banner */}
      {activeAlerts.length > 0 && (
        <div className="active-alerts-banner">
          <div className="banner-header">
            <h3>🚨 Active Alerts</h3>
            <div className="alert-counts">
              {criticalCount > 0 && (
                <span className="alert-badge critical">{criticalCount} Critical</span>
              )}
              {warningCount > 0 && (
                <span className="alert-badge warning">{warningCount} Warning</span>
              )}
            </div>
          </div>
          <div className="active-alerts-list">
            {activeAlerts.slice(0, 3).map((alert, idx) => (
              <div key={idx} className={`active-alert-item level-${alert.level}`}>
                <span className="alert-icon">
                  {alert.level === 'critical' ? '🚨' : '⚠️'}
                </span>
                <span className="alert-message">{alert.message}</span>
                <span className="alert-time">
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="alerts-stats">
        <div className="stat-card total">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <span className="stat-number">{totalAlerts}</span>
            <span className="stat-label">Total Alerts</span>
          </div>
        </div>

        <div className="stat-card critical">
          <div className="stat-icon">🚨</div>
          <div className="stat-content">
            <span className="stat-number">{criticalTotal}</span>
            <span className="stat-label">Critical</span>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <span className="stat-number">{warningTotal}</span>
            <span className="stat-label">Warnings</span>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">ℹ️</div>
          <div className="stat-content">
            <span className="stat-number">{infoTotal}</span>
            <span className="stat-label">Info</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="alerts-filters">
        <div className="filter-group">
          <label>Severity:</label>
          <select value={filterLevel} onChange={(e) => setFilterLevel(e.target.value)}>
            <option value="all">All Levels</option>
            <option value="critical">Critical Only</option>
            <option value="warning">Warning Only</option>
            <option value="info">Info Only</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Category:</label>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="all">All Categories</option>
            <option value="crowd_density">Crowd Density</option>
            <option value="metro_flow">Metro Flow</option>
            <option value="combined">Combined Alerts</option>
          </select>
        </div>

        <div className="filter-info">
          Showing {filteredNotifications.length} of {totalAlerts} alerts
        </div>
      </div>

      {/* Alert History */}
      <div className="alerts-history-section">
        <AlertHistory />
      </div>
    </div>
  );
};

export default AlertsMonitoringView;

