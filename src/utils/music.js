import { getCurrentPhase } from './phaseResolution';
import { getMusicKey } from '../data/musicMap';

const STORAGE_KEY = 'lifeSim:music';
const DEFAULT_VOLUME = 0.4;
const CROSSFADE_MS = 1500;
const MIN_PHASE_DURATION_MS = 8000;

class MusicEngine {
  constructor() {
    this.audioByKey = new Map();
    this.currentMusicKey = null;
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
      this.currentMusicKey = null;
      this.playPhase(phase);
    }
  }

  setMuted(muted) {
    this.muted = !!muted;
    this._saveSettings();
    if (this.muted) {
      this._stopAll();
    } else if (this.currentMusicKey) {
      this._fadeIn(this.currentMusicKey);
    }
  }

  toggleMuted() {
    this.setMuted(!this.muted);
    return this.muted;
  }

  setVolume(v) {
    this.volume = Math.max(0, Math.min(1, v));
    this._saveSettings();
    if (this.currentMusicKey && !this.muted) {
      const audio = this.audioByKey.get(this.currentMusicKey);
      if (audio) audio.volume = this.volume;
    }
  }

  isMuted() { return this.muted; }
  getVolume() { return this.volume; }

  /**
   * Transition to whatever music corresponds to the given game phase.
   * If the resolved music key matches what's already playing, no transition occurs.
   */
  playPhase(phase) {
    if (!phase) return;
    const musicKey = getMusicKey(phase);
    if (!musicKey) return;
    if (musicKey === this.currentMusicKey) return;

    const now = Date.now();
    const sinceLast = now - this.lastPhaseChangeAt;
    if (sinceLast < MIN_PHASE_DURATION_MS && this.currentMusicKey) {
      return;
    }
    this.lastPhaseChangeAt = now;

    if (!this.unlocked) {
      this.pendingPhase = phase;
      return;
    }

    const oldKey = this.currentMusicKey;
    this.currentMusicKey = musicKey;

    if (oldKey) this._fadeOut(oldKey);
    if (!this.muted) this._fadeIn(musicKey);
  }

  _getOrCreate(musicKey) {
    if (this.audioByKey.has(musicKey)) {
      return this.audioByKey.get(musicKey);
    }

    const audio = new Audio(`/music/${musicKey}.mp3`);
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = 0;

    audio.addEventListener('error', () => {
      if (import.meta.env.DEV) {
        console.warn(`[music] file missing or failed to load: /music/${musicKey}.mp3`);
      }
      this.audioByKey.set(musicKey, null);
    });

    this.audioByKey.set(musicKey, audio);
    return audio;
  }

  _fadeIn(musicKey) {
    const audio = this._getOrCreate(musicKey);
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

  _fadeOut(musicKey) {
    const audio = this.audioByKey.get(musicKey);
    if (!audio) return;
    const startVol = audio.volume;
    this._rampVolume(audio, startVol, 0, CROSSFADE_MS, () => {
      audio.pause();
    });
  }

  _stopAll() {
    for (const audio of this.audioByKey.values()) {
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
