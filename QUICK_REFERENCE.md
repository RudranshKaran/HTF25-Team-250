# 🚀 Quick Reference Guide - Version 2.0 New Features

**For Administrators & Users**

---

## 🎯 New Components at a Glance

### 1. Mode Toggle (Top Navigation)
**Location**: Header, left of connection status

**What it does**:
- Switches between Live Mode (real data) and Demo Mode (mock data)
- 🔴 LIVE MODE: Red pulsing indicator
- 🎬 DEMO MODE: Blue film icon

**How to use**:
- Click the toggle to switch modes
- Status changes immediately
- Useful for offline presentations or testing

---

### 2. Crowd Risk Indicator (Header Center)
**Location**: Center of header, prominent position

**What it does**:
- Shows overall crowd safety level in real-time
- 🟢 **SAFE**: Density below 80 - Normal operations
- 🟡 **MODERATE RISK**: Density 80-120 - Monitor closely
- 🔴 **HIGH RISK**: Density above 120 - Take action!

**What happens**:
- Animates and pulses when high risk
- Plays alert sound (one-time when entering high risk)
- Updates every 2 seconds with latest density data

---

### 3. System Logs Panel (Bottom Right)
**Location**: Bottom-right corner (fixed position)

**What it does**:
- Shows last 5 system events in real-time
- Terminal-style display with timestamps
- Color-coded by type:
  - ✓ Green = Success
  - ✗ Red = Error
  - ⚠ Orange = Warning
  - • Blue = Info

**How to use**:
- Click header to collapse/expand
- Auto-scrolls to latest event
- Useful for debugging and monitoring system health

**Example events**:
- "System initialized"
- "WebSocket connected"
- "Sensor data received"
- "New alert dispatched"
- "Theme switched to light mode"

---

## ⌨️ Updated Keyboard Shortcuts

| Key | Action |
|-----|--------|
| **Space** | Pause/Resume data streams |
| **D** | Toggle Demo Mode |
| **E** | Export data |
| **M** | Toggle sound |
| **R** | Refresh data |
| **Ctrl+K** | Open Control Panel |
| **Shift+?** | Show all shortcuts |

*Hint: All shortcuts work regardless of which component has focus*

---

## 🎨 Theme Colors Quick Reference

### Dark Mode (Default)
- Background: Deep Navy (#0a0e27)
- Primary Accent: Cyan Blue (#4facfe)
- Text: White (#ffffff)
- Success: Bright Green (#00ff88)
- Warning: Orange (#ffa500)
- Danger: Red (#ff4444)

### Light Mode
- Background: Off-White (#f5f7fa)
- Primary Accent: Royal Blue (#2563eb)
- Text: Dark Gray (#1f2937)
- Success: Green (#10b981)
- Warning: Amber (#f59e0b)
- Danger: Red (#ef4444)

---

## 🔔 Enhanced Notification System

### Notification Types
1. **Success** (Green): Positive actions completed
2. **Error** (Red): Failed actions or critical errors
3. **Warning** (Orange): Cautionary messages
4. **Info** (Blue): General information

### Where notifications appear
- **Toast Notifications**: Top-right corner, auto-dismiss
- **Alert Banner**: Below header, for critical alerts
- **System Logs**: Bottom-right panel, permanent record

---

## 💡 Tips & Tricks

### For Presentations
1. Switch to **Demo Mode** for reliable mock data
2. **Collapse System Logs** for cleaner view
3. Enable **Sound** for dramatic effect
4. Use fullscreen mode for better visibility

### For Monitoring
1. Keep **Live Mode** active
2. Watch **Crowd Risk Indicator** for quick status
3. Monitor **System Logs** for connectivity issues
4. Set alert sounds to comfortable volume (⚙️ Settings)

### For Analysis
1. Use **Pause** button to freeze current state
2. **Export Data** for offline analysis
3. Check **Alert History** for patterns
4. Review **System Logs** for event correlation

---

## 🐛 Troubleshooting

### Problem: Mode Toggle not switching
**Solution**: Check backend is running and WebSocket connected

### Problem: System Logs not showing events
**Solution**: Refresh page - logs initialize on load

### Problem: Crowd Risk Indicator stuck on "Safe"
**Solution**: Wait for density data to load (2-3 seconds)

### Problem: Alert sound not playing
**Solution**: Check browser autoplay policy, press "M" to unmute

---

## 📊 Understanding the Dashboard

### Header Layout (Left to Right)
```
[Title & Subtitle] | [Crowd Risk Indicator] | [Mode Toggle] [Status] [Last Update]
```

### Main Area Layout
```
+----------------------------------+--------+
|                                  |        |
|          Map with                | Side   |
|          Heatmap                 | Panel  |
|                                  |        |
+----------------------------------+--------+
|     Analytics Panel (collapsible)         |
+-------------------------------------------+
```

### Overlays (Floating)
- **Control Panel** (⚙️ button): Settings and configuration
- **Performance Dashboard**: Connection and performance metrics
- **Quick Actions**: Fast access toolbar
- **System Logs**: Event log (bottom-right)

---

## 🎓 Best Practices

### DO:
✅ Keep Live Mode enabled for real monitoring  
✅ Monitor Crowd Risk Indicator during events  
✅ Check System Logs for errors  
✅ Export data before making setting changes  
✅ Use keyboard shortcuts for efficiency  

### DON'T:
❌ Toggle modes rapidly (may cause sync issues)  
❌ Ignore high-risk warnings  
❌ Disable sound during critical events  
❌ Close browser during active monitoring  
❌ Forget to pause before exporting data  

---

## 📞 Need Help?

- **Documentation**: See `/docs` folder
- **API Reference**: `docs/api_references.md`
- **UI Changes**: `docs/ui_changes.md`
- **Full History**: `docs/iterations/`

---

## 🔄 Coming in Next Version (2.1)

- 📊 Advanced Chart.js integration
- 🗺️ Click hotspots for detailed zone info
- 🎯 "Focus on most crowded zone" button
- ➡️ Directional flow arrows on map
- 📄 PDF report generation
- 🤖 AI-based crowd predictions

---

**Version**: 2.0  
**Last Updated**: October 26, 2025  
**Maintained By**: Team 250

---

<div align="center">
  <strong>Happy Monitoring! 🚨</strong>
</div>
