import React from 'react';
import './Breadcrumb.css';

const Breadcrumb = ({ activeSection }) => {
  const sectionLabels = {
    operations: 'Live Operations',
    analytics: 'Analytics & Insights',
    alerts: 'Alerts & History',
    fleet: 'Fleet Management',
    control: 'System Control'
  };

  const sectionIcons = {
    operations: '🗺️',
    analytics: '📊',
    alerts: '🚨',
    fleet: '🚍',
    control: '⚙️'
  };

  return (
    <div className="breadcrumb">
      <span className="breadcrumb-item home">
        <span className="breadcrumb-icon">🏠</span>
        <span className="breadcrumb-text">Home</span>
      </span>
      <span className="breadcrumb-separator">›</span>
      <span className="breadcrumb-item active">
        <span className="breadcrumb-icon">{sectionIcons[activeSection]}</span>
        <span className="breadcrumb-text">{sectionLabels[activeSection]}</span>
      </span>
    </div>
  );
};

export default Breadcrumb;

