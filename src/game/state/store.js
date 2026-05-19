import { create } from 'zustand';
import { initialState } from './initialState';

/**
 * Game store. All game state lives here.
 *
 * Selector patterns:
 *   const knowledge = useGameStore((s) => s.currencies.knowledge);
 *   const click = useGameStore((s) => s.click);
 *
 * Avoid `useGameStore((s) => s)` — that subscribes to every change.
 */
export const useGameStore = create((set, get) => ({
  ...initialState(),

  /**
   * Click an action button. Adds `perClick[currency]` to that currency.
   * @param {'knowledge'|'money'|'research'|'applications'} currency
   * @returns {number} amount added (so callers can show "+N" feedback)
   */
  click(currency) {
    const amount = get().perClick[currency];
    set((s) => ({
      currencies: {
        ...s.currencies,
        [currency]: s.currencies[currency] + amount,
      },
    }));
    return amount;
  },

  /**
   * Advance time by `dtSeconds` seconds. Called by the tick loop.
   * Applies passive generation and time-based mechanics.
   * Multiplied by 10 when devMode is on.
   */
  tick(dtSeconds) {
    const s = get();
    const speed = s.meta.devMode ? 10 : 1;
    const effectiveDt = dtSeconds * speed;

    const nextCurrencies = { ...s.currencies };
    let anyChanged = false;
    for (const c of Object.keys(s.perSecond)) {
      const rate = s.perSecond[c];
      if (rate > 0) {
        nextCurrencies[c] += rate * effectiveDt;
        anyChanged = true;
      }
    }

    if (anyChanged) {
      set({ currencies: nextCurrencies });
    }

    // Time-based mechanics (burnout decay, Annual Review schedule, etc.) come in later sessions.
    // Keep this function the single chokepoint for "what happens over time".
  },

  /**
   * Toggle 10x devmode.
   */
  toggleDevMode() {
    set((s) => ({
      meta: { ...s.meta, devMode: !s.meta.devMode },
    }));
  },

  /**
   * Wipe the run and start fresh. Does not touch localStorage in this session
   * (persistence comes in session 08).
   */
  reset() {
    set(initialState());
  },

  /**
   * DEV-ONLY helper: set a passive rate directly. Used by the verification page in session 07
   * to test the tick loop. Real passive generation is purchased via the shop in session 12.
   */
  _setPassive(currency, rate) {
    set((s) => ({
      perSecond: { ...s.perSecond, [currency]: rate },
    }));
  },
}));
