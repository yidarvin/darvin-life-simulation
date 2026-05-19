import { useGameStore } from './store';

const TICK_INTERVAL_MS = 100; // 10 Hz

let installed = false;
let intervalId = null;

/**
 * Start the global tick loop. Safe to call multiple times — second call is a no-op.
 * Returns a cleanup function for unit tests, but in the app you typically never stop it.
 */
export function installTickLoop() {
  if (installed) return () => {};
  installed = true;

  let lastTick = Date.now();

  intervalId = setInterval(() => {
    const now = Date.now();
    const dtSec = (now - lastTick) / 1000;
    lastTick = now;
    useGameStore.getState().tick(dtSec);
  }, TICK_INTERVAL_MS);

  return () => {
    if (intervalId) clearInterval(intervalId);
    intervalId = null;
    installed = false;
  };
}
