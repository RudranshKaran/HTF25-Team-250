# Backend Restructure - Migration Guide

## What Changed

The backend has been reorganized from a flat structure to a professional, modular architecture:

### Before
```
backend/
├── main.py
├── api_handlers.py
├── config_manager.py
├── history_manager.py
├── simulations.py
└── requirements.txt
```

### After
```
backend/
├── main.py (updated imports)
├── requirements.txt
├── .env
├── STRUCTURE.md (documentation)
│
└── app/
    ├── config/
    │   └── settings.py (was config_manager.py)
    ├── services/
    │   ├── bmtc_service.py (from api_handlers.py)
    │   ├── weather_service.py (from api_handlers.py)
    │   ├── crowd_simulation_service.py (from simulations.py)
    │   └── history_service.py (was history_manager.py)
    └── utils/
        └── constants.py (extracted from simulations.py)
```

## Import Changes

### Old imports (before):
```python
from api_handlers import fetch_bmtc_bus_data, fetch_weather_data
from simulations import simulate_metro_flow, simulate_crowd_density
from config_manager import config_manager
from history_manager import history_manager
```

### New imports (after):
```python
from app.services import (
    fetch_bmtc_bus_data, 
    fetch_weather_data,
    simulate_metro_flow, 
    simulate_crowd_density,
    history_manager
)
from app.config import config_manager
from app.utils import STADIUM_LOCATION, METRO_LOCATION
```

## Benefits

1. **Clear Separation of Concerns**
   - Services: Business logic (data fetching, simulations)
   - Config: Settings and configuration management
   - Utils: Shared constants and utilities

2. **Better Maintainability**
   - Each service has a single responsibility
   - Easy to locate specific functionality
   - Reduced file sizes

3. **Easier Testing**
   - Services can be tested in isolation
   - Clear dependencies between modules
   - Mock external APIs easily

4. **Scalability**
   - Easy to add new services
   - Clear place for new features
   - Professional structure for team collaboration

## Running the Application

No changes needed! The application runs exactly the same:

```powershell
cd backend
./venv/Scripts/activate
python main.py
```

## Original Files

The original flat structure files (`api_handlers.py`, `simulations.py`, etc.) are still present in the `backend/` root directory for reference. They can be safely deleted once you've verified the new structure works.

## Verification

Test that imports work:
```powershell
python -c "from app.services import simulate_metro_flow; print('✓ OK')"
```

## Next Steps (Optional Enhancements)

1. **Add Controllers** (for complex business logic)
   - `app/controllers/websocket_controller.py`
   - `app/controllers/api_controller.py`

2. **Add Routes** (to separate endpoint definitions)
   - `app/routes/websocket.py`
   - `app/routes/api.py`
   - `app/routes/control.py`

3. **Add Middleware** (for logging, auth, etc.)
   - `app/middleware/logging.py`
   - `app/middleware/auth.py`

4. **Add Models** (for data validation with Pydantic)
   - `app/models/alerts.py`
   - `app/models/crowd_data.py`
