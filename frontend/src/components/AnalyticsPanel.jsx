/**
 * AnalyticsPanel - Historical data visualization with charts
 * Shows trends and patterns over last 30 minutes
 */

import { useState, useEffect } from 'react';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import './AnalyticsPanel.css';

function AnalyticsPanel({ densityData, metroData, embedded = false, selectedZone = 'all' }) {
  const [chartData, setChartData] = useState({ density_chart: [], metro_chart: [] });
  const [isExpanded, setIsExpanded] = useState(embedded ? true : false);
  
  // Extract current density value (handle both old single-zone and new multi-zone format)
  const getCurrentDensity = () => {
    if (!densityData) return null;
    
    // New multi-zone format
    if (densityData.zones) {
      if (selectedZone && selectedZone !== 'all' && densityData.zones[selectedZone]) {
        return densityData.zones[selectedZone].max_density;
      }
      // For 'all', use global max from summary
      return densityData.summary?.max_density_overall || 0;
    }
    
    // Old single-zone format (backward compatibility)
    return densityData.max_density || 0;
  };
  
  // Extract current trend (handle both formats)
  const getCurrentTrend = () => {
    if (!densityData) return null;
    
    // New multi-zone format
    if (densityData.zones) {
      if (selectedZone && selectedZone !== 'all' && densityData.zones[selectedZone]) {
        return densityData.zones[selectedZone].trend;
      }
      // For 'all', use general trend
      return densityData.trend || 'stable';
    }
    
    // Old format
    return densityData.trend;
  };

  // Fetch chart data from backend
  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/charts');
        const data = await response.json();
        setChartData(data);
      } catch (error) {
        console.error('Failed to fetch chart data:', error);
      }
    };

    // Fetch initially and then every 30 seconds
    fetchChartData();
    const interval = setInterval(fetchChartData, 30000);

    return () => clearInterval(interval);
  }, []);

  // Get trend emoji
  const getTrendEmoji = (trend) => {
    switch(trend) {
      case 'increasing': return '↗️';
      case 'decreasing': return '↘️';
      case 'stable': return '→';
      default: return '→';
    }
  };

  // Get trend color
  const getTrendColor = (trend) => {
    switch(trend) {
      case 'increasing': return '#ff6b6b';
      case 'decreasing': return '#4facfe';
      case 'stable': return '#00ff88';
      default: return '#8b9dc3';
    }
  };

  return (
    <div className={`analytics-panel ${embedded ? 'embedded' : isExpanded ? 'expanded' : 'collapsed'}`}>
      {!embedded && (
      <div className="analytics-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="analytics-title">
          📊 Analytics & Trends
        </div>
        <div className="analytics-toggle">
          {isExpanded ? '▼' : '▲'}
        </div>
      </div>
      )}

      {(isExpanded || embedded) && (
        <div className="analytics-content">
          {/* Crowd Density Chart */}
          <div className="chart-section">
            <div className="chart-header">
              <h4>🔥 Crowd Density Over Time</h4>
              {getCurrentTrend() && (
                <span className="trend-indicator" style={{ color: getTrendColor(getCurrentTrend()) }}>
                  {getTrendEmoji(getCurrentTrend())} {getCurrentTrend().toUpperCase()}
                </span>
              )}
            </div>

            {chartData.density_chart.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={chartData.density_chart}>
                  <defs>
                    <linearGradient id="densityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff6b6b" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#ff6b6b" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a3f5f" />
                  <XAxis 
                    dataKey="time" 
                    stroke="#8b9dc3" 
                    style={{ fontSize: '0.75rem' }}
                  />
                  <YAxis 
                    stroke="#8b9dc3" 
                    style={{ fontSize: '0.75rem' }}
                  />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: '#0f1628', 
                      border: '1px solid #2a3f5f',
                      borderRadius: '8px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="max" 
                    stroke="#ff6b6b" 
                    fillOpacity={1} 
                    fill="url(#densityGradient)"
                    name="Max Density"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="avg" 
                    stroke="#ffa500" 
                    strokeWidth={2}
                    dot={false}
                    name="Avg Density"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="chart-placeholder">
                Collecting data... (Need 3+ data points)
              </div>
            )}
          </div>

          {/* Metro Flow Chart */}
          <div className="chart-section">
            <div className="chart-header">
              <h4>🚇 Metro Flow Over Time</h4>
              {metroData?.trend && (
                <span className="trend-indicator" style={{ color: getTrendColor(metroData.trend) }}>
                  {getTrendEmoji(metroData.trend)} {metroData.trend.toUpperCase()}
                </span>
              )}
            </div>

            {chartData.metro_chart.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData.metro_chart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a3f5f" />
                  <XAxis 
                    dataKey="time" 
                    stroke="#8b9dc3" 
                    style={{ fontSize: '0.75rem' }}
                  />
                  <YAxis 
                    stroke="#8b9dc3" 
                    style={{ fontSize: '0.75rem' }}
                  />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: '#0f1628', 
                      border: '1px solid #2a3f5f',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="entry" 
                    stroke="#4facfe" 
                    strokeWidth={2}
                    name="Entry Rate"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="exit" 
                    stroke="#ff6b6b" 
                    strokeWidth={2}
                    name="Exit Rate"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="chart-placeholder">
                Collecting data... (Need 3+ data points)
              </div>
            )}
          </div>

          {/* Prediction - Handle multi-zone format */}
          {(() => {
            const prediction = densityData?.prediction || 
                             (densityData?.zones && selectedZone !== 'all' && densityData.zones[selectedZone]?.prediction);
            return prediction ? (
              <div className="prediction-alert">
                <div className="prediction-icon">🔮</div>
                <div className="prediction-content">
                  <div className="prediction-title">Predictive Alert</div>
                  <div className="prediction-message">
                    {prediction.level === 'warning' ? '⚠️ WARNING' : '🚨 CRITICAL'} threshold ({prediction.threshold}) 
                    predicted in ~<strong>{prediction.estimated_minutes} minutes</strong>
                  </div>
                  <div className="prediction-details">
                    Current: {prediction.current_density} | 
                    Rate: +{prediction.rate}/update
                  </div>
                </div>
              </div>
            ) : null;
          })()}
        </div>
      )}
    </div>
  );
}

export default AnalyticsPanel;

