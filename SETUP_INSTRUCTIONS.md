# 🚀 Setup Instructions for Phase 1

## Step-by-Step Setup Guide

### Backend Setup

1. **Navigate to backend directory:**
   ```powershell
   cd backend
   ```

2. **Create virtual environment:**
   ```powershell
   python -m venv venv
   ```

3. **Activate virtual environment:**
   ```powershell
   .\venv\Scripts\activate
   ```

4. **Install dependencies:**
   ```powershell
   pip install -r requirements.txt
   ```

5. **Verify .env file exists** (already created with default values)

6. **Run the backend server:**
   ```powershell
   python main.py
   ```

   You should see:
   ```
   INFO:     Started server process
   INFO:     Uvicorn running on http://0.0.0.0:8000
   ```

### Frontend Setup

Open a **NEW terminal window** and:

1. **Navigate to frontend directory:**
   ```powershell
   cd frontend
   ```

2. **Install dependencies:**
   ```powershell
   npm install
   ```

3. **Start development server:**
   ```powershell
   npm start
   ```

   Browser should automatically open to http://localhost:3000

---

## ✅ Verification Checklist

After both servers are running:

- [ ] Backend accessible at http://localhost:8000
- [ ] Frontend opens at http://localhost:3000
- [ ] Status indicator shows **"LIVE"** (green dot)
- [ ] Test messages appear in the "Recent Messages" panel every 10 seconds
- [ ] Map shows Bengaluru with satellite imagery
- [ ] Two markers visible: Stadium (🏏) and Metro (🚇)
- [ ] Click markers to see popup information
- [ ] "Send Test Message" button is enabled and works
- [ ] Console shows WebSocket messages (press F12)

---

## 🐛 Common Issues

### Issue: "python: command not found"
**Solution:** Use `py` instead of `python`:
```powershell
py -m venv venv
```

### Issue: Port 8000 already in use
**Solution:** 
1. Find and kill the process:
   ```powershell
   netstat -ano | findstr :8000
   taskkill /PID <PID> /F
   ```
2. Or change PORT in backend/.env

### Issue: npm not found
**Solution:** Install Node.js from https://nodejs.org/

### Issue: WebSocket shows "DISCONNECTED"
**Solution:**
1. Ensure backend is running first
2. Check backend terminal for errors
3. Verify no firewall blocking port 8000

---

## 🎯 What's Working in Phase 1

✅ **Backend:**
- FastAPI server running
- WebSocket server accepting connections
- Broadcasting test messages every 10 seconds
- Connection manager tracking active clients
- Health check endpoint at /
- Status endpoint at /api/status

✅ **Frontend:**
- React app with modern UI
- Leaflet map with Mapbox satellite tiles
- WebSocket client with auto-reconnect
- Real-time message display
- Connection status indicator
- Interactive map markers
- Custom legend and overlays
- Test message controls

---

## 📱 Next Steps

Once Phase 1 is verified working:
1. Keep both servers running
2. Observe test messages flowing every 10 seconds
3. Test the "Send Test Message" button
4. Explore the map (zoom, pan, click markers)
5. Open browser console (F12) to see detailed logs

**Ready for Phase 2!** 🎉

