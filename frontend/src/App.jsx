/**
 * Crowd Safety Intelligence System - Main Application Component
 * Mission Control Dashboard for Real-time Crowd Safety Monitoring
 * Enhanced Version 2.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import MapComponent from './components/MapComponent';
import WeatherWidget from './components/WeatherWidget';
import MetroFlowWidget from './components/MetroFlowWidget';
import AlertBanner from './components/AlertBanner';
import AlertHistory from './components/AlertHistory';
import NotificationCenter, { notify } from './components/NotificationCenter';
import NotificationHub from './components/NotificationHub';
import NotificationBell from './components/NotificationBell';
import ControlPanel from './components/ControlPanel';
import QuickActions from './components/QuickActions';
import ModeToggle from './components/ModeToggle';
import CrowdRiskIndicator from './components/CrowdRiskIndicator';
import InsightsDock from './components/InsightsDock';
import audioManager from './utils/audioManager';
import keyboardManager from './utils/keyboardShortcuts';
import notificationPreferences from './utils/notificationPreferences';

// New Layout Components
import Sidebar from './components/layout/Sidebar';
import Breadcrumb from './components/layout/Breadcrumb';
import KeyboardShortcutsPanel from './components/layout/KeyboardShortcutsPanel';

// New View Components
import LiveOperationsView from './components/views/LiveOperationsView';
import AnalyticsDashboardView from './components/views/AnalyticsDashboardView';
import AlertsMonitoringView from './components/views/AlertsMonitoringView';
import FleetManagementView from './components/views/FleetManagementView';
import SystemControlView from './components/views/SystemControlView';

import './App.css';

function App() {
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [messages, setMessages] = useState([]);
  const [wsClient, setWsClient] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  
  // Phase 2: Data streams
  const [busData, setBusData] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [busCount, setBusCount] = useState(0);
  
  // Phase 3: AI & Simulations
  const [metroData, setMetroData] = useState(null);
  const [densityData, setDensityData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [firstResponders, setFirstResponders] = useState(null);
  
  // Phase 5: Performance & Settings
  const [messageCount, setMessageCount] = useState(0);
  const [settings, setSettings] = useState(null);
  
  // Enhanced Notification System
  const [notificationHubOpen, setNotificationHubOpen] = useState(false);
  const [allNotifications, setAllNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasNewCritical, setHasNewCritical] = useState(false);
  const alertDedupeMap = useRef(new Map()); // Track recent alerts for deduplication

  // New Dashboard Layout State
  const [activeSection, setActiveSection] = useState('operations'); // operations, analytics, alerts, fleet, control
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);

  // WebSocket connection logic
  const connectWebSocket = useCallback(() => {
    console.log('Attempting to connect to WebSocket...');
    setConnectionStatus('connecting');

    const ws = new WebSocket('ws://localhost:8000/ws');

    ws.onopen = () => {
      console.log('✅ WebSocket connected successfully');
      setConnectionStatus('connected');
      
      // Log to system logs
      if (window.addSystemLog) {
        window.addSystemLog('WebSocket connected successfully', 'success');
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📨 Message received from backend:', data);
        
        setMessages(prev => [...prev, data].slice(-10)); // Keep last 10 messages
        setLastUpdate(new Date().toLocaleTimeString());
        setMessageCount(prev => prev + 1);

        // Handle different message types
        switch(data.type) {
          case 'connection':
            console.log('Connection acknowledged:', data.message);
            break;
          case 'test':
            console.log('Test message:', data.message);
            break;
          case 'echo':
            console.log('Echo received:', data.received);
            break;
          case 'gps_update':
            // Update bus data
            console.log(`🚌 Received ${data.count} buses`);
            setBusData(data);
            setBusCount(data.count || 0);
            break;
          case 'weather_update':
            // Update weather data
            console.log(`🌦️ Weather: ${data.temperature}°C, ${data.description}`);
            setWeatherData(data);
            break;
          case 'metro_update':
            // Update metro flow data
            console.log(`🚇 Metro: Entry ${data.entry_rate}/min, Exit ${data.exit_rate}/min`);
            setMetroData(data);
            break;
          case 'density_update':
            // Update crowd density data
            console.log(`🔥 Density: Max ${data.max_density}, Avg ${data.avg_density}, Phase: ${data.phase?.toUpperCase()}`);
            setDensityData(data);
            break;
          case 'alert':
            // Enhanced alert routing with deduplication and user preferences
            console.log(`⚠️ ${data.level.toUpperCase()} ALERT: ${data.message}`);
            
            // Check if this is a duplicate alert (same category, zone, level)
            const alertKey = `${data.category}-${data.zone}-${data.level}`;
            const now = Date.now();
            const lastAlertTime = alertDedupeMap.current.get(alertKey);
            const dedupeWindow = notificationPreferences.getDeduplicationWindow();
            const isDuplicate = lastAlertTime && (now - lastAlertTime.timestamp) < dedupeWindow;
            
            // Add to notification hub (with deduplication)
            addNotification(data);
            
            // Route based on severity and user preferences (only if NOT a duplicate)
            if (data.level === 'critical' && !isDuplicate) {
              // CRITICAL: Full alert experience (only for NEW critical alerts)
              if (notificationPreferences.shouldShowBanner()) {
                setAlerts(prev => [data, ...prev].slice(0, 1)); // Keep only most recent critical for banner
              }
              if (notificationPreferences.isCriticalAlertSoundEnabled()) {
                audioManager.playCriticalAlert(); // 3 urgent beeps
              }
              if (notificationPreferences.shouldShowToast()) {
                notify.error(`🚨 ${data.message}`, 8000); // Toast popup
              }
              
            } else if (data.level === 'warning' && !isDuplicate) {
              // WARNING: Silent to hub, gentle audio feedback only (only for NEW warnings)
              if (notificationPreferences.isWarningAlertSoundEnabled()) {
                audioManager.playNotification(); // Gentle single beep
              }
              // NO toast popup, NO banner - warnings go to hub only
              
            } else if (!isDuplicate) {
              // INFO: Completely silent, hub only
              // No audio, no toast, no banner
            }
            // If duplicate, it only updates the notification hub (no sound, no banner, no toast)
            break;
          case 'first_responders_update':
            // Update first responders data
            console.log(`🚨 First Responders: ${data.count} units active`);
            setFirstResponders(data);
            break;
          default:
            console.log('Unknown message type:', data.type);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
      setConnectionStatus('error');
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setConnectionStatus('disconnected');
      
      // Log to system logs
      if (window.addSystemLog) {
        window.addSystemLog('WebSocket disconnected', 'error');
      }
      
      // Attempt to reconnect after 3 seconds
      setTimeout(() => {
        console.log('Attempting to reconnect...');
        if (window.addSystemLog) {
          window.addSystemLog('Attempting to reconnect...', 'warning');
        }
        connectWebSocket();
      }, 3000);
    };

    setWsClient(ws);

    // Cleanup function
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  // Connect to WebSocket on component mount
  useEffect(() => {
    const cleanup = connectWebSocket();
    
    // Log to system logs
    if (window.addSystemLog) {
      window.addSystemLog('Connecting to backend...', 'info');
    }
    
    return cleanup;
  }, [connectWebSocket]);

  // ===== NOTIFICATION SYSTEM FUNCTIONS =====
  
  // Add notification to hub with deduplication
  const addNotification = useCallback((alert) => {
    const alertKey = `${alert.category}-${alert.zone}-${alert.level}`;
    const now = Date.now();
    const dedupeWindow = notificationPreferences.getDeduplicationWindow();
    
    // Check for duplicate within configured deduplication window
    const existing = alertDedupeMap.current.get(alertKey);
    if (existing && (now - existing.timestamp) < dedupeWindow) {
      // Update existing notification instead of creating new one
      setAllNotifications(prev => 
        prev.map(notif => 
          notif.dedupeKey === alertKey && !notif.read
            ? { ...notif, ...alert, value: alert.value, timestamp: alert.timestamp, updatedCount: (notif.updatedCount || 0) + 1 }
            : notif
        )
      );
      return;
    }
    
    // Add new notification
    const notification = {
      ...alert,
      id: alert.id || `alert-${now}-${Math.random()}`,
      read: false,
      dedupeKey: alertKey,
      updatedCount: 0
    };
    
    alertDedupeMap.current.set(alertKey, { id: notification.id, timestamp: now });
    
    setAllNotifications(prev => {
      const updated = [notification, ...prev];
      // Auto-remove notifications older than 10 minutes
      const tenMinutesAgo = now - 600000;
      const filtered = updated.filter(n => {
        const notifTime = new Date(n.timestamp).getTime();
        return notifTime > tenMinutesAgo;
      });
      // Limit to 50 notifications max
      return filtered.slice(0, 50);
    });
    setUnreadCount(prev => prev + 1);
    
    // Set critical flag if critical alert
    if (alert.level === 'critical') {
      setHasNewCritical(true);
      setTimeout(() => setHasNewCritical(false), 3000);
    }
    
    // Cleanup old dedupe entries (older than 2 minutes)
    alertDedupeMap.current.forEach((value, key) => {
      if (now - value.timestamp > 120000) {
        alertDedupeMap.current.delete(key);
      }
    });
    
    // Auto-mark notifications older than 2 minutes as read (if enabled in preferences)
    if (notificationPreferences.shouldAutoReadOld()) {
      setTimeout(() => {
        setAllNotifications(prev => 
          prev.map(notif => {
            const notifTime = new Date(notif.timestamp).getTime();
            const age = now - notifTime;
            // Auto-read if older than 2 minutes and same alert is still coming
            if (!notif.read && age > 120000) {
              setUnreadCount(c => Math.max(0, c - 1));
              return { ...notif, read: true };
            }
            return notif;
          })
        );
      }, 2000);
    }
  }, []);

  // Mark notifications as read
  const markAsRead = useCallback((notificationIds) => {
    setAllNotifications(prev => 
      prev.map(notif => 
        notificationIds.includes(notif.id) ? { ...notif, read: true } : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - notificationIds.length));
  }, []);

  // Dismiss notification
  const dismissNotification = useCallback((notificationId) => {
    setAllNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    setUnreadCount(prev => {
      const notification = allNotifications.find(n => n.id === notificationId);
      return notification && !notification.read ? Math.max(0, prev - 1) : prev;
    });
  }, [allNotifications]);

  // View alert on map
  const viewAlertOnMap = useCallback((alert) => {
    if (alert.location && alert.location.length === 2) {
      // This would trigger map zoom - you can implement this in MapComponent
      console.log('Zoom to location:', alert.location);
      notify.info(`📍 Viewing ${alert.zone} on map`);
      setNotificationHubOpen(false);
      
      // Optionally: Add a ref to MapComponent and call a zoom function
      // mapRef.current?.zoomTo(alert.location);
    }
  }, []);

  // Toggle notification hub
  const toggleNotificationHub = useCallback(() => {
    setNotificationHubOpen(prev => !prev);
  }, []);

  // Fetch settings
  const fetchSettings = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:8000/api/settings');
      const data = await response.json();
      setSettings(data);
      
      // Update audio manager volume
      if (data.notifications) {
        audioManager.setVolume(data.notifications.sound_volume);
        audioManager.setEnabled(data.notifications.sound_enabled);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Keyboard shortcuts
  useEffect(() => {
    keyboardManager.init();
    
    // Register shortcuts
    keyboardManager.register('k', 'ctrl', () => {
      // Open control panel (handled by ControlPanel component)
      notify.info('Press ⚙️ Settings button to open Control Panel');
    }, 'Open Control Panel');
    
    keyboardManager.register(' ', '', async () => {
      // Pause/Resume
      try {
        const response = await fetch('http://localhost:8000/api/control/toggle', { method: 'POST' });
        const data = await response.json();
        notify.info(data.paused ? '⏸️ Paused' : '▶️ Resumed');
        await fetchSettings();
      } catch (error) {
        console.error('Failed to toggle pause:', error);
      }
    }, 'Pause/Resume');
    
    keyboardManager.register('d', '', async () => {
      // Demo mode
      try {
        const response = await fetch('http://localhost:8000/api/control/demo-mode', { method: 'POST' });
        const data = await response.json();
        notify.warning(data.demo_mode ? '🎬 Demo Mode ON' : '🎬 Demo Mode OFF');
        await fetchSettings();
      } catch (error) {
        console.error('Failed to toggle demo mode:', error);
      }
    }, 'Toggle Demo Mode');
    
    keyboardManager.register('e', '', exportData, 'Export Data');
    
    keyboardManager.register('m', '', () => {
      const enabled = audioManager.isEnabled();
      audioManager.setEnabled(!enabled);
      notify.info(`Sound ${!enabled ? 'enabled 🔊' : 'muted 🔇'}`);
    }, 'Toggle Sound');
    
    keyboardManager.register('r', '', () => {
      notify.info('🔄 Refreshing data...');
      fetchSettings();
    }, 'Refresh Data');
    
    keyboardManager.register('?', 'shift', () => {
      setShowKeyboardShortcuts(true);
    }, 'Show Shortcuts');

    // NEW: Navigation shortcuts for dashboard sections
    keyboardManager.register('1', '', () => setActiveSection('operations'), 'Go to Live Operations');
    keyboardManager.register('2', '', () => setActiveSection('analytics'), 'Go to Analytics');
    keyboardManager.register('3', '', () => setActiveSection('alerts'), 'Go to Alerts');
    keyboardManager.register('4', '', () => setActiveSection('fleet'), 'Go to Fleet Management');
    keyboardManager.register('5', '', () => setActiveSection('control'), 'Go to System Control');
    
    // TEST: Generate sample notifications (Press 't' key)
    keyboardManager.register('t', '', () => {
      // Generate test notifications of all types
      const testAlerts = [
        {
          level: 'warning',
          category: 'crowd_density',
          zone: 'Stadium Area',
          message: 'High crowd density: 175 people',
          value: 175,
          threshold: 150,
          recommendation: 'Monitor situation closely',
          location: [12.9716, 77.5946],
          timestamp: new Date().toISOString()
        },
        {
          level: 'warning',
          category: 'metro_flow',
          zone: 'MG Road Metro',
          message: 'High metro exit rate: 85 passengers/min',
          value: 85,
          threshold: 80,
          recommendation: 'Prepare for crowd influx near metro',
          location: [12.9759, 77.6069],
          timestamp: new Date().toISOString()
        },
        {
          level: 'critical',
          category: 'crowd_density',
          zone: 'Stadium Area',
          message: 'Critical crowd density detected: 225 people',
          value: 225,
          threshold: 200,
          recommendation: 'Immediate crowd control measures required',
          location: [12.9716, 77.5946],
          timestamp: new Date().toISOString()
        }
      ];
      
      testAlerts.forEach((alert, index) => {
        setTimeout(() => {
          addNotification(alert);
          if (alert.level === 'critical') {
            setAlerts([alert]);
            audioManager.playCriticalAlert();
            notify.error(`🚨 ${alert.message}`, 8000);
          } else if (alert.level === 'warning') {
            audioManager.playNotification();
          }
          console.log(`Test alert ${index + 1} generated:`, alert);
        }, index * 1000);
      });
      
      notify.info('🧪 Generating 3 test notifications...', 3000);
    }, 'Test Notifications (generates 3 sample alerts)');
    
    return () => {
      keyboardManager.destroy();
    };
  }, [fetchSettings, addNotification]);

  // Handle quick action callbacks
  const handleQuickAction = useCallback((action) => {
    if (action === 'refresh') {
      fetchSettings();
    }
  }, [fetchSettings]);

  // Send test message to backend
  const sendTestMessage = () => {
    if (wsClient && wsClient.readyState === WebSocket.OPEN) {
      const testMessage = {
        type: 'test_from_client',
        message: 'Hello from React frontend!',
        timestamp: new Date().toISOString()
      };
      wsClient.send(JSON.stringify(testMessage));
      console.log('📤 Sent test message to backend');
    } else {
      console.warn('WebSocket is not connected');
    }
  };

  // Export data function
  const exportData = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/export');
      const data = await response.json();
      
      // Create downloadable JSON file
      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      link.download = `crowd_safety_data_${timestamp}.json`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log('✅ Data exported successfully');
    } catch (error) {
      console.error('Failed to export data:', error);
    }
  };

  // Get trend emoji
  const getTrendEmoji = (trend) => {
    switch(trend) {
      case 'increasing': return '↗️';
      case 'decreasing': return '↘️';
      case 'stable': return '→';
      default: return '';
    }
  };

  // Navigate to section
  const navigateToSection = useCallback((section) => {
    setActiveSection(section);
    notify.info(`Navigated to ${section.charAt(0).toUpperCase() + section.slice(1)}`, 2000);
  }, []);

  return (
    <div className="App">
      {/* Global Overlays */}
      <NotificationCenter />
      <NotificationHub 
        isOpen={notificationHubOpen}
        onClose={() => setNotificationHubOpen(false)}
        alerts={allNotifications}
        onMarkAsRead={markAsRead}
        onDismiss={dismissNotification}
        onViewOnMap={viewAlertOnMap}
      />
      <AlertBanner 
        alerts={alerts} 
        onDismiss={dismissNotification}
      />
      <KeyboardShortcutsPanel 
        isOpen={showKeyboardShortcuts}
        onClose={() => setShowKeyboardShortcuts(false)}
      />
      
      {/* Legacy Floating Panels - REMOVED for cleaner layout */}
      
      {/* Slim Header */}
      <header className="app-header-slim">
        <div className="header-title">
          <h1>🚨 CSIS</h1>
          <span className="header-subtitle">Crowd Safety Intelligence</span>
        </div>
        <div className="header-actions">
          <ModeToggle />
          <NotificationBell 
            unreadCount={unreadCount}
            onClick={toggleNotificationHub}
            hasNewCritical={hasNewCritical}
          />
          <div className={`status-indicator ${connectionStatus}`}>
            <span className="status-dot"></span>
            <span className="status-text">
              {connectionStatus === 'connected' ? 'LIVE' : 
               connectionStatus === 'connecting' ? 'CONNECTING...' : 
               'DISCONNECTED'}
            </span>
          </div>
        </div>
      </header>

      {/* New Dashboard Layout */}
      <div className="dashboard-layout">
        {/* Sidebar Navigation */}
        <Sidebar 
          activeSection={activeSection}
          onNavigate={navigateToSection}
        />

        {/* Main Dashboard Content */}
        <div className="dashboard-main">
          {/* Breadcrumb Navigation */}
          <Breadcrumb activeSection={activeSection} />

          {/* Section Content - Conditional Rendering */}
          <div className="section-content">
            {activeSection === 'operations' && (
              <LiveOperationsView 
                busData={busData}
                densityData={densityData}
                firstResponders={firstResponders}
                weatherData={weatherData}
                metroData={metroData}
                alerts={alerts}
                messages={messages}
              />
            )}

            {activeSection === 'analytics' && (
              <AnalyticsDashboardView 
                densityData={densityData}
                metroData={metroData}
                connectionStatus={connectionStatus}
                messagesReceived={messageCount}
              />
            )}

            {activeSection === 'alerts' && (
              <AlertsMonitoringView 
                alerts={alerts}
                allNotifications={allNotifications}
              />
            )}

            {activeSection === 'fleet' && (
              <FleetManagementView 
                busData={busData}
                metroData={metroData}
                firstResponders={firstResponders}
              />
            )}

            {activeSection === 'control' && (
              <SystemControlView 
                onSettingsUpdate={fetchSettings}
                connectionStatus={connectionStatus}
                onExport={exportData}
                onTestMessage={sendTestMessage}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

