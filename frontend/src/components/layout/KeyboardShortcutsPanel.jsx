import React from 'react';
import './KeyboardShortcutsPanel.css';

const KeyboardShortcutsPanel = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    {
      category: 'Navigation',
      items: [
        { keys: ['1'], description: 'Go to Live Operations' },
        { keys: ['2'], description: 'Go to Analytics' },
        { keys: ['3'], description: 'Go to Alerts & History' },
        { keys: ['4'], description: 'Go to Fleet Management' },
        { keys: ['5'], description: 'Go to System Control' },
      ]
    },
    {
      category: 'Actions',
      items: [
        { keys: ['T'], description: 'Generate Test Notifications' },
        { keys: ['Esc'], description: 'Close Modals / Panels' },
        { keys: ['?'], description: 'Show This Help Panel' },
      ]
    },
    {
      category: 'Views',
      items: [
        { keys: ['H'], description: 'Toggle Heatmap' },
        { keys: ['B'], description: 'Toggle Badges' },
        { keys: ['M'], description: 'Toggle Dark/Light Mode' },
      ]
    }
  ];

  return (
    <div className="shortcuts-overlay" onClick={onClose}>
      <div className="shortcuts-panel" onClick={(e) => e.stopPropagation()}>
        <div className="shortcuts-header">
          <h2>⌨️ Keyboard Shortcuts</h2>
          <button className="shortcuts-close" onClick={onClose}>✕</button>
        </div>

        <div className="shortcuts-content">
          {shortcuts.map((section, idx) => (
            <div key={idx} className="shortcuts-section">
              <h3 className="shortcuts-category">{section.category}</h3>
              <div className="shortcuts-list">
                {section.items.map((shortcut, sidx) => (
                  <div key={sidx} className="shortcut-item">
                    <div className="shortcut-keys">
                      {shortcut.keys.map((key, kidx) => (
                        <kbd key={kidx} className="shortcut-key">{key}</kbd>
                      ))}
                    </div>
                    <div className="shortcut-description">{shortcut.description}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="shortcuts-footer">
          <p>Press <kbd>?</kbd> anytime to toggle this panel</p>
          <p className="shortcuts-tip">💡 Tip: Most shortcuts work from any view</p>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsPanel;

