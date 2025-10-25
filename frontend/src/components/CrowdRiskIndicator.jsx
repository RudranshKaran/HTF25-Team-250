/**
 * CrowdRiskIndicator Component
 * Displays real-time crowd safety status with color-coded indicator
 * States: Safe (Green), Moderate (Yellow), High (Red)
 */

import { useEffect, useState, useRef } from 'react';
import audioManager from '../utils/audioManager';
import './CrowdRiskIndicator.css';

function CrowdRiskIndicator({ densityData }) {
  const [riskLevel, setRiskLevel] = useState('safe');
  const [previousRiskLevel, setPreviousRiskLevel] = useState('safe');
  const alertPlayedRef = useRef(false);

  // Calculate risk level based on density
  useEffect(() => {
    if (!densityData || densityData.max_density === undefined) {
      setRiskLevel('safe');
      return;
    }

    const maxDensity = densityData.max_density;
    let newRiskLevel = 'safe';

    if (maxDensity >= 120) {
      newRiskLevel = 'high';
    } else if (maxDensity >= 80) {
      newRiskLevel = 'moderate';
    } else {
      newRiskLevel = 'safe';
    }

    // Play alert sound when entering high risk state (only once per transition)
    if (newRiskLevel === 'high' && previousRiskLevel !== 'high' && !alertPlayedRef.current) {
      audioManager.playWarningAlert();
      alertPlayedRef.current = true;
    } else if (newRiskLevel !== 'high') {
      alertPlayedRef.current = false;
    }

    setPreviousRiskLevel(riskLevel);
    setRiskLevel(newRiskLevel);
  }, [densityData, riskLevel, previousRiskLevel]);

  const getRiskConfig = () => {
    switch (riskLevel) {
      case 'high':
        return {
          icon: '🔴',
          label: 'HIGH RISK',
          description: 'Critical crowd density detected',
          color: '#ff4444',
          bgColor: 'rgba(255, 68, 68, 0.15)'
        };
      case 'moderate':
        return {
          icon: '🟡',
          label: 'MODERATE RISK',
          description: 'Elevated crowd levels',
          color: '#ffa500',
          bgColor: 'rgba(255, 165, 0, 0.15)'
        };
      case 'safe':
      default:
        return {
          icon: '🟢',
          label: 'SAFE',
          description: 'Normal crowd density',
          color: '#00ff88',
          bgColor: 'rgba(0, 255, 136, 0.15)'
        };
    }
  };

  const config = getRiskConfig();
  const density = densityData?.max_density || 0;

  return (
    <div 
      className={`crowd-risk-indicator risk-${riskLevel}`}
      style={{ 
        borderColor: config.color,
        background: config.bgColor 
      }}
    >
      <div className="risk-icon-wrapper">
        <span className="risk-icon">{config.icon}</span>
        {riskLevel === 'high' && <div className="risk-pulse"></div>}
      </div>
      <div className="risk-content">
        <div className="risk-label" style={{ color: config.color }}>
          {config.label}
        </div>
        <div className="risk-description">{config.description}</div>
        <div className="risk-density">
          Max Density: <span style={{ color: config.color }}>{density}</span>
        </div>
      </div>
    </div>
  );
}

export default CrowdRiskIndicator;
