/**
 * MetroFlowWidget - Displays real-time metro passenger flow data
 * Shows entry/exit rates and capacity status
 */

import './MetroFlowWidget.css';

function MetroFlowWidget({ metroData }) {
  if (!metroData) {
    return (
      <div className="metro-widget loading">
        <div className="metro-icon">🚇</div>
        <div className="metro-info">
          <p className="metro-status">Loading metro data...</p>
        </div>
      </div>
    );
  }

  const {
    station,
    entry_rate,
    exit_rate,
    total_flow,
    capacity_percent,
    status,
    flow_reason,
    crowd_phase
  } = metroData;

  // Get status color
  const getStatusColor = (status) => {
    switch(status) {
      case 'high': return '#ff6b6b';
      case 'moderate': return '#ffa500';
      case 'low': return '#00ff88';
      default: return '#4facfe';
    }
  };

  const statusColor = getStatusColor(status);

  return (
    <div className="metro-widget" style={{ borderLeftColor: statusColor }}>
      <div className="metro-header">
        <h3>🚇 Metro Flow</h3>
        <span className={`metro-status-badge ${status}`}>
          {status.toUpperCase()}
        </span>
      </div>

      <div className="metro-station-name">
        {station}
        {flow_reason && (
          <span className="flow-reason-badge">• {flow_reason}</span>
        )}
      </div>

      <div className="metro-flows">
        <div className="flow-item entry">
          <div className="flow-icon">↓</div>
          <div className="flow-details">
            <span className="flow-label">Entry Rate</span>
            <span className="flow-value">{entry_rate}</span>
            <span className="flow-unit">passengers/min</span>
          </div>
        </div>

        <div className="flow-divider"></div>

        <div className="flow-item exit">
          <div className="flow-icon">↑</div>
          <div className="flow-details">
            <span className="flow-label">Exit Rate</span>
            <span className="flow-value">{exit_rate}</span>
            <span className="flow-unit">passengers/min</span>
          </div>
        </div>
      </div>

      <div className="metro-capacity">
        <div className="capacity-header">
          <span>Capacity</span>
          <span className="capacity-value">{capacity_percent}%</span>
        </div>
        <div className="capacity-bar">
          <div 
            className="capacity-fill" 
            style={{ 
              width: `${capacity_percent}%`,
              backgroundColor: statusColor
            }}
          ></div>
        </div>
      </div>

      <div className="metro-total">
        <span>Total Flow:</span>
        <span className="total-value">{total_flow} passengers/min</span>
      </div>
    </div>
  );
}

export default MetroFlowWidget;

