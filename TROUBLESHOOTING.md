# 🔧 Troubleshooting Guide

## ✅ Fixed: ajv/dist/compile/codegen Module Error

### Problem
When running `npm start`, you encountered:
```
Cannot find module 'ajv/dist/compile/codegen'
```

### Root Cause
This is a known dependency conflict between:
- `ajv` (JSON schema validator)
- `ajv-keywords` 
- React Scripts 5.0.1

The issue occurs due to version mismatches in the dependency tree.

### Solution Applied ✅
```powershell
cd frontend
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install --legacy-peer-deps
```

The `--legacy-peer-deps` flag tells npm to use the legacy peer dependency resolution algorithm, which resolves the version conflicts.

---

## 🚀 How to Start the Application Now

### Backend (Terminal 1)
```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

**Expected Output:**
```
Starting Crowd Safety Intelligence System backend...
WebSocket endpoint available at: ws://localhost:8000/ws
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Frontend (Terminal 2)
```powershell
cd frontend
npm start
```

**Expected Output:**
```
Compiled successfully!
You can now view crowd-safety-dashboard in the browser.
  Local:            http://localhost:3000
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "python: command not found"
**Solution:**
```powershell
py -m venv venv  # Use 'py' instead of 'python'
```

### Issue 2: Port 8000 Already in Use
**Solution:**
```powershell
# Find and kill the process
netstat -ano | findstr :8000
taskkill /PID <PID_NUMBER> /F
```

Or change the port in `backend/.env`:
```env
PORT=8001
```

### Issue 3: Port 3000 Already in Use
**Solution:**
When prompted, type `Y` to run on a different port, or:
```powershell
# Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F
```

### Issue 4: Virtual Environment Activation Restricted
**Error:** "cannot be loaded because running scripts is disabled"

**Solution:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Issue 5: npm Vulnerabilities Warning
**Output:**
```
9 vulnerabilities (3 moderate, 6 high)
```

**Note:** These are known issues with React Scripts 5.0.1 dependencies. They don't affect development functionality. If needed:
```powershell
npm audit fix
# Or for aggressive fixes (may break things):
npm audit fix --force
```

### Issue 6: WebSocket Shows "DISCONNECTED"
**Checklist:**
- [ ] Is backend running? Check terminal 1
- [ ] Backend accessible at http://localhost:8000
- [ ] No firewall blocking port 8000
- [ ] Check backend terminal for errors
- [ ] Try refreshing the browser (Ctrl+Shift+R)

### Issue 7: Map Not Loading / Blank Map
**Possible Causes:**
1. **Network issue** - Check internet connection
2. **Mapbox token** - Using demo token (limited requests)
3. **Console errors** - Press F12 and check console

**Solution:**
Get your own Mapbox token (free):
1. Sign up at https://www.mapbox.com/
2. Get access token
3. Update `frontend/src/components/MapComponent.js`:
```javascript
const MAPBOX_TOKEN = 'YOUR_TOKEN_HERE';
```

### Issue 8: Module Not Found (Backend)
**Error:** `ModuleNotFoundError: No module named 'fastapi'`

**Solution:**
```powershell
cd backend
.\venv\Scripts\activate  # Make sure venv is activated
pip install -r requirements.txt
```

### Issue 9: Can't Install Dependencies (No Admin Rights)
**Solution:**
```powershell
# For Python - use --user flag
pip install --user -r requirements.txt

# For npm - should work without admin by default
npm install --legacy-peer-deps
```

---

## 🔍 Debugging Tips

### View Backend Logs
Backend logs show in the terminal where you ran `python main.py`:
- WebSocket connections
- API requests
- Errors and warnings

### View Frontend Logs
1. Open browser (http://localhost:3000)
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Look for:
   - WebSocket connection messages
   - React errors (red)
   - Warnings (yellow)

### Test Backend Directly
```powershell
# Test health check
curl http://localhost:8000

# Test status API
curl http://localhost:8000/api/status
```

### Test WebSocket Connection
1. Open browser console (F12)
2. Run:
```javascript
const ws = new WebSocket('ws://localhost:8000/ws');
ws.onmessage = (e) => console.log('Received:', e.data);
```
3. Should see connection message and test broadcasts

---

## 📋 Dependency Versions (Working Configuration)

### Backend (requirements.txt)
```txt
fastapi==0.109.0
uvicorn[standard]==0.27.0
websockets==12.0
requests==2.31.0
python-dotenv==1.0.0
```

### Frontend (package.json)
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-scripts": "5.0.1",
  "leaflet": "^1.9.4",
  "react-leaflet": "^4.2.1",
  "leaflet-heatmap": "^1.0.0"
}
```

### Required Software
- **Python:** 3.8+ (tested with 3.13)
- **Node.js:** 16+ (tested with 18+)
- **npm:** 8+ (comes with Node.js)

---

## 🔄 Clean Reinstall (Nuclear Option)

If nothing works, start fresh:

### Backend
```powershell
cd backend
Remove-Item -Recurse -Force venv
python -m venv venv
.\venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
```

### Frontend
```powershell
cd frontend
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm cache clean --force
npm install --legacy-peer-deps
```

---

## ✅ Verification Checklist

After starting both servers:

- [ ] Backend terminal shows: `Uvicorn running on http://0.0.0.0:8000`
- [ ] Frontend browser opens automatically to http://localhost:3000
- [ ] Dashboard shows green "LIVE" status indicator
- [ ] Test messages appear every 10 seconds in side panel
- [ ] Map displays satellite view of Bengaluru
- [ ] Two markers visible: Stadium (🏏) and Metro (🚇)
- [ ] Clicking markers shows popup info
- [ ] "Send Test Message" button works
- [ ] No errors in browser console (F12)
- [ ] No errors in backend terminal

---

## 📞 Still Having Issues?

### Collect This Information:
1. **Error message** (full text)
2. **Terminal output** (both backend and frontend)
3. **Browser console errors** (F12 → Console)
4. **System info:**
   - Python version: `python --version`
   - Node version: `node --version`
   - npm version: `npm --version`
   - OS: Windows 10/11

### Check These Files Exist:
```
backend/
  ├── main.py
  ├── requirements.txt
  ├── .env
  └── venv/

frontend/
  ├── package.json
  ├── node_modules/
  └── src/
      ├── App.js
      └── components/MapComponent.js
```

---

## 🎯 Quick Test Commands

### Test Backend
```powershell
# From project root
cd backend
.\venv\Scripts\activate
python -c "import fastapi; print('FastAPI OK')"
python -c "import uvicorn; print('Uvicorn OK')"
python main.py
```

### Test Frontend
```powershell
# From project root
cd frontend
node --version  # Should show v16+
npm --version   # Should show v8+
npm start
```

---

**Last Updated:** After fixing ajv dependency issue  
**Status:** Phase 1 functional ✅

For Phase-specific issues, refer to the main README.md

