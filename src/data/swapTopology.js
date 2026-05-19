/**
 * Swap-cost matrix. Reading: SWAP_COSTS[fromTrack][toTrack] = ranks lost on swap.
 *
 * Rock-paper-scissors cycle (cost 1):
 *   FAANG → Startup → PhD → FAANG (cycle direction)
 *
 * Reverse direction (cost 3):
 *   FAANG → PhD, Startup → FAANG, PhD → Startup
 *
 * Upwork: -1 to enter (voluntarily), -2 to exit (climb back out).
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
    faang: 2,
    startup: 2,
    phd: 2,
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
