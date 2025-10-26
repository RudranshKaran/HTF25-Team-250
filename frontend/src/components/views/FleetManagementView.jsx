import React from 'react';
import MetroFlowWidget from '../MetroFlowWidget';
import './FleetManagementView.css';

const FleetManagementView = ({ busData, metroData, multiMetroData, firstResponders }) => {
  const buses = busData?.buses || [];
  const metroStations = multiMetroData?.stations || [];
  
  // Match MapComponent data structure: firstResponders.responders is an array
  const respondersArray = firstResponders?.responders || [];
  
  // Group responders by type
  const policeUnits = respondersArray.filter(r => r.type === 'police');
  const ambulances = respondersArray.filter(r => r.type === 'ambulance');
  const fireUnits = respondersArray.filter(r => r.type === 'fire');
  const emergencyUnits = respondersArray.filter(r => r.type === 'emergency');
  
  const policeCount = policeUnits.length;
  const ambulanceCount = ambulances.length;
  const fireCount = fireUnits.length;
  const emergencyCount = emergencyUnits.length;

  return (
    <div className="fleet-management-view">
      {/* Fleet Summary Cards */}
      <div className="fleet-summary">
        <div className="fleet-card buses">
          <div className="fleet-icon">🚌</div>
          <div className="fleet-info">
            <h3>{buses.length}</h3>
            <p>BMTC Buses</p>
          </div>
        </div>

        <div className="fleet-card police">
          <div className="fleet-icon">👮</div>
          <div className="fleet-info">
            <h3>{policeCount}</h3>
            <p>Police Units</p>
          </div>
        </div>

        <div className="fleet-card ambulance">
          <div className="fleet-icon">🚑</div>
          <div className="fleet-info">
            <h3>{ambulanceCount}</h3>
            <p>Ambulances</p>
          </div>
        </div>

        <div className="fleet-card fire">
          <div className="fleet-icon">🚒</div>
          <div className="fleet-info">
            <h3>{fireCount}</h3>
            <p>Fire Trucks</p>
          </div>
        </div>

        <div className="fleet-card emergency">
          <div className="fleet-icon">🚨</div>
          <div className="fleet-info">
            <h3>{emergencyCount}</h3>
            <p>Emergency</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="fleet-content-grid">
        {/* BMTC Buses Section */}
        <div className="fleet-section">
          <h2 className="section-title">🚌 BMTC Buses</h2>
          <div className="fleet-list">
            {buses.length > 0 ? (
              buses.map((bus, idx) => (
                <div key={idx} className="fleet-item">
                  <div className="item-icon">🚌</div>
                  <div className="item-details">
                    <div className="item-name">Bus #{bus.route || idx + 1}</div>
                    <div className="item-location">
                      {bus.lat?.toFixed(4)}, {bus.lon?.toFixed(4)}
                    </div>
                  </div>
                  <div className="item-status active">Active</div>
                </div>
              ))
            ) : (
              <div className="empty-state">No buses currently tracked</div>
            )}
          </div>
        </div>

        {/* First Responders Section - Display data from map */}
        <div className="fleet-section">
          <h2 className="section-title">🚨 First Responders</h2>
          <div className="fleet-list">
            {respondersArray.length > 0 ? (
              <>
                {/* Police Units */}
                {policeUnits.map((unit, idx) => (
                  <div key={`police-${unit.id}`} className="fleet-item responder-police">
                    <div className="item-icon">🚓</div>
                    <div className="item-details">
                      <div className="item-name">{unit.name || `Police Unit ${unit.id}`}</div>
                      <div className="item-meta">
                        <span className="meta-badge">{unit.vehicle_id}</span>
                        <span className="meta-badge status-{unit.status}">{unit.status}</span>
                      </div>
                      <div className="item-location">
                        📍 {unit.zone || 'Patrolling'} - {unit.lat.toFixed(4)}, {unit.lon.toFixed(4)}
                      </div>
                      <div className="item-speed">Speed: {unit.speed} km/h</div>
                    </div>
                    <div className={`item-status ${unit.status}`}>{unit.status.toUpperCase()}</div>
                  </div>
                ))}
                
                {/* Ambulances */}
                {ambulances.map((unit, idx) => (
                  <div key={`ambulance-${unit.id}`} className="fleet-item responder-ambulance">
                    <div className="item-icon">🚑</div>
                    <div className="item-details">
                      <div className="item-name">{unit.name || `Ambulance ${unit.id}`}</div>
                      <div className="item-meta">
                        <span className="meta-badge">{unit.vehicle_id}</span>
                        <span className="meta-badge status-{unit.status}">{unit.status}</span>
                      </div>
                      <div className="item-location">
                        📍 {unit.zone || 'Standby'} - {unit.lat.toFixed(4)}, {unit.lon.toFixed(4)}
                      </div>
                      <div className="item-speed">Speed: {unit.speed} km/h</div>
                    </div>
                    <div className={`item-status ${unit.status}`}>{unit.status.toUpperCase()}</div>
                  </div>
                ))}
                
                {/* Fire Trucks */}
                {fireUnits.map((unit, idx) => (
                  <div key={`fire-${unit.id}`} className="fleet-item responder-fire">
                    <div className="item-icon">🚒</div>
                    <div className="item-details">
                      <div className="item-name">{unit.name || `Fire Truck ${unit.id}`}</div>
                      <div className="item-meta">
                        <span className="meta-badge">{unit.vehicle_id}</span>
                        <span className="meta-badge status-{unit.status}">{unit.status}</span>
                      </div>
                      <div className="item-location">
                        📍 {unit.zone || 'Station'} - {unit.lat.toFixed(4)}, {unit.lon.toFixed(4)}
                      </div>
                      <div className="item-speed">Speed: {unit.speed} km/h</div>
                    </div>
                    <div className={`item-status ${unit.status}`}>{unit.status.toUpperCase()}</div>
                  </div>
                ))}
                
                {/* Emergency Units */}
                {emergencyUnits.map((unit, idx) => (
                  <div key={`emergency-${unit.id}`} className="fleet-item responder-emergency">
                    <div className="item-icon">🚨</div>
                    <div className="item-details">
                      <div className="item-name">{unit.name || `Emergency Unit ${unit.id}`}</div>
                      <div className="item-meta">
                        <span className="meta-badge">{unit.vehicle_id}</span>
                        <span className="meta-badge status-{unit.status}">{unit.status}</span>
                      </div>
                      <div className="item-location">
                        📍 {unit.zone || 'Active'} - {unit.lat.toFixed(4)}, {unit.lon.toFixed(4)}
                      </div>
                      <div className="item-speed">Speed: {unit.speed} km/h</div>
                    </div>
                    <div className={`item-status ${unit.status}`}>{unit.status.toUpperCase()}</div>
                  </div>
                ))}
              </>
            ) : (
              <div className="empty-state">No first responders currently tracked</div>
            )}
          </div>
        </div>

        {/* Metro Flow Section */}
        <div className="fleet-section metro-section">
          <h2 className="section-title">🚇 Metro Stations</h2>
          <div className="fleet-list">
            {metroStations.length > 0 ? (
              metroStations.map((station, idx) => (
                <div key={station.id || idx} className="fleet-item metro-item">
                  <div className="item-icon">🚇</div>
                  <div className="item-details">
                    <div className="item-name">{station.station}</div>
                    <div className="item-meta">
                      <span className="meta-badge" style={{ backgroundColor: station.color || '#28458C' }}>
                        {station.line}
                      </span>
                      <span className={`meta-badge status-${station.status}`}>{station.status.toUpperCase()}</span>
                    </div>
                    <div className="metro-flow-stats">
                      <div className="flow-stat">
                        <span className="flow-label">Entry:</span>
                        <span className="flow-value">{station.entry_rate}/min</span>
                      </div>
                      <div className="flow-stat">
                        <span className="flow-label">Exit:</span>
                        <span className="flow-value">{station.exit_rate}/min</span>
                      </div>
                      <div className="flow-stat">
                        <span className="flow-label">Total:</span>
                        <span className="flow-value">{station.total_flow}/min</span>
                      </div>
                      <div className="flow-stat">
                        <span className="flow-label">Capacity:</span>
                        <span className="flow-value">{station.capacity_percent}%</span>
                      </div>
                    </div>
                    <div className="item-reason">
                      {station.flow_reason} • Phase: {station.crowd_phase}
                    </div>
                  </div>
                  <div className={`item-status ${station.status}`}>{station.status.toUpperCase()}</div>
                </div>
              ))
            ) : metroData ? (
              // Fallback to single metro widget if multi-metro not available
              <MetroFlowWidget metroData={metroData} />
            ) : (
              <div className="empty-state">No metro station data available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FleetManagementView;

