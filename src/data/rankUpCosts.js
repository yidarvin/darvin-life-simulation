/**
 * Per-track rank-up cost schedules.
 *
 * Keys are the TARGET rank (i.e., the rank you advance TO).
 * Costs are deducted from state.currencies on tryRankUp.
 *
 * Tuning notes:
 *   - FAANG progression should feel grindy on Money but rewarded by its 5× Money multiplier.
 *   - Startup progression front-loads Influence; equity comes as a reward, not a cost.
 *   - PhD is research-heavy. Costs accelerate hard at faculty ranks.
 *   - Upwork uses Money + Influence (Connects integration is session 26+).
 */
export const RANK_UP_COSTS = {
  faang: {
    2: { money: 2_000, knowledge: 500 },
    3: { money: 5_000, knowledge: 1_500, influence: 50 },
    4: { money: 12_000, knowledge: 4_000, influence: 150 },
    5: { money: 30_000, knowledge: 10_000, influence: 400 },
    6: { money: 80_000, knowledge: 25_000, influence: 1_000 },
    7: { money: 250_000, knowledge: 60_000, influence: 3_000 },
  },

  startup: {
    2: { influence: 100, equity: 50 },
    3: { influence: 400, equity: 250, money: 5_000 },
    4: { influence: 1_200, equity: 1_000, money: 20_000 },
    5: { influence: 3_500, equity: 4_000, money: 75_000 },
    6: { influence: 9_000, equity: 15_000, money: 200_000 },
    7: { influence: 25_000, equity: 50_000, money: 500_000 },
  },

  phd: {
    2: { research: 200, knowledge: 800 },
    3: { research: 700, knowledge: 2_500, influence: 30 },
    4: { research: 2_000, knowledge: 7_000, influence: 120 },
    5: { research: 6_000, knowledge: 20_000, influence: 400 },
    6: { research: 18_000, knowledge: 50_000, influence: 1_200 },
    7: { research: 50_000, knowledge: 120_000, influence: 4_000 },
  },

  upwork: {
    2: { money: 500, influence: 20 },
    3: { money: 2_000, influence: 100 },
    4: { money: 6_000, influence: 400 },
    5: { money: 20_000, influence: 1_500 },
    6: { money: 60_000, influence: 5_000 },
    7: { money: 200_000, influence: 15_000 },
  },
};

/**
 * Look up the cost for advancing FROM `currentRank` to `currentRank + 1` on `track`.
 * Returns null if no further rank-up exists.
 */
export function getRankUpCost(track, currentRank) {
  const targetRank = currentRank + 1;
  if (targetRank > 7) return null;
  return RANK_UP_COSTS[track]?.[targetRank] ?? null;
}
