import { useState } from 'react';
import AnalyticsPanel from './AnalyticsPanel';
import SystemLogs from './SystemLogs';
import PerformanceDashboard from './PerformanceDashboard';
import './InsightsDock.css';

/**
 * InsightsDock
 * A unified, non-overlapping right-side drawer that consolidates:
 * - Analytics & Trends
 * - System Logs
 * - Performance metrics
 */
export default function InsightsDock({
  densityData,
  metroData,
  connectionStatus,
  messagesReceived,
}) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('analytics');

  return (
    <>
      {/* Toggle button */}
      <button
        className={`insights-toggle ${open ? 'open' : ''}`}
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Close Insights' : 'Open Insights'}
      >
        {open ? '✖' : '📈'}
      </button>

      {/* Drawer */}
      <div className={`insights-dock ${open ? 'visible' : ''}`}>
        <div className="dock-header">
          <div className="dock-title">Mission Insights</div>
          <div className="dock-tabs" role="tablist">
            <button
              className={`dock-tab ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
              role="tab"
              aria-selected={activeTab === 'analytics'}
            >
              Analytics
            </button>
            <button
              className={`dock-tab ${activeTab === 'logs' ? 'active' : ''}`}
              onClick={() => setActiveTab('logs')}
              role="tab"
              aria-selected={activeTab === 'logs'}
            >
              Logs
            </button>
            <button
              className={`dock-tab ${activeTab === 'performance' ? 'active' : ''}`}
              onClick={() => setActiveTab('performance')}
              role="tab"
              aria-selected={activeTab === 'performance'}
            >
              Performance
            </button>
          </div>
        </div>

        <div className="dock-content">
          {activeTab === 'analytics' && (
            <AnalyticsPanel densityData={densityData} metroData={metroData} embedded />
          )}
          {activeTab === 'logs' && (
            <SystemLogs embedded />
          )}
          {activeTab === 'performance' && (
            <PerformanceDashboard
              embedded
              connectionStatus={connectionStatus}
              messagesReceived={messagesReceived}
            />
          )}
        </div>
      </div>
    </>
  );
}
