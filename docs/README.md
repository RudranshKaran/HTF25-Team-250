# Crowd Safety Intelligence System

## 🎯 Project Overview

The **Crowd Safety Intelligence System** is a real-time crowd monitoring and safety management dashboard designed for urban environments, specifically targeting Bengaluru's high-traffic areas. The system provides live visualization of crowd density, transportation data, weather conditions, and intelligent alerts to help authorities manage public safety during events and peak hours.

## 🌟 Key Features

### Real-Time Monitoring
- **Live Crowd Density Heatmaps**: Visual representation of crowd concentration across monitored zones
- **BMTC Bus Tracking**: Real-time GPS tracking of public buses
- **Metro Flow Analytics**: Entry and exit rate monitoring at metro stations
- **Weather Integration**: Live weather data for situational awareness

### Intelligent Alerts
- **Multi-Level Alert System**: Critical, Warning, and Info level alerts
- **Audio Notifications**: Customizable sound alerts for different severity levels
- **Predictive Analytics**: AI-based forecasting of potential overcrowding

### Advanced Visualization
- **Interactive Leaflet Maps**: Pan, zoom, and click interactions
- **Heatmap Overlays**: Dynamic visualization of crowd density
- **Animated Hotspots**: Pulsing effects for active high-density zones
- **Directional Flow Arrows**: Visual indicators of crowd movement patterns

### Control & Management
- **Live/Demo Mode Toggle**: Switch between real data and demonstration mode
- **Pause/Resume**: Control data stream for analysis
- **Export Functionality**: Download crowd data reports in PDF/CSV formats
- **Keyboard Shortcuts**: Quick access to key functions

### Analytics Dashboard
- **Real-Time Charts**: Trend analysis with Chart.js
- **Performance Metrics**: System health and data throughput monitoring
- **Alert History**: Chronological log of all system alerts
- **Predictive Insights**: Machine learning-based crowd forecasting

## 🏗️ Architecture

### Frontend
- **Framework**: React 18.3 with Vite
- **Mapping**: Leaflet with React-Leaflet
- **Charts**: Chart.js & Recharts
- **Styling**: Custom CSS with CSS3 animations
- **State Management**: React Hooks (useState, useEffect, useCallback)

### Backend
- **Framework**: FastAPI (Python)
- **WebSocket**: Real-time bidirectional communication
- **Data Sources**: 
  - BMTC Bus API (unofficial)
  - OpenWeatherMap API
  - Simulated crowd density sensors
- **Simulation Engine**: Advanced crowd dynamics modeling

### Communication
- **Protocol**: WebSocket (ws://)
- **Data Format**: JSON
- **Message Types**: Connection, GPS updates, Weather, Metro, Density, Alerts

## 📁 Project Structure

```
HTF25-Team-250/
├── backend/
│   ├── main.py                 # FastAPI server & WebSocket handler
│   ├── api_handlers.py         # External API integrations
│   ├── simulations.py          # Crowd simulation engine
│   ├── config_manager.py       # Settings & configuration
│   ├── history_manager.py      # Alert history management
│   └── requirements.txt        # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Main application component
│   │   ├── components/        # React components
│   │   └── utils/             # Utility functions
│   ├── public/                # Static assets
│   └── package.json           # Node dependencies
└── docs/                      # Documentation (you are here)
    ├── README.md
    ├── architecture.md
    ├── api_references.md
    ├── ui_changes.md
    └── iterations/
        ├── iteration_1.md
        └── iteration_2.md
```

## 🚀 Getting Started

### Prerequisites
- **Python**: 3.9+
- **Node.js**: 16+
- **npm** or **yarn**

### Installation

#### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python main.py
```
Backend will run on `http://localhost:8000`

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend will run on `http://localhost:5173`

## 🔑 Environment Variables

Create a `.env` file in the backend directory:
```env
OPENWEATHER_API_KEY=your_api_key_here
BENGALURU_LAT=12.9716
BENGALURU_LON=77.5946
```

## 🎮 Usage

### Keyboard Shortcuts
- **Space**: Pause/Resume data streams
- **D**: Toggle Demo Mode
- **E**: Export data
- **M**: Toggle sound
- **R**: Refresh data
- **Ctrl+K**: Open Control Panel
- **Shift+?**: Show all shortcuts

### API Endpoints
- `GET /api/settings`: Retrieve system settings
- `POST /api/control/toggle`: Pause/Resume
- `POST /api/control/demo-mode`: Toggle demo mode
- `GET /api/export`: Export current data
- `GET /api/alerts/history`: Get alert history

## 📊 Data Flow

1. **Backend** fetches data from external APIs (BMTC, OpenWeather)
2. **Simulation Engine** generates crowd density data
3. **WebSocket Server** broadcasts updates to frontend
4. **Frontend** receives data and updates visualizations
5. **Alert System** triggers notifications based on thresholds
6. **Analytics Engine** processes trends and predictions

## 🛡️ Safety Features

- **Crowd Density Thresholds**: Automatic alert triggers
- **Risk Assessment**: Real-time calculation of crowd safety levels
- **Emergency Actions**: Suggested interventions for crowd management
- **Historical Analysis**: Pattern recognition for event planning

## 🔮 Future Enhancements

- Machine learning model integration for predictive analytics
- Mobile app for field officers
- Multi-city support
- Integration with emergency services
- Social media sentiment analysis
- CCTV camera integration with computer vision

## 👥 Contributors

**Team 250** - HTF25 Hackathon

## 📄 License

This project is part of the HTF25 Hackathon submission.

## 📞 Support

For issues, questions, or contributions, please refer to the project repository or contact the development team.

---

**Last Updated**: October 26, 2025  
**Version**: 2.0  
**Status**: Active Development
