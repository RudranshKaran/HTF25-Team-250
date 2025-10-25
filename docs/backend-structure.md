# Backend Structure

## Directory Organization

```
backend/
├── main.py                 # FastAPI application entry point
├── .env                    # Environment variables (API keys, config)
├── requirements.txt        # Python dependencies
│
├── app/                    # Application package
│   ├── __init__.py
│   │
│   ├── config/            # Configuration management
│   │   ├── __init__.py
│   │   └── settings.py    # ConfigManager class
│   │
│   ├── services/          # Business logic layer
│   │   ├── __init__.py
│   │   ├── bmtc_service.py              # BMTC bus data fetching
│   │   ├── weather_service.py           # Weather API integration
│   │   ├── crowd_simulation_service.py  # Crowd density & metro simulations
│   │   └── history_service.py           # Historical data management
│   │
│   └── utils/             # Shared utilities
│       ├── __init__.py
│       └── constants.py   # Application constants (locations, thresholds)
│
└── venv/                   # Python virtual environment
```

## Key Components

### `main.py`
- FastAPI application initialization
- WebSocket connection management
- Background tasks for data streaming
- API endpoints for control and data export

### `app/config/`
**settings.py**: System configuration and settings management
- Alert thresholds configuration
- Simulation controls (pause/resume, speed)
- Display and notification settings
- Performance tracking and statistics

### `app/services/`

**bmtc_service.py**: BMTC Bus GPS data
- Fetches live bus locations from BMTC API
- Fallback to demo data when API unavailable

**weather_service.py**: Weather data integration
- OpenWeatherMap API integration
- Simulated weather data fallback

**crowd_simulation_service.py**: Crowd dynamics simulation
- Metro passenger flow simulation
- Realistic crowd density with phases (building, peak, dispersing, low)
- Alert generation logic
- Synchronized metro and crowd behaviors

**history_service.py**: Historical data management
- Stores and retrieves historical crowd/metro data
- Trend analysis
- Chart data generation

### `app/utils/`
**constants.py**: Application-wide constants
- Geographic coordinates (Bengaluru, stadium, metro)
- Alert thresholds
- Configuration values

## Running the Application

```powershell
# Activate virtual environment
.\\venv\\Scripts\\activate

# Install dependencies (if needed)
pip install -r requirements.txt

# Run the server
python main.py

# Or with uvicorn directly
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## API Endpoints

### WebSocket
- `ws://localhost:8000/ws` - Real-time data streaming

### REST API
- `GET /` - Health check
- `GET /api/status` - System status
- `GET /api/history` - Historical data
- `GET /api/charts` - Chart data
- `GET /api/export` - Export all data
- `GET /api/settings` - Current settings
- `POST /api/settings/thresholds` - Update alert thresholds
- `POST /api/control/pause` - Pause simulations
- `POST /api/control/resume` - Resume simulations
- `POST /api/control/toggle` - Toggle pause/resume
- `POST /api/control/reset-history` - Clear history
- `POST /api/control/reset-stats` - Reset statistics
- `POST /api/settings/display` - Update display settings
- `POST /api/settings/sound` - Update sound settings
- `POST /api/control/demo-mode` - Toggle demo mode

## Environment Variables

Create a `.env` file with:

```
# OpenWeather API Key (optional - falls back to simulated data)
OPENWEATHER_API_KEY=your_api_key_here

# Optional overrides
# FRONTEND_URL=http://localhost:5173
# PORT=8000
```

## Data Flow

1. **Background Tasks** continuously generate/fetch data:
   - BMTC bus locations (every 30s)
   - Weather data (every 5min)
   - Metro flow simulation (every 60s)
   - Crowd density simulation (every 30s)

2. **Services** process and format data

3. **WebSocket** broadcasts data to all connected clients

4. **History Manager** stores data for analytics

5. **Config Manager** controls behavior and thresholds

## Development Notes

- All services are in `app/services/` for clean separation
- Configuration is centralized in `app/config/`
- Constants are in `app/utils/constants.py`
- Main.py focuses on routing and WebSocket management
- Easy to test individual services in isolation
