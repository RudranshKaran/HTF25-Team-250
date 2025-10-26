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

// Custom first responder icons
const createResponderIcon = (icon, color) => {
  return new L.DivIcon({
    html: `<div class="responder-marker">${icon}</div>`,
    className: 'custom-responder-icon',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

// Custom hotspot icon (crowd density hotspot)
const createHotspotIcon = (intensity) => {
  // Intensity ranges from 0 to 1, scale to size and opacity
  const size = 20 + (intensity * 30); // 20px to 50px
  const opacity = 0.6 + (intensity * 0.4); // 0.6 to 1.0
  
  return new L.DivIcon({
    html: `<div class="hotspot-marker" style="width: ${size}px; height: ${size}px; opacity: ${opacity};">
             <div class="hotspot-pulse"></div>
             <div class="hotspot-icon">📍</div>
           </div>`,
    className: 'custom-hotspot-icon',
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
  });
};

const responderIcons = {
  police: createResponderIcon('🚓', '#0066cc'),
  ambulance: createResponderIcon('🚑', '#ff3333'),
  fire: createResponderIcon('🚒', '#ff6600'),
  emergency: createResponderIcon('🚨', '#ff00ff')
};

// Bengaluru coordinates (M. Chinnaswamy Stadium area)
const BENGALURU_CENTER = [12.9791, 77.5993];
const CHINNASWAMY_STADIUM = [12.9789, 77.5993];

// Metro Stations (Namma Metro)
const MG_ROAD_METRO = [12.9756, 77.6057]; // Blue/Purple Line interchange
const MAJESTIC_METRO = [12.9767, 77.5713]; // Majestic Interchange (Purple/Green)
const INDIRANAGAR_METRO = [12.9784, 77.6408]; // Purple Line
const ELECTRONIC_CITY_METRO = [12.8450, 77.6628]; // Green Line terminus

// Heatmap Layer Component - MULTI-ZONE SUPPORT
function HeatmapLayer({ densityData, selectedZone = 'all' }) {
  const map = useMap();
  const heatLayerRef = useRef(null);

  useEffect(() => {
    if (!densityData) return;

    // Remove existing heat layer
    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
    }

    const heatPoints = [];
    let maxDensityGlobal = 0;

    // Check if we have multi-zone data
    if (densityData.zones) {
      // NEW MULTI-ZONE FORMAT
      console.log('🔥 Multi-Zone Heatmap Update - Zones:', Object.keys(densityData.zones).length);
      
      // Process each zone
      Object.entries(densityData.zones).forEach(([zoneId, zoneData]) => {
        // Skip zones not selected (unless 'all' is selected)
        if (selectedZone !== 'all' && selectedZone !== zoneId) return;

        const { grid, center } = zoneData;
        const grid_size = 10; // Standard grid size
        
        if (!grid || !center) {
          console.warn(`⚠️ Zone ${zoneId} missing grid or center`);
          return;
        }

        // Find max density for this zone
        let maxDensity = 0;
        grid.forEach(row => {
          row.forEach(density => {
            if (density > maxDensity) maxDensity = density;
            if (density > maxDensityGlobal) maxDensityGlobal = density;
          });
        });

        // Convert grid to heatmap points
        grid.forEach((row, i) => {
          row.forEach((density, j) => {
            if (density > 5) {
              // Convert grid position to lat/lon
              const lat_offset = (i - grid_size / 2) * 0.002;
              const lon_offset = (j - grid_size / 2) * 0.002;
              const lat = center[0] + lat_offset;
              const lon = center[1] + lon_offset;
              
              // Normalize intensity
              const normalizedIntensity = Math.sqrt(density / Math.max(maxDensity, 100));
              
              heatPoints.push([lat, lon, normalizedIntensity]);
            }
          });
        });
      });

      console.log(`🗺️ Multi-Zone Heatmap: ${heatPoints.length} points, Max Density: ${maxDensityGlobal}`);
    } 
    else if (densityData.grid && densityData.center_location) {
      // OLD SINGLE-ZONE FORMAT (backward compatibility)
      console.log('🔥 Single-Zone Heatmap Update (Legacy)');
      
      const { grid, center_location, grid_size = 10 } = densityData;
      
      // Find max density
      grid.forEach(row => {
        row.forEach(density => {
          if (density > maxDensityGlobal) maxDensityGlobal = density;
        });
      });

      // Convert grid to heatmap points
      grid.forEach((row, i) => {
        row.forEach((density, j) => {
          if (density > 5) {
            const lat_offset = (i - grid_size / 2) * 0.002;
            const lon_offset = (j - grid_size / 2) * 0.002;
            const lat = center_location[0] + lat_offset;
            const lon = center_location[1] + lon_offset;
            
            const normalizedIntensity = Math.sqrt(density / Math.max(maxDensityGlobal, 100));
            
            heatPoints.push([lat, lon, normalizedIntensity]);
          }
        });
      });

      console.log(`🗺️ Single-Zone Heatmap: ${heatPoints.length} points`);
    } else {
      console.warn('⚠️ Heatmap: Invalid data structure', densityData);
      return;
    }

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
  }, [densityData, selectedZone, map]);

  return null;
}

// Component to handle map centering on zone selection
function ZoneCenterController({ selectedZone, zones }) {
  const map = useMap();

  useEffect(() => {
    if (selectedZone && selectedZone !== 'all' && zones[selectedZone]) {
      const zone = zones[selectedZone];
      // Calculate appropriate zoom level based on radius
      const zoomLevel = zone.radius > 1500 ? 13 : zone.radius > 800 ? 14 : 15;
      map.flyTo(zone.center, zoomLevel, {
        duration: 1.5,
        easeLinearity: 0.25
      });
    } else if (selectedZone === 'all') {
      // Show all of Bengaluru
      map.flyTo([12.9716, 77.5946], 12, {
        duration: 1.5,
        easeLinearity: 0.25
      });
    }
  }, [selectedZone, zones, map]);

  return null;
}

function MapComponent({ busData, densityData, firstResponders, selectedZone = 'all' }) {
  const [buses, setBuses] = useState([]);
  const [hotspots, setHotspots] = useState([]);
  const [responders, setResponders] = useState([]);
  const [legendCollapsed, setLegendCollapsed] = useState(false);

  // Zone definitions with Metro Line colors
  const zones = {
    stadium: { center: [12.9789, 77.5993], radius: 1000, color: '#CB0020', name: 'Chinnaswamy Stadium' }, // Red Line
    mg_road_metro: { center: [12.9756, 77.6057], radius: 500, color: '#28458C', name: 'MG Road Metro' }, // Blue Line
    majestic: { center: [12.9767, 77.5713], radius: 800, color: '#FF6300', name: 'Majestic Bus Stand' }, // Orange Line
    electronic_city: { center: [12.8450, 77.6628], radius: 2000, color: '#009933', name: 'Electronic City' }, // Green Line
    koramangala: { center: [12.9352, 77.6245], radius: 1500, color: '#FFDF00', name: 'Koramangala' }, // Yellow Line
    indiranagar: { center: [12.9784, 77.6408], radius: 1200, color: '#8C2877', name: 'Indiranagar' }, // Purple Line
    cubbon_park: { center: [12.9762, 77.5929], radius: 1000, color: '#FF49A7', name: 'Cubbon Park Area' } // Pink Line
  };

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
    if (!densityData) {
      setHotspots([]);
      return;
    }

    // Multi-zone format: extract hotspots from all zones
    if (densityData.zones) {
      const allHotspots = [];
      Object.entries(densityData.zones).forEach(([zoneId, zoneData]) => {
        // Skip zones not selected (unless 'all' is selected)
        if (selectedZone !== 'all' && selectedZone !== zoneId) return;
        
        if (zoneData.hotspots && Array.isArray(zoneData.hotspots)) {
          // Add zone ID to each hotspot for tracking
          const zoneHotspots = zoneData.hotspots.map(h => ({
            ...h,
            zone: zoneId,
            zoneName: zoneData.zone_name || zoneId
          }));
          allHotspots.push(...zoneHotspots);
        }
      });
      console.log(`🔥 Multi-Zone Hotspots: ${allHotspots.length} across ${Object.keys(densityData.zones).length} zones`);
      setHotspots(allHotspots);
    } 
    // Single-zone format (backward compatibility)
    else if (densityData.hotspots) {
      console.log(`🔥 Single-Zone Hotspots: ${densityData.hotspots.length}`);
      setHotspots(densityData.hotspots);
    } else {
      console.warn('⚠️ No hotspot data in densityData');
      setHotspots([]);
    }
  }, [densityData, selectedZone]);

  // Update first responders when new data arrives
  useEffect(() => {
    if (firstResponders && firstResponders.responders) {
      setResponders(firstResponders.responders);
    }
  }, [firstResponders]);

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

        {/* Crowd Density Heatmap - Multi-Zone */}
        <HeatmapLayer densityData={densityData} selectedZone={selectedZone} />

        {/* Zone Center Controller */}
        <ZoneCenterController selectedZone={selectedZone} zones={zones} />

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

        {/* Metro Stations with Monitoring Circles */}
        
        {/* MG Road Metro Station - Blue/Purple Line */}
        <Marker position={MG_ROAD_METRO}>
          <Popup>
            <div className="custom-popup">
              <h3>🚇 MG Road Metro Station</h3>
              <p><strong>Lines:</strong> Blue & Purple Line interchange</p>
              <p><strong>Type:</strong> High traffic transit hub</p>
              <p><strong>Facilities:</strong> Underground station with multiple exits</p>
            </div>
          </Popup>
        </Marker>
        <Circle
          center={MG_ROAD_METRO}
          radius={300}
          pathOptions={{ color: '#28458C', fillColor: '#28458C', fillOpacity: 0.15, weight: 2 }}
        >
          <Popup><strong>MG Road Metro Transit Zone</strong><p>300m radius</p></Popup>
        </Circle>

        {/* Majestic Metro Station - Purple/Green Line */}
        <Marker position={MAJESTIC_METRO}>
          <Popup>
            <div className="custom-popup">
              <h3>🚇 Majestic Metro Station</h3>
              <p><strong>Lines:</strong> Purple & Green Line interchange</p>
              <p><strong>Type:</strong> Major interchange hub</p>
              <p><strong>Adjacent:</strong> Kempegowda Bus Station, Railway Station</p>
            </div>
          </Popup>
        </Marker>
        <Circle
          center={MAJESTIC_METRO}
          radius={400}
          pathOptions={{ color: '#FF6300', fillColor: '#FF6300', fillOpacity: 0.15, weight: 2 }}
        >
          <Popup><strong>Majestic Transit Zone</strong><p>400m radius</p></Popup>
        </Circle>

        {/* Indiranagar Metro Station - Purple Line */}
        <Marker position={INDIRANAGAR_METRO}>
          <Popup>
            <div className="custom-popup">
              <h3>🚇 Indiranagar Metro Station</h3>
              <p><strong>Line:</strong> Purple Line</p>
              <p><strong>Type:</strong> Commercial & residential hub</p>
              <p><strong>Area:</strong> Popular shopping and dining district</p>
            </div>
          </Popup>
        </Marker>
        <Circle
          center={INDIRANAGAR_METRO}
          radius={300}
          pathOptions={{ color: '#8C2877', fillColor: '#8C2877', fillOpacity: 0.15, weight: 2 }}
        >
          <Popup><strong>Indiranagar Metro Transit Zone</strong><p>300m radius</p></Popup>
        </Circle>

        {/* Electronic City Metro Station - Green Line */}
        <Marker position={ELECTRONIC_CITY_METRO}>
          <Popup>
            <div className="custom-popup">
              <h3>🚇 Electronic City Metro Station</h3>
              <p><strong>Line:</strong> Green Line terminus</p>
              <p><strong>Type:</strong> IT corridor terminus</p>
              <p><strong>Area:</strong> Major tech hub with high office density</p>
            </div>
          </Popup>
        </Marker>
        <Circle
          center={ELECTRONIC_CITY_METRO}
          radius={500}
          pathOptions={{ color: '#009933', fillColor: '#009933', fillOpacity: 0.15, weight: 2 }}
        >
          <Popup><strong>Electronic City Metro Transit Zone</strong><p>500m radius</p></Popup>
        </Circle>

        {/* Multi-Zone Circles */}
        {Object.entries(zones).map(([zoneId, zone]) => (
          <Circle
            key={`zone-${zoneId}`}
            center={zone.center}
            radius={zone.radius}
            pathOptions={{
              color: zone.color,
              fillColor: zone.color,
              fillOpacity: selectedZone === zoneId ? 0.25 : selectedZone === 'all' ? 0.1 : 0.05,
              weight: selectedZone === zoneId ? 3 : selectedZone === 'all' ? 2 : 1,
              dashArray: selectedZone === zoneId ? null : '5, 10'
            }}
          >
            <Popup>
              <div className="custom-popup">
                <h3>{zone.name}</h3>
                <p><strong>Monitoring Zone</strong></p>
                <p>Radius: {zone.radius}m</p>
              </div>
            </Popup>
          </Circle>
        ))}

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

        {/* First Responders Markers */}
        {responders.map((responder, index) => (
          <Marker
            key={`responder-${responder.id}-${index}`}
            position={[responder.lat, responder.lon]}
            icon={responderIcons[responder.type]}
            zIndexOffset={1000}
          >
            <Popup>
              <div className="custom-popup">
                <h3>{responder.icon} {responder.name}</h3>
                <p><strong>Unit ID:</strong> {responder.id}</p>
                <p><strong>Vehicle:</strong> {responder.vehicle_id}</p>
                <p><strong>Status:</strong> <span className={`status-${responder.status}`}>{responder.status.toUpperCase()}</span></p>
                <p><strong>Speed:</strong> {responder.speed} km/h</p>
                <p><strong>Zone:</strong> {responder.zone}</p>
                <p><strong>Location:</strong> {responder.lat.toFixed(4)}, {responder.lon.toFixed(4)}</p>
                <p className="responder-update-time">
                  Updated: {new Date(responder.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Crowd Density Hotspot Markers */}
        {hotspots.map((hotspot, index) => {
          // Normalize intensity to 0-1 range
          const normalizedIntensity = Math.min(hotspot.intensity / 250, 1);
          
          return (
            <Marker
              key={`hotspot-${index}`}
              position={[hotspot.lat, hotspot.lon]}
              icon={createHotspotIcon(normalizedIntensity)}
              zIndexOffset={500}
            >
              <Popup>
                <div className="custom-popup hotspot-popup">
                  <h3>🔥 Crowd Hotspot</h3>
                  <p><strong>Density Level:</strong> {Math.round(hotspot.intensity)} people</p>
                  <p><strong>Intensity:</strong> 
                    <span className={`intensity-${normalizedIntensity > 0.7 ? 'critical' : normalizedIntensity > 0.4 ? 'high' : 'moderate'}`}>
                      {normalizedIntensity > 0.7 ? ' CRITICAL' : normalizedIntensity > 0.4 ? ' HIGH' : ' MODERATE'}
                    </span>
                  </p>
                  <p><strong>Location:</strong> {hotspot.lat.toFixed(4)}, {hotspot.lon.toFixed(4)}</p>
                  <p className="hotspot-warning">
                    {normalizedIntensity > 0.7 ? '⚠️ Immediate attention required' : 
                     normalizedIntensity > 0.4 ? '⚠️ Monitor closely' : 
                     'ℹ️ Normal crowd levels'}
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Map Legend - Collapsible */}
      <div className={`map-legend ${legendCollapsed ? 'collapsed' : ''}`}>
        <div className="legend-header" onClick={() => setLegendCollapsed(!legendCollapsed)}>
          <h4>Map Legend</h4>
          <button className="legend-toggle">
            {legendCollapsed ? '▲' : '▼'}
          </button>
        </div>
        {!legendCollapsed && (
          <div className="legend-content">
            <div className="legend-item">
              <span className="legend-color" style={{ background: '#ff6b6b' }}></span>
              <span>Event Zone (500m)</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ background: '#28458C' }}></span>
              <span>Metro Stations (4)</span>
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
              <span className="legend-icon">🚓</span>
              <span>Police ({responders.filter(r => r.type === 'police').length})</span>
            </div>
            <div className="legend-item">
              <span className="legend-icon">🚑</span>
              <span>Ambulance ({responders.filter(r => r.type === 'ambulance').length})</span>
            </div>
            <div className="legend-item">
              <span className="legend-icon">🚒</span>
              <span>Fire Trucks ({responders.filter(r => r.type === 'fire').length})</span>
            </div>
            <div className="legend-item">
              <span className="legend-icon">🚨</span>
              <span>Emergency ({responders.filter(r => r.type === 'emergency').length})</span>
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
        )}
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

