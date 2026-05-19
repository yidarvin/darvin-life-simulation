/**
 * Burnout thresholds and the rate multiplier they impose.
 *
 *   0 ≤ b < 50:   1.0× (fine)
 *  50 ≤ b < 80:   0.8× (tired, 20% rate debuff)
 *  80 ≤ b < 100:  0.5× (burned out, 50% debuff; vacation modal triggers)
 *           100:  0.0× (collapse, generation halts)
 *
 * Collapse is sticky: once burnout hits 100, the `collapsed` flag latches and
 * holds the multiplier at 0 until burnout decays back down to BURNOUT_TIRED (50).
 */

export const BURNOUT_TIRED = 50;
export const BURNOUT_BURNED = 80;
export const BURNOUT_COLLAPSE = 100;

export const VACATION_COST = 1000;
export const VACATION_CLEAR = 50;

export const BURNOUT_PER_CLICK = 1;
export const BURNOUT_DECAY_PER_SEC = 0.5;

export function getBurnoutMultiplier(burnout, collapsed = false) {
  if (collapsed) return 0;
  if (!Number.isFinite(burnout)) return 1;
  if (burnout >= BURNOUT_COLLAPSE) return 0;
  if (burnout >= BURNOUT_BURNED) return 0.5;
  if (burnout >= BURNOUT_TIRED) return 0.8;
  return 1;
}

export function getBurnoutLabel(burnout, collapsed = false) {
  if (collapsed || burnout >= BURNOUT_COLLAPSE) return 'collapse';
  if (burnout >= BURNOUT_BURNED) return 'burned out';
  if (burnout >= BURNOUT_TIRED) return 'tired';
  return 'fine';
}

export function getBurnoutColorClass(burnout, collapsed = false) {
  if (collapsed || burnout >= BURNOUT_BURNED) return 'text-error';
  if (burnout >= BURNOUT_TIRED) return 'text-warning';
  return 'text-phosphor';
}

/**
 * Latches `true` once burnout reaches BURNOUT_COLLAPSE, stays `true` while still
 * above BURNOUT_TIRED, releases once burnout decays to ≤ BURNOUT_TIRED.
 */
export function nextCollapsed(prevCollapsed, newBurnout) {
  if (newBurnout >= BURNOUT_COLLAPSE) return true;
  if (prevCollapsed && newBurnout > BURNOUT_TIRED) return true;
  return false;
}
