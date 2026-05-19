/**
 * Swap-cost matrix. Reading: SWAP_COSTS[fromTrack][toTrack] = ranks lost on swap.
 *
 * Rock-paper-scissors cycle (cost 1):
 *   FAANG → Startup → PhD → FAANG (cycle direction)
 *
 * Reverse direction (cost 3):
 *   FAANG → PhD, Startup → FAANG, PhD → Startup
 *
 * Upwork: -1 to enter (voluntarily), -4 to exit (climbing out is brutal).
 *
 * Swaps are gated by `currentRank > swapCost` — you must be senior enough
 * to fully absorb the rank drop and still land at rank 1 or higher.
 *
 * Forced Upwork entry (from senior-year job offer failure) does NOT use this matrix —
 * it skips the gauntlet and lands at rank 1 directly (handled in session 15's forceUpwork).
 */
export const SWAP_COSTS = {
  faang: {
    startup: 1,  // cycle direction
    phd: 3,      // reverse
    upwork: 1,   // voluntary down to upwork
  },
  startup: {
    phd: 1,
    faang: 3,
    upwork: 1,
  },
  phd: {
    faang: 1,
    startup: 3,
    upwork: 1,
  },
  upwork: {
    faang: 4,
    startup: 4,
    phd: 4,
  },
};

/**
 * @returns {number|null} rank cost, or null if swap is invalid (same track, unknown track)
 */
export function getSwapCost(fromTrack, toTrack) {
  if (fromTrack === toTrack) return null;
  return SWAP_COSTS[fromTrack]?.[toTrack] ?? null;
}

/**
 * @returns {number} the new rank after swap (capped at 1)
 */
export function getTargetRank(currentRank, swapCost) {
  return Math.max(1, currentRank - swapCost);
}

/**
 * Minimum rank required to swap out without bottoming out below rank 1.
 * Equal to swapCost + 1 — you must land at rank 1 or higher after the drop.
 */
export function getRequiredRank(swapCost) {
  return swapCost + 1;
}

/**
 * @returns {boolean} true if the player is senior enough to fully absorb the rank drop.
 */
export function canAffordSwap(currentRank, swapCost) {
  return currentRank > swapCost;
}

/**
 * Applications required to swap. Scales with both swap cost and current rank:
 * a senior swap (cost 3) at rank 7 is a real investment; an early cycle swap is cheap.
 *
 * Formula: swapCost × currentRank × 25
 *   rank 2, cost 1 →   50 apps
 *   rank 5, cost 1 →  125 apps
 *   rank 7, cost 3 →  525 apps
 *   rank 7, cost 4 →  700 apps  (Upwork exit)
 */
export function getSwapApplicationsCost(currentRank, swapCost) {
  return swapCost * currentRank * 25;
}
