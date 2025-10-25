/**
 * Theme Manager
 * Manages dark theme (dark is default and only theme)
 */

class ThemeManager {
  constructor() {
    this.currentTheme = 'dark';
    this.applyTheme();
  }

  applyTheme() {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.body.classList.add('dark-theme');
    document.body.classList.remove('light-theme');
  }

  getCurrentTheme() {
    return 'dark';
  }
}

// Global instance
const themeManager = new ThemeManager();

export default themeManager;

