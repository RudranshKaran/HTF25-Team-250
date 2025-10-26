# Quick Start: AI Crowd Management Insights

**Get the AI Insights feature running in 5 minutes!**

## 1️⃣ Get Your Gemini API Key (2 minutes)

1. Visit: https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key" 
4. Copy the key

## 2️⃣ Configure Backend (1 minute)

1. Open `backend/.env`
2. Replace `your_gemini_api_key_here` with your actual API key:
   ```
   GEMINI_API_KEY=sk-xxx...xxx
   ```
3. Save the file

## 3️⃣ Install & Start Backend (1 minute)

```powershell
# Open terminal in backend directory
cd backend
pip install -r requirements.txt
python main.py
```

**Expected output:**
```
🚨 Crowd Safety Intelligence System - Backend Starting...
✅ Background tasks started
```

## 4️⃣ Start Frontend (30 seconds)

```powershell
# Open new terminal in frontend directory
cd frontend
npm run dev
```

**Expected output:**
```
➜  Local:   http://localhost:5173
```

## 5️⃣ Access AI Insights (30 seconds)

1. Open browser to `http://localhost:5173`
2. Click **"🤖 AI Insights"** in the sidebar
3. Or press **`6`** on your keyboard

## 🎮 Using the Feature

### Tab 1: 📊 Insights
- Click "🔄 Refresh Insights"
- See current crowd status, risks, trends

### Tab 2: ⚡ Action Plans
- Click "🔄 Generate Action Plan"
- Get immediate and short-term strategies

### Tab 3: 🚌 Transportation
- Click "🔄 Find Transportation"
- See nearest buses, metro, taxis

### Tab 4: 🛣️ Traffic Diversion
- Click "🔄 Generate Diversion Plan"
- Get alternate routes and restrictions

### Tab 5: 📋 Report
- Select time period (1h, 24h, 7d)
- Click "📄 Generate Report"
- Click "📥 Download Report as Text"

## ✅ What to Expect

### With API Key (AI Mode)
```
Status: ✅ LIVE
- Real-time AI analysis
- Smart recommendations
- Personalized insights
```

### Without API Key (Fallback Mode)
```
Status: ⚠️ FALLBACK
- Rule-based recommendations
- Generic strategies
- Still functional
```

## 🔧 Troubleshooting

### ❌ Backend won't start
```
ERROR: Module not found
FIX: pip install google-generativeai
```

### ❌ Can't connect to API
```
ERROR: Failed to fetch
FIX: Ensure backend running on http://localhost:8000
```

### ❌ All data showing "N/A"
```
Normal during startup
Wait 30 seconds for WebSocket data
Then refresh
```

### ❌ Fallback mode active
```
REASON: GEMINI_API_KEY not set
FIX: Add API key to backend/.env
```

## 📊 What You'll See

### Insights Tab
```
Status: CRITICAL
Risk: 2 critical zones, 1 warning
Trend: Density increasing ↗️
```

### Actions Tab
```
IMMEDIATE (0-5 min):
→ Increase personnel
→ Open alternate entrances
→ Activate info kiosks

SHORT-TERM (5-30 min):
→ Manage crowd with barriers
→ Redirect to less congested areas
```

### Transportation Tab
```
🚇 Metro: Chinnaswamy Station (50m)
🚌 Bus: Routes 1,2,3,4
🚕 Taxi: Available throughout area
```

### Diversion Tab
```
🟢 PRIMARY: Via Outer Ring Road
🟡 SECONDARY: Via Whitefield Road
🚫 RESTRICT: Direct stadium access
```

### Report Tab
```
Period: Last 1 Hour
Zones: 8 monitored
Efficiency: 72% ⭐
Peak Times: 12:00-14:00, 17:00-19:00
```

## 🚀 Features Explained

| Feature | What It Does | When to Use |
|---------|-------------|------------|
| **Insights** | Analyzes current situation | Every 5-10 minutes |
| **Actions** | Gives strategies | During peak hours |
| **Transport** | Finds dispersal routes | When crowded |
| **Diversion** | Routes traffic | During events |
| **Reports** | Summarizes activity | End of shift |

## 💾 Data Flow

```
WebSocket ──► Crowd Density Data ──► AI Service
                                        ↓
                              Gemini API (AI)
                                        ↓
                              JSON Response
                                        ↓
                            React Component
                                        ↓
                         Beautiful Dashboard
```

## ⏱️ Response Times

| Action | Speed |
|--------|-------|
| Insights | 1-3 seconds |
| Action Plan | 2-4 seconds |
| Transportation | < 100ms |
| Diversion | 2-5 seconds |
| Report | 2-5 seconds |

## 🎯 Common Workflows

### Scenario 1: Stadium Event Gets Crowded
1. Click AI Insights (shortcut: `6`)
2. Go to **Action Plans** tab
3. Follow immediate actions
4. Use **Transportation** to suggest dispersal
5. Check **Diversion** for traffic relief

### Scenario 2: End of Shift Report
1. Go to **Report** tab
2. Select "Last 24 Hours"
3. Click "📄 Generate Report"
4. Click "📥 Download Report"
5. Send to management

### Scenario 3: Monitor Trends
1. Switch to **Insights** tab
2. Note current status
3. Wait 5 minutes
4. Refresh insights
5. Compare trends

## 📚 Learn More

For detailed information, see:
- **Setup**: `AI_INSIGHTS_SETUP.md`
- **Summary**: `AI_INSIGHTS_SUMMARY.md`
- **API Docs**: `AI_INSIGHTS_SETUP.md` (Endpoints section)

## 🆘 Need Help?

1. Check terminal console for error messages
2. Verify `.env` file has correct API key
3. Ensure both backend and frontend are running
4. Check browser console (F12) for errors
5. Restart backend and frontend

## ✨ Tips & Tricks

- 🎹 Press `6` to jump to AI Insights quickly
- 📄 Reports download as `.txt` files (can open in any editor)
- 🔄 Refresh any tab when data seems stale
- 📊 Generate reports periodically for analysis
- 🎯 Use action plans during peak hours
- 🚌 Transportation finder works for all zones

## 🎓 Next Steps

1. ✅ Get it working (you are here!)
2. Learn all features (read setup guide)
3. Use in production
4. Monitor crowd effectively
5. Generate insights reports
6. Share findings with team

---

**🎉 You're all set! Welcome to AI-powered crowd management!**

For questions or issues, refer to the troubleshooting section above.