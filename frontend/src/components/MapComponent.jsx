/**
 * MapComponent - Leaflet map centered on Bengaluru
 * Displays static locations and dynamic BMTC bus markers
 */

import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import { useEffect, useState, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet.heat';
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

// Heatmap Layer Component
function HeatmapLayer({ densityData }) {
  const map = useMap();
  const heatLayerRef = useRef(null);

  useEffect(() => {
    if (!densityData || !densityData.grid) return;

    // Remove existing heat layer
    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
    }

    // Convert grid to heatmap points
    const heatPoints = [];
    const { grid, center_location, grid_size } = densityData;
    
    // Find max density for normalization
    let maxDensity = 0;
    grid.forEach(row => {
      row.forEach(density => {
        if (density > maxDensity) maxDensity = density;
      });
    });
    
    console.log('🔥 Heatmap Update:', {
      maxDensity,
      avgDensity: densityData.avg_density,
      gridSize: grid_size,
      isEventTime: densityData.is_event_time
    });
    
    grid.forEach((row, i) => {
      row.forEach((density, j) => {
        // Show all densities > 5 for better visualization
        if (density > 5) {
          // Convert grid position to lat/lon
          const lat_offset = (i - grid_size / 2) * 0.002;
          const lon_offset = (j - grid_size / 2) * 0.002;
          const lat = center_location[0] + lat_offset;
          const lon = center_location[1] + lon_offset;
          
          // Normalize intensity to 0-1 range based on actual max
          // Use square root for better visual distribution
          const normalizedIntensity = Math.sqrt(density / Math.max(maxDensity, 100));
          
          // Heatmap expects [lat, lon, intensity]
          heatPoints.push([lat, lon, normalizedIntensity]);
        }
      });
    });

    console.log('🗺️ Heatmap points:', heatPoints.length);

    // Create heat layer with improved settings
    if (heatPoints.length > 0) {
      heatLayerRef.current = L.heatLayer(heatPoints, {
        radius: 30,
        blur: 20,
        maxZoom: 18,
        max: 1.0,
        minOpacity: 0.3,
        gradient: {
          0.0: 'rgba(0, 255, 0, 0)',
          0.2: 'lime',
          0.4: 'yellow',
          0.6: 'orange',
          0.8: 'red',
          1.0: 'darkred'
        }
      }).addTo(map);
    }

    return () => {
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
      }
    };
  }, [densityData, map]);

  return null;
}

function MapComponent({ busData, densityData }) {
  const [buses, setBuses] = useState([]);
  const [hotspots, setHotspots] = useState([]);

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

  // Update hotspots when density data arrives
  useEffect(() => {
    if (densityData && densityData.hotspots) {
      setHotspots(densityData.hotspots);
    }
  }, [densityData]);

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

        {/* Crowd Density Heatmap */}
        <HeatmapLayer densityData={densityData} />

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

        {/* Crowd Density Hotspot Markers */}
        {hotspots.map((hotspot, index) => (
          <Circle
            key={`hotspot-${index}-${hotspot.density}`}
            center={[hotspot.lat, hotspot.lon]}
            radius={50}
            pathOptions={{
              color: hotspot.density > 200 ? '#8B0000' : hotspot.density > 150 ? '#FF4500' : '#FF8C00',
              fillColor: hotspot.density > 200 ? 'darkred' : hotspot.density > 150 ? 'red' : 'orange',
              fillOpacity: 0.5,
              weight: 3
            }}
          >
            <Popup>
              <div className="custom-popup">
                <strong>🔥 Crowd Hotspot #{index + 1}</strong><br/>
                <p><strong>Density:</strong> {hotspot.density} people</p>
                <p><strong>Alert Level:</strong> {
                  hotspot.density > 200 ? '🚨 CRITICAL' :
                  hotspot.density > 150 ? '⚠️ HIGH' : '⚡ MODERATE'
                }</p>
              </div>
            </Popup>
          </Circle>
        ))}

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
        <div className="legend-item">
          <span className="legend-color heatmap-gradient"></span>
          <span>Crowd Density</span>
        </div>
        <div className="legend-item">
          <span className="legend-icon">🔥</span>
          <span>Hotspots ({hotspots.length})</span>
        </div>
      </div>

      {/* Map Overlay Info */}
      <div className="map-info">
        <h4>📍 Bengaluru, Karnataka</h4>
        <p>Focus Area: M. Chinnaswamy Stadium & MG Road</p>
      </div>

      {/* Crowd Phase Status Badge */}
      {densityData && densityData.phase && (
        <div className={`phase-badge phase-${densityData.phase}`}>
          <div className="phase-icon">
            {densityData.phase === 'building' && '📈'}
            {densityData.phase === 'peak' && '🚨'}
            {densityData.phase === 'dispersing' && '📉'}
            {densityData.phase === 'low' && '✅'}
          </div>
          <div className="phase-content">
            <div className="phase-label">Crowd Status</div>
            <div className="phase-text">{densityData.status || densityData.phase.toUpperCase()}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MapComponent;

