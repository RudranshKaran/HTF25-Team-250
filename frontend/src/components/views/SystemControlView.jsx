import React, { useState } from 'react';
import ControlPanel from '../ControlPanel';
import SystemLogs from '../SystemLogs';
import './SystemControlView.css';

const SystemControlView = ({ 
  onSettingsUpdate, 
  connectionStatus, 
  onExport, 
  onTestMessage 
}) => {
  const [activeTab, setActiveTab] = useState('settings');

  return (
    <div className="system-control-view">
      {/* Tab Navigation */}
      <div className="control-tabs">
        <button
          className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          ⚙️ Settings
        </button>
        <button
          className={`tab-button ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          📋 Logs & Export
        </button>
        <button
          className={`tab-button ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          🔔 Notifications
        </button>
        <button
          className={`tab-button ${activeTab === 'system' ? 'active' : ''}`}
          onClick={() => setActiveTab('system')}
        >
          🖥️ System Health
        </button>
      </div>

      {/* Tab Content */}
      <div className="control-content">
        {activeTab === 'settings' && (
          <div className="control-section">
            <h2 className="section-heading">⚙️ System Settings</h2>
            <p className="section-description">
              Configure alert thresholds, display options, and system behavior
            </p>
            <ControlPanel onSettingsUpdate={onSettingsUpdate} />
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="control-section">
            <h2 className="section-heading">📋 System Logs & Data Export</h2>
            <p className="section-description">
              View system logs and export historical data for analysis
            </p>
            
            {/* Export Section */}
            <div className="export-section">
              <h3>📥 Data Export</h3>
              <div className="export-actions">
                <button 
                  className="export-btn primary"
                  onClick={onExport}
                  disabled={connectionStatus !== 'connected'}
                >
                  <span>📥</span>
                  <span>Export All Data</span>
                </button>
                <button 
                  className="export-btn secondary"
                  onClick={onTestMessage}
                  disabled={connectionStatus !== 'connected'}
                >
                  <span>🔔</span>
                  <span>Send Test Message</span>
                </button>
              </div>
            </div>

            {/* System Logs */}
            <div className="logs-container">
              <SystemLogs />
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="control-section">
            <h2 className="section-heading">🔔 Notification Preferences</h2>
            <p className="section-description">
              Configure how and when you receive alerts
            </p>

            <div className="preference-groups">
              <div className="preference-group">
                <h3>🔊 Sound Settings</h3>
                <div className="preference-item">
                  <label>
                    <input type="checkbox" defaultChecked />
                    <span>Enable sound alerts</span>
                  </label>
                </div>
                <div className="preference-item">
                  <label>
                    <input type="checkbox" defaultChecked />
                    <span>Critical alerts (3 beeps)</span>
                  </label>
                </div>
                <div className="preference-item">
                  <label>
                    <input type="checkbox" defaultChecked />
                    <span>Warning alerts (1 beep)</span>
                  </label>
                </div>
              </div>

              <div className="preference-group">
                <h3>🖥️ Display Settings</h3>
                <div className="preference-item">
                  <label>
                    <input type="checkbox" defaultChecked />
                    <span>Show banner for critical alerts</span>
                  </label>
                </div>
                <div className="preference-item">
                  <label>
                    <input type="checkbox" defaultChecked />
                    <span>Show toast notifications</span>
                  </label>
                </div>
                <div className="preference-item">
                  <label>
                    <input type="checkbox" defaultChecked />
                    <span>Auto-read old notifications (2 min)</span>
                  </label>
                </div>
              </div>

              <div className="preference-group">
                <h3>⏱️ Timing Settings</h3>
                <div className="preference-item">
                  <label>
                    <span>Deduplication window:</span>
                    <select>
                      <option value="30">30 seconds</option>
                      <option value="60" selected>60 seconds</option>
                      <option value="120">2 minutes</option>
                    </select>
                  </label>
                </div>
                <div className="preference-item">
                  <label>
                    <span>Banner auto-dismiss:</span>
                    <select>
                      <option value="15">15 seconds</option>
                      <option value="30" selected>30 seconds</option>
                      <option value="60">60 seconds</option>
                    </select>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="control-section">
            <h2 className="section-heading">🖥️ System Health</h2>
            <p className="section-description">
              Monitor system performance and connection status
            </p>

            <div className="health-grid">
              <div className="health-card">
                <div className="health-icon">🔌</div>
                <div className="health-content">
                  <h3>WebSocket Connection</h3>
                  <div className={`health-status status-${connectionStatus}`}>
                    {connectionStatus.toUpperCase()}
                  </div>
                  <p>Real-time data stream</p>
                </div>
              </div>

              <div className="health-card">
                <div className="health-icon">📡</div>
                <div className="health-content">
                  <h3>Backend API</h3>
                  <div className="health-status status-connected">
                    OPERATIONAL
                  </div>
                  <p>http://localhost:8000</p>
                </div>
              </div>

              <div className="health-card">
                <div className="health-icon">🗺️</div>
                <div className="health-content">
                  <h3>Map Service</h3>
                  <div className="health-status status-connected">
                    ACTIVE
                  </div>
                  <p>OpenStreetMap + Leaflet</p>
                </div>
              </div>

              <div className="health-card">
                <div className="health-icon">💾</div>
                <div className="health-content">
                  <h3>Data Storage</h3>
                  <div className="health-status status-connected">
                    READY
                  </div>
                  <p>In-memory + localStorage</p>
                </div>
              </div>
            </div>

            {/* System Info */}
            <div className="system-info">
              <h3>ℹ️ System Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Version:</span>
                  <span className="info-value">1.0.0</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Build:</span>
                  <span className="info-value">Phase 1 Complete</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Environment:</span>
                  <span className="info-value">Development</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Uptime:</span>
                  <span className="info-value">Active Session</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemControlView;

