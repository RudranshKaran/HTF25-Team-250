/**
 * Crowd Safety Intelligence System - Main Application Component
 * Mission Control Dashboard for Real-time Crowd Safety Monitoring
 */

import { useState, useEffect, useCallback } from 'react';
import MapComponent from './components/MapComponent';
import WeatherWidget from './components/WeatherWidget';
import MetroFlowWidget from './components/MetroFlowWidget';
import AlertBanner from './components/AlertBanner';
import AnalyticsPanel from './components/AnalyticsPanel';
import AlertHistory from './components/AlertHistory';
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

  // WebSocket connection logic
  const connectWebSocket = useCallback(() => {
    console.log('Attempting to connect to WebSocket...');
    setConnectionStatus('connecting');

    const ws = new WebSocket('ws://localhost:8000/ws');

    ws.onopen = () => {
      console.log('✅ WebSocket connected successfully');
      setConnectionStatus('connected');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📨 Message received from backend:', data);
        
        setMessages(prev => [...prev, data].slice(-10)); // Keep last 10 messages
        setLastUpdate(new Date().toLocaleTimeString());

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
            // New alert received
            console.log(`⚠️ ${data.level.toUpperCase()} ALERT: ${data.message}`);
            setAlerts(prev => [data, ...prev].slice(0, 5)); // Keep last 5 alerts
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
      
      // Attempt to reconnect after 3 seconds
      setTimeout(() => {
        console.log('Attempting to reconnect...');
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
    return cleanup;
  }, [connectWebSocket]);

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

  return (
    <div className="App">
      {/* Header */}
      <header className="app-header">
        <div className="header-left">
          <h1>🚨 Crowd Safety Intelligence System</h1>
          <p className="subtitle">Mission Control Dashboard - Bengaluru</p>
        </div>
        <div className="header-right">
          <div className={`status-indicator ${connectionStatus}`}>
            <span className="status-dot"></span>
            <span className="status-text">
              {connectionStatus === 'connected' ? 'LIVE' : 
               connectionStatus === 'connecting' ? 'CONNECTING...' : 
               'DISCONNECTED'}
            </span>
          </div>
          {lastUpdate && (
            <span className="last-update">Last Update: {lastUpdate}</span>
          )}
        </div>
      </header>

      {/* Alert Notifications */}
      <AlertBanner alerts={alerts} />

      {/* Main content area */}
      <div className="main-content">
        {/* Map component */}
        <div className="map-container">
          <MapComponent busData={busData} densityData={densityData} />
        </div>

        {/* Side panel */}
        <div className="side-panel">
          {/* Weather Widget */}
          <div className="panel-section weather-section">
            <WeatherWidget weatherData={weatherData} />
          </div>
          
          {/* Metro Flow Widget */}
          <div className="panel-section metro-section">
            <MetroFlowWidget metroData={metroData} />
          </div>
          
          <div className="panel-section">
            <h3>System Status</h3>
            <div className="status-grid">
              <div className="status-item">
                <span className="label">WebSocket:</span>
                <span className={`value ${connectionStatus}`}>
                  {connectionStatus.toUpperCase()}
                </span>
              </div>
              <div className="status-item">
                <span className="label">Messages:</span>
                <span className="value">{messages.length}</span>
              </div>
              <div className="status-item">
                <span className="label">Active Buses:</span>
                <span className="value bus-count">{busCount}</span>
              </div>
              <div className="status-item">
                <span className="label">Weather:</span>
                <span className="value">
                  {weatherData ? `${weatherData.temperature}°C` : 'Loading...'}
                </span>
              </div>
              <div className="status-item">
                <span className="label">Max Density:</span>
                <span className="value density-value">
                  {densityData ? (
                    <>
                      {densityData.max_density} {getTrendEmoji(densityData.trend)}
                    </>
                  ) : '-'}
                </span>
              </div>
              <div className="status-item">
                <span className="label">Crowd Phase:</span>
                <span className={`value phase-${densityData?.phase || 'unknown'}`}>
                  {densityData?.phase ? densityData.phase.toUpperCase() : 'INITIALIZING'}
                </span>
              </div>
              <div className="status-item">
                <span className="label">Active Alerts:</span>
                <span className={`value ${alerts.length > 0 ? 'alert-active' : ''}`}>
                  {alerts.length}
                </span>
              </div>
            </div>
          </div>

          <div className="panel-section">
            <h3>Controls</h3>
            <button 
              className="export-button" 
              onClick={exportData}
              disabled={connectionStatus !== 'connected'}
            >
              📥 Export Data
            </button>
            <button 
              className="test-button" 
              onClick={sendTestMessage}
              disabled={connectionStatus !== 'connected'}
            >
              🔔 Send Test Message
            </button>
          </div>

          {/* Alert History */}
          <div className="panel-section alert-history-section">
            <AlertHistory />
          </div>

          <div className="panel-section">
            <h3>Recent Messages</h3>
            <div className="messages-log">
              {messages.length === 0 ? (
                <p className="no-messages">No messages yet...</p>
              ) : (
                messages.slice().reverse().map((msg, idx) => (
                  <div key={idx} className="message-item">
                    <span className="message-type">[{msg.type}]</span>
                    <span className="message-text">{msg.message || JSON.stringify(msg)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Panel */}
      <AnalyticsPanel densityData={densityData} metroData={metroData} />
    </div>
  );
}

export default App;

