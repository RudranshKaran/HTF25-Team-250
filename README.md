# 🚨 Crowd Safety Intelligence System

**PS28: Enhanced Data Fusion Dashboard for Bengaluru**

A real-time "Mission Control" dashboard that fuses multiple data streams (AI crowd analysis, live GPS, Metro flow, weather, emergency locations) onto a satellite map for comprehensive crowd safety monitoring.

## 📋 Project Overview

**Target City:** Bengaluru, Karnataka  
**Focus Area:** M. Chinnaswamy Stadium & MG Road Metro  
**Tech Stack:** FastAPI (Python) + React + Leaflet.js + WebSockets

### Core Features
- 🤖 **AI Crowd Analysis** - Real-time density estimation using computer vision
- 🚌 **Live BMTC GPS** - Real-time bus location tracking
- 🚇 **Metro Flow Simulation** - Simulated passenger flow data
- 🌦️ **Live Weather** - OpenWeatherMap integration
- 🏥 **Emergency Locations** - Static markers for hospitals & police stations
- 🔥 **Heatmap Visualization** - Dynamic crowd density overlay
- ⚠️ **Alert System** - Threshold-based early warnings

---

## 🚀 Quick Start

### Prerequisites
- **Python 3.8+** (with pip and venv)
- **Node.js 16+** and npm
- **Git**

### 1️⃣ Clone Repository
```bash
git clone <repository-url>
cd HTF25-Team-250
```

### 2️⃣ Backend Setup

#### Create Python Virtual Environment
```bash
cd backend
python -m venv venv
```

#### Activate Virtual Environment
**Windows:**
```bash
venv\Scripts\activate
```

**Linux/Mac:**
```bash
source venv/bin/activate
```

#### Install Dependencies
```bash
pip install -r requirements.txt
```

#### Create Environment File
Create a `backend/.env` file:
```env
HOST=0.0.0.0
PORT=8000
FRONTEND_URL=http://localhost:3000
OPENWEATHER_API_KEY=your_api_key_here
```

#### Run Backend Server
```bash
python main.py
```

Backend will start at: **http://localhost:8000**  
WebSocket endpoint: **ws://localhost:8000/ws**

---

### 3️⃣ Frontend Setup

Open a **new terminal** window:

```bash
cd frontend
npm install
npm run dev
```

Frontend will start at: **http://localhost:3000**

**Note:** We use **Vite** instead of create-react-app for faster builds and zero dependency conflicts!

---

## 📁 Project Structure

```
HTF25-Team-250/
├── backend/
│   ├── main.py              # FastAPI server with WebSocket
│   ├── requirements.txt     # Python dependencies
│   └── .env                 # Environment variables (create this)
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── MapComponent.js      # Leaflet map
│   │   │   └── MapComponent.css
│   │   ├── App.js                    # Main React component
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
│
├── README.md
└── .gitignore
```

---

## 🔧 Technology Stack

### Backend
- **FastAPI** - Async web framework
- **WebSockets** - Real-time bidirectional communication
- **OpenCV** - Video processing for AI analysis
- **PyTorch/TensorFlow** - Crowd density estimation models
- **Requests** - HTTP client for external APIs

### Frontend
- **Vite** - Lightning-fast build tool (⚡ replaces create-react-app)
- **React** - UI framework
- **Leaflet.js** - Interactive mapping library
- **react-leaflet** - React bindings for Leaflet
- **Leaflet.heat** - Heatmap visualization (Phase 4)
- **WebSocket API** - Real-time data streaming

**Why Vite?** Modern ES modules, instant HMR, zero ajv conflicts, 90% fewer dependencies!

### APIs & Data Sources
- **BMTC API** - Live bus GPS coordinates
- **OpenWeatherMap** - Weather data
- **Mapbox** - Satellite imagery tiles
- **OpenStreetMap** - Static location data

---

## 🎯 Phase 1 Implementation Status

### ✅ Completed Tasks
- [x] Git repository initialized
- [x] Python backend environment setup
- [x] FastAPI server with health check endpoints
- [x] WebSocket server with connection management
- [x] Broadcast functionality for real-time updates
- [x] React frontend initialized
- [x] Leaflet map centered on Bengaluru
- [x] Mapbox satellite tile integration
- [x] WebSocket client connection
- [x] Test message broadcast system
- [x] Real-time connection status indicator
- [x] Key location markers (Stadium & Metro)
- [x] Monitoring zone circles

### 🎨 UI Features
- Real-time connection status with visual indicators
- Message log panel for debugging
- Test message controls
- Modern dark theme with gradient accents
- Responsive layout with side panel
- Custom map legend and overlays

---

## 🧪 Testing Phase 1

1. **Start Backend:**
   ```bash
   cd backend
   venv\Scripts\activate  # Windows
   python main.py
   ```

2. **Start Frontend:**
   ```bash
   cd frontend
   npm start
   ```

3. **Verify:**
   - ✅ Backend running at http://localhost:8000
   - ✅ Frontend at http://localhost:3000
   - ✅ Status indicator shows "LIVE" (green)
   - ✅ Test messages appear every 10 seconds
   - ✅ Map displays Bengaluru with satellite tiles
   - ✅ Markers visible at Stadium & Metro locations
   - ✅ "Send Test Message" button works

---

## 📊 Upcoming Phases

### Phase 2: Live Data Integration
- BMTC bus GPS tracking
- OpenWeatherMap integration
- Dynamic marker updates
- Weather widget component

### Phase 3: AI & Simulations
- Crowd density estimation model
- Video processing pipeline
- Metro flow simulation
- Density grid generation

### Phase 4: Advanced Visualization
- Heatmap overlay implementation
- Custom bus icons
- Alert system with thresholds
- Visual alert indicators

### Phase 5: Polish & Deployment
- Error handling & robustness
- Documentation
- Loading states & UX improvements
- Deployment preparation

---

## 🔑 API Keys Required

### OpenWeatherMap (Free Tier)
1. Sign up at https://openweathermap.org/api
2. Get your API key
3. Add to `backend/.env`:
   ```
   OPENWEATHER_API_KEY=your_key_here
   ```

### Mapbox (Optional - using default token in Phase 1)
For production, get your own token:
1. Sign up at https://www.mapbox.com/
2. Get access token
3. Replace in `frontend/src/components/MapComponent.js`

---

## 🐛 Troubleshooting

### Backend Issues
**Port already in use:**
```bash
# Change PORT in .env file or kill process on port 8000
```

**Module not found:**
```bash
pip install -r requirements.txt
```

### Frontend Issues
**Dependencies not installed:**
```bash
cd frontend
npm install
```

**WebSocket connection failed:**
- Ensure backend is running
- Check backend console for errors
- Verify port 8000 is not blocked

---

## 📝 Development Notes

### WebSocket Message Types (Phase 1)
- `connection` - Initial connection acknowledgment
- `test` - Test broadcast messages
- `echo` - Echo response to client messages

### Bengaluru Coordinates
- **City Center:** [12.9791, 77.5993]
- **M. Chinnaswamy Stadium:** [12.9789, 77.5993]
- **MG Road Metro:** [12.9756, 77.6057]

---

## 👥 Team
HTF25-Team-250

## 📄 License
MIT License - Hackathon Project

---

**Status:** Phase 1 Complete ✅ | Ready for Phase 2 Development

For issues or questions, check the console logs in both backend and frontend terminals.
