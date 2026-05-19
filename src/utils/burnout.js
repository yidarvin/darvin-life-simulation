/**
 * Burnout thresholds and the rate multiplier they impose.
 *
 *   0 ≤ b < 50:   1.0× (fine)
 *  50 ≤ b < 80:   0.8× (tired, 20% rate debuff)
 *  80 ≤ b < 100:  0.5× (burned out, 50% debuff; vacation modal triggers)
 *           100:  0.0× (collapse, generation halts)
 */

export const BURNOUT_TIRED = 50;
export const BURNOUT_BURNED = 80;
export const BURNOUT_COLLAPSE = 100;

export const VACATION_COST = 1000;
export const VACATION_CLEAR = 50;

export function getBurnoutMultiplier(burnout) {
  if (!Number.isFinite(burnout)) return 1;
  if (burnout >= BURNOUT_COLLAPSE) return 0;
  if (burnout >= BURNOUT_BURNED) return 0.5;
  if (burnout >= BURNOUT_TIRED) return 0.8;
  return 1;
}

export function getBurnoutLabel(burnout) {
  if (burnout >= BURNOUT_COLLAPSE) return 'collapse';
  if (burnout >= BURNOUT_BURNED) return 'burned out';
  if (burnout >= BURNOUT_TIRED) return 'tired';
  return 'fine';
}

export function getBurnoutColorClass(burnout) {
  if (burnout >= BURNOUT_BURNED) return 'text-error';
  if (burnout >= BURNOUT_TIRED) return 'text-warning';
  return 'text-phosphor';
}
