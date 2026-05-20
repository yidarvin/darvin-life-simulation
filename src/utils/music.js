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

  // iOS Safari (and Chrome's autoplay policy) blocks HTML5 Audio playback
  // until a user gesture occurs. Idempotent and safe to call on every gesture —
  // resolves pendingPhase even when muted so a later unmute can start playback
  // without needing another gesture.
  unlock() {
    this.unlocked = true;

    // Resolve any queued phase into currentMusicKey. playPhase internally
    // skips _fadeIn if muted, but still sets currentMusicKey.
    if (!this.currentMusicKey && this.pendingPhase) {
      const phase = this.pendingPhase;
      this.pendingPhase = null;
      this.lastPhaseChangeAt = 0;
      this.playPhase(phase);
      return;
    }

    if (this.muted) return;

    // If we have a current track, call play() unconditionally — Chrome's
    // `paused` flag can lie after a previously-rejected play(), and play()
    // on already-playing audio is a safe no-op.
    if (this.currentMusicKey) {
      const audio = this.audioByKey.get(this.currentMusicKey);
      if (audio) {
        const p = audio.play();
        if (p && typeof p.catch === 'function') p.catch(() => {});
      } else {
        this._fadeIn(this.currentMusicKey);
      }
    }
  }

  setMuted(muted) {
    this.muted = !!muted;
    this._saveSettings();
    if (this.muted) {
      this._stopAll();
      return;
    }
    // Unmuting: start whatever should be playing.
    this._ensurePlaying();
  }

  toggleMuted() {
    this.setMuted(!this.muted);
    return this.muted;
  }

  setVolume(v) {
    this.volume = Math.max(0, Math.min(1, v));
    this._saveSettings();
    if (this.muted) return;
    if (this.currentMusicKey) {
      const audio = this.audioByKey.get(this.currentMusicKey);
      if (audio) audio.volume = this.volume;
    }
    // Belt-and-suspenders: any volume interaction is a user gesture, so use it
    // to start playback if the unlock path missed for some reason.
    this._ensurePlaying();
  }

  // Start music if it should be playing but isn't. Called from setMuted(false)
  // and setVolume(), which both happen inside user gestures and so can succeed
  // even when the document-level unlock listener missed an earlier gesture.
  _ensurePlaying() {
    if (this.muted) return;
    this.unlocked = true;
    if (this.currentMusicKey) {
      const audio = this.audioByKey.get(this.currentMusicKey);
      if (audio) {
        const p = audio.play();
        if (p && typeof p.catch === 'function') p.catch(() => {});
      } else {
        this._fadeIn(this.currentMusicKey);
      }
      return;
    }
    if (this.pendingPhase) {
      const phase = this.pendingPhase;
      this.pendingPhase = null;
      this.lastPhaseChangeAt = 0;
      this.playPhase(phase);
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

    if (!this.unlocked) {
      this.pendingPhase = phase;
      return;
    }

    const now = Date.now();
    const sinceLast = now - this.lastPhaseChangeAt;
    if (sinceLast < MIN_PHASE_DURATION_MS && this.currentMusicKey) {
      return;
    }
    this.lastPhaseChangeAt = now;

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

    // iOS Safari sometimes drops the loop attribute. If `ended` fires while
    // this is still the active track, restart it manually.
    audio.addEventListener('ended', () => {
      if (this.currentMusicKey !== musicKey || this.muted) return;
      audio.currentTime = 0;
      const p = audio.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    });

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
