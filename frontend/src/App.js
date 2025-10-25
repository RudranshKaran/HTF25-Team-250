/**
 * Crowd Safety Intelligence System - Main Application Component
 * Mission Control Dashboard for Real-time Crowd Safety Monitoring
 */

import React, { useState, useEffect, useCallback } from 'react';
import MapComponent from './components/MapComponent';
import './App.css';

function App() {
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [messages, setMessages] = useState([]);
  const [wsClient, setWsClient] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

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

      {/* Main content area */}
      <div className="main-content">
        {/* Map component */}
        <div className="map-container">
          <MapComponent />
        </div>

        {/* Side panel for testing (Phase 1) */}
        <div className="side-panel">
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
            </div>
          </div>

          <div className="panel-section">
            <h3>Test Controls</h3>
            <button 
              className="test-button" 
              onClick={sendTestMessage}
              disabled={connectionStatus !== 'connected'}
            >
              Send Test Message
            </button>
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
    </div>
  );
}

export default App;

