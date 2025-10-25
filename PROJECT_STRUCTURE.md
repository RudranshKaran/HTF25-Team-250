# 📁 Project Structure

## Root Directory
```
HTF25-Team-250/
├── backend/                    # Python FastAPI backend
├── frontend/                   # React + Vite frontend
├── README.md                   # Main documentation
├── QUICK_START.md             # Quick setup commands
├── FINAL_IMPROVEMENTS_SUMMARY.md  # Complete feature summary
├── PROJECT_STRUCTURE.md       # This file
└── fork.jpeg                  # Project image
```

---

## Backend Structure
```
backend/
├── main.py                    # FastAPI app & WebSocket server
├── api_handlers.py           # BMTC & Weather API integration
├── simulations.py            # Metro & Crowd density simulations
├── requirements.txt          # Python dependencies
├── .env                      # Environment variables (create manually)
└── venv/                     # Python virtual environment
```

### Backend Files

#### `main.py` (260 lines)
- FastAPI application setup
- WebSocket connection manager
- 5 background tasks (test, BMTC, weather, metro, density)
- HTTP endpoints (/api/status)
- Startup event handlers

#### `api_handlers.py` (222 lines)
- `fetch_bmtc_bus_data()`: Live bus GPS with demo fallback
- `fetch_weather_data()`: OpenWeatherMap integration
- Helper formatting functions
- Demo data generators

#### `simulations.py` (397 lines)
- `simulate_metro_flow()`: Phase-synchronized metro flow
- `simulate_crowd_density()`: 4-phase realistic accumulation
- `check_alerts()`: Intelligent alert system
- Global `_crowd_state` for phase persistence
- Formatting utilities

---

## Frontend Structure
```
frontend/
├── src/
│   ├── main.jsx              # React entry point
│   ├── index.css             # Global styles
│   ├── App.jsx               # Main application component
│   ├── App.css               # App styles
│   └── components/
│       ├── MapComponent.jsx  # Leaflet map with heatmap
│       ├── MapComponent.css
│       ├── WeatherWidget.jsx # Weather display
│       ├── WeatherWidget.css
│       ├── MetroFlowWidget.jsx  # Metro flow display
│       ├── MetroFlowWidget.css
│       ├── AlertBanner.jsx   # Alert notifications
│       └── AlertBanner.css
├── public/
│   └── vite.svg
├── index.html                # HTML template
├── package.json              # Node dependencies
├── package-lock.json
├── vite.config.js           # Vite configuration
└── eslint.config.js         # ESLint configuration
```

### Frontend Files

#### `src/main.jsx` (10 lines)
- React app initialization
- Renders App component

#### `src/App.jsx` (245 lines)
- WebSocket client with auto-reconnect
- State management for all data streams
- Component integration
- Message routing

#### Components

**MapComponent.jsx** (325 lines)
- Leaflet map setup
- Heatmap layer with Leaflet.heat
- Static markers (stadium, metro)
- Dynamic bus markers
- Hotspot circle markers
- Phase status badge
- Map legend

**WeatherWidget.jsx** (60 lines)
- Current weather display
- Temperature, conditions, humidity, wind
- Demo indicator

**MetroFlowWidget.jsx** (95 lines)
- Entry/exit rates
- Capacity percentage
- Flow reason badge
- Phase-based status

**AlertBanner.jsx** (90 lines)
- Real-time alert notifications
- WARNING/CRITICAL levels
- Dismissible alerts
- Alert history

---

## Documentation Files

### Essential Docs (Keep)
- **`README.md`**: Complete project documentation
- **`QUICK_START.md`**: Fast setup reference
- **`FINAL_IMPROVEMENTS_SUMMARY.md`**: All features & improvements
- **`PROJECT_STRUCTURE.md`**: This file

---

## Key Features by File

### Backend Features

| Feature | File | Function |
|---------|------|----------|
| WebSocket Server | main.py | ConnectionManager class |
| Bus GPS | api_handlers.py | fetch_bmtc_bus_data() |
| Weather API | api_handlers.py | fetch_weather_data() |
| Metro Flow | simulations.py | simulate_metro_flow() |
| Crowd Density | simulations.py | simulate_crowd_density() |
| Alert System | simulations.py | check_alerts() |
| Phase Management | simulations.py | _crowd_state dict |

### Frontend Features

| Feature | Component | Description |
|---------|-----------|-------------|
| Interactive Map | MapComponent | Leaflet.js map |
| Crowd Heatmap | MapComponent (HeatmapLayer) | Leaflet.heat overlay |
| Hotspot Markers | MapComponent | Colored circles |
| Phase Badge | MapComponent | Top-left status |
| Weather Widget | WeatherWidget | Temperature & conditions |
| Metro Widget | MetroFlowWidget | Passenger flow |
| Alert Banners | AlertBanner | Top-right notifications |
| Status Panel | App | System metrics |

---

## Data Flow

```
Backend (FastAPI)
    ↓
5 Background Tasks (asyncio)
    ├── Test broadcast (10s)
    ├── BMTC GPS fetch (30s)
    ├── Weather fetch (5min)
    ├── Metro simulation (60s)
    └── Density simulation (30s)
    ↓
WebSocket broadcast
    ↓
Frontend (React)
    ↓
State updates
    ↓
Component re-renders
    ↓
Visual updates
```

---

## WebSocket Messages

### From Backend to Frontend

| Type | Source | Frequency | Data |
|------|--------|-----------|------|
| connection | WebSocket | Once | Welcome message |
| test | Test task | 10s | Heartbeat |
| gps_update | BMTC API | 30s | Bus locations |
| weather_update | OpenWeather | 5min | Weather data |
| metro_update | Simulation | 60s | Metro flow |
| density_update | Simulation | 30s | Crowd density |
| alert | Alert system | As needed | Warnings/Critical |

### From Frontend to Backend
| Type | Trigger | Purpose |
|------|---------|---------|
| test_from_client | Button click | Test connection |

---

## Dependencies

### Backend (Python)
```
fastapi==0.109.0
uvicorn[standard]==0.27.0
websockets==12.0
requests==2.31.0
python-dotenv==1.0.0
```

### Frontend (Node)
```
react@18.3.1
react-dom@18.3.1
leaflet@1.9.4
react-leaflet@4.2.1
leaflet.heat@0.2.0
vite@6.0.11
```

---

## Configuration Files

### Backend
- **`.env`**: Environment variables (OPENWEATHER_API_KEY)
- **`requirements.txt`**: Python dependencies

### Frontend
- **`package.json`**: Node dependencies & scripts
- **`vite.config.js`**: Build configuration
- **`eslint.config.js`**: Linting rules

---

## Size Summary

### Backend
- Total: ~880 lines of Python
- main.py: 260 lines
- api_handlers.py: 222 lines
- simulations.py: 397 lines

### Frontend
- Total: ~1,250 lines of JSX/CSS
- Components: 8 files (4 JSX + 4 CSS)
- Main app: 2 files (App.jsx + App.css)

### Documentation
- README.md: ~300 lines
- Other docs: ~800 lines

**Total Project**: ~2,950 lines

---

## File Count

```
Backend:    4 Python files
Frontend:   10 source files
Docs:       4 markdown files
Config:     5 configuration files
Total:      23 essential files
```

---

## Port Configuration

| Service | Port | URL |
|---------|------|-----|
| Backend API | 8000 | http://localhost:8000 |
| Backend WebSocket | 8000 | ws://localhost:8000/ws |
| Frontend Dev Server | 5173 | http://localhost:5173 |

---

## Environment Variables

### Backend `.env`
```env
OPENWEATHER_API_KEY=7411714f5e7fc080249fdc1141a6a519
PORT=8000  # Optional, defaults to 8000
```

---

## Build Artifacts (Ignored)

### Backend
- `__pycache__/`
- `venv/`
- `.env` (gitignored)

### Frontend
- `node_modules/`
- `dist/`
- `.vite/`

---

**Last Updated**: October 25, 2025  
**Status**: ✅ Clean & Production Ready

