import { getCurrentPhase } from './phaseResolution';
import { getMusicKey, PHASE_TO_MUSIC_KEY } from '../data/musicMap';

const ALL_MUSIC_KEYS = [...new Set(Object.values(PHASE_TO_MUSIC_KEY))];

const STORAGE_KEY = 'lifeSim:music';
const DEFAULT_VOLUME = 0.4;
const CROSSFADE_MS = 1500;
const MIN_PHASE_DURATION_MS = 8000;

// Toggle in console: window.__musicDebug = true
function dbg(...args) {
  if (typeof window !== 'undefined' && window.__musicDebug) {
    console.log('[music]', ...args);
  }
}

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
      if (typeof s.volume === 'number' && Number.isFinite(s.volume)) {
        this.volume = Math.max(0, Math.min(1, s.volume));
      }
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
    const firstUnlock = !this.unlocked;
    this.unlocked = true;

    // Prime every track's <audio> within this gesture. Some browsers (notably
    // Safari, and sometimes Chrome) refuse to play elements that were first
    // created outside a user gesture — even if a later play() happens inside
    // one. Creating them all up-front avoids that whole class of failure when
    // the game transitions phase later from a useEffect.
    if (firstUnlock) this._primeAllAudio();

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

  // The all-in-one entry point: call this on every user gesture with the
  // current phase. It primes, transitions, and (re)starts playback as needed,
  // all inside the gesture so play() is guaranteed to be allowed. Bypasses
  // MIN_PHASE_DURATION_MS throttling because if a real phase change happens,
  // the user should hear it.
  ensurePlaying(phase) {
    const firstUnlock = !this.unlocked;
    this.unlocked = true;
    if (firstUnlock) this._primeAllAudio();

    const musicKey = phase ? getMusicKey(phase) : null;
    dbg('ensurePlaying', { phase, musicKey, currentMusicKey: this.currentMusicKey, muted: this.muted, firstUnlock });

    // Transition if the requested key differs from what's current.
    if (musicKey && musicKey !== this.currentMusicKey) {
      const oldKey = this.currentMusicKey;
      this.currentMusicKey = musicKey;
      this.pendingPhase = null;
      this.lastPhaseChangeAt = Date.now();
      if (oldKey) this._fadeOut(oldKey);
      if (!this.muted) this._fadeIn(musicKey);
      return;
    }

    if (this.muted) return;

    // Same key (or no phase given) — make sure the current track is playing.
    if (this.currentMusicKey) {
      const audio = this.audioByKey.get(this.currentMusicKey);
      if (audio) {
        dbg('retry play', {
          key: this.currentMusicKey,
          paused: audio.paused,
          readyState: audio.readyState,
          volume: audio.volume,
          muted: audio.muted,
          currentTime: audio.currentTime,
          engineVolume: this.volume,
        });
        const p = audio.play();
        if (p && typeof p.then === 'function') {
          p.then(() => dbg('retry play OK', this.currentMusicKey))
           .catch((e) => dbg('retry play FAIL', this.currentMusicKey, e.name, e.message));
        }
      } else {
        this._fadeIn(this.currentMusicKey);
      }
    } else if (this.pendingPhase) {
      const queued = this.pendingPhase;
      this.pendingPhase = null;
      this.lastPhaseChangeAt = 0;
      this.playPhase(queued);
    }
  }

  // Pre-create every track's Audio element so each one is registered in the
  // current user-gesture context. Uses preload='metadata' to avoid pulling
  // ~46MB of audio data upfront — full data loads when each track is first
  // played (preload is promoted to 'auto' inside _getOrCreate on play).
  _primeAllAudio() {
    for (const key of ALL_MUSIC_KEYS) {
      this._getOrCreate(key, 'metadata');
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
    // Reject NaN/non-finite; otherwise this.volume would poison every future
    // _rampVolume call and throw IndexSizeError mid-tick.
    const n = Number(v);
    if (!Number.isFinite(n)) return;
    this.volume = Math.max(0, Math.min(1, n));
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

  _getOrCreate(musicKey, preload = 'auto') {
    if (this.audioByKey.has(musicKey)) {
      const existing = this.audioByKey.get(musicKey);
      // Promote preload if we're about to play this one.
      if (existing && preload === 'auto' && existing.preload !== 'auto') {
        existing.preload = 'auto';
      }
      return existing;
    }

    const audio = new Audio();
    audio.preload = preload;
    audio.src = `/music/${musicKey}.mp3`;
    audio.loop = true;
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
    dbg('_fadeIn', { key: musicKey, readyState: audio.readyState, preload: audio.preload });
    const playPromise = audio.play();
    if (playPromise && typeof playPromise.then === 'function') {
      playPromise
        .then(() => dbg('play OK', musicKey))
        .catch((e) => dbg('play FAIL', musicKey, e.name, e.message));
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
    // Defensive: coerce NaN/out-of-range to safe values. A bad `this.volume`
    // (e.g., NaN from a previously-bad input) would otherwise make the tick
    // assignment throw IndexSizeError and leave the audio stuck silent.
    const safeFrom = Number.isFinite(from) ? Math.max(0, Math.min(1, from)) : 0;
    const safeTo = Number.isFinite(to) ? Math.max(0, Math.min(1, to)) : 0;
    const startTime = performance.now();
    const tick = (now) => {
      const elapsed = now - startTime;
      const t = Math.max(0, Math.min(1, elapsed / durationMs));
      const next = safeFrom + (safeTo - safeFrom) * t;
      const clamped = Math.max(0, Math.min(1, next));
      try {
        audio.volume = clamped;
      } catch (e) {
        dbg('volume set FAIL', { value: clamped, raw: next, from, to, t, audioVol: audio.volume, err: e.message });
      }
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
