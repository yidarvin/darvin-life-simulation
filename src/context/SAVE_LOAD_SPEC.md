# Save/Load Spec

The game persists to `localStorage` only. No backend, no auth, no cloud sync. One save slot per browser.

## Storage key

```
KEY = 'lifeIsASimulation:v1'
```

Versioning is in the key suffix. When breaking changes happen (schema migrations), bump to `v2`, `v3`, etc. Old keys are migrated on load (see Migration section).

## Save schema (v1)

```js
{
  version: 1,                    // schema version (matches key suffix)
  savedAt: 1715000000000,        // ms timestamp, for debugging
  meta: {
    devMode: false,              // 1x vs 10x speed toggle
    runStarted: 1714900000000,   // when current run began
  },
  stage: 'undergrad',            // 'undergrad' | 'internship' | 'offer' | 'career' | 'endgame'
  year: 'freshman',              // only relevant during stage 'undergrad'
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
    owned: { 'espresso': true, 'study_group': false, ... },
  },
  career: {
    currentTrack: null,          // 'faang' | 'startup' | 'phd' | 'upwork'
    rank: 0,                     // 1–7 once entered; 0 before
    specialization: null,        // { track, choice }
    hires: [],                   // [{ id, name, baseRates, level, multiplier }]
    teams: [],
    influenceAllocation: {       // rank-3 allocator
      knowledge: 0,              // basis points
      money: 0,
      research: 0,
    },
    swapHistory: [],             // [{ from, to, atTimestamp, rankBefore, rankAfter }]
  },
  upwork: {
    connects: 0,
    jss: 100,
    platformTaxLifetime: 0,
    courseSales: 0,
  },
  burnout: 0,
  annualReview: {
    lastFiredAt: null,
    snapshotsByCurrency: {},     // for delta calculation
  },
  events: {
    firedEventIds: [],           // serialized as array; Set is rebuilt on load
    activeEvent: null,
    queue: [],
  },
  endgames: {
    reached: [],                 // ['faang', 'startup', ...] — for "completed all endgames" bookkeeping
  },
}
```

## Save timing

- **On every state-changing user action**: debounced 500ms (so rapid clicks coalesce to one write per ~500ms).
- **Periodic**: every 5 seconds even if no user input (catches passive accumulation).
- **On window beforeunload**: flush any pending debounced save synchronously.

```js
let saveTimer;
function scheduleSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(save, 500);
}

function save() {
  try {
    const snapshot = getSnapshot(state);
    localStorage.setItem(KEY, JSON.stringify(snapshot));
    state.lastSaveStatus = 'saved';
    state.lastSaveError = null;
  } catch (e) {
    state.lastSaveStatus = 'failed';
    state.lastSaveError = e.message;
    console.error('Save failed:', e);
  }
}
```

## Load on init

On app boot, attempt to load `lifeIsASimulation:v1`. If not present, try older versions (`:v2`, `:v3` if they ever exist), then fall back to initialState.

```js
function load() {
  const raw = localStorage.getItem(KEY);
  if (!raw) {
    return tryMigrationFromOlderVersions() || initialState();
  }
  try {
    const parsed = JSON.parse(raw);
    return mergeWithDefaults(parsed, initialState());
  } catch (e) {
    console.warn('Save corrupted; starting fresh. Old data preserved at', KEY + ':corrupted-' + Date.now());
    localStorage.setItem(KEY + ':corrupted-' + Date.now(), raw);
    return initialState();
  }
}
```

`mergeWithDefaults` is critical: when new fields are added to the schema between sessions, old saves must merge with current defaults rather than overwriting whole objects. Use a deep-merge utility, NOT `Object.assign` (which is shallow).

```js
function mergeWithDefaults(loaded, defaults) {
  const out = { ...defaults, ...loaded };
  for (const key of Object.keys(defaults)) {
    if (typeof defaults[key] === 'object' && defaults[key] !== null && !Array.isArray(defaults[key])) {
      out[key] = mergeWithDefaults(loaded[key] || {}, defaults[key]);
    }
  }
  return out;
}
```

Arrays from saves should overwrite defaults (don't deep-merge arrays, they're typically lists like `firedEventIds` or `hires`).

After loading: rebuild `Set` instances from arrays (e.g., `state.events.firedEventIds = new Set(loaded.events.firedEventIds)`).

## Migration framework

```js
const migrations = {
  1: (s) => s,  // identity for v1
  // 2: (s) => { ...migrate v1 → v2... },
};

function migrate(loaded) {
  let current = loaded;
  let v = current.version || 1;
  while (v < CURRENT_VERSION) {
    current = migrations[v + 1](current);
    v += 1;
  }
  return current;
}
```

Each migration is a pure function that takes the previous schema and returns the next. They're run in sequence.

## Reset

The Reset button in the footer:

1. Asks for confirmation (browser `confirm()` is fine for v1).
2. On confirm, clears localStorage and replaces state with `initialState()`.
3. Triggers a single render.

```js
function reset() {
  if (!window.confirm('Wipe the run and start over?')) return;
  localStorage.removeItem(KEY);
  state.replace(initialState());
}
```

## Devmode flag

Devmode toggle persists in the save. To "hide" it in production, the footer button is hidden via a build-time env var:

```jsx
{import.meta.env.VITE_SHOW_DEVMODE === 'true' && <DevModeToggle />}
```

In `.env.development` (or just default): `VITE_SHOW_DEVMODE=true`.
In `.env.production`: omit the variable (or set to `false`).

The toggle still WORKS in production (state is read), but the button is just not visible. Player can hit it via console: `useGameStore.getState().toggleDevMode()`.

## Status indicator

Footer shows a tiny `saved` / `save failed` indicator next to the Reset and Devmode buttons. Updates immediately on save attempt.

## Corruption handling

If `JSON.parse` throws on the saved value, preserve the corrupted blob under a timestamped key (`lifeIsASimulation:v1:corrupted-{timestamp}`) and fall back to fresh state. Don't silently delete data the user might want to debug.

## Cross-tab considerations

For v1: no special handling. If user opens two tabs, they'll race on writes. Document this as a known limitation.

(For v2 we could use `localStorage` events to sync, but it's not worth the complexity in v1.)

## Save snapshot size

Target: < 50 KB JSON for a maxed-out run. Most fields are small numbers; the main bloat would be `hires` (up to ~30 entries × ~200 bytes = 6 KB) and `firedEventIds` (up to ~100 strings × 30 bytes = 3 KB). Well within localStorage's typical 5–10 MB limit.

## Testing

Unit-test the migration framework with sample old-schema fixtures when schema bumps happen. For v1, just test:

- `load` returns initialState when localStorage is empty
- `load` returns merged state when localStorage has a v1 save
- `load` recovers from corrupted JSON without crashing
- `save` writes the current state and updates `lastSaveStatus`
- `reset` clears storage and replaces state
