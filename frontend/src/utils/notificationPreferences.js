/**
 * Notification Preferences Manager
 * Manages user preferences for notifications, alerts, and sounds
 */

const STORAGE_KEY = 'notification_preferences';

const DEFAULT_PREFERENCES = {
  sound: {
    enabled: true,
    criticalAlerts: true,
    warningAlerts: true,
  },
  display: {
    showBanner: true,
    showToast: true,
    autoReadOld: true,
  },
  timing: {
    deduplicationWindow: 60, // seconds
    bannerAutoDismiss: 30, // seconds
  }
};

class NotificationPreferences {
  constructor() {
    this.preferences = this.loadPreferences();
    this.listeners = new Set();
  }

  loadPreferences() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
    return { ...DEFAULT_PREFERENCES };
  }

  savePreferences() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.preferences));
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  }

  getPreferences() {
    return { ...this.preferences };
  }

  updatePreferences(updates) {
    this.preferences = {
      ...this.preferences,
      ...updates,
      sound: { ...this.preferences.sound, ...updates.sound },
      display: { ...this.preferences.display, ...updates.display },
      timing: { ...this.preferences.timing, ...updates.timing },
    };
    this.savePreferences();
  }

  // Sound preferences
  isSoundEnabled() {
    return this.preferences.sound.enabled;
  }

  setSoundEnabled(enabled) {
    this.preferences.sound.enabled = enabled;
    this.savePreferences();
  }

  isCriticalAlertSoundEnabled() {
    return this.preferences.sound.enabled && this.preferences.sound.criticalAlerts;
  }

  setCriticalAlertSound(enabled) {
    this.preferences.sound.criticalAlerts = enabled;
    this.savePreferences();
  }

  isWarningAlertSoundEnabled() {
    return this.preferences.sound.enabled && this.preferences.sound.warningAlerts;
  }

  setWarningAlertSound(enabled) {
    this.preferences.sound.warningAlerts = enabled;
    this.savePreferences();
  }

  // Display preferences
  shouldShowBanner() {
    return this.preferences.display.showBanner;
  }

  setShowBanner(show) {
    this.preferences.display.showBanner = show;
    this.savePreferences();
  }

  shouldShowToast() {
    return this.preferences.display.showToast;
  }

  setShowToast(show) {
    this.preferences.display.showToast = show;
    this.savePreferences();
  }

  shouldAutoReadOld() {
    return this.preferences.display.autoReadOld;
  }

  setAutoReadOld(autoRead) {
    this.preferences.display.autoReadOld = autoRead;
    this.savePreferences();
  }

  // Timing preferences
  getDeduplicationWindow() {
    return this.preferences.timing.deduplicationWindow * 1000; // Convert to milliseconds
  }

  setDeduplicationWindow(seconds) {
    this.preferences.timing.deduplicationWindow = seconds;
    this.savePreferences();
  }

  getBannerAutoDismiss() {
    return this.preferences.timing.bannerAutoDismiss * 1000; // Convert to milliseconds
  }

  setBannerAutoDismiss(seconds) {
    this.preferences.timing.bannerAutoDismiss = seconds;
    this.savePreferences();
  }

  // Listener management
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notifyListeners() {
    this.listeners.forEach(listener => listener(this.preferences));
  }

  // Reset to defaults
  resetToDefaults() {
    this.preferences = { ...DEFAULT_PREFERENCES };
    this.savePreferences();
  }
}

// Export singleton instance
const notificationPreferences = new NotificationPreferences();
export default notificationPreferences;

