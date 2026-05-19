import { create } from 'zustand';
import { initialState } from './initialState';
import { save, clear } from './persistence';
import { SHOP_ITEMS_BY_ID } from '../../data/shopItems';
import { YEAR_TRANSITIONS } from '../../data/yearTransitions';
import { pickRandomCompany } from '../../data/internshipCompanies';
import { buildEventSchedule, INTERNSHIP_EVENTS_BY_ID } from '../../data/internshipEvents';
import { copy } from '../../data/copy';
import { getTrackMultiplier } from '../../data/careerTracks';
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
    const state = get();
    const baseAmount = state.perClick[currency];
    const multiplier = getTrackMultiplier(state.career.currentTrack, currency, state.career.rank);
    const amount = baseAmount * multiplier;

    const nextCurrencies = {
      ...state.currencies,
      [currency]: state.currencies[currency] + amount,
    };

    // Internship bonus: each click also grants +1 Influence.
    if (state.stage === 'internship') {
      nextCurrencies.influence = (nextCurrencies.influence || 0) + 1;
    }

    set({ currencies: nextCurrencies });
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

    // Passive currency generation.
    const nextCurrencies = { ...s.currencies };
    let currenciesChanged = false;
    for (const c of Object.keys(s.perSecond)) {
      const rate = s.perSecond[c];
      if (rate > 0) {
        const multiplier = getTrackMultiplier(s.career.currentTrack, c, s.career.rank);
        nextCurrencies[c] += rate * effectiveDt * multiplier;
        currenciesChanged = true;
      }
    }

    // Internship progression. Time freezes while any modal is open so events don't queue up.
    let internshipPatch = null;
    let modalToOpen = null;
    let shouldComplete = false;

    if (s.internship.active && !s.internship.complete && !s.ui.activeModal) {
      const VIRTUAL_DAYS_PER_REAL_SECOND = 3;
      const nextDaysElapsed = Math.min(
        s.internship.daysTotal,
        s.internship.daysElapsed + effectiveDt * VIRTUAL_DAYS_PER_REAL_SECOND,
      );

      const fireable = s.internship.eventSchedule.find((e) => nextDaysElapsed >= e.atDay);
      if (fireable) {
        modalToOpen = { kind: 'internship_event', payload: { eventId: fireable.eventId } };
      }

      if (nextDaysElapsed >= s.internship.daysTotal) {
        shouldComplete = true;
      }

      internshipPatch = { ...s.internship, daysElapsed: nextDaysElapsed };
    }

    const patch = {};
    if (currenciesChanged) patch.currencies = nextCurrencies;
    if (internshipPatch) patch.internship = internshipPatch;
    if (modalToOpen) patch.ui = { ...s.ui, activeModal: modalToOpen };

    if (Object.keys(patch).length > 0) set(patch);

    // completeInternship reads fresh state and opens its own modal.
    if (shouldComplete) get().completeInternship();
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
   * Open a modal. Closes any currently-open modal first.
   */
  openModal(kind, payload = {}) {
    set((s) => ({
      ui: { ...s.ui, activeModal: { kind, payload } },
    }));
  },

  closeModal() {
    set((s) => ({ ui: { ...s.ui, activeModal: null } }));
  },

  /**
   * Show the internship offer modal. Called from YearProgressPanel when sophomore + thresholds met.
   */
  beginInternshipOffer() {
    const state = get();
    if (state.stage !== 'undergrad' || state.year !== 'sophomore') {
      console.warn('beginInternshipOffer: only valid from sophomore undergrad');
      return;
    }
    const company = pickRandomCompany();
    set((s) => ({
      ui: { ...s.ui, activeModal: { kind: 'internship_offer', payload: { company } } },
    }));
  },

  /**
   * Player accepted the internship. Deduct the sophomore-year cost (same as direct sophomore→junior),
   * flip stage to 'internship', initialize internship state.
   */
  acceptInternship(company) {
    const state = get();
    // Sophomore→junior threshold from YEAR_TRANSITIONS (hardcoded to avoid circular import).
    const cost = { knowledge: 250, money: 300 };

    if (!canAfford(state.currencies, cost)) {
      console.warn('acceptInternship: thresholds not met');
      return;
    }

    const nextCurrencies = { ...state.currencies };
    for (const [c, amount] of Object.entries(cost)) {
      nextCurrencies[c] -= amount;
    }

    set({
      currencies: nextCurrencies,
      stage: 'internship',
      internship: {
        active: true,
        complete: false,
        company,
        daysElapsed: 0,
        daysTotal: 90,
        eventSchedule: buildEventSchedule(),
        influenceAtStart: nextCurrencies.influence,
      },
      ui: { ...state.ui, activeModal: null },
    });
    debouncedSave(get, set);
  },

  /**
   * Player declined the internship. Stay in sophomore year; modal closes.
   */
  declineInternship() {
    set((s) => ({ ui: { ...s.ui, activeModal: null } }));
  },

  /**
   * Resolve an internship sub-event. Apply the chosen option's effect, mark the event
   * as fired (by removing from schedule), close the modal.
   */
  resolveInternshipEvent(eventId, optionIndex) {
    const event = INTERNSHIP_EVENTS_BY_ID[eventId];
    if (!event) return;
    const option = event.options[optionIndex];
    if (!option) return;

    const state = get();
    const nextCurrencies = { ...state.currencies };
    for (const [c, delta] of Object.entries(option.effect)) {
      nextCurrencies[c] = (nextCurrencies[c] || 0) + delta;
    }

    const nextSchedule = state.internship.eventSchedule.filter((e) => e.eventId !== eventId);

    set({
      currencies: nextCurrencies,
      internship: { ...state.internship, eventSchedule: nextSchedule },
      ui: { ...state.ui, activeModal: null },
    });
    debouncedSave(get, set);
  },

  /**
   * Internship timer hit 90 days. Open the results modal.
   */
  completeInternship() {
    const state = get();
    const influenceEarned = state.currencies.influence - state.internship.influenceAtStart;
    const threshold = copy.modals.internshipResults.returnOfferThreshold;
    const success = influenceEarned >= threshold;

    set((s) => ({
      internship: { ...s.internship, active: false, complete: true },
      ui: {
        ...s.ui,
        activeModal: {
          kind: 'internship_results',
          payload: { success, influenceEarned },
        },
      },
    }));
  },

  /**
   * After viewing results, transition to junior year. If successful, apply the return-offer bonus.
   */
  finishInternship() {
    const state = get();
    const influenceEarned = state.currencies.influence - state.internship.influenceAtStart;
    const success = influenceEarned >= copy.modals.internshipResults.returnOfferThreshold;
    const bonus = success ? copy.modals.internshipResults.returnOfferBonus : {};

    const nextCurrencies = { ...state.currencies };
    for (const [c, delta] of Object.entries(bonus)) {
      nextCurrencies[c] = (nextCurrencies[c] || 0) + delta;
    }

    set({
      currencies: nextCurrencies,
      stage: 'undergrad',
      year: 'junior',
      internship: {
        active: false,
        complete: false,
        company: null,
        daysElapsed: 0,
        daysTotal: 90,
        eventSchedule: [],
        influenceAtStart: 0,
        gotReturnOffer: success,
      },
      ui: { ...state.ui, activeModal: null },
    });
    debouncedSave(get, set);
  },

  /**
   * Begin the senior-year job offer flow. Scores the player's prep and decides outcome.
   */
  beginJobOffer() {
    const state = get();
    if (state.stage !== 'undergrad' || state.year !== 'senior') {
      console.warn('beginJobOffer: only valid from senior undergrad');
      return;
    }

    const cost = { knowledge: 1000, money: 1500, research: 50, applications: 10 };
    if (!canAfford(state.currencies, cost)) {
      console.warn('beginJobOffer: thresholds not met');
      return;
    }

    const nextCurrencies = { ...state.currencies };
    for (const [c, amount] of Object.entries(cost)) {
      nextCurrencies[c] -= amount;
    }

    const weights = copy.modals.jobOfferResults.scoringWeights;
    const applicationsAtStart = state.currencies.applications;
    const influence = state.currencies.influence;
    const knowledge = state.currencies.knowledge;
    const hasReturnOffer = state.internship.gotReturnOffer;
    const score = Math.floor(
      applicationsAtStart * weights.applications
        + influence * weights.influence
        + knowledge * weights.knowledge
        + (hasReturnOffer ? weights.returnOffer : 0),
    );
    const success = score >= copy.modals.jobOfferResults.scoringThreshold;

    set({
      currencies: nextCurrencies,
      ui: {
        ...state.ui,
        activeModal: {
          kind: 'job_offer_results',
          payload: {
            success,
            score,
            applicationsSubmitted: applicationsAtStart,
            influenceAccumulated: influence,
          },
        },
      },
    });
    debouncedSave(get, set);
  },

  /**
   * Player accepted a track from the success modal. Set up career state.
   *
   * @param {'faang' | 'startup' | 'phd'} trackId
   */
  chooseTrack(trackId) {
    if (!['faang', 'startup', 'phd'].includes(trackId)) {
      console.warn('chooseTrack: invalid track', trackId);
      return;
    }
    const state = get();
    set({
      stage: 'career',
      year: null,
      career: {
        ...state.career,
        currentTrack: trackId,
        rank: 1,
      },
      ui: { ...state.ui, activeModal: null },
    });
    debouncedSave(get, set);
  },

  /**
   * Player failed the job-offer event. Forced into Upwork — no 5-dialogue gauntlet
   * (that's for voluntary entry only).
   */
  forceUpwork() {
    const state = get();
    set({
      stage: 'career',
      year: null,
      career: {
        ...state.career,
        currentTrack: 'upwork',
        rank: 1,
      },
      upwork: {
        ...state.upwork,
        connects: 40,
        jss: 100,
        platformTaxLifetime: 0,
        courseSales: 0,
        connectsLastRegen: Date.now(),
      },
      ui: { ...state.ui, activeModal: null },
    });
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
