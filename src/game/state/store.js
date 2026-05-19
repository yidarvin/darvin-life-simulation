import { create } from 'zustand';
import { initialState } from './initialState';
import { save, clear } from './persistence';
import { SHOP_ITEMS_BY_ID } from '../../data/shopItems';
import { YEAR_TRANSITIONS } from '../../data/yearTransitions';
import { canAfford } from '../../utils/currency';

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
   * Buy a shop item. Validates ownership, locked status, and affordability.
   * Returns true on success, false on failure (caller can show feedback if needed).
   *
   * Transactional: deducts cost AND applies effect in a single set() call.
   */
  buyShopItem(itemId) {
    const state = get();
    const item = SHOP_ITEMS_BY_ID[itemId];

    if (!item) {
      console.warn(`buyShopItem: unknown item id "${itemId}"`);
      return false;
    }
    if (state.shop.owned[itemId]) {
      return false;
    }
    if (item.lockedUntilInternship && state.stage === 'undergrad') {
      return false;
    }
    if (!canAfford(state.currencies, item.cost)) {
      return false;
    }

    const nextCurrencies = { ...state.currencies };
    for (const [currency, amount] of Object.entries(item.cost)) {
      nextCurrencies[currency] -= amount;
    }

    const next = {
      currencies: nextCurrencies,
      shop: {
        ...state.shop,
        owned: { ...state.shop.owned, [itemId]: true },
      },
    };
    if (item.effect.kind === 'perClick') {
      next.perClick = {
        ...state.perClick,
        [item.effect.currency]: state.perClick[item.effect.currency] + item.effect.amount,
      };
    } else if (item.effect.kind === 'perSecond') {
      next.perSecond = {
        ...state.perSecond,
        [item.effect.currency]: state.perSecond[item.effect.currency] + item.effect.amount,
      };
    }

    set(next);
    debouncedSave(get, set);
    return true;
  },

  /**
   * Attempt to advance the player to the next year.
   *
   * Returns one of:
   *   { ok: true }                                   — advanced successfully
   *   { ok: false, reason: 'requires_event', event } — needs internship / job offer (sessions 14, 15)
   *   { ok: false, reason: 'insufficient_currency' } — thresholds not met
   *   { ok: false, reason: 'no_transition' }         — somehow called from a stage with no transition
   */
  tryAdvanceYear() {
    const state = get();
    if (state.stage !== 'undergrad') {
      return { ok: false, reason: 'no_transition' };
    }
    const transition = YEAR_TRANSITIONS[state.year];
    if (!transition) {
      return { ok: false, reason: 'no_transition' };
    }
    if (transition.requiresEvent) {
      return { ok: false, reason: 'requires_event', event: transition.requiresEvent };
    }
    if (!canAfford(state.currencies, transition.threshold)) {
      return { ok: false, reason: 'insufficient_currency' };
    }

    const nextCurrencies = { ...state.currencies };
    for (const [c, amount] of Object.entries(transition.threshold)) {
      nextCurrencies[c] -= amount;
    }

    set({
      currencies: nextCurrencies,
      year: transition.nextYear,
      stage: transition.nextStage,
    });
    debouncedSave(get, set);
    return { ok: true };
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
