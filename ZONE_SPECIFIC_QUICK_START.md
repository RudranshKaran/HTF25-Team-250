# Zone-Specific AI Plans - Quick Start Guide

## 🎯 What's New?

Your AI insights now provide **zone-specific detailed plans** with reasoning for each recommendation.

Instead of generic suggestions, you now get:
- ✅ Why each action is recommended
- ✅ What the expected outcome is
- ✅ How resources should be allocated per zone
- ✅ Integrated crowd + transportation + traffic strategies
- ✅ Risk analysis specific to each zone

---

## 🚀 Quick Start

### **Step 1: Call the Endpoint**

```bash
# Generate zone-specific plans
curl -X POST http://localhost:8000/api/ai/zone-specific-plan \
  -H "Content-Type: application/json" \
  -d '{}' # Leave empty to use latest crowd data
```

### **Step 2: Get Back Detailed Plans**

For each zone, you'll receive:

```json
{
  "zone_id": "stadium",
  "status": "critical",
  
  "analysis": {
    "current_situation": "...",
    "risk_factors": [
      "Exit bottleneck at North Gate",
      "High concentration in Entry Hall A"
    ],
    "capacity_assessment": "Operating at 85% capacity",
    "bottleneck_identification": "North exit serving 40% of crowd",
    "trend": "Density increasing - expected peak in 15 minutes"
  },
  
  "action_plan": {
    "crowd_management": {
      "immediate_actions": [
        {
          "action": "Deploy 5 personnel at North Gate",
          "why": "Bottleneck is blocking efficient flow",
          "expected_outcome": "20% increase in exit throughput"
        }
      ]
    },
    "transportation_routing": {
      "recommended_routes": ["Via Metro (1.2km)", "Via BMTC Express"],
      "why_routing": "Reduces vehicle congestion at zone boundary"
    },
    "traffic_diversion": {
      "primary_diversion": "Divert via Outer Ring Road",
      "why_diversion": "Prevents access congestion during peak"
    }
  },
  
  "metrics": {
    "estimated_duration_to_stabilize": "25 minutes",
    "expected_density_reduction": "35%",
    "monitoring_priorities": ["Exit flow", "Hotspot A", "Incident reports"]
  }
}
```

### **Step 3: Use the Insights**

**For Operations:**
- Read `analysis.risk_factors` to understand specific risks
- Look at `action_plan` to see what to do and why
- Check `metrics` for expected outcomes

**For Frontend Display:**
- Show `analysis` section for situation awareness
- Display `action_plan` sections as recommendations
- Highlight `metrics.monitoring_priorities` as focus areas

**For Decision Making:**
- Use the `why` fields to justify actions to stakeholders
- Reference `expected_outcome` for resource allocation
- Check `estimated_duration_to_stabilize` for timeline expectations

---

## 📊 Data Structure Reference

```
Each Zone Contains:
├── zone_id: "zone_name"
├── status: "critical|warning|normal"
├── analysis
│   ├── current_situation: "Description of conditions"
│   ├── risk_factors: ["Risk 1", "Risk 2", ...]
│   ├── capacity_assessment: "Capacity utilization analysis"
│   ├── bottleneck_identification: "Where and why"
│   └── trend: "15/30/60 min forecast"
├── action_plan
│   ├── crowd_management
│   │   ├── immediate_actions: [{action, why, expected_outcome}]
│   │   ├── short_term_actions: [{action, why, duration}]
│   │   └── resources_needed: ["Resource 1", "Resource 2", ...]
│   ├── transportation_routing
│   │   ├── recommended_routes: ["Route 1", "Route 2", ...]
│   │   ├── public_transport: {metro: [...], bus: [...]}
│   │   ├── ride_hailing: "Recommendation"
│   │   └── why_routing: "Reasoning"
│   └── traffic_diversion
│       ├── primary_diversion: "Primary route"
│       ├── secondary_diversion: "Fallback route"
│       ├── roads_to_restrict: ["Road 1", ...]
│       ├── expected_relief: "X% reduction"
│       └── why_diversion: "Reasoning"
└── metrics
    ├── estimated_duration_to_stabilize: "X minutes"
    ├── expected_density_reduction: "X%"
    ├── resource_efficiency: 0-100
    └── monitoring_priorities: ["Priority 1", ...]
```

---

## 💻 Integration Examples

### **React Component Example:**

```jsx
import { useEffect, useState } from 'react';

function ZoneSpecificPlans() {
  const [plans, setPlans] = useState({});

  useEffect(() => {
    fetch('/api/ai/zone-specific-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
    .then(res => res.json())
    .then(data => setPlans(data.zone_specific_plan.zone_specific_plans));
  }, []);

  return (
    <div>
      {Object.entries(plans).map(([zoneId, plan]) => (
        <div key={zoneId} className={`zone ${plan.status}`}>
          <h3>{zoneId}</h3>
          
          {/* Show analysis */}
          <section>
            <h4>Situation Analysis</h4>
            <p>{plan.analysis.current_situation}</p>
            <p><strong>Risks:</strong> {plan.analysis.risk_factors.join(', ')}</p>
          </section>
          
          {/* Show actions */}
          <section>
            <h4>Recommended Actions</h4>
            {plan.action_plan.crowd_management.immediate_actions.map(action => (
              <div key={action.action}>
                <strong>{action.action}</strong>
                <p>Why: {action.why}</p>
                <p>Expected: {action.expected_outcome}</p>
              </div>
            ))}
          </section>
          
          {/* Show metrics */}
          <section>
            <h4>Expected Outcomes</h4>
            <p>Time to stabilize: {plan.metrics.estimated_duration_to_stabilize}</p>
            <p>Density reduction: {plan.metrics.expected_density_reduction}</p>
            <p>Focus on: {plan.metrics.monitoring_priorities.join(', ')}</p>
          </section>
        </div>
      ))}
    </div>
  );
}
```

### **Python Backend Example:**

```python
from app.services import ai_service

@app.post("/api/zones/detailed-report")
async def get_detailed_zones_report():
    """Get detailed zone-by-zone analysis"""
    # Get latest crowd data
    crowd_data = get_latest_crowd_data()
    
    # Generate zone-specific plans
    plans = ai_service.generate_zone_specific_plan(crowd_data)
    
    # Process and format for display
    result = {}
    for zone_id, plan in plans['zone_specific_plans'].items():
        result[zone_id] = {
            'status': plan['status'],
            'situation': plan['analysis']['current_situation'],
            'risks': plan['analysis']['risk_factors'],
            'actions': plan['action_plan'],
            'expected_outcome': plan['metrics']['expected_density_reduction']
        }
    
    return result
```

---

## 🔄 Comparison: Before vs After

### **Before:**
```json
{
  "status": "critical",
  "risk_assessment": "High crowd density",
  "trend": "Monitor closely",
  "metrics_to_monitor": ["Overall density", "Hotspot count"]
}
```

### **After:**
```json
{
  "zone_id": "stadium",
  "status": "critical",
  "analysis": {
    "current_situation": "North gate experiencing 85% utilization with backlog",
    "risk_factors": [
      "Bottleneck at North exit reducing throughput by 40%",
      "Single entry point overloaded during peak hours",
      "Inadequate signage causing crowd misdirection"
    ],
    "capacity_assessment": "Currently at 85% capacity, trending to 95%",
    "bottleneck_identification": "North Gate exit showing 15min wait, caused by narrow passage and poor traffic management",
    "trend": "Expected to reach critical in 15 minutes, peak at 12:45"
  },
  "action_plan": {
    "crowd_management": {
      "immediate_actions": [
        {
          "action": "Deploy 5 crowd control staff at North Gate",
          "why": "Reduce bottleneck congestion and improve flow",
          "expected_outcome": "Increase throughput by 20%, reduce wait to 5 minutes"
        },
        {
          "action": "Open South entry (currently closed for maintenance)",
          "why": "Distribute crowd across multiple entry points",
          "expected_outcome": "50% reduction in North Gate pressure"
        }
      ],
      "short_term_actions": [...],
      "resources_needed": ["5 security personnel", "Barriers", "Digital signage"]
    },
    "transportation_routing": {
      "recommended_routes": ["Via MG Road Metro", "BMTC Express Route 5"],
      "public_transport": {"metro": ["Chinnaswamy Station"], "bus": ["Routes 1, 2"]},
      "why_routing": "Metro reduces vehicle congestion by 30%",
    },
    "traffic_diversion": {
      "primary_diversion": "Divert incoming traffic via Outer Ring Road",
      "why_diversion": "Prevents additional vehicles from entering zone",
      "expected_relief": "25% reduction in zone approach congestion"
    }
  },
  "metrics": {
    "estimated_duration_to_stabilize": "20 minutes",
    "expected_density_reduction": "35%",
    "resource_efficiency": 82,
    "monitoring_priorities": ["North Gate throughput", "Entry Hall A density", "Incident reports"]
  }
}
```

---

## ❓ FAQ

**Q: Why is the stadium zone showing "critical" status?**
A: Look at `analysis.risk_factors` and `analysis.bottleneck_identification` - they explain exactly why.

**Q: What should I do immediately?**
A: Check `action_plan.crowd_management.immediate_actions` - these are prioritized by urgency.

**Q: How long will it take to improve?**
A: See `metrics.estimated_duration_to_stabilize` and `metrics.expected_density_reduction`.

**Q: What resources do I need?**
A: Look at `action_plan.crowd_management.resources_needed` for specific quantities.

**Q: Why is this specific route recommended?**
A: See `action_plan.transportation_routing.why_routing` for the reasoning.

**Q: What if I can't reach that outcome?**
A: Use `metrics.resource_efficiency` (0-100) to see if you have enough resources. Increase resources if score is low.

---

## 🔗 Related Endpoints

| Endpoint | Purpose | When to Use |
|----------|---------|------------|
| `/api/ai/zone-specific-plan` | Detailed zone-by-zone analysis | Need detailed action plans with reasoning |
| `/api/ai/insights` | Quick overall insights | Need overall system status |
| `/api/ai/action-plan` | General action plan | Need quick recommendations |
| `/api/ai/traffic-diversion` | Traffic routing | Need specific traffic diversion |
| `/api/ai/nearest-transportation` | Transport options | Need transportation alternatives |

---

## 📞 Support

For issues or questions about zone-specific plans:
1. Check the `error` field in the response
2. Verify that crowd data is being provided
3. Check that Gemini API key is configured
4. Review fallback plans if API is unavailable