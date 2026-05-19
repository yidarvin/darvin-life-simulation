import { SOUNDS } from '../data/sounds';

const STORAGE_KEY = 'lifeSim:sound';
const DEFAULT_VOLUME = 0.6;

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.volume = DEFAULT_VOLUME;
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
      // Bad JSON or no localStorage; use defaults.
    }
  }

  _saveSettings() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        muted: this.muted,
        volume: this.volume,
      }));
    } catch {
      // Quota exceeded or localStorage unavailable; silently ignore.
    }
  }

  /**
   * Lazy-create AudioContext on first call. iOS Safari refuses to create one
   * until a user gesture has occurred — since this method is only called from
   * gesture-driven code paths (click, modal open after click, etc.), this works.
   */
  _ensureContext() {
    if (!this.ctx) {
      const AudioCtor = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtor) return null;
      this.ctx = new AudioCtor();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  setMuted(muted) {
    this.muted = !!muted;
    this._saveSettings();
  }

  toggleMuted() {
    this.setMuted(!this.muted);
    return this.muted;
  }

  setVolume(v) {
    this.volume = Math.max(0, Math.min(1, v));
    this._saveSettings();
  }

  isMuted() { return this.muted; }
  getVolume() { return this.volume; }

  /**
   * Play a sound by id. Silently no-ops if muted, Web Audio is unsupported,
   * or the sound id doesn't exist.
   */
  play(soundId) {
    if (this.muted) return;
    const def = SOUNDS[soundId];
    if (!def) {
      if (import.meta.env.DEV) console.warn(`Unknown sound: ${soundId}`);
      return;
    }
    try {
      const ctx = this._ensureContext();
      if (!ctx) return;
      const synth = SYNTHS[def.type];
      if (!synth) return;
      synth(ctx, def, this.volume);
    } catch (e) {
      if (import.meta.env.DEV) console.warn('Sound error:', e);
    }
  }
}

// ─── Synthesis functions ──────────────────────────────────────────────────

const SYNTHS = {
  beep: (ctx, def, masterVol) => {
    const now = ctx.currentTime;
    const dur = def.duration / 1000;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = def.wave || 'sine';
    osc.frequency.value = def.freq;
    const peak = def.volume * masterVol;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(peak, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + dur);
  },

  sweep: (ctx, def, masterVol) => {
    const now = ctx.currentTime;
    const dur = def.duration / 1000;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = def.wave || 'sine';
    osc.frequency.setValueAtTime(def.from, now);
    osc.frequency.exponentialRampToValueAtTime(def.to, now + dur);
    const peak = def.volume * masterVol;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(peak, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + dur);
  },

  arpeggio: (ctx, def, masterVol) => {
    const noteCount = def.notes.length;
    const noteDuration = (def.duration / noteCount) / 1000;
    const now = ctx.currentTime;
    const peak = def.volume * masterVol;
    for (let i = 0; i < noteCount; i++) {
      const t = now + i * noteDuration;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = def.wave || 'square';
      osc.frequency.value = def.notes[i];
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(peak, t + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.001, t + noteDuration * 1.2);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + noteDuration * 1.5);
    }
  },

  noise: (ctx, def, masterVol) => {
    const dur = def.duration / 1000;
    const now = ctx.currentTime;
    const sampleRate = ctx.sampleRate;
    const bufferSize = Math.max(1, Math.floor(sampleRate * dur));
    const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = def.filter || 'highpass';
    filter.frequency.value = def.filterFreq || 1000;

    const gain = ctx.createGain();
    const peak = def.volume * masterVol;
    gain.gain.setValueAtTime(peak, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    source.connect(filter).connect(gain).connect(ctx.destination);
    source.start(now);
  },
};

// Singleton export.
export const sound = new SoundEngine();
