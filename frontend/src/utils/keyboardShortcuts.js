/**
 * Keyboard Shortcuts Manager
 * Handles global keyboard shortcuts for the app
 */

class KeyboardShortcutsManager {
  constructor() {
    this.handlers = new Map();
    this.enabled = true;
    
    // Bind the event listener
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  init() {
    document.addEventListener('keydown', this.handleKeyDown);
  }

  destroy() {
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  register(key, modifier, handler, description) {
    const shortcutKey = this.createKey(key, modifier);
    this.handlers.set(shortcutKey, { handler, description, key, modifier });
  }

  unregister(key, modifier) {
    const shortcutKey = this.createKey(key, modifier);
    this.handlers.delete(shortcutKey);
  }

  createKey(key, modifier) {
    return `${modifier || ''}:${key.toLowerCase()}`;
  }

  handleKeyDown(event) {
    if (!this.enabled) return;
    
    // Don't trigger if user is typing in an input
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
      return;
    }

    const modifier = this.getModifier(event);
    const key = event.key.toLowerCase();
    const shortcutKey = this.createKey(key, modifier);
    
    const shortcut = this.handlers.get(shortcutKey);
    if (shortcut) {
      event.preventDefault();
      shortcut.handler(event);
    }
  }

  getModifier(event) {
    if (event.ctrlKey || event.metaKey) return 'ctrl';
    if (event.shiftKey) return 'shift';
    if (event.altKey) return 'alt';
    return '';
  }

  setEnabled(enabled) {
    this.enabled = enabled;
  }

  getAllShortcuts() {
    const shortcuts = [];
    this.handlers.forEach((value, key) => {
      shortcuts.push({
        key: value.key,
        modifier: value.modifier,
        description: value.description
      });
    });
    return shortcuts;
  }
}

// Global instance
const keyboardManager = new KeyboardShortcutsManager();

export default keyboardManager;

