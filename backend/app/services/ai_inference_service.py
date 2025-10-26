"""
AI Inference Service - Using Gemini API for Crowd Management Insights
Provides intelligent recommendations for crowd management, transportation, and traffic diversion
"""

import os
import json
from typing import Dict, List, Any
from datetime import datetime
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

class AIInferenceService:
    """Service for generating AI-powered insights using Gemini API"""
    
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        if self.api_key:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-2.5-flash')
        else:
            self.model = None
            print("⚠️ GEMINI_API_KEY not found. Using fallback mode.")
    
    def generate_crowd_insights(self, crowd_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate AI insights for crowd management based on current crowd data
        
        Args:
            crowd_data: Dictionary containing multi-zone density data
            
        Returns:
            Dictionary with AI recommendations
        """
        try:
            if not self.model:
                return self._generate_fallback_insights(crowd_data)
            
            # Format the data for AI processing
            prompt = self._format_crowd_prompt(crowd_data)
            
            # Get AI response
            response = self.model.generate_content(prompt)
            
            # Parse the response
            insights = self._parse_ai_response(response.text)
            insights['timestamp'] = datetime.now().isoformat()
            insights['model'] = 'gemini-pro'
            
            return insights
            
        except Exception as e:
            print(f"❌ AI Inference Error: {e}")
            return self._generate_fallback_insights(crowd_data)
    
    def generate_zone_specific_plan(self, crowd_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate detailed zone-specific plans with analysis, risk assessment, and reasoning
        
        Args:
            crowd_data: Current multi-zone density data
            
        Returns:
            Dictionary with comprehensive zone-specific analysis and action plans
        """
        try:
            if not self.model:
                return self._generate_fallback_zone_specific_plan(crowd_data)
            
            zones = crowd_data.get('zones', {})
            zone_plans = {}
            
            # Generate plan for each zone
            for zone_id, zone_data in zones.items():
                prompt = self._format_zone_specific_prompt(zone_id, zone_data, crowd_data)
                response = self.model.generate_content(prompt)
                
                zone_plan = self._parse_zone_specific_response(response.text, zone_id)
                zone_plans[zone_id] = zone_plan
            
            return {
                'zone_specific_plans': zone_plans,
                'total_zones_analyzed': len(zones),
                'timestamp': datetime.now().isoformat(),
                'model': 'gemini-pro'
            }
            
        except Exception as e:
            print(f"❌ Zone-Specific Plan Generation Error: {e}")
            return self._generate_fallback_zone_specific_plan(crowd_data)
    
    def generate_action_plan(self, crowd_data: Dict[str, Any], alert_zones: List[str]) -> Dict[str, Any]:
        """
        Generate actionable recommendations to ease crowd and manage flow
        
        Args:
            crowd_data: Current multi-zone density data
            alert_zones: List of zones with critical or warning alerts
            
        Returns:
            Dictionary with action plan and recommendations
        """
        try:
            if not self.model:
                return self._generate_fallback_action_plan(crowd_data, alert_zones)
            
            prompt = self._format_action_plan_prompt(crowd_data, alert_zones)
            response = self.model.generate_content(prompt)
            
            action_plan = self._parse_action_plan_response(response.text)
            action_plan['timestamp'] = datetime.now().isoformat()
            
            return action_plan
            
        except Exception as e:
            print(f"❌ Action Plan Generation Error: {e}")
            return self._generate_fallback_action_plan(crowd_data, alert_zones)
    
    def find_nearest_transportation(self, zone: str, crowd_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Find nearest transportation options for crowd dispersal
        
        Args:
            zone: Current zone identifier
            crowd_data: Current multi-zone density data
            
        Returns:
            Dictionary with nearest transportation options
        """
        try:
            # Default transportation data for Bengaluru zones
            transportation_data = {
                'stadium': {
                    'metro': ['Chinnaswamy Stadium Metro Station (50m)', 'MG Road Metro (800m)'],
                    'buses': ['BMTC Route 1, 2, 3, 4 at Stadium Stand', 'Express Service: 5, 6'],
                    'taxis': ['Ola, Uber stands within 100m']
                },
                'mg_road_metro': {
                    'metro': ['MG Road Metro (on site)', 'Vidhana Soudha Metro (300m)'],
                    'buses': ['BMTC Multiple routes on MG Road', 'Express Service: 6, 7, 8'],
                    'taxis': ['Multiple pickup points along MG Road']
                },
                'majestic': {
                    'metro': ['Majestic Metro (on site)', 'Vidhana Soudha (600m)'],
                    'buses': ['BMTC Hub - 50+ routes', 'City Express routes'],
                    'taxis': ['Extensive taxi stands throughout area']
                },
                'electronic_city': {
                    'metro': ['Electronic City Metro (planned)', 'Silk Board Metro (800m)'],
                    'buses': ['BMTC IT Corridor routes', 'Corporate Shuttle services'],
                    'taxis': ['Ride-hailing services prevalent']
                },
                'koramangala': {
                    'metro': ['Indiranagar Metro (1.5km)', 'Whitefield Metro (2km)'],
                    'buses': ['BMTC Routes: 1, 2, 3, 4, 5', 'Local circulators'],
                    'taxis': ['Multiple pickup points in main streets']
                },
                'indiranagar': {
                    'metro': ['Indiranagar Metro (on site)', '100 Ft Road Metro'],
                    'buses': ['BMTC Multiple routes', 'Local services'],
                    'taxis': ['Ride-hailing services abundant']
                },
                'cubbon_park': {
                    'metro': ['Vidhana Soudha Metro (500m)', 'Dr. Rajkumar Road Metro'],
                    'buses': ['BMTC routes through Cubbon Park area', 'Tourist services'],
                    'taxis': ['Available near park entrances']
                },
                'all': {
                    'metro': ['City-wide Metro network available'],
                    'buses': ['Comprehensive BMTC coverage across city'],
                    'taxis': ['Ola, Uber services available throughout']
                }
            }
            
            zone_transport = transportation_data.get(zone, transportation_data['all'])
            
            return {
                'zone': zone,
                'nearest_transportation': zone_transport,
                'recommendations': self._get_transport_recommendations(zone, crowd_data),
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"❌ Transportation Find Error: {e}")
            return {'error': str(e), 'zone': zone}
    
    def suggest_traffic_diversion(self, zone: str, crowd_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Suggest traffic diversion routes based on crowd density
        
        Args:
            zone: Current zone identifier
            crowd_data: Current multi-zone density data
            
        Returns:
            Dictionary with traffic diversion recommendations
        """
        try:
            if not self.model:
                return self._generate_fallback_diversion(zone, crowd_data)
            
            prompt = self._format_diversion_prompt(zone, crowd_data)
            response = self.model.generate_content(prompt)
            
            diversion_plan = self._parse_diversion_response(response.text, zone)
            diversion_plan['timestamp'] = datetime.now().isoformat()
            
            return diversion_plan
            
        except Exception as e:
            print(f"❌ Traffic Diversion Error: {e}")
            return self._generate_fallback_diversion(zone, crowd_data)
    
    def generate_report(self, crowd_data: Dict[str, Any], alerts: List[Dict], 
                       period: str = "1hour") -> Dict[str, Any]:
        """
        Generate a comprehensive crowd management report
        
        Args:
            crowd_data: Multi-zone density data
            alerts: List of recent alerts
            period: Time period for report ("1hour", "24hours", "7days")
            
        Returns:
            Dictionary with report data
        """
        try:
            if not self.model:
                return self._generate_fallback_report(crowd_data, alerts, period)
            
            prompt = self._format_report_prompt(crowd_data, alerts, period)
            response = self.model.generate_content(prompt)
            
            report = self._parse_report_response(response.text)
            report['period'] = period
            report['timestamp'] = datetime.now().isoformat()
            report['summary'] = self._generate_report_summary(crowd_data, alerts, period)
            
            return report
            
        except Exception as e:
            print(f"❌ Report Generation Error: {e}")
            return self._generate_fallback_report(crowd_data, alerts, period)
    
    # ===== PROMPT FORMATTING =====
    
    def _format_zone_specific_prompt(self, zone_id: str, zone_data: Dict[str, Any], 
                                     all_crowd_data: Dict[str, Any]) -> str:
        """Format detailed zone-specific analysis prompt for Gemini API"""
        hotspots = zone_data.get('hotspots', [])
        avg_density = zone_data.get('avg_density', 0)
        max_density = zone_data.get('max_density', 0)
        phase = zone_data.get('phase', 'unknown')
        flow_rate = zone_data.get('flow_rate', 0)
        capacity = zone_data.get('capacity', 100)
        
        # Calculate capacity utilization
        capacity_utilization = (avg_density / capacity * 100) if capacity > 0 else 0
        
        hotspots_info = "\n".join([f"  - {spot.get('name', 'Unknown')}: {spot.get('density', 0):.1f}% density" 
                                   for spot in hotspots[:5]])
        
        prompt = f"""
You are an expert urban crowd management strategist. Analyze this SPECIFIC ZONE in detail:

ZONE: {zone_id}
├─ Current Average Density: {avg_density:.1f}%
├─ Peak Density: {max_density:.1f}%
├─ Zone Capacity: {capacity}%
├─ Capacity Utilization: {capacity_utilization:.1f}%
├─ Flow Phase: {phase}
├─ Flow Rate: {flow_rate} people/min
└─ Top Hotspots:
{hotspots_info if hotspots_info else "  - No specific hotspots detected"}

TASK: Provide a COMPREHENSIVE, DETAILED zone-specific analysis and action plan.

REQUIRED OUTPUT (format as JSON with ALL these fields):
{{
  "zone_id": "{zone_id}",
  "status": "critical|warning|normal",
  
  "analysis": {{
    "current_situation": "Detailed description of current crowd conditions in this zone",
    "risk_factors": ["Risk factor 1 with explanation", "Risk factor 2 with explanation"],
    "capacity_assessment": "Analysis of current capacity utilization and implications",
    "bottleneck_identification": "Specific bottlenecks and why they are forming",
    "trend": "Expected trend in next 15, 30, 60 minutes"
  }},
  
  "action_plan": {{
    "crowd_management": {{
      "immediate_actions": [
        {{"action": "action 1", "why": "reason this will help", "expected_outcome": "expected result"}}
      ],
      "short_term_actions": [
        {{"action": "action 1", "why": "reason this will help", "duration": "estimated time"}}
      ],
      "resources_needed": ["Resource 1 with quantity", "Resource 2 with quantity"]
    }},
    "transportation_routing": {{
      "recommended_routes": ["Route 1 (capacity, estimated time)", "Route 2 (capacity, estimated time)"],
      "public_transport": {{"metro": ["station 1", "station 2"], "bus": ["route 1", "route 2"]}},
      "ride_hailing": "Recommendation for ride-hailing services",
      "why_routing": "Detailed reason for this routing strategy"
    }},
    "traffic_diversion": {{
      "primary_diversion": "Primary alternate route with capacity impact",
      "secondary_diversion": "Secondary route if primary is saturated",
      "roads_to_restrict": ["Road 1", "Road 2"],
      "expected_relief": "Percentage expected density reduction",
      "why_diversion": "Reason this diversion strategy will work for this zone"
    }}
  }},
  
  "metrics": {{
    "estimated_duration_to_stabilize": "Estimated time in minutes",
    "expected_density_reduction": "Percentage reduction",
    "resource_efficiency": "Efficiency score 0-100",
    "monitoring_priorities": ["Priority 1", "Priority 2", "Priority 3"]
  }}
}}

Be specific to {zone_id}'s characteristics. Provide concrete, actionable recommendations with clear reasoning.
"""
        return prompt
    
    def _format_crowd_prompt(self, crowd_data: Dict[str, Any]) -> str:
        """Format crowd data into a prompt for Gemini API"""
        zones_info = []
        summary = crowd_data.get('summary', {})
        zones = crowd_data.get('zones', {})
        
        for zone_id, zone_data in zones.items():
            zones_info.append(
                f"- {zone_id}: Density {zone_data.get('avg_density', 0):.1f}% "
                f"(max {zone_data.get('max_density', 0):.1f}%), Phase: {zone_data.get('phase', 'unknown')}"
            )
        
        prompt = f"""
You are an expert in crowd management and urban traffic. Based on the following real-time crowd density data:

{chr(10).join(zones_info)}

Critical zones: {summary.get('critical_zones', [])}
Warning zones: {summary.get('warning_zones', [])}

Please provide:
1. Current crowd status assessment
2. Key risk areas
3. Expected trend in next 30 minutes
4. Key metrics to monitor

Format your response as JSON with keys: status, risk_assessment, trend, metrics_to_monitor
"""
        return prompt
    
    def _format_action_plan_prompt(self, crowd_data: Dict[str, Any], alert_zones: List[str]) -> str:
        """Format action plan request for AI"""
        zones = crowd_data.get('zones', {})
        alert_zone_details = []
        
        for zone_id in alert_zones:
            if zone_id in zones:
                zone_data = zones[zone_id]
                alert_zone_details.append(
                    f"- {zone_id}: {zone_data.get('avg_density', 0):.1f}% density, "
                    f"{len(zone_data.get('hotspots', []))} hotspots"
                )
        
        prompt = f"""
You are an expert crowd management officer. Given these critical zones:

{chr(10).join(alert_zone_details)}

Generate an action plan to ease crowd and improve flow. Please provide:
1. Immediate actions (0-5 minutes)
2. Short-term actions (5-30 minutes)
3. Resource allocation recommendations
4. Expected outcome

Format as JSON with keys: immediate_actions, short_term_actions, resources, expected_outcome
"""
        return prompt
    
    def _format_diversion_prompt(self, zone: str, crowd_data: Dict[str, Any]) -> str:
        """Format traffic diversion request for AI"""
        prompt = f"""
You are a traffic management expert for Bengaluru. Zone '{zone}' is experiencing high crowd density.

Provide traffic diversion strategies:
1. Primary alternate routes
2. Secondary alternate routes
3. Roads to close/restrict
4. Duration of diversions
5. Expected traffic impact

Format as JSON with keys: primary_routes, secondary_routes, restricted_roads, duration, impact
"""
        return prompt
    
    def _format_report_prompt(self, crowd_data: Dict[str, Any], alerts: List[Dict], 
                             period: str) -> str:
        """Format report request for AI"""
        summary = crowd_data.get('summary', {})
        alert_count = len(alerts)
        critical_alerts = len([a for a in alerts if a.get('level') == 'critical'])
        
        prompt = f"""
Generate a crowd management report for the {period} period:

- Total zones monitored: {summary.get('total_zones', 0)}
- Critical zones: {len(summary.get('critical_zones', []))}
- Warning zones: {len(summary.get('warning_zones', []))}
- Total alerts: {alert_count}
- Critical alerts: {critical_alerts}

Provide:
1. Executive Summary
2. Peak crowd times
3. Problem areas
4. Recommendations for improvement
5. Resource efficiency score (0-100)

Format as JSON with keys: summary, peak_times, problem_areas, recommendations, efficiency_score
"""
        return prompt
    
    # ===== RESPONSE PARSING =====
    
    def _parse_zone_specific_response(self, response_text: str, zone_id: str) -> Dict[str, Any]:
        """Parse zone-specific analysis response"""
        try:
            # Try to find JSON in response
            if '{' in response_text and '}' in response_text:
                json_str = response_text[response_text.find('{'):response_text.rfind('}')+1]
                parsed = json.loads(json_str)
                # Ensure all required fields are present
                if 'zone_id' not in parsed:
                    parsed['zone_id'] = zone_id
                return parsed
            # Fallback to structured format if JSON parsing fails
            return {
                'zone_id': zone_id,
                'status': 'normal',
                'analysis': {'current_situation': response_text},
                'action_plan': {},
                'parsed': False
            }
        except Exception as e:
            print(f"Error parsing zone-specific response: {e}")
            return {
                'zone_id': zone_id,
                'status': 'normal',
                'analysis': {'current_situation': response_text},
                'action_plan': {},
                'parsed': False,
                'error': str(e)
            }
    
    def _parse_ai_response(self, response_text: str) -> Dict[str, Any]:
        """Parse AI response and convert to JSON"""
        try:
            # Try to find JSON in response
            if '{' in response_text and '}' in response_text:
                json_str = response_text[response_text.find('{'):response_text.rfind('}')+1]
                return json.loads(json_str)
            return {'insights': response_text, 'parsed': False}
        except:
            return {'insights': response_text, 'parsed': False}
    
    def _parse_action_plan_response(self, response_text: str) -> Dict[str, Any]:
        """Parse action plan response"""
        try:
            if '{' in response_text and '}' in response_text:
                json_str = response_text[response_text.find('{'):response_text.rfind('}')+1]
                return json.loads(json_str)
            return {'action_plan': response_text}
        except:
            return {'action_plan': response_text}
    
    def _parse_diversion_response(self, response_text: str, zone: str) -> Dict[str, Any]:
        """Parse traffic diversion response"""
        try:
            if '{' in response_text and '}' in response_text:
                json_str = response_text[response_text.find('{'):response_text.rfind('}')+1]
                return json.loads(json_str)
            return {'diversion_plan': response_text, 'zone': zone}
        except:
            return {'diversion_plan': response_text, 'zone': zone}
    
    def _parse_report_response(self, response_text: str) -> Dict[str, Any]:
        """Parse report response"""
        try:
            if '{' in response_text and '}' in response_text:
                json_str = response_text[response_text.find('{'):response_text.rfind('}')+1]
                return json.loads(json_str)
            return {'report': response_text}
        except:
            return {'report': response_text}
    
    # ===== FALLBACK IMPLEMENTATIONS (when Gemini API is not available) =====
    
    def _generate_fallback_zone_specific_plan(self, crowd_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate fallback zone-specific plans when AI is unavailable"""
        zones = crowd_data.get('zones', {})
        zone_plans = {}
        
        for zone_id, zone_data in zones.items():
            avg_density = zone_data.get('avg_density', 0)
            
            # Determine status based on density
            if avg_density > 80:
                status = 'critical'
            elif avg_density > 50:
                status = 'warning'
            else:
                status = 'normal'
            
            zone_plans[zone_id] = {
                'zone_id': zone_id,
                'status': status,
                'analysis': {
                    'current_situation': f"Zone {zone_id} is at {avg_density:.1f}% capacity",
                    'risk_factors': [
                        'High crowd concentration in specific areas',
                        'Limited alternative exit routes'
                    ],
                    'capacity_assessment': f'Operating at {avg_density:.1f}% of zone capacity',
                    'bottleneck_identification': 'Primary exits showing congestion',
                    'trend': 'Monitor for continued density increase'
                },
                'action_plan': {
                    'crowd_management': {
                        'immediate_actions': [
                            {'action': 'Deploy crowd control staff', 'why': 'Manage flow and prevent incidents', 'expected_outcome': 'Better crowd organization'},
                            {'action': 'Activate alternative exits', 'why': 'Distribute crowd to multiple routes', 'expected_outcome': '15-20% density reduction'}
                        ],
                        'short_term_actions': [
                            {'action': 'Deploy additional signage', 'why': 'Guide crowd to less congested areas', 'duration': '5-10 minutes'}
                        ],
                        'resources_needed': ['2-3 security personnel', 'Crowd control barriers', 'Digital signage']
                    },
                    'transportation_routing': {
                        'recommended_routes': ['Primary exit (capacity 60%)', 'Secondary exit (capacity 75%)'],
                        'public_transport': {'metro': ['Nearest metro station'], 'bus': ['Available bus routes']},
                        'ride_hailing': 'Encouraged for dispersal',
                        'why_routing': 'Distributes crowd across multiple transportation modes'
                    },
                    'traffic_diversion': {
                        'primary_diversion': 'Via alternate arterial road',
                        'secondary_diversion': 'Via secondary connector',
                        'roads_to_restrict': ['Direct zone access during peak times'],
                        'expected_relief': '20-25% density reduction',
                        'why_diversion': 'Reduces bottleneck at primary exit'
                    }
                },
                'metrics': {
                    'estimated_duration_to_stabilize': '30 minutes',
                    'expected_density_reduction': '25-30%',
                    'resource_efficiency': 75,
                    'monitoring_priorities': ['Exit flow rate', 'Hotspot density', 'Incident reports']
                }
            }
        
        return {
            'zone_specific_plans': zone_plans,
            'total_zones_analyzed': len(zones),
            'timestamp': datetime.now().isoformat(),
            'model': 'fallback'
        }
    
    def _generate_fallback_insights(self, crowd_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate fallback insights when AI is unavailable"""
        summary = crowd_data.get('summary', {})
        critical_zones = summary.get('critical_zones', [])
        warning_zones = summary.get('warning_zones', [])
        
        return {
            'status': 'critical' if critical_zones else 'warning' if warning_zones else 'normal',
            'risk_assessment': f'{len(critical_zones)} critical zones, {len(warning_zones)} warning zones',
            'trend': 'Monitor closely' if critical_zones else 'Stable',
            'metrics_to_monitor': ['Overall density', 'Hotspot count', 'Metro flow rate'],
            'timestamp': datetime.now().isoformat(),
            'model': 'fallback'
        }
    
    def _generate_fallback_action_plan(self, crowd_data: Dict[str, Any], 
                                       alert_zones: List[str]) -> Dict[str, Any]:
        """Fallback action plan"""
        return {
            'immediate_actions': [
                'Increase crowd control personnel',
                'Activate alternative entrances',
                'Deploy additional information kiosks'
            ],
            'short_term_actions': [
                'Manage crowd flow with barriers',
                'Redirect flow to less congested areas',
                'Provide real-time updates to crowd'
            ],
            'resources': f'Allocate resources to {len(alert_zones)} critical zones',
            'expected_outcome': 'Density reduction by 20-30% in next 30 minutes',
            'timestamp': datetime.now().isoformat()
        }
    
    def _generate_fallback_diversion(self, zone: str, crowd_data: Dict[str, Any]) -> Dict[str, Any]:
        """Fallback traffic diversion"""
        return {
            'zone': zone,
            'primary_routes': ['Via Outer Ring Road', 'Via Whitefield Road'],
            'secondary_routes': ['Via Old Madras Road', 'Via Hosur Road'],
            'restricted_roads': ['Direct access to stadium area'],
            'duration': '1-2 hours',
            'impact': 'Expected 15-20 minutes additional travel time',
            'timestamp': datetime.now().isoformat()
        }
    
    def _generate_fallback_report(self, crowd_data: Dict[str, Any], 
                                 alerts: List[Dict], period: str) -> Dict[str, Any]:
        """Fallback report generation"""
        return {
            'summary': f'Crowd management report for {period}',
            'peak_times': ['12:00-14:00', '17:00-19:00'],
            'problem_areas': [zone for zone in crowd_data.get('summary', {}).get('critical_zones', [])],
            'recommendations': [
                'Deploy additional personnel during peak hours',
                'Improve signage and crowd direction',
                'Increase real-time communication'
            ],
            'efficiency_score': 72,
            'timestamp': datetime.now().isoformat()
        }
    
    def _get_transport_recommendations(self, zone: str, crowd_data: Dict[str, Any]) -> List[str]:
        """Generate transport recommendations based on zone"""
        recommendations = []
        
        if zone in ['stadium', 'majestic']:
            recommendations.append('Consider metro for faster dispersal')
        
        if zone in ['electronic_city', 'koramangala', 'indiranagar']:
            recommendations.append('Utilize ride-hailing services for flexibility')
        
        if zone in ['mg_road_metro']:
            recommendations.append('Prioritize metro system usage')
        
        if not recommendations:
            recommendations.append('Use multi-modal transportation')
        
        return recommendations
    
    def _generate_report_summary(self, crowd_data: Dict[str, Any], 
                                alerts: List[Dict], period: str) -> str:
        """Generate simple text summary for report"""
        summary = crowd_data.get('summary', {})
        total_zones = summary.get('total_zones', 0)
        critical_zones = len(summary.get('critical_zones', []))
        warning_zones = len(summary.get('warning_zones', []))
        alert_count = len(alerts)
        
        return (
            f"Crowd Management Report ({period})\n"
            f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
            f"Zones Monitored: {total_zones}\n"
            f"Critical Zones: {critical_zones}\n"
            f"Warning Zones: {warning_zones}\n"
            f"Total Alerts: {alert_count}\n"
            f"Report Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
        )


# Create singleton instance
ai_service = AIInferenceService()