import { create } from 'zustand';
import { initialState } from './initialState';
import { save, clear } from './persistence';

let saveDebounceTimer = null;
const SAVE_DEBOUNCE_MS = 500;

function debouncedSave(getState, setState) {
  clearTimeout(saveDebounceTimer);
  saveDebounceTimer = setTimeout(() => {
    const result = save(getState());
    setState((s) => ({
      ui: {
        ...s.ui,
        lastSaveStatus: result.status,
        lastSaveError: result.error,
      },
    }));
  }, SAVE_DEBOUNCE_MS);
}

/**
 * Flush any pending debounced save synchronously. Call on beforeunload.
 */
export function flushSave() {
  clearTimeout(saveDebounceTimer);
  saveDebounceTimer = null;
  save(useGameStore.getState());
}

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
    debouncedSave(get, set);
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
      // No debounced save here — too noisy at 10 Hz. The periodic 5-second save
      // catches passive accumulation between user interactions.
    }
  },

  /**
   * Toggle 10x devmode.
   */
  toggleDevMode() {
    set((s) => ({
      meta: { ...s.meta, devMode: !s.meta.devMode },
    }));
    debouncedSave(get, set);
  },

  /**
   * Wipe the run and start fresh. Clears localStorage and replaces state with defaults.
   */
  reset() {
    set(clear());
  },

  /**
   * DEV-ONLY helper: set a passive rate directly. Used by the verification page in session 07
   * to test the tick loop. Real passive generation is purchased via the shop in session 12.
   */
  _setPassive(currency, rate) {
    set((s) => ({
      perSecond: { ...s.perSecond, [currency]: rate },
    }));
    debouncedSave(get, set);
  },

  /**
   * Replace the entire state. Used at load time. Bypasses debouncing.
   */
  _hydrate(loadedState) {
    set(loadedState);
  },
}));

/**
 * Periodic save — every 5 seconds, snapshot the state to catch passive accumulation
 * between user interactions. Idempotent: safe to call multiple times.
 */
let periodicSaveInstalled = false;
let periodicSaveInterval = null;

export function installPeriodicSave() {
  if (periodicSaveInstalled) return () => {};
  periodicSaveInstalled = true;
  periodicSaveInterval = setInterval(() => {
    const state = useGameStore.getState();
    const result = save(state);
    useGameStore.setState((s) => ({
      ui: {
        ...s.ui,
        lastSaveStatus: result.status,
        lastSaveError: result.error,
      },
    }));
  }, 5000);
  return () => {
    if (periodicSaveInterval) clearInterval(periodicSaveInterval);
    periodicSaveInterval = null;
    periodicSaveInstalled = false;
  };
}
