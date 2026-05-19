import { initialState, TRANSIENT_PATHS } from './initialState';

const STORAGE_KEY = 'lifeIsASimulation:v1';
const CURRENT_VERSION = 1;

/**
 * Migration registry. Each entry takes the previous schema and returns the next.
 *
 * Schema v1 is stable as of session 29. Bump CURRENT_VERSION and register a
 * migration here whenever the persisted shape changes in a way that can't be
 * handled by the deep-merge default-fill in `mergeWithDefaults` — i.e., when
 * a field is renamed, removed, restructured, or needs computed defaults from
 * other fields. Pure additive fields don't need a migration: the merge will
 * fill them in from initialState().
 *
 * Example for v1 → v2:
 *
 *   const CURRENT_VERSION = 2;
 *   const migrations = {
 *     2: (s) => ({
 *       ...s,
 *       version: 2,
 *       career: {
 *         ...s.career,
 *         // Example: split `specialization` (string) into `{ id }` object.
 *         specialization: typeof s.career.specialization === 'string'
 *           ? { id: s.career.specialization }
 *           : s.career.specialization,
 *       },
 *     }),
 *   };
 */
const migrations = {};

/**
 * Serialize a slice of state for persistence. Strips transient fields (e.g., `ui.*`).
 */
export function getSerializableSnapshot(state) {
  const snapshot = { ...state };
  for (const path of TRANSIENT_PATHS) {
    delete snapshot[path];
  }
  // events.firedEventIds may be a Set — serialize to array.
  if (snapshot.events && snapshot.events.firedEventIds instanceof Set) {
    snapshot.events = {
      ...snapshot.events,
      firedEventIds: Array.from(snapshot.events.firedEventIds),
    };
  }
  snapshot.savedAt = Date.now();
  snapshot.version = CURRENT_VERSION;
  return snapshot;
}

/**
 * Write the current state to localStorage. Returns 'saved' or 'failed'.
 */
export function save(state) {
  try {
    const snapshot = getSerializableSnapshot(state);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    return { status: 'saved', error: null };
  } catch (e) {
    console.error('Save failed:', e);
    return { status: 'failed', error: e.message || String(e) };
  }
}

/**
 * Load state from localStorage. Returns either a merged-with-defaults state,
 * or initialState() if there's no save or the save is corrupted.
 */
export function load() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return initialState();

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    const backupKey = `${STORAGE_KEY}:corrupted-${Date.now()}`;
    localStorage.setItem(backupKey, raw);
    console.warn(
      `Save corrupted (${e.message}); starting fresh. Backup preserved at ${backupKey}.`,
    );
    return initialState();
  }

  const migrated = applyMigrations(parsed);
  const merged = mergeWithDefaults(migrated, initialState());

  // ui.* is transient — always reset on load.
  merged.ui = initialState().ui;

  return merged;
}

/**
 * Clear the save and return fresh initial state. The store calls this on reset().
 */
export function clear() {
  localStorage.removeItem(STORAGE_KEY);
  return initialState();
}

function applyMigrations(loaded) {
  let current = loaded;
  let v = current.version || 1;
  while (v < CURRENT_VERSION) {
    const fn = migrations[v + 1];
    if (!fn) {
      console.warn(`No migration registered for v${v} → v${v + 1}. Using default state.`);
      return initialState();
    }
    current = fn(current);
    v += 1;
  }
  return current;
}

/**
 * Deep-merge `loaded` into `defaults`. Objects recurse; arrays and primitives
 * take from `loaded` when present, else `defaults`. Lets old saves gain new
 * fields gracefully as the schema evolves.
 */
function mergeWithDefaults(loaded, defaults) {
  if (loaded === null || loaded === undefined) return defaults;
  if (typeof defaults !== 'object' || Array.isArray(defaults)) {
    return loaded !== undefined ? loaded : defaults;
  }
  const out = { ...defaults };
  for (const key of Object.keys(defaults)) {
    if (
      typeof defaults[key] === 'object' &&
      defaults[key] !== null &&
      !Array.isArray(defaults[key])
    ) {
      out[key] = mergeWithDefaults(loaded[key], defaults[key]);
    } else {
      out[key] = key in loaded ? loaded[key] : defaults[key];
    }
  }
  return out;
}
