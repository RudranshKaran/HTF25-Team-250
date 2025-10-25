"""
History Manager for Phase 4
Tracks historical data for analytics and trends
"""

from datetime import datetime, timedelta
from typing import Dict, List
from collections import deque

class HistoryManager:
    """
    Manages historical data storage with automatic cleanup
    Stores last 30 minutes of data for analytics
    """
    
    def __init__(self, retention_minutes: int = 30):
        self.retention_minutes = retention_minutes
        
        # Use deque for efficient FIFO operations
        self.density_history = deque(maxlen=100)  # Max 100 entries (~50 min at 30s intervals)
        self.metro_history = deque(maxlen=50)     # Max 50 entries (~50 min at 60s intervals)
        self.alert_history = deque(maxlen=20)     # Last 20 alerts
        
        # Phase transitions for timeline
        self.phase_transitions = deque(maxlen=20)
        
    def add_density_data(self, data: Dict):
        """Add crowd density data point"""
        self.density_history.append({
            'timestamp': data.get('timestamp'),
            'max_density': data.get('max_density'),
            'avg_density': data.get('avg_density'),
            'phase': data.get('phase'),
            'hotspots_count': len(data.get('hotspots', []))
        })
        
        # Track phase transitions
        if len(self.density_history) > 1:
            current_phase = data.get('phase')
            previous_phase = self.density_history[-2]['phase']
            
            if current_phase != previous_phase:
                self.phase_transitions.append({
                    'timestamp': data.get('timestamp'),
                    'from_phase': previous_phase,
                    'to_phase': current_phase
                })
    
    def add_metro_data(self, data: Dict):
        """Add metro flow data point"""
        self.metro_history.append({
            'timestamp': data.get('timestamp'),
            'entry_rate': data.get('entry_rate'),
            'exit_rate': data.get('exit_rate'),
            'total_flow': data.get('total_flow'),
            'status': data.get('status'),
            'flow_reason': data.get('flow_reason')
        })
    
    def add_alert(self, alert: Dict):
        """Add alert to history"""
        self.alert_history.append({
            'timestamp': alert.get('timestamp'),
            'level': alert.get('level'),
            'category': alert.get('category'),
            'zone': alert.get('zone'),
            'message': alert.get('message'),
            'value': alert.get('value')
        })
    
    def get_density_trend(self) -> str:
        """
        Calculate density trend from last 3 data points
        Returns: 'increasing', 'decreasing', or 'stable'
        """
        if len(self.density_history) < 3:
            return 'stable'
        
        recent = list(self.density_history)[-3:]
        densities = [d['max_density'] for d in recent]
        
        # Calculate average change
        changes = [densities[i+1] - densities[i] for i in range(len(densities)-1)]
        avg_change = sum(changes) / len(changes)
        
        if avg_change > 10:
            return 'increasing'
        elif avg_change < -10:
            return 'decreasing'
        else:
            return 'stable'
    
    def get_metro_trend(self) -> str:
        """
        Calculate metro flow trend from last 3 data points
        Returns: 'increasing', 'decreasing', or 'stable'
        """
        if len(self.metro_history) < 3:
            return 'stable'
        
        recent = list(self.metro_history)[-3:]
        flows = [m['total_flow'] for m in recent]
        
        # Calculate average change
        changes = [flows[i+1] - flows[i] for i in range(len(flows)-1)]
        avg_change = sum(changes) / len(changes)
        
        if avg_change > 5:
            return 'increasing'
        elif avg_change < -5:
            return 'decreasing'
        else:
            return 'stable'
    
    def predict_next_alert(self) -> Dict:
        """
        Predict when next alert might occur based on current trend
        """
        if len(self.density_history) < 3:
            return None
        
        trend = self.get_density_trend()
        if trend != 'increasing':
            return None
        
        recent = list(self.density_history)[-3:]
        current_density = recent[-1]['max_density']
        
        # Calculate rate of increase
        changes = [recent[i+1]['max_density'] - recent[i]['max_density'] 
                   for i in range(len(recent)-1)]
        avg_increase = sum(changes) / len(changes)
        
        if avg_increase <= 0:
            return None
        
        # Predict time to thresholds
        if current_density < 150:
            # Time to WARNING threshold
            points_to_warning = (150 - current_density) / avg_increase
            minutes_to_warning = int(points_to_warning * 0.5)  # 30s intervals
            
            return {
                'level': 'warning',
                'threshold': 150,
                'estimated_minutes': minutes_to_warning,
                'current_density': current_density,
                'rate': round(avg_increase, 1)
            }
        elif current_density < 200:
            # Time to CRITICAL threshold
            points_to_critical = (200 - current_density) / avg_increase
            minutes_to_critical = int(points_to_critical * 0.5)
            
            return {
                'level': 'critical',
                'threshold': 200,
                'estimated_minutes': minutes_to_critical,
                'current_density': current_density,
                'rate': round(avg_increase, 1)
            }
        
        return None
    
    def get_history_summary(self) -> Dict:
        """Get complete history summary for export"""
        return {
            'density_history': list(self.density_history),
            'metro_history': list(self.metro_history),
            'alert_history': list(self.alert_history),
            'phase_transitions': list(self.phase_transitions),
            'trends': {
                'density': self.get_density_trend(),
                'metro': self.get_metro_trend()
            },
            'prediction': self.predict_next_alert(),
            'stats': {
                'total_alerts': len(self.alert_history),
                'total_phase_transitions': len(self.phase_transitions),
                'data_points': {
                    'density': len(self.density_history),
                    'metro': len(self.metro_history)
                }
            }
        }
    
    def get_chart_data(self) -> Dict:
        """Get data formatted for charts"""
        return {
            'density_chart': [
                {
                    'time': d['timestamp'][-8:-3] if d['timestamp'] else '',  # HH:MM
                    'max': d['max_density'],
                    'avg': d['avg_density'],
                    'phase': d['phase']
                }
                for d in list(self.density_history)[-20:]  # Last 20 points
            ],
            'metro_chart': [
                {
                    'time': m['timestamp'][-8:-3] if m['timestamp'] else '',  # HH:MM
                    'entry': m['entry_rate'],
                    'exit': m['exit_rate'],
                    'total': m['total_flow']
                }
                for m in list(self.metro_history)[-20:]  # Last 20 points
            ]
        }
    
    def clear_history(self):
        """Clear all history (for testing/reset)"""
        self.density_history.clear()
        self.metro_history.clear()
        self.alert_history.clear()
        self.phase_transitions.clear()


# Global history manager instance
history_manager = HistoryManager(retention_minutes=30)

