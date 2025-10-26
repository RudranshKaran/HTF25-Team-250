import React from 'react';
import './ZoneSelector.css';

const ZoneSelector = ({ selectedZone, onZoneChange }) => {
  const zones = [
    { id: 'all', name: 'All Zones (City-Wide View)', icon: '🌐' },
    { id: 'stadium', name: 'Chinnaswamy Stadium', icon: '🏟️' },
    { id: 'mg_road_metro', name: 'MG Road Metro', icon: '🚇' },
    { id: 'majestic', name: 'Majestic Bus Stand', icon: '🚌' },
    { id: 'electronic_city', name: 'Electronic City', icon: '💼' },
    { id: 'koramangala', name: 'Koramangala', icon: '🛍️' },
    { id: 'indiranagar', name: 'Indiranagar', icon: '🏠' },
    { id: 'cubbon_park', name: 'Cubbon Park Area', icon: '🏛️' }
  ];

  return (
    <div className="zone-selector">
      <label htmlFor="zone-select" className="zone-label">
        <span className="zone-label-icon">🗺️</span>
        <span className="zone-label-text">Select Zone:</span>
      </label>
      <select 
        id="zone-select"
        value={selectedZone}
        onChange={(e) => onZoneChange(e.target.value)}
        className="zone-dropdown"
      >
        {zones.map(zone => (
          <option key={zone.id} value={zone.id}>
            {zone.icon} {zone.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ZoneSelector;

