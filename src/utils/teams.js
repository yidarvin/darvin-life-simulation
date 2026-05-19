/**
 * Maximum teams a player can have. Hardcoded for v1.
 */
export const MAX_TEAMS = 3;
export const MAX_TEAM_SIZE = 4;

/**
 * Bonus multiplier added to each hire's rates when they're in a team.
 *
 * - 1 hire alone in a team: no bonus (incomplete team)
 * - 2 hires: +15% per hire
 * - 3 hires: +25% per hire
 * - 4 hires: +35% per hire
 */
export function getTeamBonus(memberCount) {
  if (memberCount < 2) return 0;
  if (memberCount === 2) return 0.15;
  if (memberCount === 3) return 0.25;
  return 0.35;
}

/**
 * Find which team a hire belongs to, or null if unassigned.
 */
export function findHireTeam(teams, hireId) {
  return teams.find((t) => (t.memberHireIds || []).includes(hireId)) || null;
}

/**
 * Compute the team-bonus multiplier (1 + bonus) for a given hire.
 * Unassigned hires return 1 (no bonus).
 */
export function getHireTeamMultiplier(teams, hireId) {
  const team = findHireTeam(teams, hireId);
  if (!team) return 1;
  return 1 + getTeamBonus((team.memberHireIds || []).length);
}

/**
 * Generate a fresh team id.
 */
export function newTeamId() {
  return `team_${Date.now()}_${Math.floor(Math.random() * 1e6).toString(36)}`;
}
