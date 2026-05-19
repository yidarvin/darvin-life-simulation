/**
 * Factory for the default game state. Pure — call this any time you need a fresh state
 * (initial load with no save, reset, etc.).
 */
export function initialState() {
  return {
    version: 2,
    savedAt: null,
    meta: {
      devMode: false,
      runStarted: Date.now(),
    },
    stage: 'undergrad',
    year: 'freshman',
    currencies: {
      knowledge: 0,
      money: 0,
      research: 0,
      applications: 0,
      influence: 0,
      equity: 0,
    },
    // perClick / perSecond removed in v2. Effective rates compute on demand from
    // BASE_RATES + shop.owned + career.phdEndowments via the helpers in
    // src/data/careerTracks.js (getEffectiveClickAmount, getEffectivePerSecond).
    shop: {
      owned: {},
    },
    career: {
      currentTrack: null,
      rank: 0,
      specialization: null,
      hires: [],
      teams: [],
      influenceAllocation: {
        knowledge: 0,
        money: 0,
        research: 0,
      },
      swapHistory: [],
      phdEndowments: [],
    },
    upwork: {
      connects: 0,
      jss: 100,
      platformTaxLifetime: 0,
      courseSales: 0,
      connectsLastRegen: null,
      activeCourse: null,
    },
    internship: {
      active: false,
      complete: false,
      company: null,
      daysElapsed: 0,
      daysTotal: 90,
      eventSchedule: [],
      influenceAtStart: 0,
      gotReturnOffer: false,
    },
    burnout: 0,
    annualReview: {
      lastFiredAt: null,
      snapshotsByCurrency: {},
    },
    events: {
      enabled: false,
      nextEventAt: null,
      activeEvent: null,
      queue: [],
      firedEventIds: [], // persisted as array; rebuilt as Set in memory when needed
    },
    endgames: {
      reached: [],
    },
    // Transient UI state (not persisted, but stored here for centralization).
    // These are reset on load.
    ui: {
      activeModal: null, // { kind, payload } | null
      lastSaveStatus: null, // 'saved' | 'failed' | null
      lastSaveError: null,
      burnoutModalShown: false,
    },
  };
}

/**
 * Fields under `ui.*` are not saved to localStorage. The persistence layer (session 08)
 * will filter them out when serializing.
 */
export const TRANSIENT_PATHS = ['ui'];
