# API References

## Table of Contents
1. [Backend REST APIs](#backend-rest-apis)
2. [WebSocket API](#websocket-api)
3. [External APIs](#external-apis)

---

## Backend REST APIs

Base URL: `http://localhost:8000`

### 1. Get System Settings
```http
GET /api/settings
```

**Description**: Retrieve current system configuration and settings.

**Response** (200 OK):
```json
{
  "refresh_intervals": {
    "bus": 5,
    "weather": 600,
    "density": 2,
    "metro": 3
  },
  "simulation": {
    "grid_size": 20,
    "max_density": 150,
    "event_duration": 300
  },
  "alerts": {
    "enabled": true,
    "thresholds": {
      "warning": 80,
      "critical": 120
    }
  },
  "notifications": {
    "sound_enabled": true,
    "sound_volume": 0.7
  },
  "paused": false,
  "demo_mode": false
}
```

### 2. Update System Settings
```http
POST /api/settings
Content-Type: application/json
```

**Body**:
```json
{
  "notifications": {
    "sound_enabled": false,
    "sound_volume": 0.5
  },
  "alerts": {
    "enabled": true
  }
}
```

**Response** (200 OK):
```json
{
  "status": "success",
  "message": "Settings updated",
  "settings": { /* updated settings object */ }
}
```

### 3. Toggle Pause/Resume
```http
POST /api/control/toggle
```

**Description**: Pause or resume all data streams and simulations.

**Response** (200 OK):
```json
{
  "status": "success",
  "paused": true,
  "message": "System paused"
}
```

### 4. Toggle Demo Mode
```http
POST /api/control/demo-mode
```

**Description**: Switch between live data and demonstration mode.

**Response** (200 OK):
```json
{
  "status": "success",
  "demo_mode": true,
  "message": "Demo mode enabled"
}
```

### 5. Export Data
```http
GET /api/export
```

**Description**: Export current system data including density, alerts, metro, and weather.

**Response** (200 OK):
```json
{
  "timestamp": "2025-10-26T10:30:00Z",
  "density": {
    "max_density": 95,
    "avg_density": 42,
    "hotspot_count": 3
  },
  "alerts": [
    {
      "level": "warning",
      "message": "High crowd density at MG Road",
      "timestamp": "2025-10-26T10:25:00Z"
    }
  ],
  "metro": {
    "entry_rate": 120,
    "exit_rate": 85
  },
  "weather": {
    "temperature": 28.5,
    "humidity": 65,
    "description": "Partly cloudy"
  }
}
```

### 6. Get Alert History
```http
GET /api/alerts/history?limit=50&level=warning
```

**Query Parameters**:
- `limit` (optional): Number of alerts to retrieve (default: 50)
- `level` (optional): Filter by level (critical, warning, info)
- `since` (optional): ISO timestamp to get alerts after

**Response** (200 OK):
```json
{
  "alerts": [
    {
      "id": "alert-12345",
      "level": "warning",
      "message": "Moderate crowd density at Shivajinagar",
      "location": [12.9789, 77.5993],
      "timestamp": "2025-10-26T10:20:00Z",
      "density": 85
    }
  ],
  "total": 42
}
```

### 7. Clear Alert History
```http
DELETE /api/alerts/history
```

**Response** (200 OK):
```json
{
  "status": "success",
  "message": "Alert history cleared"
}
```

---

## WebSocket API

**Endpoint**: `ws://localhost:8000/ws`

### Connection
```javascript
const ws = new WebSocket('ws://localhost:8000/ws');

ws.onopen = () => {
  console.log('Connected to backend');
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Handle message based on data.type
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};

ws.onclose = () => {
  console.log('Disconnected');
};
```

### Message Types (Server → Client)

#### 1. Connection Acknowledgment
```json
{
  "type": "connection",
  "message": "WebSocket connection established",
  "timestamp": "2025-10-26T10:00:00Z"
}
```

#### 2. GPS Update (BMTC Buses)
```json
{
  "type": "gps_update",
  "count": 45,
  "buses": [
    {
      "id": "bus-123",
      "route": "356",
      "position": [12.9789, 77.5993],
      "speed": 25,
      "timestamp": "2025-10-26T10:00:00Z"
    }
  ]
}
```

#### 3. Weather Update
```json
{
  "type": "weather_update",
  "temperature": 28.5,
  "feels_like": 30.2,
  "humidity": 65,
  "wind_speed": 3.5,
  "description": "Partly cloudy",
  "icon": "02d",
  "timestamp": "2025-10-26T10:00:00Z"
}
```

#### 4. Metro Flow Update
```json
{
  "type": "metro_update",
  "station": "MG Road",
  "entry_rate": 120,
  "exit_rate": 85,
  "current_capacity": 450,
  "max_capacity": 800,
  "utilization": 56.25,
  "timestamp": "2025-10-26T10:00:00Z"
}
```

#### 5. Crowd Density Update
```json
{
  "type": "density_update",
  "max_density": 95,
  "avg_density": 42,
  "hotspot_count": 3,
  "phase": "event",
  "trend": "increasing",
  "grid": [[0, 5, 10], [15, 95, 50], [20, 30, 10]],
  "grid_size": 20,
  "center_location": [12.9789, 77.5993],
  "is_event_time": true,
  "timestamp": "2025-10-26T10:00:00Z"
}
```

#### 6. Alert
```json
{
  "type": "alert",
  "level": "critical",
  "message": "Critical crowd density detected at Chinnaswamy Stadium",
  "location": [12.9789, 77.5993],
  "zone": "Chinnaswamy Stadium",
  "density": 145,
  "action": "Implement crowd control measures immediately",
  "timestamp": "2025-10-26T10:00:00Z"
}
```

### Message Types (Client → Server)

#### Send Test Message
```json
{
  "type": "test_from_client",
  "message": "Hello from React frontend!",
  "timestamp": "2025-10-26T10:00:00Z"
}
```

#### Request Data Refresh
```json
{
  "type": "refresh_request",
  "components": ["bus", "weather", "density"]
}
```

---

## External APIs

### 1. BMTC Bus GPS API

**Base URL**: `http://bmtcmob.hostg.in/api`

**Endpoint**: `POST /itsroutewise/details`

**Headers**:
```http
Content-Type: application/json
Host: bmtcmob.hostg.in
User-Agent: Apache-HttpClient/UNAVAILABLE (java 1.4)
```

**Request Body**:
```json
{
  "direction": "UP",
  "routeNO": "356"
}
```

**Response**:
```json
{
  "status": "success",
  "buses": [
    {
      "vehicleNo": "KA-01-F-1234",
      "latitude": 12.9789,
      "longitude": 77.5993,
      "speed": 25,
      "timestamp": "2025-10-26T10:00:00+05:30"
    }
  ]
}
```

**Rate Limit**: Not officially documented (use responsibly)

**Notes**: 
- Unofficial API, may change without notice
- Limited to specific routes
- Best effort basis

---

### 2. OpenWeatherMap API

**Base URL**: `https://api.openweathermap.org/data/2.5`

**Endpoint**: `GET /weather`

**Query Parameters**:
- `lat`: Latitude (e.g., 12.9716)
- `lon`: Longitude (e.g., 77.5946)
- `appid`: API key (required)
- `units`: metric (for Celsius)

**Example Request**:
```http
GET https://api.openweathermap.org/data/2.5/weather?lat=12.9716&lon=77.5946&appid=YOUR_API_KEY&units=metric
```

**Response**:
```json
{
  "coord": {
    "lon": 77.5946,
    "lat": 12.9716
  },
  "weather": [
    {
      "id": 802,
      "main": "Clouds",
      "description": "scattered clouds",
      "icon": "03d"
    }
  ],
  "main": {
    "temp": 28.5,
    "feels_like": 30.2,
    "temp_min": 27.0,
    "temp_max": 30.0,
    "pressure": 1013,
    "humidity": 65
  },
  "wind": {
    "speed": 3.5,
    "deg": 180
  },
  "dt": 1698307200,
  "name": "Bengaluru"
}
```

**Rate Limit**: 
- Free tier: 60 calls/minute, 1,000,000 calls/month
- Paid tiers available

**Documentation**: https://openweathermap.org/api

**Setup**:
1. Register at https://openweathermap.org/
2. Get API key from dashboard
3. Add to backend `.env` file: `OPENWEATHER_API_KEY=your_key_here`

---

## Error Codes

### HTTP Status Codes

| Code | Description | Typical Use |
|------|-------------|-------------|
| 200 | OK | Successful request |
| 400 | Bad Request | Invalid parameters |
| 404 | Not Found | Endpoint doesn't exist |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | External API unavailable |

### Custom Error Responses

```json
{
  "error": "invalid_parameter",
  "message": "The 'level' parameter must be one of: critical, warning, info",
  "code": 400
}
```

---

## Rate Limiting

### Internal APIs
- No rate limiting currently implemented
- Recommended: 100 requests/minute per client

### External APIs
- **BMTC**: Use sparingly, no official limits
- **OpenWeather**: Respect API tier limits

---

## Authentication

**Current**: No authentication (development/demo)

**Production Recommendations**:
- JWT tokens for REST API
- API keys for WebSocket connections
- OAuth2 for third-party integrations

---

## Versioning

**Current Version**: v1 (implicit)

**Future**: Use URL versioning (e.g., `/api/v2/settings`)

---

**Last Updated**: October 26, 2025  
**Maintained By**: Team 250
