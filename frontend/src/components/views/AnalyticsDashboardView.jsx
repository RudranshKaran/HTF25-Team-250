import React from 'react';
import AnalyticsPanel from '../AnalyticsPanel';
import PerformanceDashboard from '../PerformanceDashboard';
import './AnalyticsDashboardView.css';

const AnalyticsDashboardView = ({ densityData, metroData, connectionStatus, messagesReceived }) => {
  // Calculate trend statistics
  const maxDensity = densityData?.max_density || 0;
  const avgDensity = densityData?.avg_density || 0;
  const currentPhase = densityData?.phase || 'unknown';
  const metroExitRate = metroData?.exit_rate || 0;

  return (
    <div className="analytics-dashboard-view">
      {/* Summary Cards at Top */}
      <div className="analytics-summary">
        <div className="summary-card">
          <div className="summary-icon">📈</div>
          <div className="summary-content">
            <span className="summary-label">Max Density Today</span>
            <span className="summary-value">{maxDensity}</span>
            <span className="summary-unit">people</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">📊</div>
          <div className="summary-content">
            <span className="summary-label">Average Density</span>
            <span className="summary-value">{avgDensity}</span>
            <span className="summary-unit">people/zone</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">🚇</div>
          <div className="summary-content">
            <span className="summary-label">Metro Exit Rate</span>
            <span className="summary-value">{metroExitRate}</span>
            <span className="summary-unit">passengers/min</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">🎯</div>
          <div className="summary-content">
            <span className="summary-label">Current Phase</span>
            <span className={`summary-value phase-${currentPhase}`}>
              {currentPhase.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Main Analytics Grid */}
      <div className="analytics-grid">
        {/* Historical Charts */}
        <div className="analytics-section charts-section">
          <AnalyticsPanel 
            densityData={densityData} 
            metroData={metroData} 
          />
        </div>

        {/* Performance Metrics */}
        <div className="analytics-section performance-section">
          <PerformanceDashboard 
            connectionStatus={connectionStatus}
            messagesReceived={messagesReceived}
          />
        </div>
      </div>

      {/* Insights Section */}
      <div className="analytics-insights">
        <div className="insight-card">
          <div className="insight-icon">💡</div>
          <div className="insight-content">
            <h4>Insight</h4>
            <p>
              {currentPhase === 'peak' 
                ? 'Crowd density is at peak levels. Monitor closely for safety.'
                : currentPhase === 'building'
                ? 'Crowd is building. Prepare for potential peak conditions.'
                : currentPhase === 'dispersing'
                ? 'Crowd is dispersing. Situation improving gradually.'
                : 'Crowd levels are normal. Continue monitoring.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboardView;

