"""
Config Manager for Phase 5
Handles system settings and configuration
"""

from typing import Dict, Any
from datetime import datetime

class ConfigManager:
    """
    Manages system configuration and settings
    Allows dynamic threshold adjustments and system controls
    """
    
    def __init__(self):
        # Alert thresholds
        self.density_threshold_warning = 150
        self.density_threshold_critical = 200
        self.metro_flow_threshold = 80
        
        # System controls
        self.simulations_paused = False
        self.simulations_speed = 1.0  # 1.0 = normal, 2.0 = 2x speed
        
        # Display settings
        self.heatmap_enabled = True
        self.hotspot_markers_enabled = True
        self.phase_badge_enabled = True
        
        # Notification settings
        self.sound_enabled = True
        self.sound_volume = 0.5  # 0.0 to 1.0
        self.critical_sound_enabled = True
        self.warning_sound_enabled = False
        
        # Performance tracking
        self.session_start = datetime.now()
        self.total_alerts = 0
        self.total_messages = 0
        self.phase_transition_count = 0
        
        # Demo mode
        self.demo_mode = False
        self.demo_force_critical = False
        
    def update_thresholds(self, warning: int = None, critical: int = None, metro: int = None):
        """Update alert thresholds"""
        if warning is not None:
            self.density_threshold_warning = max(50, min(300, warning))
        if critical is not None:
            self.density_threshold_critical = max(100, min(400, critical))
        if metro is not None:
            self.metro_flow_threshold = max(20, min(150, metro))
    
    def pause_simulations(self):
        """Pause all simulations"""
        self.simulations_paused = True
    
    def resume_simulations(self):
        """Resume all simulations"""
        self.simulations_paused = False
    
    def toggle_simulations(self):
        """Toggle pause state"""
        self.simulations_paused = not self.simulations_paused
        return self.simulations_paused
    
    def set_speed(self, speed: float):
        """Set simulation speed multiplier"""
        self.simulations_speed = max(0.5, min(5.0, speed))
    
    def toggle_demo_mode(self):
        """Toggle demo mode"""
        self.demo_mode = not self.demo_mode
        if self.demo_mode:
            # Demo mode: faster phases, guaranteed alerts
            self.simulations_speed = 2.0
            self.demo_force_critical = True
        else:
            self.simulations_speed = 1.0
            self.demo_force_critical = False
        return self.demo_mode
    
    def increment_alert_count(self):
        """Track alerts"""
        self.total_alerts += 1
    
    def increment_message_count(self):
        """Track messages"""
        self.total_messages += 1
    
    def increment_phase_transition(self):
        """Track phase changes"""
        self.phase_transition_count += 1
    
    def get_session_duration(self) -> int:
        """Get session duration in seconds"""
        return int((datetime.now() - self.session_start).total_seconds())
    
    def get_settings(self) -> Dict[str, Any]:
        """Get all current settings"""
        return {
            "thresholds": {
                "density_warning": self.density_threshold_warning,
                "density_critical": self.density_threshold_critical,
                "metro_flow": self.metro_flow_threshold
            },
            "controls": {
                "paused": self.simulations_paused,
                "speed": self.simulations_speed,
                "demo_mode": self.demo_mode
            },
            "display": {
                "heatmap_enabled": self.heatmap_enabled,
                "hotspot_markers_enabled": self.hotspot_markers_enabled,
                "phase_badge_enabled": self.phase_badge_enabled
            },
            "notifications": {
                "sound_enabled": self.sound_enabled,
                "sound_volume": self.sound_volume,
                "critical_sound": self.critical_sound_enabled,
                "warning_sound": self.warning_sound_enabled
            },
            "stats": {
                "session_duration": self.get_session_duration(),
                "total_alerts": self.total_alerts,
                "total_messages": self.total_messages,
                "phase_transitions": self.phase_transition_count
            }
        }
    
    def update_display_settings(self, heatmap: bool = None, hotspots: bool = None, badge: bool = None):
        """Update display toggles"""
        if heatmap is not None:
            self.heatmap_enabled = heatmap
        if hotspots is not None:
            self.hotspot_markers_enabled = hotspots
        if badge is not None:
            self.phase_badge_enabled = badge
    
    def update_sound_settings(self, enabled: bool = None, volume: float = None, 
                             critical: bool = None, warning: bool = None):
        """Update sound settings"""
        if enabled is not None:
            self.sound_enabled = enabled
        if volume is not None:
            self.sound_volume = max(0.0, min(1.0, volume))
        if critical is not None:
            self.critical_sound_enabled = critical
        if warning is not None:
            self.warning_sound_enabled = warning
    
    def reset_stats(self):
        """Reset statistics"""
        self.session_start = datetime.now()
        self.total_alerts = 0
        self.total_messages = 0
        self.phase_transition_count = 0


# Global config manager instance
config_manager = ConfigManager()

