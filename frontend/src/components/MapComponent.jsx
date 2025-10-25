/**
 * MapComponent - Leaflet map centered on Bengaluru
 * Displays static locations and dynamic BMTC bus markers
 */

import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { useEffect, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './MapComponent.css';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom bus icon
const busIcon = new L.DivIcon({
  html: '<div class="bus-marker">🚌</div>',
  className: 'custom-bus-icon',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

// Bengaluru coordinates (M. Chinnaswamy Stadium area)
const BENGALURU_CENTER = [12.9791, 77.5993];
const CHINNASWAMY_STADIUM = [12.9789, 77.5993];
const MG_ROAD_METRO = [12.9756, 77.6057];

function MapComponent({ busData }) {
  const [buses, setBuses] = useState([]);

  // Update buses when new data arrives
  useEffect(() => {
    if (busData && busData.buses) {
      // Filter out invalid coordinates
      const validBuses = busData.buses.filter(
        bus => bus.lat && bus.lon && 
               bus.lat >= -90 && bus.lat <= 90 && 
               bus.lon >= -180 && bus.lon <= 180 &&
               bus.lat !== 0 && bus.lon !== 0
      );
      setBuses(validBuses);
    }
  }, [busData]);

  return (
    <div className="map-wrapper">
      <MapContainer
        center={BENGALURU_CENTER}
        zoom={14}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        {/* OpenStreetMap Tile Layer - No API key required! */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* Key Location Markers */}
        
        {/* M. Chinnaswamy Stadium */}
        <Marker position={CHINNASWAMY_STADIUM}>
          <Popup>
            <div className="custom-popup">
              <h3>🏏 M. Chinnaswamy Stadium</h3>
              <p>Major event venue - High crowd density zone</p>
              <p><strong>Capacity:</strong> 40,000+</p>
            </div>
          </Popup>
        </Marker>
        
        {/* Event Zone Circle */}
        <Circle
          center={CHINNASWAMY_STADIUM}
          radius={500}
          pathOptions={{
            color: '#ff6b6b',
            fillColor: '#ff6b6b',
            fillOpacity: 0.2,
            weight: 2,
          }}
        >
          <Popup>
            <div className="custom-popup">
              <strong>Event Monitoring Zone</strong>
              <p>500m radius around stadium</p>
            </div>
          </Popup>
        </Circle>

        {/* MG Road Metro Station */}
        <Marker position={MG_ROAD_METRO}>
          <Popup>
            <div className="custom-popup">
              <h3>🚇 MG Road Metro Station</h3>
              <p>High traffic transit hub</p>
              <p>Purple & Green Line interchange</p>
            </div>
          </Popup>
        </Marker>

        {/* Metro Station Monitoring Circle */}
        <Circle
          center={MG_ROAD_METRO}
          radius={300}
          pathOptions={{
            color: '#4ecdc4',
            fillColor: '#4ecdc4',
            fillOpacity: 0.15,
            weight: 2,
          }}
        >
          <Popup>
            <div className="custom-popup">
              <strong>Metro Transit Zone</strong>
              <p>300m radius monitoring</p>
            </div>
          </Popup>
        </Circle>

        {/* Dynamic BMTC Bus Markers */}
        {buses.map((bus, index) => (
          <Marker
            key={`bus-${bus.id}-${index}`}
            position={[bus.lat, bus.lon]}
            icon={busIcon}
          >
            <Popup>
              <div className="custom-popup">
                <h3>🚌 BMTC Bus</h3>
                <p><strong>Route:</strong> {bus.route}</p>
                <p><strong>Speed:</strong> {bus.speed} km/h</p>
                <p><strong>Location:</strong> {bus.lat.toFixed(4)}, {bus.lon.toFixed(4)}</p>
                <p className="bus-update-time">
                  Updated: {new Date(bus.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Map Legend */}
      <div className="map-legend">
        <h4>Map Legend</h4>
        <div className="legend-item">
          <span className="legend-color" style={{ background: '#ff6b6b' }}></span>
          <span>Event Zone (500m)</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ background: '#4ecdc4' }}></span>
          <span>Metro Transit Zone (300m)</span>
        </div>
        <div className="legend-item">
          <span className="legend-icon">📍</span>
          <span>Key Locations</span>
        </div>
        <div className="legend-item">
          <span className="legend-icon">🚌</span>
          <span>BMTC Buses ({buses.length})</span>
        </div>
      </div>

      {/* Map Overlay Info */}
      <div className="map-info">
        <h4>📍 Bengaluru, Karnataka</h4>
        <p>Focus Area: M. Chinnaswamy Stadium & MG Road</p>
      </div>
    </div>
  );
}

export default MapComponent;

