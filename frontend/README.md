# Frontend - Crowd Safety Dashboard

## 🚀 Vite + React

This frontend is built with **Vite** for blazing-fast development.

### Quick Start

```bash
npm install
npm run dev
```

Opens at: **http://localhost:3000**

---

## 📦 Dependencies (121 total)

### Core
- **React 18.3.1** - UI framework
- **Leaflet 1.9.4** - Mapping library
- **react-leaflet 4.2.1** - React bindings

### Dev
- **Vite 6.0.1** - Build tool
- **@vitejs/plugin-react** - React plugin

**Total packages:** 121 (vs 1,321 with create-react-app!)  
**Vulnerabilities:** 0 ✅

---

## 🎯 Features

1. **Real-time WebSocket** - Connects to backend at ws://localhost:8000/ws
2. **Interactive Map** - Bengaluru with satellite imagery
3. **Status Indicator** - Live connection monitoring
4. **Message Log** - Last 10 WebSocket messages
5. **Test Controls** - Send messages to backend

---

## 🛠️ Development

### Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Hot Module Replacement (HMR)

Vite provides instant HMR - changes reflect immediately without page reload!

---

## 📁 Structure

```
src/
├── main.jsx              # Entry point
├── App.jsx               # Main component
├── App.css               # App styles
├── index.css             # Global styles
└── components/
    ├── MapComponent.jsx  # Leaflet map
    └── MapComponent.css  # Map styles
```

---

## 🔌 WebSocket Integration

Connects to backend WebSocket endpoint:

```javascript
const ws = new WebSocket('ws://localhost:8000/ws');
```

### Message Types
- `connection` - Initial handshake
- `test` - Backend test broadcasts
- `echo` - Echo responses

---

## 🗺️ Map Configuration

- **Center:** Bengaluru (12.9791°N, 77.5993°E)
- **Tiles:** Mapbox Satellite Streets
- **Markers:**
  - M. Chinnaswamy Stadium
  - MG Road Metro Station
- **Circles:** Monitoring zones (500m & 300m)

---

## 🎨 Styling

- **Theme:** Dark mode
- **Colors:** Blue gradients (#4facfe, #00f2fe)
- **Status:** Green (connected), Orange (connecting), Red (disconnected)

---

## ✅ No ajv Issues!

Unlike create-react-app, Vite has:
- ✅ Zero ajv dependencies
- ✅ Zero webpack conflicts  
- ✅ Zero vulnerability warnings
- ✅ 90% fewer packages

---

## 🚀 Performance

- **Cold start:** ~2 seconds
- **Hot reload:** <100ms
- **Build time:** ~5 seconds

---

## 📝 Phase Status

**Phase 1:** ✅ Complete
- WebSocket communication
- Leaflet map
- Real-time updates
- Status indicators

**Phase 2:** Ready to implement
- BMTC bus markers
- Weather widget
- Dynamic updates

---

*Built with Vite ⚡ - No more dependency hell!*
