# AI Crowd Management Insights - Setup Guide

## Overview
The **AI Crowd Management Insights** feature provides intelligent, AI-powered recommendations to help manage crowd flow in real-time. It uses Google's Gemini API to analyze crowd data and generate actionable recommendations.

## Features

### 1. **AI Insights** 🤖
- Real-time crowd assessment and status
- Risk assessment based on current density data
- Expected trend analysis (30-minute forecast)
- Key metrics to monitor

### 2. **Action Plans** ⚡
- Immediate actions (0-5 minutes)
- Short-term actions (5-30 minutes)
- Resource allocation recommendations
- Expected outcomes

### 3. **Transportation Options** 🚌
- Nearest metro/rail stations
- Available bus routes
- Taxi/ride-hailing services
- Zone-specific transportation recommendations

### 4. **Traffic Diversion** 🛣️
- Primary alternate routes
- Secondary alternate routes
- Roads to restrict/close
- Expected travel time impact

### 5. **Report Generation** 📋
- Executive summary
- Peak crowd times
- Problem areas identification
- Efficiency score
- Downloadable text reports

## Setup Instructions

### Backend Setup

#### 1. Install Dependencies
```powershell
# From the backend directory
pip install -r requirements.txt
```

#### 2. Configure Gemini API Key
1. Get your free API key from: https://makersuite.google.com/app/apikey
2. Open `backend/.env` file
3. Add your API key:
   ```
   GEMINI_API_KEY=your_actual_api_key_here
   ```

#### 3. Start Backend Server
```powershell
cd backend
python main.py
```

The backend will start on `http://localhost:8000`

### Frontend Setup

#### 1. Install Dependencies
```powershell
cd frontend
npm install
```

#### 2. Start Development Server
```powershell
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Using the AI Insights Feature

### Navigation
1. **In Dashboard**: Click the "🤖 AI Insights" button in the sidebar
2. **Keyboard Shortcut**: Press `6` to jump directly to AI Insights view

### Tabs Overview

#### 📊 Insights Tab
- View current crowd assessment
- See status badge (CRITICAL, WARNING, NORMAL)
- Monitor risk assessment
- Track expected trends

**To refresh**: Click "🔄 Refresh Insights" button

#### ⚡ Action Plans Tab
- Get immediate actions for critical situations
- Review short-term strategies
- See resource allocation recommendations
- Understand expected outcomes

**To generate**: Click "🔄 Generate Action Plan" button

#### 🚌 Transportation Tab
- Find nearest metro stations
- Check available bus routes
- See taxi/ride-hailing options
- Get zone-specific recommendations

**To find**: Click "🔄 Find Transportation" button

#### 🛣️ Traffic Diversion Tab
- View primary diversion routes
- See secondary routes
- Check which roads to restrict
- Understand traffic impact

**To calculate**: Click "🔄 Generate Diversion Plan" button

#### 📋 Report Tab
- Select report period (1 hour, 24 hours, 7 days)
- Generate comprehensive reports
- View efficiency score with visual indicator
- Download reports as text files

**To download**: Click "📥 Download Report as Text" button

## API Endpoints

### Crowd Insights
```
POST /api/ai/insights
Content-Type: application/json

Response:
{
  "status": "success",
  "insights": {
    "status": "critical|warning|normal",
    "risk_assessment": "...",
    "trend": "...",
    "metrics_to_monitor": [...]
  }
}
```

### Action Plans
```
POST /api/ai/action-plan?zone=all
Content-Type: application/json

Response:
{
  "status": "success",
  "action_plan": {
    "immediate_actions": [...],
    "short_term_actions": [...],
    "resources": "...",
    "expected_outcome": "..."
  }
}
```

### Nearest Transportation
```
GET /api/ai/nearest-transportation?zone=all

Response:
{
  "status": "success",
  "transportation": {
    "zone": "all",
    "nearest_transportation": {
      "metro": [...],
      "buses": [...],
      "taxis": [...]
    },
    "recommendations": [...]
  }
}
```

### Traffic Diversion
```
POST /api/ai/traffic-diversion?zone=all
Content-Type: application/json

Response:
{
  "status": "success",
  "diversion": {
    "primary_routes": [...],
    "secondary_routes": [...],
    "restricted_roads": [...],
    "duration": "...",
    "impact": "..."
  }
}
```

### Generate Report
```
GET /api/ai/report?period=1hour|24hours|7days

Response:
{
  "status": "success",
  "report": {
    "summary": "...",
    "peak_times": [...],
    "problem_areas": [...],
    "recommendations": [...],
    "efficiency_score": 72,
    "period": "1hour"
  }
}
```

## Zones Supported

The system supports the following zones:
- `all` - City-wide view
- `stadium` - Chinnaswamy Stadium
- `mg_road_metro` - MG Road Metro Area
- `majestic` - Majestic Bus Stand
- `electronic_city` - Electronic City
- `koramangala` - Koramangala
- `indiranagar` - Indiranagar
- `cubbon_park` - Cubbon Park Area

## Fallback Mode

If the **Gemini API key is not configured** or unavailable, the system will automatically use **fallback mode** with pre-defined recommendations. This ensures the application continues to function even without the AI service.

### Fallback Behavior:
- ✅ Insights still displayed (rule-based)
- ✅ Action plans still generated
- ✅ Transportation options still shown
- ✅ Traffic diversion still calculated
- ⚠️ Recommendations are less personalized
- ⚠️ No AI-powered analysis

## Troubleshooting

### Issue: "GEMINI_API_KEY not found. Using fallback mode."
**Solution**: 
1. Check if `.env` file exists in `backend/` directory
2. Verify API key is set correctly
3. Restart the backend server

### Issue: "Failed to fetch insights: Network error"
**Solution**:
1. Ensure backend server is running (`http://localhost:8000`)
2. Check CORS configuration
3. Verify frontend is on `http://localhost:5173` or `http://localhost:3000`

### Issue: "Status: error" in response
**Solution**:
1. Check backend console for error messages
2. Verify crowd data is being received
3. Check Gemini API quota/rate limits

### Issue: Insights are not updating
**Solution**:
1. Click "🔄 Refresh Insights" button manually
2. Wait for WebSocket data to arrive (checks every 30 seconds)
3. Verify multi-zone density data is available

## Performance Notes

- **Insights Generation**: ~1-3 seconds with Gemini API
- **Fallback Mode**: < 100ms
- **Report Generation**: ~2-5 seconds
- **Caching**: Recommendations cached per request (no re-generation)

## API Rate Limits

- Gemini API free tier: 60 requests per minute
- Recommended: Generate reports every 5+ minutes
- Insights: Generate on-demand (not recommended more than once per minute)

## Data Privacy

- ✅ All data stays within your infrastructure
- ✅ Only crowd density and alerts sent to Gemini API
- ✅ No personal information collected
- ✅ API responses not stored permanently

## Future Enhancements

Potential improvements for future versions:
- [ ] Custom AI model deployment
- [ ] Historical AI analysis and learning
- [ ] Predictive alerts based on patterns
- [ ] Integration with emergency services APIs
- [ ] Multi-language support for recommendations
- [ ] Real-time report streaming
- [ ] ML-based crowd behavior prediction
- [ ] Cost optimization recommendations

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review backend console logs
3. Verify all API keys and configurations
4. Check network connectivity