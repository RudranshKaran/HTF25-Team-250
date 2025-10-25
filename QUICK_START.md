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

**All 5 Phases Complete!** Mission Control System Operational! 🚀

---

## 🎯 Phase 5 Features (LATEST!) 🚀 MISSION CONTROL

### ⚙️ Control Panel
- **Click** ⚙️ Settings button (top-right)
- **Tabs**: Controls | Thresholds | Display | Sound
- **Adjust** alert thresholds in real-time
- **Toggle** display elements (heatmap, hotspots, badges)
- **Configure** sound notifications
- **View** session statistics

### ⚡ Quick Actions Toolbar
- **Click** ⚡ button (bottom-left) for instant actions:
  - ⏯️ Pause/Resume
  - 🎬 Demo Mode
  - 💾 Export
  - 🔊 Sound Toggle
  - 🔄 Refresh
  - 🗑️ Clear History

### ⌨️ Keyboard Shortcuts
- `Space` - Pause/Resume
- `D` - Toggle Demo Mode
- `E` - Export Data
- `M` - Toggle Sound
- `R` - Refresh
- `Shift+?` - Show all shortcuts

### 🎵 Sound Notifications
- **Critical Alerts**: 3 urgent beeps
- **Warning Alerts**: 2 medium beeps
- **Success**: Ascending tone
- **Mute**: Press `M` key

### 📊 Performance Dashboard
- **Location**: Bottom-right corner
- **Metrics**: FPS, Latency, Memory, Messages, Status
- **Expand** to see all details

### 💬 Toast Notifications
- Auto-appear for all actions
- Color-coded by type
- Dismissible
- Top-right corner

### 🎬 Demo Mode
- **Activate**: Press `D` or Quick Actions
- **Effect**: 2x speed, guaranteed alerts
- **Perfect** for presentations

### 📊 What You'll See
1. **Map**: Heatmap overlay showing crowd density
2. **Right Panel**: Weather + Metro Flow widgets + Alert History
3. **Bottom Panel**: Analytics with charts & predictions
4. **Top-Right**: Settings button + Toast notifications
5. **Bottom-Right**: Performance Dashboard
6. **Bottom-Left**: Quick Actions toolbar
7. **Alerts**: Real-time audio + visual notifications
8. **Status**: Max density with trend arrows (↗️↘️→)

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

