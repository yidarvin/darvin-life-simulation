/**
 * Year-progression helpers. Used by HUD, ActionsPanel, ShopPanel, and any other
 * component that needs to gate UI by player's current year.
 */

export const YEAR_ORDER = ['freshman', 'sophomore', 'junior', 'senior'];

/**
 * Is the player at least at `targetYear`?
 *
 * @param {string} currentYear - one of YEAR_ORDER
 * @param {string} targetYear - one of YEAR_ORDER
 * @returns {boolean}
 */
export function isAtLeastYear(currentYear, targetYear) {
  return YEAR_ORDER.indexOf(currentYear) >= YEAR_ORDER.indexOf(targetYear);
}

/**
 * Which currencies are unlocked for the current player state?
 * Returns a Set of currency keys.
 */
export function unlockedCurrencies(state) {
  const out = new Set(['knowledge']);
  const { year, stage, career } = state;

  if (stage !== 'undergrad') {
    // Once we've left undergrad, all four undergrad currencies are unlocked.
    out.add('money').add('research').add('applications');
  } else {
    if (isAtLeastYear(year, 'sophomore')) out.add('money');
    if (isAtLeastYear(year, 'junior')) out.add('research');
    if (isAtLeastYear(year, 'senior')) out.add('applications');
  }

  if (stage !== 'undergrad' && stage !== 'internship') out.add('influence');
  if (career?.currentTrack) out.add('equity');

  return out;
}
