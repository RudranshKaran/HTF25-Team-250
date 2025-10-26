import React from 'react';
import MapComponent from '../MapComponent';
import CrowdRiskIndicator from '../CrowdRiskIndicator';
import WeatherWidget from '../WeatherWidget';
import MetroFlowWidget from '../MetroFlowWidget';
import './LiveOperationsView.css';

const LiveOperationsView = ({ 
  busData, 
  densityData, 
  firstResponders, 
  weatherData, 
  metroData,
  alerts,
  messages
}) => {
  // Calculate statistics
  const busCount = busData?.buses?.length || 0;
  const responderCount = firstResponders ? 
    (firstResponders.police?.length || 0) + 
    (firstResponders.ambulance?.length || 0) + 
    (firstResponders.fire?.length || 0) + 
    (firstResponders.emergency?.length || 0) : 0;

  const getTrendEmoji = (trend) => {
    switch(trend) {
      case 'increasing': return '↗️';
      case 'decreasing': return '↘️';
      case 'stable': return '→';
      default: return '';
    }
  };

  return (
    <div className="live-operations-view">
      {/* Main Map Area - 70% */}
      <div className="operations-map-area">
        <MapComponent 
          busData={busData} 
          densityData={densityData} 
          firstResponders={firstResponders} 
        />
      </div>

      {/* Right Panel - 30% */}
      <div className="operations-side-panel">
        {/* Risk Indicator */}
        <div className="operations-card risk-card">
          <CrowdRiskIndicator densityData={densityData} />
        </div>

        {/* Weather Widget */}
        <div className="operations-card weather-card">
          <WeatherWidget weatherData={weatherData} />
        </div>

        {/* Metro Flow Widget */}
        <div className="operations-card metro-card">
          <MetroFlowWidget metroData={metroData} />
        </div>

        {/* Quick Stats Card */}
        <div className="operations-card stats-card">
          <h3 className="card-title">📊 Quick Stats</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Active Buses</span>
              <span className="stat-value bus-count">{busCount}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">First Responders</span>
              <span className="stat-value responder-count">{responderCount}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Max Density</span>
              <span className="stat-value density-value">
                {densityData ? (
                  <>
                    {densityData.max_density} {getTrendEmoji(densityData.trend)}
                  </>
                ) : '-'}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Crowd Phase</span>
              <span className={`stat-value phase-${densityData?.phase || 'unknown'}`}>
                {densityData?.phase ? densityData.phase.toUpperCase() : 'INITIALIZING'}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Active Alerts</span>
              <span className={`stat-value ${alerts?.length > 0 ? 'alert-active' : ''}`}>
                {alerts?.length || 0}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Messages</span>
              <span className="stat-value">{messages?.length || 0}</span>
            </div>
          </div>
        </div>

        {/* Live Status Indicator */}
        <div className="operations-card status-card">
          <div className="live-indicator">
            <span className="live-dot"></span>
            <span className="live-text">LIVE MONITORING</span>
          </div>
          <p className="status-subtitle">All systems operational</p>
        </div>
      </div>
    </div>
  );
};

export default LiveOperationsView;

