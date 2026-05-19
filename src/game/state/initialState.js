/**
 * Factory for the default game state. Pure — call this any time you need a fresh state
 * (initial load with no save, reset, etc.).
 */
export function initialState() {
  return {
    version: 1,
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
    perClick: {
      knowledge: 1,
      money: 5,
      research: 1,
      applications: 1,
    },
    perSecond: {
      knowledge: 0,
      money: 0,
      research: 0,
      applications: 0,
      influence: 0,
      equity: 0,
    },
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
    },
    upwork: {
      connects: 0,
      jss: 100,
      platformTaxLifetime: 0,
      courseSales: 0,
      connectsLastRegen: null,
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
    },
  };
}

/**
 * Fields under `ui.*` are not saved to localStorage. The persistence layer (session 08)
 * will filter them out when serializing.
 */
export const TRANSIENT_PATHS = ['ui'];
