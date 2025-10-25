# ⚡ Quick Start Commands

## 🔴 Backend Terminal
```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

## 🔵 Frontend Terminal (NEW WINDOW)
```powershell
cd frontend
npm install
npm run dev
```

## ✅ Success Indicators
- Backend: `Uvicorn running on http://0.0.0.0:8000`
  - Background tasks: Test, BMTC, Weather, Metro, Density
- Frontend: Browser opens to http://localhost:5173 (Vite default)
- Status: Green "LIVE" indicator in dashboard
- Map: Shows Bengaluru with heatmap overlay
- Widgets: Weather + Metro Flow visible
- Console: Messages every 10-60 seconds

## 🎯 Test URLs
- Backend Health: http://localhost:8000
- Backend Status API: http://localhost:8000/api/status
- Frontend Dashboard: http://localhost:5173 (Vite)
- WebSocket: ws://localhost:8000/ws

---

**All 4 Phases Complete!** Full analytics & predictive insights! 🚀

---

## 🎯 Phase 4 Features (LATEST!)

### 🚇 Metro Flow Simulation
- Real-time passenger entry/exit rates
- Rush hour patterns (8-10 AM, 5-8 PM)
- Updates every 60 seconds

### 🔥 Crowd Density Heatmap
- 10x10 grid over stadium area
- Color-coded: Green → Yellow → Orange → Red
- Updates every 30 seconds

### ⚠️ Intelligent Alerts
- WARNING: Density > 150 or Metro exit > 80/min
- CRITICAL: Density > 200 or combined risks
- Top-right corner notifications

### 📊 What You'll See
1. **Map**: Heatmap overlay showing crowd density
2. **Right Panel**: Weather + Metro Flow widgets + Alert History
3. **Bottom Panel**: Analytics with charts & predictions
4. **Status**: Max density with trend arrows (↗️↘️→)
5. **Alerts**: Real-time notifications with recommendations
6. **Export**: Download complete system data as JSON

---

## 🚀 Tech Stack

### Backend
- FastAPI + WebSockets
- 5 background tasks (simulations + APIs)
- Python simulations (metro, density, alerts)

### Frontend  
- React 18 + Vite
- Leaflet.js + Leaflet.heat
- Real-time WebSocket client

### Why Vite?
- ⚡ **30x faster** builds
- 📦 **Minimal dependencies**
- ✅ **0 vulnerabilities**
- 💨 **Instant HMR**

