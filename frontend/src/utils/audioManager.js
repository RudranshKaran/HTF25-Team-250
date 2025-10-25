/**
 * Audio Manager - Sound notification system
 * Uses Web Audio API for generating sounds (no external files needed)
 */

class AudioManager {
  constructor() {
    this.audioContext = null;
    this.enabled = true;
    this.volume = 0.5;
    
    // Initialize audio context on user interaction
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.initialized = true;
    } catch (error) {
      console.warn('Audio not supported:', error);
    }
  }

  playBeep(frequency = 800, duration = 200, type = 'sine') {
    if (!this.enabled || !this.initialized) return;
    
    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = type;
      
      gainNode.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        this.audioContext.currentTime + duration / 1000
      );
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration / 1000);
    } catch (error) {
      console.warn('Beep failed:', error);
    }
  }

  playWarningAlert() {
    // Warning: 2 beeps, medium pitch
    this.playBeep(600, 150);
    setTimeout(() => this.playBeep(600, 150), 200);
  }

  playCriticalAlert() {
    // Critical: 3 urgent beeps, high pitch
    this.playBeep(900, 150);
    setTimeout(() => this.playBeep(900, 150), 180);
    setTimeout(() => this.playBeep(900, 200), 360);
  }

  playSuccess() {
    // Success: ascending tone
    this.playBeep(400, 100);
    setTimeout(() => this.playBeep(600, 150), 120);
  }

  playClick() {
    // Subtle click
    this.playBeep(1200, 50);
  }

  playNotification() {
    // Gentle notification
    this.playBeep(500, 200, 'sine');
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  setEnabled(enabled) {
    this.enabled = enabled;
  }

  isEnabled() {
    return this.enabled;
  }
}

// Global instance
const audioManager = new AudioManager();

// Initialize on first user interaction
document.addEventListener('click', () => audioManager.init(), { once: true });

export default audioManager;

