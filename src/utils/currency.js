export const CURRENCY_EMOJI = {
  knowledge: '🧠',
  money: '💵',
  research: '📄',
  applications: '📨',
  influence: '🌟',
  equity: '🏛️',
};

/**
 * Total influence currently earmarked across the allocation buckets.
 */
export function getAllocatedInfluence(state) {
  const alloc = state?.career?.influenceAllocation;
  if (!alloc) return 0;
  return (alloc.knowledge ?? 0) + (alloc.money ?? 0) + (alloc.research ?? 0);
}

/**
 * Influence available to spend = total influence minus the amount earmarked
 * across allocation buckets.
 */
export function getAvailableInfluence(state) {
  const total = state?.currencies?.influence ?? 0;
  return Math.max(0, total - getAllocatedInfluence(state));
}

/**
 * Returns a currencies-shaped object where `influence` is replaced with
 * the spendable portion (total minus allocated). Use this anywhere you'd
 * normally pass `state.currencies` to an affordability check.
 */
export function getSpendableCurrencies(state) {
  return {
    ...state.currencies,
    influence: getAvailableInfluence(state),
  };
}

/**
 * Can the player afford the given cost?
 *
 * @param {object} currencies - the state.currencies object
 * @param {object} cost - { knowledge: 10, money: 100, ... }
 * @returns {boolean}
 */
export function canAfford(currencies, cost) {
  for (const [currency, amount] of Object.entries(cost)) {
    if ((currencies[currency] ?? 0) < amount) return false;
  }
  return true;
}

/**
 * Format a cost object for display.
 *
 * @param {object} cost - { knowledge: 10, money: 100 }
 * @returns {string} e.g., '10 🧠  $100'
 */
export function formatCost(cost) {
  const parts = [];
  for (const [currency, amount] of Object.entries(cost)) {
    const prefix = currency === 'money' ? '$' : '';
    const suffix = currency === 'money' ? '' : ` ${CURRENCY_EMOJI[currency]}`;
    parts.push(`${prefix}${amount.toLocaleString()}${suffix}`);
  }
  return parts.join('  ');
}
