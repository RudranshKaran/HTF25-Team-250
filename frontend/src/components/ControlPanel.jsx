import React, { useState, useEffect } from 'react';
import './ControlPanel.css';
import { notify } from './NotificationCenter';

const ControlPanel = ({ onSettingsUpdate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('controls');
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch settings on mount
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/settings');
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const handlePauseToggle = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/control/toggle', {
        method: 'POST',
      });
      const data = await response.json();
      
      if (data.paused) {
        notify.info('⏸️ Simulations paused');
      } else {
        notify.success('▶️ Simulations resumed');
      }
      
      await fetchSettings();
      onSettingsUpdate?.();
    } catch (error) {
      notify.error('Failed to toggle simulations');
    } finally {
      setLoading(false);
    }
  };

  const handleResetHistory = async () => {
    if (!confirm('Clear all historical data?')) return;
    
    setLoading(true);
    try {
      await fetch('http://localhost:8000/api/control/reset-history', {
        method: 'POST',
      });
      notify.success('History cleared');
      onSettingsUpdate?.();
    } catch (error) {
      notify.error('Failed to clear history');
    } finally {
      setLoading(false);
    }
  };

  const handleResetStats = async () => {
    if (!confirm('Reset all statistics?')) return;
    
    setLoading(true);
    try {
      await fetch('http://localhost:8000/api/control/reset-stats', {
        method: 'POST',
      });
      notify.success('Statistics reset');
      await fetchSettings();
    } catch (error) {
      notify.error('Failed to reset stats');
    } finally {
      setLoading(false);
    }
  };

  const handleThresholdUpdate = async (field, value) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append(field, value);
      
      await fetch(`http://localhost:8000/api/settings/thresholds?${params}`, {
        method: 'POST',
      });
      
      notify.success(`Threshold updated: ${field} = ${value}`);
      await fetchSettings();
    } catch (error) {
      notify.error('Failed to update threshold');
    } finally {
      setLoading(false);
    }
  };

  const handleDisplayToggle = async (field) => {
    setLoading(true);
    try {
      const currentValue = settings.display[field];
      const params = new URLSearchParams();
      params.append(field, !currentValue);
      
      await fetch(`http://localhost:8000/api/settings/display?${params}`, {
        method: 'POST',
      });
      
      await fetchSettings();
      onSettingsUpdate?.();
    } catch (error) {
      notify.error('Failed to update display setting');
    } finally {
      setLoading(false);
    }
  };

  const handleSoundToggle = async (field) => {
    setLoading(true);
    try {
      const currentValue = settings.notifications[field];
      const params = new URLSearchParams();
      params.append(field.replace('_', ''), !currentValue);
      
      await fetch(`http://localhost:8000/api/settings/sound?${params}`, {
        method: 'POST',
      });
      
      await fetchSettings();
    } catch (error) {
      notify.error('Failed to update sound setting');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoMode = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/control/demo-mode', {
        method: 'POST',
      });
      const data = await response.json();
      
      if (data.demo_mode) {
        notify.warning('🎬 Demo Mode ACTIVATED - Accelerated alerts');
      } else {
        notify.info('Demo Mode deactivated');
      }
      
      await fetchSettings();
      onSettingsUpdate?.();
    } catch (error) {
      notify.error('Failed to toggle demo mode');
    } finally {
      setLoading(false);
    }
  };

  if (!settings) return null;

  return (
    <>
      <button 
        className="control-panel-toggle"
        onClick={() => setIsOpen(!isOpen)}
        title="Open Control Panel (Ctrl+K)"
      >
        ⚙️ Settings
      </button>

      {isOpen && (
        <div className="control-panel-overlay" onClick={() => setIsOpen(false)}>
          <div className="control-panel" onClick={(e) => e.stopPropagation()}>
            <div className="control-panel-header">
              <h2>⚙️ Control Panel</h2>
              <button className="close-btn" onClick={() => setIsOpen(false)}>✕</button>
            </div>

            <div className="control-panel-tabs">
              <button 
                className={activeTab === 'controls' ? 'active' : ''}
                onClick={() => setActiveTab('controls')}
              >
                Controls
              </button>
              <button 
                className={activeTab === 'thresholds' ? 'active' : ''}
                onClick={() => setActiveTab('thresholds')}
              >
                Thresholds
              </button>
              <button 
                className={activeTab === 'display' ? 'active' : ''}
                onClick={() => setActiveTab('display')}
              >
                Display
              </button>
              <button 
                className={activeTab === 'sound' ? 'active' : ''}
                onClick={() => setActiveTab('sound')}
              >
                Sound
              </button>
            </div>

            <div className="control-panel-content">
              {activeTab === 'controls' && (
                <div className="settings-section">
                  <h3>System Controls</h3>
                  
                  <div className="control-group">
                    <label>Simulation Control</label>
                    <button 
                      className={`control-btn ${settings.controls.paused ? 'btn-warning' : 'btn-success'}`}
                      onClick={handlePauseToggle}
                      disabled={loading}
                    >
                      {settings.controls.paused ? '▶️ Resume' : '⏸️ Pause'} Simulations
                    </button>
                  </div>

                  <div className="control-group">
                    <label>Demo Mode</label>
                    <button 
                      className={`control-btn ${settings.controls.demo_mode ? 'btn-critical' : 'btn-secondary'}`}
                      onClick={handleDemoMode}
                      disabled={loading}
                    >
                      {settings.controls.demo_mode ? '🎬 Demo Active' : '🎬 Enable Demo'} 
                    </button>
                    <small>Demo mode accelerates events for presentations</small>
                  </div>

                  <div className="control-group">
                    <label>Data Management</label>
                    <button 
                      className="control-btn btn-danger"
                      onClick={handleResetHistory}
                      disabled={loading}
                    >
                      🗑️ Clear History
                    </button>
                    <button 
                      className="control-btn btn-danger"
                      onClick={handleResetStats}
                      disabled={loading}
                    >
                      🔄 Reset Statistics
                    </button>
                  </div>

                  <div className="stats-display">
                    <h4>Session Statistics</h4>
                    <div className="stat-item">
                      <span>Duration:</span>
                      <strong>{Math.floor(settings.stats.session_duration / 60)}m {settings.stats.session_duration % 60}s</strong>
                    </div>
                    <div className="stat-item">
                      <span>Total Alerts:</span>
                      <strong>{settings.stats.total_alerts}</strong>
                    </div>
                    <div className="stat-item">
                      <span>Messages:</span>
                      <strong>{settings.stats.total_messages}</strong>
                    </div>
                    <div className="stat-item">
                      <span>Phase Transitions:</span>
                      <strong>{settings.stats.phase_transitions}</strong>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'thresholds' && (
                <div className="settings-section">
                  <h3>Alert Thresholds</h3>
                  
                  <div className="threshold-group">
                    <label>
                      Density Warning Threshold
                      <span className="current-value">{settings.thresholds.density_warning}</span>
                    </label>
                    <input 
                      type="range"
                      min="50"
                      max="300"
                      value={settings.thresholds.density_warning}
                      onChange={(e) => handleThresholdUpdate('warning', e.target.value)}
                      disabled={loading}
                    />
                  </div>

                  <div className="threshold-group">
                    <label>
                      Density Critical Threshold
                      <span className="current-value">{settings.thresholds.density_critical}</span>
                    </label>
                    <input 
                      type="range"
                      min="100"
                      max="400"
                      value={settings.thresholds.density_critical}
                      onChange={(e) => handleThresholdUpdate('critical', e.target.value)}
                      disabled={loading}
                    />
                  </div>

                  <div className="threshold-group">
                    <label>
                      Metro Flow Threshold
                      <span className="current-value">{settings.thresholds.metro_flow}</span>
                    </label>
                    <input 
                      type="range"
                      min="20"
                      max="150"
                      value={settings.thresholds.metro_flow}
                      onChange={(e) => handleThresholdUpdate('metro', e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'display' && (
                <div className="settings-section">
                  <h3>Display Settings</h3>
                  
                  <div className="toggle-group">
                    <label>
                      <input 
                        type="checkbox"
                        checked={settings.display.heatmap_enabled}
                        onChange={() => handleDisplayToggle('heatmap_enabled')}
                        disabled={loading}
                      />
                      <span>Show Heatmap</span>
                    </label>
                  </div>

                  <div className="toggle-group">
                    <label>
                      <input 
                        type="checkbox"
                        checked={settings.display.hotspot_markers_enabled}
                        onChange={() => handleDisplayToggle('hotspot_markers_enabled')}
                        disabled={loading}
                      />
                      <span>Show Hotspot Markers</span>
                    </label>
                  </div>

                  <div className="toggle-group">
                    <label>
                      <input 
                        type="checkbox"
                        checked={settings.display.phase_badge_enabled}
                        onChange={() => handleDisplayToggle('phase_badge_enabled')}
                        disabled={loading}
                      />
                      <span>Show Crowd Phase Badge</span>
                    </label>
                  </div>
                </div>
              )}

              {activeTab === 'sound' && (
                <div className="settings-section">
                  <h3>Sound Settings</h3>
                  
                  <div className="toggle-group">
                    <label>
                      <input 
                        type="checkbox"
                        checked={settings.notifications.sound_enabled}
                        onChange={() => handleSoundToggle('sound_enabled')}
                        disabled={loading}
                      />
                      <span>Enable Sounds</span>
                    </label>
                  </div>

                  <div className="toggle-group">
                    <label>
                      <input 
                        type="checkbox"
                        checked={settings.notifications.critical_sound}
                        onChange={() => handleSoundToggle('critical_sound')}
                        disabled={loading || !settings.notifications.sound_enabled}
                      />
                      <span>Critical Alert Sound</span>
                    </label>
                  </div>

                  <div className="toggle-group">
                    <label>
                      <input 
                        type="checkbox"
                        checked={settings.notifications.warning_sound}
                        onChange={() => handleSoundToggle('warning_sound')}
                        disabled={loading || !settings.notifications.sound_enabled}
                      />
                      <span>Warning Alert Sound</span>
                    </label>
                  </div>

                  <div className="threshold-group">
                    <label>
                      Volume
                      <span className="current-value">{Math.round(settings.notifications.sound_volume * 100)}%</span>
                    </label>
                    <input 
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={settings.notifications.sound_volume}
                      onChange={(e) => {
                        const params = new URLSearchParams();
                        params.append('volume', e.target.value);
                        fetch(`http://localhost:8000/api/settings/sound?${params}`, {
                          method: 'POST',
                        }).then(fetchSettings);
                      }}
                      disabled={loading || !settings.notifications.sound_enabled}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ControlPanel;

