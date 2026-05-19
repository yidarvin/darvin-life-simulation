export const CURRENCY_EMOJI = {
  knowledge: '🧠',
  money: '💵',
  research: '📄',
  applications: '📨',
  influence: '🌟',
  equity: '🏛️',
};

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
