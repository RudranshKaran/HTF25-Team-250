# System Architecture

## Overview

The Crowd Safety Intelligence System follows a modern client-server architecture with real-time bidirectional communication using WebSockets. The system is designed for scalability, real-time responsiveness, and extensibility.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND LAYER                        │
│                     (React + Vite + Leaflet)                 │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   Map    │  │ Analytics│  │  Alerts  │  │ Controls │   │
│  │Component │  │  Panel   │  │  System  │  │  Panel   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Weather  │  │  Metro   │  │ System   │  │  Quick   │   │
│  │ Widget   │  │  Widget  │  │  Logs    │  │ Actions  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ↕ WebSocket (JSON)
┌─────────────────────────────────────────────────────────────┐
│                        BACKEND LAYER                         │
│                    (FastAPI + Python 3.9+)                   │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │ WebSocket Server │  │   REST API       │                │
│  │  (main.py)       │  │   Endpoints      │                │
│  └──────────────────┘  └──────────────────┘                │
│           ↓                      ↓                           │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │  Simulation      │  │  Config Manager  │                │
│  │  Engine          │  │  (Settings)      │                │
│  │ (simulations.py) │  │                  │                │
│  └──────────────────┘  └──────────────────┘                │
│           ↓                      ↓                           │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │ Alert Manager    │  │ History Manager  │                │
│  │                  │  │                  │                │
│  └──────────────────┘  └──────────────────┘                │
└─────────────────────────────────────────────────────────────┘
                              ↕ HTTP/REST
┌─────────────────────────────────────────────────────────────┐
│                     EXTERNAL DATA SOURCES                    │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │  BMTC    │  │OpenWeather│ │  Sensor  │                  │
│  │  Bus API │  │   API     │  │  Network │                  │
│  └──────────┘  └──────────┘  └──────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

## Component Breakdown

### Frontend Components

#### Core Application (App.jsx)
- **Role**: Main orchestrator of all components
- **Responsibilities**:
  - WebSocket connection management
  - State management for all data streams
  - Message routing and handling
  - Keyboard shortcut registration
- **State Management**:
  - Connection status
  - Bus data (GPS coordinates)
  - Weather data
  - Metro flow data
  - Crowd density data
  - Alerts array
  - System settings

#### Map Component
- **Technology**: Leaflet + React-Leaflet
- **Features**:
  - Interactive map centered on Bengaluru
  - Heatmap overlay for crowd density
  - Bus marker rendering with custom icons
  - Metro station markers
  - Click handlers for hotspot details
  - Zoom controls and auto-focus
- **Data Flow**: Receives `busData` and `densityData` props, renders visualizations

#### Analytics Panel
- **Technology**: Chart.js / Recharts
- **Visualizations**:
  - Real-time line chart for density trends
  - Bar chart for entry/exit flow comparison
  - Predictive analytics display
- **Updates**: React to `densityData` and `metroData` changes

#### Weather Widget
- **Data Source**: OpenWeatherMap API
- **Display**: Temperature, humidity, wind speed, conditions
- **Refresh**: Updates every 10 minutes

#### Metro Flow Widget
- **Data Source**: Backend simulation or real metro API
- **Metrics**: Entry rate, exit rate, current capacity
- **Visualization**: Animated flow indicators

#### Alert System
- **Components**: AlertBanner, AlertHistory, NotificationCenter
- **Levels**: Critical, Warning, Info
- **Features**: Toast notifications, sound alerts, history logging

#### Control Panel
- **Functions**: Settings management, pause/resume, demo mode toggle
- **UI**: Slide-out panel with form controls
- **Persistence**: Updates backend settings via API

### Backend Components

#### FastAPI Server (main.py)
- **Framework**: FastAPI with async support
- **WebSocket Endpoint**: `/ws`
  - Accepts connections
  - Broadcasts updates to all clients
  - Handles client messages
- **REST Endpoints**:
  - `/api/settings` - Get/update configuration
  - `/api/control/toggle` - Pause/resume
  - `/api/control/demo-mode` - Switch modes
  - `/api/export` - Data export
  - `/api/alerts/history` - Alert logs
- **CORS**: Enabled for frontend communication

#### API Handlers (api_handlers.py)
- **BMTC Bus API Integration**:
  - Fetches live GPS data
  - Filters buses in Bengaluru region
  - Transforms data for frontend consumption
- **OpenWeather API Integration**:
  - Fetches weather for Bengaluru coordinates
  - Caches results to avoid rate limits
  - Formats temperature, conditions, wind data

#### Simulation Engine (simulations.py)
- **Crowd Density Simulation**:
  - Grid-based density calculation
  - Time-based evolution (event, dispersal, normal phases)
  - Entry/exit rate modeling
  - Hotspot identification
- **Metro Flow Simulation**:
  - Station capacity tracking
  - Peak hour patterns
  - Random variation for realism
- **Alert Generation**:
  - Threshold-based triggering
  - Severity classification
  - Actionable recommendations

#### Config Manager (config_manager.py)
- **Settings Storage**: JSON file-based persistence
- **Default Configuration**: Fallback values
- **Dynamic Updates**: Real-time setting changes
- **Settings Categories**:
  - Refresh intervals
  - Alert thresholds
  - Notification preferences
  - Simulation parameters

#### History Manager (history_manager.py)
- **Alert Logging**: Timestamped alert records
- **Query Interface**: Retrieve alerts by time range or level
- **Persistence**: File-based storage with rotation
- **Analytics**: Alert frequency analysis

## Data Flow Sequence

### Startup Sequence
1. Backend server starts, initializes WebSocket server
2. Frontend loads, establishes WebSocket connection
3. Backend sends connection acknowledgment
4. Frontend fetches initial settings via REST API
5. Backend starts data collection loops (buses, weather)
6. Backend starts simulation loops (density, metro)

### Real-Time Update Cycle
1. **Every 5 seconds**: Backend fetches BMTC bus data
2. **Every 10 minutes**: Backend fetches weather data
3. **Every 2 seconds**: Simulation engine updates crowd density
4. **Every 3 seconds**: Simulation engine updates metro flow
5. Each update triggers WebSocket broadcast to all clients
6. Frontend receives message, parses type, updates relevant state
7. React re-renders affected components
8. User sees updated visualization

### Alert Flow
1. Simulation engine detects threshold violation
2. Alert object created with level, message, location
3. History manager logs alert
4. WebSocket broadcasts alert to all clients
5. Frontend receives alert, adds to state
6. Alert components display notification
7. Audio manager plays appropriate sound
8. Toast notification appears

## Technology Stack

### Frontend
- **React**: 18.3.1 (UI framework)
- **Vite**: 6.0.1 (Build tool)
- **Leaflet**: 1.9.4 (Mapping library)
- **React-Leaflet**: 4.2.1 (React bindings)
- **Leaflet.heat**: 0.2.0 (Heatmap plugin)
- **Chart.js**: Latest (Charts and graphs)
- **Recharts**: 2.12.0 (React chart library)

### Backend
- **FastAPI**: Latest (Web framework)
- **uvicorn**: ASGI server
- **websockets**: WebSocket support
- **requests**: HTTP client for external APIs
- **asyncio**: Async/await support

### Development Tools
- **ESLint**: Code linting
- **Vite**: Fast HMR during development
- **Git**: Version control

## Security Considerations

### Current Implementation
- CORS enabled for localhost development
- No authentication (demo system)
- API keys stored in environment variables
- WebSocket connections unencrypted (ws://)

### Production Recommendations
- Implement JWT authentication
- Use WSS (WebSocket Secure) with SSL/TLS
- Rate limiting on API endpoints
- Input validation and sanitization
- API key rotation policy
- Role-based access control (RBAC)

## Scalability

### Current Limitations
- Single server instance
- In-memory state (no database)
- File-based persistence
- Broadcast to all clients (no selective routing)

### Scaling Strategies
- **Horizontal Scaling**: Multiple FastAPI instances behind load balancer
- **Database Integration**: PostgreSQL/MongoDB for persistent storage
- **Message Queue**: Redis/RabbitMQ for pub/sub pattern
- **Caching Layer**: Redis for frequent queries
- **CDN**: Static asset delivery
- **Microservices**: Separate simulation, alerts, data fetching into services

## Performance Optimization

### Frontend
- React.memo for expensive components
- useCallback and useMemo for function/value memoization
- Lazy loading for heavy components
- Debounced map interactions
- Virtual scrolling for large lists

### Backend
- Async operations for non-blocking I/O
- Connection pooling for external APIs
- Cached API responses
- Efficient WebSocket broadcasting
- Background tasks for simulations

## Monitoring & Logging

### Current Implementation
- Console logging in browser (frontend)
- Print statements in Python (backend)
- Connection status indicator
- Message count tracking

### Enhanced Monitoring (Future)
- Structured logging (JSON format)
- Log aggregation (ELK stack)
- Application performance monitoring (APM)
- Error tracking (Sentry)
- Custom metrics dashboard
- Alert on system failures

## Deployment Architecture

### Development
- Backend: `python main.py` on localhost:8000
- Frontend: `npm run dev` on localhost:5173
- Hot module replacement enabled

### Production (Recommended)
- Backend: Docker container with uvicorn
- Frontend: Static build served by Nginx
- Reverse proxy (Nginx) for routing
- SSL termination at proxy
- Environment-specific configuration
- Health check endpoints
- Automated deployment pipeline

## Error Handling

### Frontend
- WebSocket reconnection logic (3-second delay)
- Try-catch blocks for API calls
- Fallback UI for missing data
- Error toast notifications
- Graceful degradation

### Backend
- Try-catch for external API calls
- Fallback to cached data
- WebSocket connection error handling
- Validation of incoming messages
- Graceful shutdown on SIGTERM

## Future Architecture Enhancements

1. **Microservices Architecture**: Split monolithic backend
2. **Event-Driven Design**: Apache Kafka for event streaming
3. **CQRS Pattern**: Separate read/write models
4. **GraphQL API**: Replace REST for flexible queries
5. **Server-Side Rendering**: Next.js for SEO
6. **Progressive Web App**: Offline support
7. **Real-Time Analytics**: Stream processing with Apache Flink
8. **Machine Learning Pipeline**: Model training and inference service

---

**Last Updated**: October 26, 2025  
**Author**: Team 250  
**Version**: 2.0
