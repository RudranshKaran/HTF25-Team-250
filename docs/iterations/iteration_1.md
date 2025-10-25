# Iteration 1 - Initial Dashboard Implementation

**Date**: Pre-October 26, 2025  
**Version**: 1.0  
**Status**: Completed

---

## Overview

Initial implementation of the Crowd Safety Intelligence System dashboard. This iteration established the foundation for real-time crowd monitoring with basic visualization, external data integration, and alert systems.

---

## Features Implemented

### 1. Core WebSocket Infrastructure
- **FastAPI Backend**: Async WebSocket server on port 8000
- **React Frontend**: WebSocket client with auto-reconnection
- **Message Protocol**: JSON-based bidirectional communication
- **Connection Status**: Visual indicator (connected/disconnected/connecting)

### 2. Map Visualization
- **Leaflet Integration**: Interactive map centered on Bengaluru
- **Heatmap Overlay**: Using leaflet.heat plugin for crowd density
- **Bus Markers**: Real-time BMTC bus positions with custom 🚌 icons
- **Static Locations**: 
  - Chinnaswamy Stadium marker
  - MG Road Metro marker

### 3. Data Streams

#### BMTC Bus GPS Data
- **Source**: Unofficial BMTC API (bmtcmob.hostg.in)
- **Routes**: 356, 500, G4, 335E, KIA-9
- **Refresh Rate**: Every 5 seconds
- **Data Points**: Vehicle ID, route, latitude, longitude, speed

#### Weather Data
- **Source**: OpenWeatherMap API
- **Location**: Bengaluru (12.9716, 77.5946)
- **Refresh Rate**: Every 10 minutes
- **Data Points**: Temperature, feels-like, humidity, wind speed, description

#### Metro Flow Simulation
- **Implementation**: Backend simulation engine
- **Station**: MG Road Metro
- **Metrics**: Entry rate, exit rate, capacity utilization
- **Refresh Rate**: Every 3 seconds

#### Crowd Density Simulation
- **Algorithm**: Grid-based density modeling
- **Grid Size**: 20x20 cells
- **Center**: Chinnaswamy Stadium area
- **Phases**: Normal, Event, Dispersal
- **Refresh Rate**: Every 2 seconds

### 4. Alert System

#### Alert Levels
- **Critical**: Density > 120 (red alert sound)
- **Warning**: Density 80-120 (warning alert sound)
- **Info**: System notifications

#### Components
- **AlertBanner**: Top banner showing active alerts
- **AlertHistory**: Side panel with chronological alert log
- **NotificationCenter**: Toast notifications
- **Audio Alerts**: Custom sounds for different severity levels

### 5. Analytics Panel
- **Location**: Collapsible bottom panel
- **Charts**: Recharts library for basic trend visualization
- **Metrics**: Density trends, phase transitions

### 6. Control Features

#### Settings Panel
- **Refresh Intervals**: Configurable for each data stream
- **Simulation Parameters**: Grid size, max density, event duration
- **Alert Thresholds**: Warning and critical levels
- **Notification Settings**: Sound enable/disable, volume control

#### Quick Actions
- **Pause/Resume**: Stop/start all data streams
- **Demo Mode**: Toggle simulation mode
- **Export Data**: Download JSON snapshot
- **Sound Toggle**: Mute/unmute alert sounds
- **Refresh**: Manual data refresh

### 7. Keyboard Shortcuts
- **Space**: Pause/Resume
- **D**: Demo Mode
- **E**: Export
- **M**: Toggle Sound
- **R**: Refresh
- **Ctrl+K**: Control Panel
- **Shift+?**: Show Shortcuts

### 8. Performance Monitoring
- **PerformanceDashboard**: Shows connection status, message count
- **Message Log**: Last 10 WebSocket messages in side panel
- **Last Update**: Timestamp of most recent data

---

## Technical Stack

### Frontend
```json
{
  "react": "^18.3.1",
  "leaflet": "^1.9.4",
  "react-leaflet": "^4.2.1",
  "leaflet.heat": "^0.2.0",
  "recharts": "^2.12.0",
  "vite": "^6.0.1"
}
```

### Backend
```python
fastapi
uvicorn[standard]
websockets
requests
asyncio
```

---

## File Structure

```
HTF25-Team-250/
├── backend/
│   ├── main.py                 # FastAPI server, WebSocket handler
│   ├── api_handlers.py         # BMTC & OpenWeather API integration
│   ├── simulations.py          # Crowd density & metro simulation
│   ├── config_manager.py       # Settings persistence
│   ├── history_manager.py      # Alert history storage
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Main component
│   │   ├── App.css            # Global styles
│   │   ├── components/
│   │   │   ├── MapComponent.jsx/.css
│   │   │   ├── WeatherWidget.jsx/.css
│   │   │   ├── MetroFlowWidget.jsx/.css
│   │   │   ├── AlertBanner.jsx/.css
│   │   │   ├── AlertHistory.jsx/.css
│   │   │   ├── AnalyticsPanel.jsx/.css
│   │   │   ├── ControlPanel.jsx/.css
│   │   │   ├── PerformanceDashboard.jsx/.css
│   │   │   ├── QuickActions.jsx/.css
│   │   │   └── NotificationCenter.jsx/.css
│   │   └── utils/
│   │       ├── audioManager.js
│   │       ├── keyboardShortcuts.js
│   │       └── themeManager.js
│   └── package.json
└── README.md
```

---

## UI/UX Design

### Color Scheme
- **Background**: Dark blue (#0a0e27)
- **Surface**: Navy (#1a1f3a)
- **Primary**: Cyan gradient (#4facfe → #00f2fe)
- **Text**: White (#ffffff) / Gray (#8b9dc3)

### Layout
- **Header**: Full-width with title, subtitle, connection status
- **Main Content**: 
  - Left: Map (70% width)
  - Right: Side panel (30% width)
- **Bottom**: Collapsible analytics panel
- **Overlays**: Control panel, performance dashboard, quick actions

### Typography
- **Font**: System default (sans-serif)
- **Heading**: 1.8rem, bold
- **Subtitle**: 0.9rem
- **Body**: 1rem

---

## Data Flow

```
External APIs → Backend (FastAPI) → WebSocket → Frontend (React) → UI Update
     ↓              ↓                    ↓            ↓
  BMTC API      API Handlers        ws://...     State Update
  OpenWeather   Simulations         JSON msg     Re-render
                                                 Map/Charts
```

---

## Challenges & Solutions

### Challenge 1: BMTC API Reliability
**Problem**: Unofficial API, inconsistent responses  
**Solution**: 
- Timeout handling (5s)
- Fallback to last known data
- Error logging without crashing

### Challenge 2: Heatmap Performance
**Problem**: Lag with large grid updates  
**Solution**: 
- Filter low-density cells (< 5)
- Normalized intensity calculation
- Debounced map re-renders

### Challenge 3: WebSocket Reconnection
**Problem**: Connection drops require manual refresh  
**Solution**: 
- Auto-reconnect logic (3s delay)
- Exponential backoff (not implemented yet)
- Status indicator for transparency

---

## Known Issues

1. **Heatmap Sometimes Invisible**: Grid updates don't always trigger re-render
   - Workaround: Manual refresh
   - Fix planned: Force layer refresh on data change

2. **BMTC API Rate Limiting**: Too many requests cause failures
   - Workaround: Limited to 2 routes
   - Fix planned: Caching layer

3. **No Data Persistence**: Server restart loses all history
   - Workaround: Export before restart
   - Fix planned: Database integration

4. **Weather Widget Static**: Shows "Loading weather..." as placeholder
   - Workaround: Backend fetches data but UI not connected
   - Fix planned: Iteration 2

5. **Mobile Responsiveness**: Layout breaks on small screens
   - Workaround: Desktop-only for now
   - Fix planned: Media queries

---

## Metrics

- **Components**: 15 React components
- **Lines of Code**: ~2000 (frontend) + ~800 (backend)
- **WebSocket Messages**: ~30/second during active simulation
- **Average Latency**: 50-100ms (local development)

---

## Achievements

✅ Real-time WebSocket communication  
✅ Interactive Leaflet map with heatmaps  
✅ Multi-source data integration  
✅ Alert system with audio notifications  
✅ Configurable settings panel  
✅ Keyboard shortcut system  
✅ Performance monitoring  
✅ Export functionality  

---

## Next Steps (Iteration 2 Goals)

1. **Mode Toggle**: Live vs Demo mode switcher
2. **Crowd Risk Indicator**: Visual safety status
3. **Enhanced Weather Widget**: Connect live data to UI
4. **Animated Hotspots**: Pulsing markers for high-density zones
5. **Hotspot Click Details**: Contextual information cards
6. **Directional Arrows**: Crowd flow visualization
7. **Focus Button**: Auto-zoom to most crowded zone
8. **Chart.js Integration**: Advanced analytics charts
9. **Predictive AI**: Forecast text box
10. **UI Polish**: Smooth animations, modern button styles
11. **Toast System**: Enhanced notifications
12. **System Logs**: Event log panel
13. **PDF Export**: Professional report generation
15. **Documentation**: Comprehensive docs folder

---

## Screenshots

*[Placeholder for screenshots]*

- Dashboard overview
- Heatmap visualization
- Alert banner in action
- Control panel opened
- Analytics panel charts

---

## Team Notes

### What Worked Well
- FastAPI's async support made WebSocket implementation smooth
- Leaflet.heat plugin was easy to integrate
- React's state management kept UI updates synchronized
- Component modularity allowed parallel development

### Lessons Learned
- External APIs need robust error handling
- Real-time visualizations require performance optimization
- User feedback (audio, visual) is critical for alert systems
- Documentation should be written alongside code, not after

### Code Quality
- Followed React best practices (hooks, functional components)
- Backend used async/await consistently
- CSS organized by component
- Some technical debt in error handling (needs refactoring)

---

**Completed By**: Team 250  
**Documented On**: October 26, 2025  
**Ready for**: Iteration 2 Enhancements
