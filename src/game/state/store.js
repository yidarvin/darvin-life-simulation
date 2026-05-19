import { create } from 'zustand';
import { initialState } from './initialState';
import { save, clear } from './persistence';
import { SHOP_ITEMS_BY_ID } from '../../data/shopItems';
import { YEAR_TRANSITIONS } from '../../data/yearTransitions';
import { pickRandomCompany } from '../../data/internshipCompanies';
import { buildEventSchedule, INTERNSHIP_EVENTS_BY_ID } from '../../data/internshipEvents';
import { copy } from '../../data/copy';
import { CAREER_TRACKS, getTrackMultiplier } from '../../data/careerTracks';
import { getRankUpCost } from '../../data/rankUpCosts';
import { getSwapCost, getTargetRank } from '../../data/swapTopology';
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
   * Attempt to advance to the next rank on the current career track.
   *
   * Returns:
   *   { ok: true, newRank, cost, rankLabel, flavor }       — advanced
   *   { ok: false, reason: 'no_track' }                    — not in a career
   *   { ok: false, reason: 'max_rank' }                    — already rank 7
   *   { ok: false, reason: 'insufficient_currency', cost } — can't afford
   */
  tryRankUp() {
    const state = get();
    if (state.stage !== 'career' || !state.career.currentTrack) {
      return { ok: false, reason: 'no_track' };
    }
    const track = state.career.currentTrack;
    const currentRank = state.career.rank;
    const cost = getRankUpCost(track, currentRank);
    if (!cost) {
      return { ok: false, reason: 'max_rank' };
    }
    if (!canAfford(state.currencies, cost)) {
      return { ok: false, reason: 'insufficient_currency', cost };
    }

    const nextCurrencies = { ...state.currencies };
    for (const [c, amount] of Object.entries(cost)) {
      nextCurrencies[c] -= amount;
    }
    const newRank = currentRank + 1;
    const trackData = CAREER_TRACKS[track];

    set({
      currencies: nextCurrencies,
      career: { ...state.career, rank: newRank },
      ui: {
        ...state.ui,
        activeModal: {
          kind: 'rank_up',
          payload: {
            rankLabel: trackData.rankLabels[newRank],
            flavor: trackData.rankFlavor[newRank],
            cost,
          },
        },
      },
    });
    debouncedSave(get, set);
    return { ok: true, newRank, cost, rankLabel: trackData.rankLabels[newRank], flavor: trackData.rankFlavor[newRank] };
  },

  /**
   * Start a swap flow. Validates the target, looks up cost, opens the appropriate modal:
   *   - For voluntary Upwork: opens the 5-step gauntlet
   *   - For other tracks: opens the simple swap_confirm modal
   *
   * @param {'faang'|'startup'|'phd'|'upwork'} targetTrack
   * @returns { ok: true } | { ok: false, reason }
   */
  trySwap(targetTrack) {
    const state = get();
    if (state.stage !== 'career' || !state.career.currentTrack) {
      return { ok: false, reason: 'not_in_career' };
    }
    if (state.career.currentTrack === targetTrack) {
      return { ok: false, reason: 'same_track' };
    }
    const swapCost = getSwapCost(state.career.currentTrack, targetTrack);
    if (swapCost === null) {
      return { ok: false, reason: 'invalid_target' };
    }
    const targetRank = getTargetRank(state.career.rank, swapCost);

    const fromTrackData = CAREER_TRACKS[state.career.currentTrack];
    const toTrackData = CAREER_TRACKS[targetTrack];
    const payload = {
      fromTrack: state.career.currentTrack,
      targetTrack,
      swapCost,
      targetRank,
      currentTrackLabel: fromTrackData.label,
      currentRankLabel: fromTrackData.rankLabels[state.career.rank],
      targetTrackLabel: toTrackData.label,
      targetRankLabel: toTrackData.rankLabels[targetRank],
    };

    const kind = targetTrack === 'upwork' ? 'upwork_gauntlet' : 'swap_confirm';
    const initialPayload = targetTrack === 'upwork' ? { ...payload, step: 1 } : payload;

    set((s) => ({
      ui: { ...s.ui, activeModal: { kind, payload: initialPayload } },
    }));
    return { ok: true };
  },

  /**
   * Advance the gauntlet to the next step, or commit on step 5.
   * Called from the gauntlet modal's Continue button.
   */
  advanceGauntlet() {
    const state = get();
    const modal = state.ui.activeModal;
    if (!modal || modal.kind !== 'upwork_gauntlet') return;

    const nextStep = modal.payload.step + 1;
    if (nextStep > 5) {
      get().confirmSwap(modal.payload.targetTrack, modal.payload.targetRank);
      return;
    }

    set((s) => ({
      ui: {
        ...s.ui,
        activeModal: { kind: 'upwork_gauntlet', payload: { ...modal.payload, step: nextStep } },
      },
    }));
  },

  /**
   * Cancel the gauntlet (or any swap modal). Closes the modal without state change.
   */
  cancelSwap() {
    set((s) => ({ ui: { ...s.ui, activeModal: null } }));
  },

  /**
   * Commit a swap. Resets specialization, hires, teams, influence allocation.
   * Logs to swapHistory. For Upwork, resets connects + JSS to starting values
   * (but preserves cumulative tax + course sales).
   */
  confirmSwap(targetTrack, targetRank) {
    const state = get();
    const isUpwork = targetTrack === 'upwork';

    const nextCareer = {
      currentTrack: targetTrack,
      rank: targetRank,
      specialization: null,
      hires: [],
      teams: [],
      influenceAllocation: { knowledge: 0, money: 0, research: 0 },
      swapHistory: [
        ...state.career.swapHistory,
        {
          from: state.career.currentTrack,
          to: targetTrack,
          atTimestamp: Date.now(),
          rankBefore: state.career.rank,
          rankAfter: targetRank,
        },
      ],
    };

    const patch = {
      career: nextCareer,
      ui: { ...state.ui, activeModal: null },
    };

    if (isUpwork) {
      patch.upwork = {
        ...state.upwork,
        connects: 40,
        jss: 100,
        connectsLastRegen: Date.now(),
      };
    }

    set(patch);
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
