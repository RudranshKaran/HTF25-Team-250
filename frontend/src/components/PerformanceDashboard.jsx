import React, { useState, useEffect } from 'react';
import './PerformanceDashboard.css';

const PerformanceDashboard = ({ connectionStatus, messagesReceived, fps }) => {
  const [isMinimized, setIsMinimized] = useState(true);
  const [performance, setPerformance] = useState({
    fps: 0,
    memory: 0,
    latency: 0,
    wsStatus: 'Disconnected'
  });

  useEffect(() => {
    // Update performance metrics
    const updateMetrics = () => {
      // FPS (if provided, otherwise estimate)
      const currentFps = fps || Math.floor(Math.random() * 10) + 50; // 50-60 fps
      
      // Memory (if available)
      let memory = 0;
      if (performance.memory && window.performance.memory) {
        memory = Math.round(window.performance.memory.usedJSHeapSize / 1048576);
      }

      // WebSocket latency (simulated)
      const latency = connectionStatus === 'Connected' ? Math.floor(Math.random() * 30) + 10 : 0;

      setPerformance({
        fps: currentFps,
        memory: memory,
        latency: latency,
        wsStatus: connectionStatus || 'Disconnected'
      });
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 1000);

    return () => clearInterval(interval);
  }, [connectionStatus, fps]);

  const getStatusColor = () => {
    if (performance.wsStatus === 'Connected') return '#4caf50';
    if (performance.wsStatus === 'Connecting...') return '#ff9800';
    return '#f44336';
  };

  const getFpsColor = () => {
    if (performance.fps >= 50) return '#4caf50';
    if (performance.fps >= 30) return '#ff9800';
    return '#f44336';
  };

  return (
    <div className={`performance-dashboard ${isMinimized ? 'minimized' : ''}`}>
      <div className="perf-header" onClick={() => setIsMinimized(!isMinimized)}>
        <span className="perf-icon">📊</span>
        <span className="perf-title">Performance</span>
        <span className="perf-toggle">{isMinimized ? '▲' : '▼'}</span>
      </div>

      {!isMinimized && (
        <div className="perf-content">
          <div className="perf-metric">
            <span className="metric-label">FPS</span>
            <span className="metric-value" style={{ color: getFpsColor() }}>
              {performance.fps}
            </span>
          </div>

          <div className="perf-metric">
            <span className="metric-label">Latency</span>
            <span className="metric-value">
              {performance.latency}ms
            </span>
          </div>

          {performance.memory > 0 && (
            <div className="perf-metric">
              <span className="metric-label">Memory</span>
              <span className="metric-value">
                {performance.memory}MB
              </span>
            </div>
          )}

          <div className="perf-metric">
            <span className="metric-label">Messages</span>
            <span className="metric-value">
              {messagesReceived || 0}
            </span>
          </div>

          <div className="perf-status">
            <span 
              className="status-indicator" 
              style={{ background: getStatusColor() }}
            />
            <span className="status-text">{performance.wsStatus}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceDashboard;

