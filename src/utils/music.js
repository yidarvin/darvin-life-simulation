import { getCurrentPhase } from './phaseResolution';

const STORAGE_KEY = 'lifeSim:music';
const DEFAULT_VOLUME = 0.4;
const CROSSFADE_MS = 1500;
const MIN_PHASE_DURATION_MS = 8000;

class MusicEngine {
  constructor() {
    this.audioByPhase = new Map();
    this.currentPhase = null;
    this.muted = false;
    this.volume = DEFAULT_VOLUME;
    this.unlocked = false;
    this.pendingPhase = null;
    this.lastPhaseChangeAt = 0;
    this._loadSettings();
  }

  _loadSettings() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const s = JSON.parse(raw);
      if (typeof s.muted === 'boolean') this.muted = s.muted;
      if (typeof s.volume === 'number') this.volume = Math.max(0, Math.min(1, s.volume));
    } catch {
      // Use defaults.
    }
  }

  _saveSettings() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        muted: this.muted,
        volume: this.volume,
      }));
    } catch {
      // localStorage unavailable or quota exceeded.
    }
  }

  // iOS Safari blocks HTML5 Audio playback until a user gesture occurs.
  unlock() {
    if (this.unlocked) return;
    this.unlocked = true;
    if (this.pendingPhase) {
      const phase = this.pendingPhase;
      this.pendingPhase = null;
      this.currentPhase = null;
      this.playPhase(phase);
    }
  }

  setMuted(muted) {
    this.muted = !!muted;
    this._saveSettings();
    if (this.muted) {
      this._stopAll();
    } else if (this.currentPhase) {
      this._fadeIn(this.currentPhase);
    }
  }

  toggleMuted() {
    this.setMuted(!this.muted);
    return this.muted;
  }

  setVolume(v) {
    this.volume = Math.max(0, Math.min(1, v));
    this._saveSettings();
    if (this.currentPhase && !this.muted) {
      const audio = this.audioByPhase.get(this.currentPhase);
      if (audio) audio.volume = this.volume;
    }
  }

  isMuted() { return this.muted; }
  getVolume() { return this.volume; }

  playPhase(phase) {
    if (!phase) return;
    if (phase === this.currentPhase) return;

    const now = Date.now();
    const sinceLast = now - this.lastPhaseChangeAt;
    if (sinceLast < MIN_PHASE_DURATION_MS && this.currentPhase) {
      return;
    }
    this.lastPhaseChangeAt = now;

    if (!this.unlocked) {
      this.pendingPhase = phase;
      return;
    }

    const oldPhase = this.currentPhase;
    this.currentPhase = phase;

    if (oldPhase) this._fadeOut(oldPhase);
    if (!this.muted) this._fadeIn(phase);
  }

  _getOrCreate(phase) {
    if (this.audioByPhase.has(phase)) {
      return this.audioByPhase.get(phase);
    }

    const audio = new Audio(`/music/${phase}.mp3`);
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = 0;

    audio.addEventListener('error', () => {
      if (import.meta.env.DEV) {
        console.warn(`[music] file missing or failed to load: /music/${phase}.mp3`);
      }
      this.audioByPhase.set(phase, null);
    });

    this.audioByPhase.set(phase, audio);
    return audio;
  }

  _fadeIn(phase) {
    const audio = this._getOrCreate(phase);
    if (!audio) return;

    audio.volume = 0;
    const playPromise = audio.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {
        // iOS gesture not yet honored, or file 404. Silent failure.
      });
    }
    this._rampVolume(audio, 0, this.volume, CROSSFADE_MS);
  }

  _fadeOut(phase) {
    const audio = this.audioByPhase.get(phase);
    if (!audio) return;
    const startVol = audio.volume;
    this._rampVolume(audio, startVol, 0, CROSSFADE_MS, () => {
      audio.pause();
    });
  }

  _stopAll() {
    for (const audio of this.audioByPhase.values()) {
      if (!audio) continue;
      audio.pause();
      audio.volume = 0;
    }
  }

  _rampVolume(audio, from, to, durationMs, onComplete) {
    const startTime = performance.now();
    const tick = (now) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / durationMs);
      audio.volume = from + (to - from) * t;
      if (t < 1) {
        requestAnimationFrame(tick);
      } else if (onComplete) {
        onComplete();
      }
    };
    requestAnimationFrame(tick);
  }
}

export const music = new MusicEngine();

export { getCurrentPhase };
