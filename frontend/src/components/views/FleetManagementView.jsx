import React from 'react';
import MetroFlowWidget from '../MetroFlowWidget';
import './FleetManagementView.css';

const FleetManagementView = ({ busData, metroData, firstResponders }) => {
  const buses = busData?.buses || [];
  const responders = firstResponders || {};

  const policeCount = responders.police?.length || 0;
  const ambulanceCount = responders.ambulance?.length || 0;
  const fireCount = responders.fire?.length || 0;
  const emergencyCount = responders.emergency?.length || 0;

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

        {/* First Responders Section */}
        <div className="fleet-section">
          <h2 className="section-title">🚨 First Responders</h2>
          <div className="fleet-list">
            {responders.police?.map((unit, idx) => (
              <div key={`police-${idx}`} className="fleet-item">
                <div className="item-icon">👮</div>
                <div className="item-details">
                  <div className="item-name">Police Unit #{idx + 1}</div>
                  <div className="item-location">
                    {unit.lat.toFixed(4)}, {unit.lon.toFixed(4)}
                  </div>
                </div>
                <div className="item-status active">Patrolling</div>
              </div>
            ))}
            {responders.ambulance?.map((unit, idx) => (
              <div key={`ambulance-${idx}`} className="fleet-item">
                <div className="item-icon">🚑</div>
                <div className="item-details">
                  <div className="item-name">Ambulance #{idx + 1}</div>
                  <div className="item-location">
                    {unit.lat.toFixed(4)}, {unit.lon.toFixed(4)}
                  </div>
                </div>
                <div className="item-status active">Available</div>
              </div>
            ))}
            {responders.fire?.map((unit, idx) => (
              <div key={`fire-${idx}`} className="fleet-item">
                <div className="item-icon">🚒</div>
                <div className="item-details">
                  <div className="item-name">Fire Truck #{idx + 1}</div>
                  <div className="item-location">
                    {unit.lat.toFixed(4)}, {unit.lon.toFixed(4)}
                  </div>
                </div>
                <div className="item-status active">Standby</div>
              </div>
            ))}
            {responders.emergency?.map((unit, idx) => (
              <div key={`emergency-${idx}`} className="fleet-item">
                <div className="item-icon">🚨</div>
                <div className="item-details">
                  <div className="item-name">Emergency #{idx + 1}</div>
                  <div className="item-location">
                    {unit.lat.toFixed(4)}, {unit.lon.toFixed(4)}
                  </div>
                </div>
                <div className="item-status active">Active</div>
              </div>
            ))}
          </div>
        </div>

        {/* Metro Flow Section */}
        <div className="fleet-section metro-section">
          <h2 className="section-title">🚇 Metro Stations</h2>
          <MetroFlowWidget metroData={metroData} />
        </div>
      </div>
    </div>
  );
};

export default FleetManagementView;

