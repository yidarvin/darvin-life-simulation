/**
 * Procedural-hire data: name pools, per-track role templates, cost + cap calculators.
 *
 * Names: simple two-pool first/last random pairing. ~25 of each → 625 possible combos,
 * good enough for v1 (collisions possible but rare).
 */

const FIRST_NAMES = [
  'Aiden', 'Brendan', 'Chika', 'Devon', 'Eitan', 'Farrah', 'Gabriel', 'Hina',
  'Ivan', 'Jada', 'Kai', 'Luna', 'Marcus', 'Naomi', 'Omar', 'Priya',
  'Quinn', 'Riya', 'Soren', 'Talia', 'Uchenna', 'Vikram', 'Wren', 'Xinyi',
  'Yusuf', 'Zara',
];

const LAST_NAMES = [
  'Kowalski', 'Nguyen', 'Adeyemi', 'Park', 'Reyes', 'Choudhury', 'Patel',
  'Singh', 'Ortega', 'Tanaka', 'Lin', 'Brennan', 'Okafor', 'Sharma', 'Wong',
  'Brown', 'Mehta', 'Zhang', 'Persaud', 'Hayes', 'Cohen', 'Goldberg',
  'Diallo', 'Garcia', 'Yamamoto',
];

/**
 * Role templates per track. Each role defines base per-second rates.
 * Type is used by session 24 for team composition.
 */
export const ROLES_BY_TRACK = {
  faang: [
    { type: 'backend',  label: 'Backend Engineer',  rates: { knowledge: 1, money: 4 } },
    { type: 'frontend', label: 'Frontend Engineer', rates: { knowledge: 2, money: 3 } },
    { type: 'ml',       label: 'ML Engineer',       rates: { research: 2, money: 3 } },
    { type: 'pm',       label: 'Product Manager',   rates: { influence: 2, money: 2 } },
    { type: 'em',       label: 'Engineering Manager', rates: { influence: 4, money: 1 } },
  ],
  startup: [
    { type: 'cofounder',  label: 'Cofounder',         rates: { equity: 1, influence: 2, money: 1 } },
    { type: 'early_eng',  label: 'Early Engineer',    rates: { knowledge: 2, money: 2 } },
    { type: 'designer',   label: 'Product Designer',  rates: { knowledge: 1, money: 2 } },
    { type: 'sales',      label: 'Sales Lead',        rates: { money: 5, influence: 1 } },
    { type: 'gtm',        label: 'GTM Lead',          rates: { influence: 3, money: 2 } },
  ],
  phd: [
    { type: 'postdoc',      label: 'Postdoc',              rates: { research: 3, knowledge: 1 } },
    { type: 'grad',         label: 'Grad Student',         rates: { research: 2, knowledge: 1 } },
    { type: 'collaborator', label: 'External Collaborator', rates: { research: 1, influence: 2 } },
    { type: 'tech',         label: 'Lab Tech',             rates: { research: 2 } },
  ],
  upwork: [
    { type: 'dev_sub',    label: 'Dev Subcontractor',    rates: { money: 4, knowledge: 1 } },
    { type: 'design_sub', label: 'Design Subcontractor', rates: { money: 3 } },
    { type: 'writer_sub', label: 'Writer Subcontractor', rates: { money: 2 } },
    { type: 'va',         label: 'Virtual Assistant',    rates: { knowledge: 1, money: 1 } },
  ],
};

/**
 * Generate a fresh random "Firstname Lastname".
 */
export function generateHireName(rng = Math.random) {
  const first = FIRST_NAMES[Math.floor(rng() * FIRST_NAMES.length)];
  const last = LAST_NAMES[Math.floor(rng() * LAST_NAMES.length)];
  return `${first} ${last}`;
}

/**
 * Pick a random role from the given track's pool.
 */
export function pickRandomRole(track, rng = Math.random) {
  const roles = ROLES_BY_TRACK[track] || [];
  if (roles.length === 0) return null;
  return roles[Math.floor(rng() * roles.length)];
}

/**
 * Hire cap by rank. Below rank 4 you can't hire at all.
 */
const HIRES_CAP_BY_RANK = { 4: 3, 5: 5, 6: 8, 7: 12 };

export function getHiresCap(rank) {
  return HIRES_CAP_BY_RANK[rank] ?? 0;
}

/**
 * Cost to hire the (currentCount+1)-th hire on this track. Scales linearly with team size.
 * Tuning numbers — adjust based on playtest pacing.
 */
export function getHireCost(track, currentHireCount) {
  const n = currentHireCount + 1;
  switch (track) {
    case 'faang':
      return { money: 5000 * n, knowledge: 100 * n };
    case 'startup':
      return { influence: 150 * n, equity: 80 * n };
    case 'phd':
      return { research: 400 * n, influence: 30 * n };
    case 'upwork':
      return { money: 1500 * n };
    default:
      return {};
  }
}

/**
 * Generate a fresh hire entity for the current track. Caller is responsible for
 * verifying the cap and cost; this is a pure factory.
 */
export function createHire(track, rng = Math.random) {
  const role = pickRandomRole(track, rng);
  if (!role) throw new Error(`No roles for track "${track}"`);
  return {
    id: `hire_${Date.now()}_${Math.floor(rng() * 1e6).toString(36)}`,
    name: generateHireName(rng),
    track,
    roleType: role.type,
    roleLabel: role.label,
    rates: { ...role.rates },
    level: 1,
    hiredAt: Date.now(),
  };
}
