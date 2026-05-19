/**
 * Endgame mechanic data per track.
 *
 * FAANG: Fellow Initiatives — one-shot, repeatable. Pay cost, get burst reward.
 * Startup: Exit — convert Equity to Money at fluctuating rate.
 * PhD: Endowments — pay cost once for permanent perSecond boost.
 * Upwork: Course Sales — pay cost to start a 60s course that earns Money TAX-FREE.
 */

export const FAANG_INITIATIVES = [
  {
    id: 'mentor_l8',
    label: 'Mentor an L8',
    flavor: 'They wrote your performance review three years ago. Now they ask you for advice.',
    cost: { money: 50_000 },
    reward: { influence: 1_000, knowledge: 500 },
  },
  {
    id: 'engineering_summit',
    label: 'Run the engineering summit',
    flavor: 'Three days. Two off-sites. One thousand pre-printed name tags.',
    cost: { money: 200_000, influence: 500 },
    reward: { influence: 3_000, knowledge: 2_000 },
  },
  {
    id: 'position_paper',
    label: 'Write the position paper',
    flavor: 'Six months. Internal-only. Quoted by VPs for two quarters.',
    cost: { knowledge: 50_000 },
    reward: { influence: 5_000, research: 2_000 },
  },
];

export const PHD_ENDOWMENTS = [
  {
    id: 'endow_chair',
    label: 'Endow a research chair',
    flavor: 'Permanent. Named after you. The students don\'t care.',
    cost: { money: 100_000, research: 10_000 },
    perSecondBoost: { research: 5, influence: 1 },
  },
  {
    id: 'found_lab',
    label: 'Found a research lab',
    flavor: 'Your lab. Your rules. Mostly your funding.',
    cost: { money: 250_000, research: 25_000, influence: 1_000 },
    perSecondBoost: { research: 12, knowledge: 3 },
  },
  {
    id: 'institute',
    label: 'Found an institute',
    flavor: 'Cross-departmental. Named after a donor you never met.',
    cost: { money: 500_000, research: 50_000, influence: 5_000 },
    perSecondBoost: { research: 25, money: 5, knowledge: 8 },
  },
];

export const UPWORK_COURSES = [
  {
    id: 'connects_masterclass',
    label: 'Connects Optimization Masterclass',
    flavor: '$497. "How I went from 12 to 80 Connects/day."',
    cost: { knowledge: 500, influence: 200 },
    moneyRate: 12,
    durationSec: 60,
  },
  {
    id: 'jss_recovery',
    label: 'JSS Recovery Bootcamp',
    flavor: 'For freelancers who dipped below 90% and want their tier back.',
    cost: { knowledge: 1_500, influence: 600 },
    moneyRate: 25,
    durationSec: 60,
  },
  {
    id: 'agency_blueprint',
    label: 'The Agency Blueprint',
    flavor: 'Build a 6-figure subcontractor mill in 90 days. No technical skills required.',
    cost: { knowledge: 3_000, influence: 1_500 },
    moneyRate: 50,
    durationSec: 60,
  },
];

/**
 * Startup exit pricing: Equity → Money conversion. Multiplier fluctuates over time.
 *
 * Base multiplier is 100 (one share of Equity = $100). The actual multiplier oscillates
 * ±40% on a sine wave with period 30 seconds (real time) so players can time their sales.
 */
export const STARTUP_EXIT_BASE_PRICE = 100;
export const STARTUP_EXIT_VOLATILITY = 0.4;
export const STARTUP_EXIT_PERIOD_MS = 30_000;

/**
 * Compute the current Equity→Money multiplier. Pure function of timestamp.
 */
export function getCurrentExitPrice(now = Date.now()) {
  const phase = (now % STARTUP_EXIT_PERIOD_MS) / STARTUP_EXIT_PERIOD_MS;
  const sine = Math.sin(phase * 2 * Math.PI);
  return STARTUP_EXIT_BASE_PRICE * (1 + STARTUP_EXIT_VOLATILITY * sine);
}

export const ENDGAME_INITIATIVES_BY_ID = {
  ...Object.fromEntries(FAANG_INITIATIVES.map((i) => [i.id, i])),
  ...Object.fromEntries(PHD_ENDOWMENTS.map((i) => [i.id, i])),
  ...Object.fromEntries(UPWORK_COURSES.map((i) => [i.id, i])),
};
