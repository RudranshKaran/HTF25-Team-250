import React from 'react';
import './Sidebar.css';

const Sidebar = ({ activeSection, onNavigate }) => {
  const sections = [
    { id: 'operations', icon: '🗺️', label: 'Live Operations', shortcut: '1' },
    { id: 'analytics', icon: '📊', label: 'Analytics', shortcut: '2' },
    { id: 'alerts', icon: '🚨', label: 'Alerts & History', shortcut: '3' },
    { id: 'fleet', icon: '🚍', label: 'Fleet Management', shortcut: '4' },
    { id: 'insights', icon: '🤖', label: 'AI Insights', shortcut: '6' },
    { id: 'control', icon: '⚙️', label: 'System Control', shortcut: '5' }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span className="logo-icon">🚨</span>
          <span className="logo-text">CSIS</span>
        </div>
        <div className="sidebar-subtitle">Mission Control</div>
      </div>

      <nav className="sidebar-nav">
        {sections.map(section => (
          <button
            key={section.id}
            className={`sidebar-item ${activeSection === section.id ? 'active' : ''}`}
            onClick={() => onNavigate(section.id)}
            title={`${section.label} (${section.shortcut})`}
          >
            <span className="sidebar-icon">{section.icon}</span>
            <span className="sidebar-label">{section.label}</span>
            <span className="sidebar-shortcut">{section.shortcut}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button 
          className="sidebar-help"
          onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: '?' }))}
          title="Keyboard Shortcuts (?)"
        >
          <span className="sidebar-icon">❓</span>
          <span className="sidebar-label">Shortcuts</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

