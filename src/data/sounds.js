/**
 * Sound parameter definitions. Each entry is a synthesis recipe.
 *
 * Synthesis types (see src/utils/sound.js for implementations):
 *   - beep: single oscillator with envelope
 *   - sweep: oscillator with frequency ramp (low→high or high→low)
 *   - arpeggio: sequenced notes, each a short oscillator burst
 *   - noise: filtered white-noise burst (for clicks, fizzes)
 *
 * Volume values are intentionally LOW (0.02–0.18). The default master volume
 * (0.6) scales them down further. The principle: a clicker game must NEVER be
 * loud, since the player will hear the click sound 10,000 times per session.
 */

export const SOUNDS = {
  // ── Very frequent: must be near-subliminal ────────────────────────────
  click: {
    type: 'noise',
    filter: 'highpass',
    filterFreq: 2500,
    duration: 18,
    volume: 0.04,
  },
  save: {
    type: 'beep',
    wave: 'sine',
    freq: 2000,
    duration: 12,
    volume: 0.02,
  },

  // ── Modal lifecycle ───────────────────────────────────────────────────
  modalOpen: {
    type: 'sweep',
    wave: 'sine',
    from: 220,
    to: 660,
    duration: 140,
    volume: 0.06,
  },
  modalClose: {
    type: 'sweep',
    wave: 'sine',
    from: 660,
    to: 220,
    duration: 110,
    volume: 0.05,
  },

  // ── Shop / transactions ───────────────────────────────────────────────
  shopBuy: {
    type: 'arpeggio',
    wave: 'sine',
    notes: [880, 1320],
    duration: 140,
    volume: 0.08,
  },
  error: {
    type: 'sweep',
    wave: 'square',
    from: 300,
    to: 150,
    duration: 170,
    volume: 0.08,
  },

  // ── Progression moments ───────────────────────────────────────────────
  yearTransition: {
    type: 'arpeggio',
    wave: 'sine',
    notes: [440, 554, 659],
    duration: 320,
    volume: 0.10,
  },
  rankUp: {
    type: 'arpeggio',
    wave: 'sine',
    notes: [523, 659, 784, 1047],
    duration: 380,
    volume: 0.12,
  },
  internshipComplete: {
    type: 'arpeggio',
    wave: 'sine',
    notes: [440, 554, 659, 880],
    duration: 420,
    volume: 0.12,
  },
  jobOfferSuccess: {
    type: 'arpeggio',
    wave: 'sine',
    notes: [440, 554, 659, 880, 1100],
    duration: 500,
    volume: 0.14,
  },
  jobOfferFail: {
    type: 'arpeggio',
    wave: 'square',
    notes: [330, 277, 220],
    duration: 380,
    volume: 0.10,
  },
  swap: {
    type: 'sweep',
    wave: 'sine',
    from: 660,
    to: 880,
    duration: 200,
    volume: 0.08,
  },

  // ── Random events ─────────────────────────────────────────────────────
  eventSpawn: {
    type: 'beep',
    wave: 'sine',
    freq: 880,
    duration: 100,
    volume: 0.08,
  },

  // ── Burnout / wellness ────────────────────────────────────────────────
  burnoutWarning: {
    type: 'arpeggio',
    wave: 'square',
    notes: [220, 220, 220],
    duration: 550,
    volume: 0.10,
  },
  vacation: {
    type: 'sweep',
    wave: 'sine',
    from: 880,
    to: 440,
    duration: 700,
    volume: 0.10,
  },

  // ── Annual review variants ────────────────────────────────────────────
  annualReviewSuccess: {
    type: 'arpeggio',
    wave: 'sine',
    notes: [523, 784, 1047],
    duration: 320,
    volume: 0.10,
  },
  annualReviewNeutral: {
    type: 'beep',
    wave: 'sine',
    freq: 440,
    duration: 180,
    volume: 0.06,
  },
  annualReviewFailure: {
    type: 'sweep',
    wave: 'square',
    from: 220,
    to: 165,
    duration: 280,
    volume: 0.08,
  },

  // ── Upwork-specific ───────────────────────────────────────────────────
  bidWin: {
    type: 'arpeggio',
    wave: 'sine',
    notes: [659, 988],
    duration: 180,
    volume: 0.10,
  },
  bidLose: {
    type: 'beep',
    wave: 'square',
    freq: 220,
    duration: 70,
    volume: 0.05,
  },
  courseComplete: {
    type: 'arpeggio',
    wave: 'sine',
    notes: [880, 1100, 1320],
    duration: 230,
    volume: 0.10,
  },

  // ── Endgame: the big one ──────────────────────────────────────────────
  endgameReached: {
    type: 'arpeggio',
    wave: 'sine',
    notes: [523, 659, 784, 1047, 1319, 1568],
    duration: 1000,
    volume: 0.18,
  },
};
