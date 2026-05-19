import { create } from 'zustand';
import { initialState } from './initialState';
import { save, clear } from './persistence';
import { SHOP_ITEMS_BY_ID } from '../../data/shopItems';
import { YEAR_TRANSITIONS } from '../../data/yearTransitions';
import { pickRandomCompany } from '../../data/internshipCompanies';
import { buildEventSchedule, INTERNSHIP_EVENTS_BY_ID } from '../../data/internshipEvents';
import { copy } from '../../data/copy';
import {
  CAREER_TRACKS,
  getEffectiveMultiplier,
  getEffectiveClickAmount,
  getEffectivePerSecond,
  applyRankUpEquityVest,
  STARTUP_FOUNDER_GRANT,
} from '../../data/careerTracks';
import { SPECIALIZATIONS } from '../../data/specializations';
import { getRankUpCost } from '../../data/rankUpCosts';
import { getSwapCost, getTargetRank, canAffordSwap, getSwapApplicationsCost } from '../../data/swapTopology';
import { EVENTS_BY_ID, pickEligibleEvent, nextEventDelayMs } from '../../data/events';
import {
  createHire,
  createPoachedHire,
  getHireCost,
  getHiresCap,
  getLevelUpCost,
  getPoachCost,
  MAX_HIRE_LEVEL,
} from '../../data/hires';
import { canAfford, getSpendableCurrencies } from '../../utils/currency';
import { getHireTeamMultiplier, newTeamId, MAX_TEAMS, MAX_TEAM_SIZE } from '../../utils/teams';
import {
  FAANG_INITIATIVES,
  PHD_ENDOWMENTS,
  UPWORK_COURSES,
  getCurrentExitPrice,
} from '../../data/endgameMechanics';
import {
  splitTax,
  CONNECT_BUNDLES,
  CONNECTS_CAP,
  getGigBidCost,
  rollGigOutcome,
} from '../../utils/upworkTax';
import {
  BURNOUT_BURNED,
  BURNOUT_COLLAPSE,
  BURNOUT_PER_CLICK,
  BURNOUT_DECAY_PER_SEC,
  VACATION_COST,
  VACATION_CLEAR,
  nextCollapsed,
} from '../../utils/burnout';

// Annual performance review disabled.
// /**
//  * Compare current "dominant" currency vs last review snapshot. Returns
//  * 'success' | 'neutral' | 'failure' based on copy.modals.annualReview thresholds.
//  */
// function computeReviewOutcome(current, snapshot) {
//   const dominantKey = Object.entries(current).reduce(
//     (best, [k, v]) => (v > best.v ? { k, v } : best),
//     { k: null, v: -Infinity },
//   ).k;
//   if (!dominantKey) return 'neutral';
//
//   const baseline = snapshot[dominantKey] ?? 0;
//   if (baseline <= 0) return 'success';
//   const growth = (current[dominantKey] - baseline) / baseline;
//
//   const tSuccess = copy.modals.annualReview.thresholdSuccess;
//   const tNeutral = copy.modals.annualReview.thresholdNeutral;
//   if (growth >= tSuccess) return 'success';
//   if (growth >= tNeutral) return 'neutral';
//   return 'failure';
// }

// Currencies that can accumulate passively via shop items or endowments.
// Influence and Equity are included so future bonuses can target them; current
// data has no perSecond contributors for those, so the loop skips them cheaply.
const PASSIVE_CURRENCIES = ['knowledge', 'money', 'research', 'applications', 'influence', 'equity'];

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
   * Click an action button. Adds the effective amount for that currency.
   * Effective amount = (BASE_RATES[phase][currency] + sum of shop perClick bonuses) × multiplier.
   * Devmode multiplies the resulting amount by 10 (matches the tick-loop devmode speed).
   * @param {'knowledge'|'money'|'research'|'applications'} currency
   * @returns {number} amount added (so callers can show "+N" feedback)
   */
  click(currency) {
    const state = get();
    const clickMultiplier = state.meta.devMode ? 10 : 1;
    const grossAmount = getEffectiveClickAmount(state, currency) * clickMultiplier;

    const nextCurrencies = { ...state.currencies };
    let nextUpwork = state.upwork;
    let returnedAmount = grossAmount;

    if (currency === 'money') {
      const isUpwork = state.career.currentTrack === 'upwork';
      const { net, tax } = splitTax(grossAmount, isUpwork);
      nextCurrencies.money = state.currencies.money + net;
      if (tax > 0) {
        nextUpwork = {
          ...state.upwork,
          platformTaxLifetime: state.upwork.platformTaxLifetime + tax,
        };
      }
      returnedAmount = net;
    } else {
      nextCurrencies[currency] = state.currencies[currency] + grossAmount;
    }

    if (state.stage === 'internship') {
      nextCurrencies.influence = (nextCurrencies.influence || 0) + clickMultiplier;
    }

    // Burnout is a post-internship mechanic — the BurnoutPanel and vacation
    // modal only exist in career/internship, so undergrad would otherwise
    // accumulate burnout silently and latch into collapse with no way to recover.
    const burnoutActive = state.stage === 'career' || state.stage === 'internship';
    const nextBurnout = burnoutActive
      ? Math.min(BURNOUT_COLLAPSE, state.burnout + BURNOUT_PER_CLICK)
      : state.burnout;
    const nextCollapsedFlag = nextCollapsed(state.collapsed, nextBurnout);

    set({
      currencies: nextCurrencies,
      upwork: nextUpwork,
      burnout: nextBurnout,
      collapsed: nextCollapsedFlag,
    });
    debouncedSave(get, set);
    return returnedAmount;
  },

  /**
   * Advance time by `dtSeconds` seconds. Called by the tick loop.
   * Applies passive generation and time-based mechanics.
   * Multiplied by 10 when devMode is on.
   *
   * @param {number} dtSeconds
   * @param {{silent?: boolean}} [options] - When silent, suppress modal triggers
   *   (random events, vacation warning, internship sub-events, internship completion).
   *   World still advances. Used by offline catch-up so hours of queued modals
   *   don't dogpile when the player returns.
   */
  tick(dtSeconds, options = {}) {
    const { silent = false } = options;
    const s = get();
    const speed = s.meta.devMode ? 10 : 1;
    const effectiveDt = dtSeconds * speed;
    const isUpwork = s.career.currentTrack === 'upwork';

    // 1. Passive currency generation. Money accumulates separately so we can
    // apply the Upwork platform tax in one shot after summing all sources.
    const nextCurrencies = { ...s.currencies };
    let currenciesChanged = false;
    let grossTaxableMoney = 0;

    // Effective per-second amounts pull from shop.owned and career.phdEndowments
    // — already multiplier-applied by the helper.
    for (const c of PASSIVE_CURRENCIES) {
      const earnedPerSec = getEffectivePerSecond(s, c);
      if (earnedPerSec <= 0) continue;
      const earned = earnedPerSec * effectiveDt;
      if (c === 'money') {
        grossTaxableMoney += earned;
      } else {
        nextCurrencies[c] = (nextCurrencies[c] ?? 0) + earned;
      }
      currenciesChanged = true;
    }

    // Hire passive generation (rank 4+), with team bonus (rank 6+).
    if (s.stage === 'career' && s.career.hires.length > 0) {
      for (const hire of s.career.hires) {
        const teamMult = getHireTeamMultiplier(s.career.teams, hire.id);
        for (const [c, rate] of Object.entries(hire.rates)) {
          const multiplier = getEffectiveMultiplier(s, c);
          const earned = rate * hire.level * teamMult * effectiveDt * multiplier;
          if (c === 'money') {
            grossTaxableMoney += earned;
          } else {
            nextCurrencies[c] = (nextCurrencies[c] || 0) + earned;
          }
          currenciesChanged = true;
        }
      }
    }

    // Apply Upwork tax to all gross Money accumulated above.
    let upworkPatch = null;
    if (grossTaxableMoney > 0) {
      const { net, tax } = splitTax(grossTaxableMoney, isUpwork);
      nextCurrencies.money = (nextCurrencies.money || 0) + net;
      if (tax > 0) {
        upworkPatch = {
          ...s.upwork,
          platformTaxLifetime: s.upwork.platformTaxLifetime + tax,
        };
      }
    }

    // 2. Internship progression. Time freezes while any modal is open so events don't queue up.
    let internshipPatch = null;
    let internshipModal = null;
    let shouldCompleteInternship = false;

    if (s.internship.active && !s.internship.complete && !s.ui.activeModal) {
      const VIRTUAL_DAYS_PER_REAL_SECOND = 3;
      const nextDaysElapsed = Math.min(
        s.internship.daysTotal,
        s.internship.daysElapsed + effectiveDt * VIRTUAL_DAYS_PER_REAL_SECOND,
      );

      if (!silent) {
        const fireable = s.internship.eventSchedule.find((e) => nextDaysElapsed >= e.atDay);
        if (fireable) {
          internshipModal = { kind: 'internship_event', payload: { eventId: fireable.eventId } };
        }

        if (nextDaysElapsed >= s.internship.daysTotal) {
          shouldCompleteInternship = true;
        }
      }

      internshipPatch = { ...s.internship, daysElapsed: nextDaysElapsed };
    }

    // 3. Wellness scheduling — vacation warning (one-shot per high-burnout episode)
    //    and annual performance review (periodic). Both gated to career stage.
    let vacationModal = null;
    let burnoutFlagPatch = null;
    const isHighBurnout = s.burnout >= BURNOUT_BURNED;
    if (!silent && s.stage === 'career' && isHighBurnout && !s.ui.activeModal && !s.ui.burnoutModalShown) {
      vacationModal = { kind: 'vacation_warning' };
    } else if (!isHighBurnout && s.ui.burnoutModalShown) {
      burnoutFlagPatch = { burnoutModalShown: false };
    }

    // Annual performance review disabled — kept as null so downstream refs remain harmless.
    const annualReviewModal = null;
    const annualReviewPatch = null;
    // const REVIEW_INTERVAL_MS = s.meta.devMode ? 9000 : 90000;
    // if (s.stage === 'career' && !s.ui.activeModal && !vacationModal) {
    //   const last = s.annualReview.lastFiredAt;
    //   if (!last || Date.now() - last >= REVIEW_INTERVAL_MS) {
    //     const outcome = computeReviewOutcome(s.currencies, s.annualReview.snapshotsByCurrency);
    //     annualReviewPatch = {
    //       lastFiredAt: Date.now(),
    //       snapshotsByCurrency: { ...s.currencies },
    //     };
    //     annualReviewModal = { kind: 'annual_review', payload: { outcome } };
    //   }
    // }

    // 4. Random events (career stage, rank >= 2). Poisson-distributed inter-arrival.
    //    Defers to wellness modals so an event doesn't consume a bank slot while blocked.
    let eventsPatch = null;
    let randomEventModal = null;

    const inCareer = s.stage === 'career' && s.career.currentTrack !== null;
    if (!silent && inCareer && s.career.rank >= 2) {
      if (!s.events.enabled) {
        // Auto-activate the event system on first eligible tick.
        eventsPatch = {
          ...s.events,
          enabled: true,
          nextEventAt: Date.now() + nextEventDelayMs(s.meta.devMode),
        };
      } else if (
        !s.ui.activeModal
        && !vacationModal
        && !annualReviewModal
        && Date.now() >= (s.events.nextEventAt ?? 0)
      ) {
        const eligible = pickEligibleEvent(s);
        eventsPatch = { ...s.events };
        if (eligible) {
          eventsPatch.firedEventIds = [...s.events.firedEventIds, eligible.id];
          randomEventModal = { kind: 'random_event', payload: { eventId: eligible.id } };
        }
        // Always reschedule so an exhausted bank doesn't leave nextEventAt in the past.
        eventsPatch.nextEventAt = Date.now() + nextEventDelayMs(s.meta.devMode);
      }
    }

    // Upwork active course (rank 7+ Upwork endgame). TAX-FREE money generation —
    // added to nextCurrencies.money AFTER the tax loop above so it bypasses the 10%.
    if (s.stage === 'career' && s.upwork.activeCourse) {
      const courseData = UPWORK_COURSES.find((c) => c.id === s.upwork.activeCourse.courseId);
      if (courseData) {
        const elapsedSec = (Date.now() - s.upwork.activeCourse.startedAt) / 1000;
        if (elapsedSec >= courseData.durationSec) {
          upworkPatch = { ...(upworkPatch ?? s.upwork), activeCourse: null };
        } else {
          const earningsThisTick = courseData.moneyRate * effectiveDt;
          nextCurrencies.money = (nextCurrencies.money || 0) + earningsThisTick;
          currenciesChanged = true;
          const base = upworkPatch ?? s.upwork;
          upworkPatch = {
            ...base,
            courseSales: base.courseSales + earningsThisTick,
            activeCourse: {
              ...s.upwork.activeCourse,
              totalEarned: s.upwork.activeCourse.totalEarned + earningsThisTick,
            },
          };
        }
      }
    }

    // Connects regen — Upwork only, +1/sec up to the cap.
    if (isUpwork && s.upwork.connects < CONNECTS_CAP) {
      const base = upworkPatch ?? s.upwork;
      const newConnects = Math.min(CONNECTS_CAP, base.connects + effectiveDt);
      upworkPatch = { ...base, connects: newConnects };
    }

    // Passive burnout decay — recovery while not actively clicking.
    const decayedBurnout = Math.max(0, s.burnout - BURNOUT_DECAY_PER_SEC * effectiveDt);
    const decayedCollapsedFlag = nextCollapsed(s.collapsed, decayedBurnout);

    // 5. Compose single set() call.
    const patch = {};
    if (currenciesChanged) patch.currencies = nextCurrencies;
    if (decayedBurnout !== s.burnout) patch.burnout = decayedBurnout;
    if (decayedCollapsedFlag !== s.collapsed) patch.collapsed = decayedCollapsedFlag;
    if (internshipPatch) patch.internship = internshipPatch;
    if (eventsPatch) patch.events = eventsPatch;
    if (upworkPatch) patch.upwork = upworkPatch;
    if (annualReviewPatch) patch.annualReview = annualReviewPatch;

    // Modal precedence: internship event > vacation warning > annual review > random event.
    // Internship and the career-stage modals are mutually exclusive by stage; the
    // career-stage trio is ordered by salience (burnout first, then performance).
    const modalToOpen = internshipModal || vacationModal || annualReviewModal || randomEventModal;
    if (modalToOpen) {
      patch.ui = { ...s.ui, activeModal: modalToOpen };
    }
    if (burnoutFlagPatch) {
      patch.ui = { ...(patch.ui ?? s.ui), ...burnoutFlagPatch };
    }

    if (Object.keys(patch).length > 0) set(patch);

    // completeInternship reads fresh state and opens its own modal.
    if (shouldCompleteInternship) get().completeInternship();
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
   * Buy a shop item. Validates ownership, locked status, and affordability.
   * Returns true on success, false on failure (caller can show feedback if needed).
   *
   * Effect is no longer materialized into state — owning the item is the only
   * change. getEffectiveClickAmount / getEffectivePerSecond read shop.owned to
   * compute contributions on demand.
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
    if (
      item.lockedUntilInternship &&
      state.stage === 'undergrad' &&
      (state.year === 'freshman' || state.year === 'sophomore')
    ) {
      return false;
    }
    if (item.requiresTrack && state.career?.currentTrack !== item.requiresTrack) {
      return false;
    }
    // Instant items grant a lump sum on purchase, so the rank gate must also block
    // the buy — there's no deferred bonus to wait for like perClick / perSecond items.
    if (item.effect.kind === 'instant' && item.requiresRank && (state.career?.rank ?? 0) < item.requiresRank) {
      return false;
    }
    if (!canAfford(getSpendableCurrencies(state), item.cost)) {
      return false;
    }

    const nextCurrencies = { ...state.currencies };
    for (const [currency, amount] of Object.entries(item.cost)) {
      nextCurrencies[currency] -= amount;
    }
    if (item.effect.kind === 'instant') {
      const c = item.effect.currency;
      nextCurrencies[c] = (nextCurrencies[c] ?? 0) + item.effect.amount;
    }

    set({
      currencies: nextCurrencies,
      shop: {
        ...state.shop,
        owned: { ...state.shop.owned, [itemId]: true },
      },
    });
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
    if (!canAfford(getSpendableCurrencies(state), transition.threshold)) {
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

    if (!canAfford(getSpendableCurrencies(state), cost)) {
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
   * Resolve a random event. Apply the chosen option's effect, close the modal.
   * Burnout is a top-level field, not a currency — separated here from the currencies patch.
   */
  resolveRandomEvent(eventId, optionIndex) {
    const event = EVENTS_BY_ID[eventId];
    if (!event) return;
    const option = event.options[optionIndex];
    if (!option) return;

    const state = get();
    const isUpwork = state.career.currentTrack === 'upwork';
    const nextCurrencies = { ...state.currencies };
    let nextBurnout = state.burnout;
    let nextUpwork = state.upwork;

    for (const [c, delta] of Object.entries(option.effect || {})) {
      if (c === 'burnout') {
        nextBurnout = Math.max(0, Math.min(100, nextBurnout + delta));
      } else if (c === 'money' && delta > 0) {
        const { net, tax } = splitTax(delta, isUpwork);
        nextCurrencies.money = (nextCurrencies.money || 0) + net;
        if (tax > 0) {
          nextUpwork = {
            ...nextUpwork,
            platformTaxLifetime: nextUpwork.platformTaxLifetime + tax,
          };
        }
      } else {
        nextCurrencies[c] = (nextCurrencies[c] || 0) + delta;
      }
    }

    set({
      currencies: nextCurrencies,
      burnout: nextBurnout,
      collapsed: nextCollapsed(state.collapsed, nextBurnout),
      upwork: nextUpwork,
      ui: { ...state.ui, activeModal: null },
    });
    debouncedSave(get, set);
  },

  /**
   * Pay $1,000 to clear 50 burnout. Closes the warning modal.
   */
  takeVacation() {
    const state = get();
    if (state.currencies.money < VACATION_COST) {
      return { ok: false, reason: 'insufficient_money' };
    }
    const postBurnout = Math.max(0, state.burnout - VACATION_CLEAR);
    set({
      currencies: { ...state.currencies, money: state.currencies.money - VACATION_COST },
      burnout: postBurnout,
      collapsed: nextCollapsed(state.collapsed, postBurnout),
      ui: { ...state.ui, activeModal: null },
    });
    debouncedSave(get, set);
    return { ok: true };
  },

  /**
   * Dismiss the vacation warning. Sets the one-shot flag so it won't immediately re-trigger.
   */
  skipVacation() {
    set((s) => ({ ui: { ...s.ui, activeModal: null, burnoutModalShown: true } }));
  },

  // Annual performance review disabled.
  // /**
  //  * Acknowledge the annual review. Applies bonus if any, closes modal.
  //  */
  // dismissAnnualReview() {
  //   const state = get();
  //   const modal = state.ui.activeModal;
  //   if (!modal || modal.kind !== 'annual_review') return;
  //
  //   const { outcome } = modal.payload;
  //   const bonus = outcome === 'success'
  //     ? copy.modals.annualReview.bonusSuccess
  //     : outcome === 'neutral'
  //       ? copy.modals.annualReview.bonusNeutral
  //       : {};
  //
  //   const nextCurrencies = { ...state.currencies };
  //   for (const [c, amt] of Object.entries(bonus || {})) {
  //     nextCurrencies[c] = (nextCurrencies[c] || 0) + amt;
  //   }
  //
  //   set({
  //     currencies: nextCurrencies,
  //     ui: { ...state.ui, activeModal: null },
  //   });
  //   debouncedSave(get, set);
  // },

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
   *
   * IMPORTANT: cost is NOT deducted here. It rides along the modal chain as
   * `pendingCost` and is finally charged in chooseTrack/forceUpwork. This keeps
   * the flow recoverable — if the player reloads mid-modal, transient ui state
   * resets and currencies are untouched, so they can re-trigger from the panel.
   */
  beginJobOffer() {
    const state = get();
    if (state.stage !== 'undergrad' || state.year !== 'senior') {
      console.warn('beginJobOffer: only valid from senior undergrad');
      return;
    }

    const cost = { knowledge: 1000, money: 1500, research: 50, applications: 10 };
    if (!canAfford(getSpendableCurrencies(state), cost)) {
      console.warn('beginJobOffer: thresholds not met');
      return;
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
      ui: {
        ...state.ui,
        activeModal: {
          kind: 'job_offer_results',
          payload: {
            success,
            score,
            applicationsSubmitted: applicationsAtStart,
            influenceAccumulated: influence,
            pendingCost: cost,
          },
        },
      },
    });
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
    const pendingCost = state.ui.activeModal?.payload?.pendingCost;

    const nextCurrencies = { ...state.currencies };
    if (pendingCost) {
      for (const [c, amount] of Object.entries(pendingCost)) {
        nextCurrencies[c] = (nextCurrencies[c] ?? 0) - amount;
      }
    }

    if (trackId === 'startup') {
      nextCurrencies.equity = (nextCurrencies.equity ?? 0) + STARTUP_FOUNDER_GRANT;
    }

    set({
      currencies: nextCurrencies,
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
   * Pick a specialization for the current track. One-time per track entry.
   *
   * @param {string} specId - the specialization id (e.g., 'backend', 'theory')
   */
  chooseSpecialization(specId) {
    const state = get();
    if (state.stage !== 'career' || !state.career.currentTrack) {
      console.warn('chooseSpecialization: not in career stage');
      return;
    }
    if (state.career.specialization) {
      console.warn('chooseSpecialization: already chosen this run');
      return;
    }
    const validIds = (SPECIALIZATIONS[state.career.currentTrack] || []).map((s) => s.id);
    if (!validIds.includes(specId)) {
      console.warn(`chooseSpecialization: invalid spec "${specId}" for track ${state.career.currentTrack}`);
      return;
    }

    set({
      career: { ...state.career, specialization: { id: specId } },
    });
    debouncedSave(get, set);
  },

  /**
   * Player failed the job-offer event. Forced into Upwork — no 5-dialogue gauntlet
   * (that's for voluntary entry only).
   */
  forceUpwork() {
    const state = get();
    const pendingCost = state.ui.activeModal?.payload?.pendingCost;

    const nextCurrencies = { ...state.currencies };
    if (pendingCost) {
      for (const [c, amount] of Object.entries(pendingCost)) {
        nextCurrencies[c] = (nextCurrencies[c] ?? 0) - amount;
      }
    }

    set({
      currencies: nextCurrencies,
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
    if (!canAfford(getSpendableCurrencies(state), cost)) {
      return { ok: false, reason: 'insufficient_currency', cost };
    }

    const nextCurrencies = { ...state.currencies };
    for (const [c, amount] of Object.entries(cost)) {
      nextCurrencies[c] -= amount;
    }
    const newRank = currentRank + 1;
    const trackData = CAREER_TRACKS[track];

    nextCurrencies.equity = applyRankUpEquityVest(
      track,
      newRank,
      nextCurrencies.equity ?? 0,
      cost.money ?? 0,
    );

    const isFirstEndgameForTrack =
      newRank === 7 && !state.endgames.reached.some((e) => e.track === track);
    const nextEndgames = isFirstEndgameForTrack
      ? {
          ...state.endgames,
          reached: [...state.endgames.reached, { track, achievedAt: Date.now() }],
        }
      : state.endgames;

    set({
      currencies: nextCurrencies,
      career: { ...state.career, rank: newRank },
      endgames: nextEndgames,
      ui: {
        ...state.ui,
        activeModal: {
          kind: 'rank_up',
          payload: {
            rankLabel: trackData.rankLabels[newRank],
            flavor: trackData.rankFlavor[newRank],
            cost,
            isEndgame: isFirstEndgameForTrack,
            track,
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
    if (!canAffordSwap(state.career.rank, swapCost)) {
      return { ok: false, reason: 'rank_too_low' };
    }
    const applicationsCost = getSwapApplicationsCost(state.career.rank, swapCost);
    if ((state.currencies.applications ?? 0) < applicationsCost) {
      return { ok: false, reason: 'not_enough_applications' };
    }
    const targetRank = getTargetRank(state.career.rank, swapCost);

    const fromTrackData = CAREER_TRACKS[state.career.currentTrack];
    const toTrackData = CAREER_TRACKS[targetTrack];
    const payload = {
      fromTrack: state.career.currentTrack,
      targetTrack,
      swapCost,
      applicationsCost,
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

    const swapCost = getSwapCost(state.career.currentTrack, targetTrack);
    const applicationsCost = swapCost === null
      ? 0
      : getSwapApplicationsCost(state.career.rank, swapCost);
    if ((state.currencies.applications ?? 0) < applicationsCost) {
      console.warn('confirmSwap: insufficient applications, aborting');
      return;
    }

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

    const nextCurrencies = {
      ...state.currencies,
      applications: (state.currencies.applications ?? 0) - applicationsCost,
    };
    if (targetTrack === 'startup' && targetRank === 1) {
      nextCurrencies.equity = (state.currencies.equity ?? 0) + STARTUP_FOUNDER_GRANT;
    }

    const patch = {
      career: nextCareer,
      currencies: nextCurrencies,
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
   * Set the Influence allocation. Validates non-negative values and total ≤ current Influence
   * (allows over-allocation up to total Influence; rejects beyond).
   *
   * @param {{knowledge?: number, money?: number, research?: number}} allocation
   */
  setInfluenceAllocation(allocation) {
    const state = get();
    if (state.stage !== 'career' || state.career.rank < 3) {
      console.warn('setInfluenceAllocation: requires career rank 3+');
      return;
    }

    const knowledge = Math.max(0, allocation.knowledge ?? state.career.influenceAllocation.knowledge);
    const money = Math.max(0, allocation.money ?? state.career.influenceAllocation.money);
    const research = Math.max(0, allocation.research ?? state.career.influenceAllocation.research);
    const total = knowledge + money + research;

    if (total > state.currencies.influence) {
      console.warn(
        `setInfluenceAllocation: total ${total} exceeds current Influence ${state.currencies.influence}`,
      );
      return;
    }

    set({
      career: {
        ...state.career,
        influenceAllocation: { knowledge, money, research },
      },
    });
    debouncedSave(get, set);
  },

  /**
   * Hire a random new team member for the current career track.
   * Validates rank-4+, hire cap, and currency cost.
   *
   * @returns { ok: true, hire } | { ok: false, reason }
   */
  hireSomeone(teamId = null) {
    const state = get();
    if (state.stage !== 'career' || !state.career.currentTrack) {
      return { ok: false, reason: 'not_in_career' };
    }
    if (state.career.rank < 4) {
      return { ok: false, reason: 'rank_locked' };
    }
    const cap = getHiresCap(state.career.rank);
    if (state.career.hires.length >= cap) {
      return { ok: false, reason: 'cap_reached', cap };
    }
    const targetTeam = teamId ? state.career.teams.find((t) => t.id === teamId) : null;
    if (teamId && !targetTeam) {
      return { ok: false, reason: 'team_not_found' };
    }
    if (targetTeam && (targetTeam.memberHireIds || []).length >= MAX_TEAM_SIZE) {
      return { ok: false, reason: 'team_full' };
    }
    const cost = getHireCost(state.career.currentTrack, state.career.hires.length);
    if (!canAfford(getSpendableCurrencies(state), cost)) {
      return { ok: false, reason: 'insufficient_currency', cost };
    }

    const hire = createHire(state.career.currentTrack);
    const nextCurrencies = { ...state.currencies };
    for (const [c, amount] of Object.entries(cost)) {
      nextCurrencies[c] -= amount;
    }

    const nextTeams = targetTeam
      ? state.career.teams.map((t) =>
          t.id === teamId
            ? { ...t, memberHireIds: [...(t.memberHireIds || []), hire.id] }
            : t,
        )
      : state.career.teams;

    set({
      currencies: nextCurrencies,
      career: { ...state.career, hires: [...state.career.hires, hire], teams: nextTeams },
    });
    debouncedSave(get, set);
    return { ok: true, hire };
  },

  /**
   * Pay to advance a hire from level L to L+1. Caps at MAX_HIRE_LEVEL.
   */
  levelUpHire(hireId) {
    const state = get();
    const hire = state.career.hires.find((h) => h.id === hireId);
    if (!hire) return { ok: false, reason: 'not_found' };
    if (hire.level >= MAX_HIRE_LEVEL) return { ok: false, reason: 'max_level' };

    const cost = getLevelUpCost(state.career.currentTrack, hire.level);
    if (!cost) return { ok: false, reason: 'no_cost' };
    if (!canAfford(getSpendableCurrencies(state), cost)) {
      return { ok: false, reason: 'insufficient_currency', cost };
    }

    const nextCurrencies = { ...state.currencies };
    for (const [c, amount] of Object.entries(cost)) {
      nextCurrencies[c] -= amount;
    }

    const nextHires = state.career.hires.map((h) =>
      h.id === hireId ? { ...h, level: h.level + 1 } : h,
    );

    set({
      currencies: nextCurrencies,
      career: { ...state.career, hires: nextHires },
    });
    debouncedSave(get, set);
    return { ok: true };
  },

  /**
   * Remove a hire from the team. No cost, no refund. Cleans up team memberships.
   */
  fireHire(hireId) {
    const state = get();
    const hire = state.career.hires.find((h) => h.id === hireId);
    if (!hire) return { ok: false, reason: 'not_found' };

    set({
      career: {
        ...state.career,
        hires: state.career.hires.filter((h) => h.id !== hireId),
        teams: state.career.teams.map((t) => ({
          ...t,
          memberHireIds: (t.memberHireIds || []).filter((id) => id !== hireId),
        })),
      },
    });
    debouncedSave(get, set);
    return { ok: true };
  },

  /**
   * Hire a poached candidate — 3× normal cost but arrives at level 3. Same cap as hireSomeone.
   */
  poachSomeone(teamId = null) {
    const state = get();
    if (state.stage !== 'career' || !state.career.currentTrack) {
      return { ok: false, reason: 'not_in_career' };
    }
    if (state.career.rank < 5) {
      return { ok: false, reason: 'rank_locked' };
    }
    const cap = getHiresCap(state.career.rank);
    if (state.career.hires.length >= cap) {
      return { ok: false, reason: 'cap_reached', cap };
    }
    const targetTeam = teamId ? state.career.teams.find((t) => t.id === teamId) : null;
    if (teamId && !targetTeam) {
      return { ok: false, reason: 'team_not_found' };
    }
    if (targetTeam && (targetTeam.memberHireIds || []).length >= MAX_TEAM_SIZE) {
      return { ok: false, reason: 'team_full' };
    }
    const cost = getPoachCost(state.career.currentTrack, state.career.hires.length);
    if (!canAfford(getSpendableCurrencies(state), cost)) {
      return { ok: false, reason: 'insufficient_currency', cost };
    }

    const hire = createPoachedHire(state.career.currentTrack);
    const nextCurrencies = { ...state.currencies };
    for (const [c, amount] of Object.entries(cost)) {
      nextCurrencies[c] -= amount;
    }

    const nextTeams = targetTeam
      ? state.career.teams.map((t) =>
          t.id === teamId
            ? { ...t, memberHireIds: [...(t.memberHireIds || []), hire.id] }
            : t,
        )
      : state.career.teams;

    set({
      currencies: nextCurrencies,
      career: { ...state.career, hires: [...state.career.hires, hire], teams: nextTeams },
    });
    debouncedSave(get, set);
    return { ok: true, hire };
  },

  /**
   * Create a new empty team. Name defaults to "Team N" where N is the next number.
   */
  createTeam() {
    const state = get();
    if (state.stage !== 'career' || state.career.rank < 6) {
      return { ok: false, reason: 'rank_locked' };
    }
    if (state.career.teams.length >= MAX_TEAMS) {
      return { ok: false, reason: 'cap_reached' };
    }
    const n = state.career.teams.length + 1;
    const team = {
      id: newTeamId(),
      name: `Team ${n}`,
      memberHireIds: [],
    };
    set({
      career: { ...state.career, teams: [...state.career.teams, team] },
    });
    debouncedSave(get, set);
    return { ok: true, team };
  },

  /**
   * Delete a team. Members become unassigned (free to join other teams).
   */
  deleteTeam(teamId) {
    const state = get();
    set({
      career: {
        ...state.career,
        teams: state.career.teams.filter((t) => t.id !== teamId),
      },
    });
    debouncedSave(get, set);
  },

  /**
   * Rename a team. Trims whitespace and clamps to 30 chars.
   */
  renameTeam(teamId, newName) {
    const state = get();
    const trimmed = (newName || '').slice(0, 30);
    set({
      career: {
        ...state.career,
        teams: state.career.teams.map((t) =>
          t.id === teamId ? { ...t, name: trimmed } : t,
        ),
      },
    });
    debouncedSave(get, set);
  },

  /**
   * Assign a hire to a team. Removes them from any other team first.
   * Enforces MAX_TEAM_SIZE and team existence.
   */
  assignHireToTeam(teamId, hireId) {
    const state = get();
    const targetTeam = state.career.teams.find((t) => t.id === teamId);
    if (!targetTeam) return { ok: false, reason: 'team_not_found' };
    if ((targetTeam.memberHireIds || []).length >= MAX_TEAM_SIZE) {
      return { ok: false, reason: 'team_full' };
    }
    if (!state.career.hires.find((h) => h.id === hireId)) {
      return { ok: false, reason: 'hire_not_found' };
    }

    set({
      career: {
        ...state.career,
        teams: state.career.teams.map((t) => {
          const members = (t.memberHireIds || []).filter((id) => id !== hireId);
          if (t.id === teamId) members.push(hireId);
          return { ...t, memberHireIds: members };
        }),
      },
    });
    debouncedSave(get, set);
    return { ok: true };
  },

  /**
   * Remove a hire from a specific team.
   */
  removeHireFromTeam(teamId, hireId) {
    const state = get();
    set({
      career: {
        ...state.career,
        teams: state.career.teams.map((t) =>
          t.id === teamId
            ? { ...t, memberHireIds: (t.memberHireIds || []).filter((id) => id !== hireId) }
            : t,
        ),
      },
    });
    debouncedSave(get, set);
  },

  /**
   * Launch a FAANG Fellow initiative. One-shot, repeatable. Pays out the reward immediately.
   */
  launchFaangInitiative(initiativeId) {
    const state = get();
    if (state.career.currentTrack !== 'faang' || state.career.rank < 7) {
      return { ok: false, reason: 'not_at_endgame' };
    }
    const initiative = FAANG_INITIATIVES.find((i) => i.id === initiativeId);
    if (!initiative) return { ok: false, reason: 'unknown_initiative' };
    if (!canAfford(getSpendableCurrencies(state), initiative.cost)) {
      return { ok: false, reason: 'insufficient_currency' };
    }

    const nextCurrencies = { ...state.currencies };
    for (const [c, amount] of Object.entries(initiative.cost)) {
      nextCurrencies[c] -= amount;
    }
    for (const [c, amount] of Object.entries(initiative.reward)) {
      nextCurrencies[c] = (nextCurrencies[c] || 0) + amount;
    }

    set({ currencies: nextCurrencies });
    debouncedSave(get, set);
    return { ok: true };
  },

  /**
   * Activate a PhD endowment. One-time per endowment ID. Permanent perSecond boost.
   */
  activatePhdEndowment(endowmentId) {
    const state = get();
    if (state.career.currentTrack !== 'phd' || state.career.rank < 7) {
      return { ok: false, reason: 'not_at_endgame' };
    }
    const endowment = PHD_ENDOWMENTS.find((e) => e.id === endowmentId);
    if (!endowment) return { ok: false, reason: 'unknown' };
    if (state.career.phdEndowments?.includes(endowmentId)) {
      return { ok: false, reason: 'already_active' };
    }
    if (!canAfford(getSpendableCurrencies(state), endowment.cost)) {
      return { ok: false, reason: 'insufficient_currency' };
    }

    const nextCurrencies = { ...state.currencies };
    for (const [c, amount] of Object.entries(endowment.cost)) {
      nextCurrencies[c] -= amount;
    }

    // Endowment boost is materialized lazily by getEffectivePerSecond — owning
    // the endowment ID is the only state change here.
    set({
      currencies: nextCurrencies,
      career: {
        ...state.career,
        phdEndowments: [...(state.career.phdEndowments || []), endowmentId],
      },
    });
    debouncedSave(get, set);
    return { ok: true };
  },

  /**
   * Sell N units of Equity at the current exit price. Money is added TAX-FREE.
   */
  sellEquity(equityAmount) {
    const state = get();
    if (state.career.currentTrack !== 'startup' || state.career.rank < 7) {
      return { ok: false, reason: 'not_at_endgame' };
    }
    if (equityAmount <= 0) return { ok: false, reason: 'invalid_amount' };
    if (state.currencies.equity < equityAmount) {
      return { ok: false, reason: 'insufficient_equity' };
    }

    const price = getCurrentExitPrice();
    const moneyGained = Math.floor(equityAmount * price);

    set({
      currencies: {
        ...state.currencies,
        equity: state.currencies.equity - equityAmount,
        money: state.currencies.money + moneyGained,
      },
    });
    debouncedSave(get, set);
    return { ok: true, moneyGained };
  },

  /**
   * Launch an Upwork course. Sets state.upwork.activeCourse — tick handles generation + completion.
   */
  launchUpworkCourse(courseId) {
    const state = get();
    if (state.career.currentTrack !== 'upwork' || state.career.rank < 7) {
      return { ok: false, reason: 'not_at_endgame' };
    }
    if (state.upwork.activeCourse) {
      return { ok: false, reason: 'course_already_active' };
    }
    const course = UPWORK_COURSES.find((c) => c.id === courseId);
    if (!course) return { ok: false, reason: 'unknown_course' };
    if (!canAfford(getSpendableCurrencies(state), course.cost)) {
      return { ok: false, reason: 'insufficient_currency' };
    }

    const nextCurrencies = { ...state.currencies };
    for (const [c, amount] of Object.entries(course.cost)) {
      nextCurrencies[c] -= amount;
    }

    set({
      currencies: nextCurrencies,
      upwork: {
        ...state.upwork,
        activeCourse: {
          courseId,
          startedAt: Date.now(),
          totalEarned: 0,
        },
      },
    });
    debouncedSave(get, set);
    return { ok: true };
  },

  /**
   * Spend Connects to bid on a gig. 5–10% acceptance, $800–$1600 reward (taxed).
   */
  bidOnGig() {
    const state = get();
    if (state.career.currentTrack !== 'upwork') {
      return { ok: false, reason: 'not_on_upwork' };
    }
    const cost = getGigBidCost();
    if (state.upwork.connects < cost) {
      return { ok: false, reason: 'insufficient_connects', cost };
    }

    const { accepted, gross } = rollGigOutcome();
    const { net, tax } = splitTax(gross, true);

    const nextUpwork = {
      ...state.upwork,
      connects: state.upwork.connects - cost,
      platformTaxLifetime: state.upwork.platformTaxLifetime + tax,
    };
    const nextCurrencies = {
      ...state.currencies,
      money: state.currencies.money + net,
    };

    set({ currencies: nextCurrencies, upwork: nextUpwork });
    debouncedSave(get, set);
    return { ok: true, accepted, cost, gross, net, tax };
  },

  /**
   * Buy a bundle of Connects with Money. Bundle amounts in CONNECT_BUNDLES.
   */
  buyConnects(amount) {
    const state = get();
    if (state.career.currentTrack !== 'upwork') {
      return { ok: false, reason: 'not_on_upwork' };
    }
    const bundle = CONNECT_BUNDLES.find((b) => b.amount === amount);
    if (!bundle) return { ok: false, reason: 'invalid_bundle' };
    if (state.upwork.connects >= CONNECTS_CAP) {
      return { ok: false, reason: 'at_cap' };
    }
    if (state.currencies.money < bundle.price) {
      return { ok: false, reason: 'insufficient_money' };
    }

    const newConnects = Math.min(CONNECTS_CAP, state.upwork.connects + bundle.amount);

    set({
      currencies: { ...state.currencies, money: state.currencies.money - bundle.price },
      upwork: { ...state.upwork, connects: newConnects },
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
