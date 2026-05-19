import { useGameStore } from './store';

const MAX_CATCH_UP_SECONDS = 4 * 60 * 60;  // 4 hours
const MIN_SHOW_MODAL_SECONDS = 60;         // < 1 minute backgrounded: don't bother

let lastVisibleAt = Date.now();

function snapshot(state) {
  return {
    knowledge: state.currencies.knowledge,
    money: state.currencies.money,
    research: state.currencies.research,
    applications: state.currencies.applications,
    influence: state.currencies.influence,
    equity: state.currencies.equity,
    burnout: state.burnout,
  };
}

function diff(before, after) {
  const out = {};
  for (const k of Object.keys(before)) {
    const delta = (after[k] ?? 0) - (before[k] ?? 0);
    if (Math.abs(delta) >= 1) out[k] = delta;
  }
  return out;
}

function handleVisibilityChange() {
  if (document.visibilityState !== 'visible') {
    lastVisibleAt = Date.now();
    return;
  }
  const now = Date.now();
  const elapsedSec = (now - lastVisibleAt) / 1000;
  lastVisibleAt = now;

  if (elapsedSec < MIN_SHOW_MODAL_SECONDS) return;

  const cappedSec = Math.min(elapsedSec, MAX_CATCH_UP_SECONDS);
  const store = useGameStore.getState();

  // Undergrad clicking is the whole interaction — no passive generation to catch up on.
  if (store.stage !== 'career' && store.stage !== 'internship') return;

  const before = snapshot(store);
  store.tick(cappedSec, { silent: true });
  const after = snapshot(useGameStore.getState());
  const delta = diff(before, after);

  const hasGains = Object.values(delta).some((v) => v > 0);
  if (hasGains) {
    useGameStore.getState().openModal('offline_catchup', {
      delta,
      secondsAway: Math.floor(elapsedSec),
      capped: elapsedSec > MAX_CATCH_UP_SECONDS,
    });
  }
}

export function initOfflineCatchUp() {
  document.addEventListener('visibilitychange', handleVisibilityChange);
  lastVisibleAt = Date.now();
}

export function teardownOfflineCatchUp() {
  document.removeEventListener('visibilitychange', handleVisibilityChange);
}
