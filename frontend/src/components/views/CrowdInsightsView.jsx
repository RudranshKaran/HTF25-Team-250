/**
 * Crowd Insights View - AI-Powered Crowd Management
 * Provides AI-generated insights, action plans, and recommendations
 */

import React, { useState, useEffect, useCallback } from 'react';
import './CrowdInsightsView.css';

const CrowdInsightsView = ({ 
  multiZoneDensityData = {}, 
  alerts = [],
  selectedZone = 'all' 
}) => {
  const [insights, setInsights] = useState(null);
  const [actionPlan, setActionPlan] = useState(null);
  const [transportation, setTransportation] = useState(null);
  const [trafficDiversion, setTrafficDiversion] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('insights');
  const [reportPeriod, setReportPeriod] = useState('1hour');
  const [generatingReport, setGeneratingReport] = useState(false);

  // Fetch AI Insights
  const fetchInsights = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8000/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(multiZoneDensityData)
      });
      const data = await response.json();
      if (data.status === 'success') {
        setInsights(data.insights);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError(`Failed to fetch insights: ${err.message}`);
      console.error('Insights error:', err);
    } finally {
      setLoading(false);
    }
  }, [multiZoneDensityData]);

  // Fetch Action Plan
  const fetchActionPlan = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `http://localhost:8000/api/ai/action-plan?zone=${selectedZone}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(multiZoneDensityData)
        }
      );
      const data = await response.json();
      if (data.status === 'success') {
        setActionPlan(data.action_plan);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError(`Failed to fetch action plan: ${err.message}`);
      console.error('Action plan error:', err);
    } finally {
      setLoading(false);
    }
  }, [multiZoneDensityData, selectedZone]);

  // Fetch Transportation Info
  const fetchTransportation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `http://localhost:8000/api/ai/nearest-transportation?zone=${selectedZone}`
      );
      const data = await response.json();
      if (data.status === 'success') {
        setTransportation(data.transportation);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError(`Failed to fetch transportation: ${err.message}`);
      console.error('Transportation error:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedZone]);

  // Fetch Traffic Diversion
  const fetchTrafficDiversion = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `http://localhost:8000/api/ai/traffic-diversion?zone=${selectedZone}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(multiZoneDensityData)
        }
      );
      const data = await response.json();
      if (data.status === 'success') {
        setTrafficDiversion(data.diversion);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError(`Failed to fetch traffic diversion: ${err.message}`);
      console.error('Traffic diversion error:', err);
    } finally {
      setLoading(false);
    }
  }, [multiZoneDensityData, selectedZone]);

  // Generate Report
  const generateReport = useCallback(async () => {
    setGeneratingReport(true);
    setError(null);
    try {
      const response = await fetch(
        `http://localhost:8000/api/ai/report?period=${reportPeriod}`
      );
      const data = await response.json();
      if (data.status === 'success') {
        setReport(data.report);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError(`Failed to generate report: ${err.message}`);
      console.error('Report error:', err);
    } finally {
      setGeneratingReport(false);
    }
  }, [reportPeriod]);

  // Auto-fetch insights when data changes
  useEffect(() => {
    if (multiZoneDensityData && Object.keys(multiZoneDensityData).length > 0) {
      if (activeTab === 'insights') fetchInsights();
      if (activeTab === 'actions') fetchActionPlan();
      if (activeTab === 'transportation') fetchTransportation();
      if (activeTab === 'diversion') fetchTrafficDiversion();
    }
  }, [multiZoneDensityData, activeTab, selectedZone]);

  // Download report as text file
  const downloadReport = () => {
    if (!report) return;
    
    const reportText = `
CROWD MANAGEMENT REPORT
Generated: ${new Date().toLocaleString()}
Period: ${reportPeriod}

${report.summary || ''}

${report.peak_times ? `Peak Times: ${JSON.stringify(report.peak_times)}` : ''}
${report.problem_areas ? `Problem Areas: ${JSON.stringify(report.problem_areas)}` : ''}
${report.efficiency_score ? `Efficiency Score: ${report.efficiency_score}%` : ''}

RECOMMENDATIONS:
${report.recommendations ? report.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n') : 'N/A'}
    `;
    
    const element = document.createElement('a');
    element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(reportText)}`);
    element.setAttribute('download', `crowd-report-${reportPeriod}-${new Date().getTime()}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="crowd-insights-view">
      <div className="insights-header">
        <h2>🤖 AI Crowd Management Insights</h2>
        <p>AI-powered recommendations to manage and ease crowd flow</p>
      </div>

      {error && (
        <div className="error-banner">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="insights-tabs">
        <button 
          className={`tab ${activeTab === 'insights' ? 'active' : ''}`}
          onClick={() => setActiveTab('insights')}
        >
          📊 Insights
        </button>
        <button 
          className={`tab ${activeTab === 'actions' ? 'active' : ''}`}
          onClick={() => setActiveTab('actions')}
        >
          ⚡ Action Plans
        </button>
        <button 
          className={`tab ${activeTab === 'transportation' ? 'active' : ''}`}
          onClick={() => setActiveTab('transportation')}
        >
          🚌 Transportation
        </button>
        <button 
          className={`tab ${activeTab === 'diversion' ? 'active' : ''}`}
          onClick={() => setActiveTab('diversion')}
        >
          🛣️ Traffic Diversion
        </button>
        <button 
          className={`tab ${activeTab === 'report' ? 'active' : ''}`}
          onClick={() => setActiveTab('report')}
        >
          📋 Report
        </button>
      </div>

      <div className="insights-content">
        {/* INSIGHTS TAB */}
        {activeTab === 'insights' && (
          <div className="insight-panel">
            <h3>Current Crowd Assessment</h3>
            {loading ? (
              <div className="loading">
                <span className="spinner">⏳</span>
                <p>Analyzing crowd data...</p>
              </div>
            ) : insights ? (
              <div className="insights-data">
                <div className="insight-card">
                  <h4>Status</h4>
                  <p className={`status-badge ${insights.status || 'unknown'}`}>
                    {insights.status ? insights.status.toUpperCase() : 'UNKNOWN'}
                  </p>
                </div>

                <div className="insight-card">
                  <h4>Risk Assessment</h4>
                  <p>{insights.risk_assessment || 'N/A'}</p>
                </div>

                <div className="insight-card">
                  <h4>Expected Trend</h4>
                  <p>{insights.trend || 'N/A'}</p>
                </div>

                {insights.metrics_to_monitor && (
                  <div className="insight-card">
                    <h4>Key Metrics</h4>
                    <ul>
                      {insights.metrics_to_monitor.map((metric, idx) => (
                        <li key={idx}>📌 {metric}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {insights.insights && (
                  <div className="insight-card full-width">
                    <h4>AI Analysis</h4>
                    <p>{insights.insights}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="no-data">No insights available. Click to generate.</p>
            )}
            <button onClick={fetchInsights} disabled={loading} className="refresh-btn">
              {loading ? '⏳ Analyzing...' : '🔄 Refresh Insights'}
            </button>
          </div>
        )}

        {/* ACTION PLANS TAB */}
        {activeTab === 'actions' && (
          <div className="insight-panel">
            <h3>Crowd Management Action Plan</h3>
            {loading ? (
              <div className="loading">
                <span className="spinner">⏳</span>
                <p>Generating action plan...</p>
              </div>
            ) : actionPlan ? (
              <div className="action-data">
                {actionPlan.immediate_actions && (
                  <div className="action-card urgent">
                    <h4>🚨 Immediate Actions (0-5 min)</h4>
                    <ul>
                      {Array.isArray(actionPlan.immediate_actions) ? (
                        actionPlan.immediate_actions.map((action, idx) => (
                          <li key={idx}>{action}</li>
                        ))
                      ) : (
                        <li>{actionPlan.immediate_actions}</li>
                      )}
                    </ul>
                  </div>
                )}

                {actionPlan.short_term_actions && (
                  <div className="action-card">
                    <h4>⏱️ Short-term Actions (5-30 min)</h4>
                    <ul>
                      {Array.isArray(actionPlan.short_term_actions) ? (
                        actionPlan.short_term_actions.map((action, idx) => (
                          <li key={idx}>{action}</li>
                        ))
                      ) : (
                        <li>{actionPlan.short_term_actions}</li>
                      )}
                    </ul>
                  </div>
                )}

                {actionPlan.resources && (
                  <div className="action-card">
                    <h4>👥 Resource Allocation</h4>
                    <p>{actionPlan.resources}</p>
                  </div>
                )}

                {actionPlan.expected_outcome && (
                  <div className="action-card success">
                    <h4>✅ Expected Outcome</h4>
                    <p>{actionPlan.expected_outcome}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="no-data">No action plan available. Click to generate.</p>
            )}
            <button onClick={fetchActionPlan} disabled={loading} className="refresh-btn">
              {loading ? '⏳ Generating...' : '🔄 Generate Action Plan'}
            </button>
          </div>
        )}

        {/* TRANSPORTATION TAB */}
        {activeTab === 'transportation' && (
          <div className="insight-panel">
            <h3>Nearest Transportation Options</h3>
            <div className="zone-selector-mini">
              <label>Zone: <strong>{selectedZone}</strong></label>
            </div>

            {loading ? (
              <div className="loading">
                <span className="spinner">⏳</span>
                <p>Finding transportation...</p>
              </div>
            ) : transportation ? (
              <div className="transport-data">
                {transportation.nearest_transportation?.metro && (
                  <div className="transport-card">
                    <h4>🚇 Metro/Rail</h4>
                    <ul>
                      {Array.isArray(transportation.nearest_transportation.metro) ? (
                        transportation.nearest_transportation.metro.map((option, idx) => (
                          <li key={idx}>{option}</li>
                        ))
                      ) : (
                        <li>{transportation.nearest_transportation.metro}</li>
                      )}
                    </ul>
                  </div>
                )}

                {transportation.nearest_transportation?.buses && (
                  <div className="transport-card">
                    <h4>🚌 Buses</h4>
                    <ul>
                      {Array.isArray(transportation.nearest_transportation.buses) ? (
                        transportation.nearest_transportation.buses.map((option, idx) => (
                          <li key={idx}>{option}</li>
                        ))
                      ) : (
                        <li>{transportation.nearest_transportation.buses}</li>
                      )}
                    </ul>
                  </div>
                )}

                {transportation.nearest_transportation?.taxis && (
                  <div className="transport-card">
                    <h4>🚕 Taxis/Ride-hailing</h4>
                    <ul>
                      {Array.isArray(transportation.nearest_transportation.taxis) ? (
                        transportation.nearest_transportation.taxis.map((option, idx) => (
                          <li key={idx}>{option}</li>
                        ))
                      ) : (
                        <li>{transportation.nearest_transportation.taxis}</li>
                      )}
                    </ul>
                  </div>
                )}

                {transportation.recommendations && (
                  <div className="transport-card highlight">
                    <h4>💡 Recommendations</h4>
                    <ul>
                      {Array.isArray(transportation.recommendations) ? (
                        transportation.recommendations.map((rec, idx) => (
                          <li key={idx}>{rec}</li>
                        ))
                      ) : (
                        <li>{transportation.recommendations}</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p className="no-data">No transportation data available. Click to fetch.</p>
            )}
            <button onClick={fetchTransportation} disabled={loading} className="refresh-btn">
              {loading ? '⏳ Fetching...' : '🔄 Find Transportation'}
            </button>
          </div>
        )}

        {/* TRAFFIC DIVERSION TAB */}
        {activeTab === 'diversion' && (
          <div className="insight-panel">
            <h3>Traffic Diversion Routes</h3>
            <div className="zone-selector-mini">
              <label>Zone: <strong>{selectedZone}</strong></label>
            </div>

            {loading ? (
              <div className="loading">
                <span className="spinner">⏳</span>
                <p>Calculating diversion routes...</p>
              </div>
            ) : trafficDiversion ? (
              <div className="diversion-data">
                {trafficDiversion.primary_routes && (
                  <div className="diversion-card primary">
                    <h4>🟢 Primary Routes</h4>
                    <ul>
                      {Array.isArray(trafficDiversion.primary_routes) ? (
                        trafficDiversion.primary_routes.map((route, idx) => (
                          <li key={idx}>{route}</li>
                        ))
                      ) : (
                        <li>{trafficDiversion.primary_routes}</li>
                      )}
                    </ul>
                  </div>
                )}

                {trafficDiversion.secondary_routes && (
                  <div className="diversion-card secondary">
                    <h4>🟡 Secondary Routes</h4>
                    <ul>
                      {Array.isArray(trafficDiversion.secondary_routes) ? (
                        trafficDiversion.secondary_routes.map((route, idx) => (
                          <li key={idx}>{route}</li>
                        ))
                      ) : (
                        <li>{trafficDiversion.secondary_routes}</li>
                      )}
                    </ul>
                  </div>
                )}

                {trafficDiversion.restricted_roads && (
                  <div className="diversion-card warning">
                    <h4>🚫 Roads to Restrict/Close</h4>
                    <ul>
                      {Array.isArray(trafficDiversion.restricted_roads) ? (
                        trafficDiversion.restricted_roads.map((road, idx) => (
                          <li key={idx}>{road}</li>
                        ))
                      ) : (
                        <li>{trafficDiversion.restricted_roads}</li>
                      )}
                    </ul>
                  </div>
                )}

                {trafficDiversion.duration && (
                  <div className="diversion-card">
                    <h4>⏱️ Duration</h4>
                    <p>{trafficDiversion.duration}</p>
                  </div>
                )}

                {trafficDiversion.impact && (
                  <div className="diversion-card">
                    <h4>📊 Expected Impact</h4>
                    <p>{trafficDiversion.impact}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="no-data">No diversion data available. Click to generate.</p>
            )}
            <button onClick={fetchTrafficDiversion} disabled={loading} className="refresh-btn">
              {loading ? '⏳ Calculating...' : '🔄 Generate Diversion Plan'}
            </button>
          </div>
        )}

        {/* REPORT TAB */}
        {activeTab === 'report' && (
          <div className="insight-panel">
            <h3>Crowd Management Report</h3>
            
            <div className="report-controls">
              <label>Report Period:</label>
              <select value={reportPeriod} onChange={(e) => setReportPeriod(e.target.value)}>
                <option value="1hour">Last 1 Hour</option>
                <option value="24hours">Last 24 Hours</option>
                <option value="7days">Last 7 Days</option>
              </select>
              <button 
                onClick={generateReport} 
                disabled={generatingReport} 
                className="refresh-btn"
              >
                {generatingReport ? '⏳ Generating...' : '📄 Generate Report'}
              </button>
            </div>

            {generatingReport ? (
              <div className="loading">
                <span className="spinner">⏳</span>
                <p>Generating comprehensive report...</p>
              </div>
            ) : report ? (
              <div className="report-data">
                {report.summary && (
                  <div className="report-card summary">
                    <h4>📋 Executive Summary</h4>
                    <pre>{report.summary}</pre>
                  </div>
                )}

                {report.peak_times && (
                  <div className="report-card">
                    <h4>📈 Peak Times</h4>
                    <ul>
                      {Array.isArray(report.peak_times) ? (
                        report.peak_times.map((time, idx) => (
                          <li key={idx}>{time}</li>
                        ))
                      ) : (
                        <li>{report.peak_times}</li>
                      )}
                    </ul>
                  </div>
                )}

                {report.problem_areas && (
                  <div className="report-card">
                    <h4>⚠️ Problem Areas</h4>
                    <ul>
                      {Array.isArray(report.problem_areas) ? (
                        report.problem_areas.map((area, idx) => (
                          <li key={idx}>{area}</li>
                        ))
                      ) : (
                        <li>{report.problem_areas}</li>
                      )}
                    </ul>
                  </div>
                )}

                {report.efficiency_score !== undefined && (
                  <div className="report-card score">
                    <h4>⭐ Efficiency Score</h4>
                    <div className="score-display">
                      <div className="score-number">{report.efficiency_score}%</div>
                      <div className="score-bar">
                        <div 
                          className="score-fill" 
                          style={{ width: `${report.efficiency_score}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}

                {report.recommendations && (
                  <div className="report-card recommendations">
                    <h4>💡 Recommendations</h4>
                    <ol>
                      {Array.isArray(report.recommendations) ? (
                        report.recommendations.map((rec, idx) => (
                          <li key={idx}>{rec}</li>
                        ))
                      ) : (
                        <li>{report.recommendations}</li>
                      )}
                    </ol>
                  </div>
                )}

                <button onClick={downloadReport} className="download-btn">
                  📥 Download Report as Text
                </button>
              </div>
            ) : (
              <p className="no-data">No report generated. Click "Generate Report" to create one.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CrowdInsightsView;