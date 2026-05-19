/**
 * Undergrad shop items. Career-tier items (rank-1+ generators, hires, etc.) come in later sessions.
 *
 * Items with `lockedUntilInternship: true` are visible but unbuyable during undergrad —
 * they're previews of what passive generation will look like post-internship.
 */
export const SHOP_ITEMS = [
  // ── Knowledge multipliers ─────────────────────────────────────────────
  {
    id: 'espresso',
    name: '☕ Triple Espresso',
    flavor: 'Becomes 30% personality, 70% espresso.',
    effect: { kind: 'perClick', currency: 'knowledge', amount: 1 },
    cost: { knowledge: 10 },
    unlocksAtYear: 'freshman',
  },
  {
    id: 'study_group',
    name: '👥 Study Group',
    flavor: 'Trauma bond with your classmates.',
    effect: { kind: 'perClick', currency: 'knowledge', amount: 2 },
    cost: { knowledge: 50 },
    unlocksAtYear: 'freshman',
  },
  {
    id: 'mech_keyboard',
    name: '⌨️ Mechanical Keyboard',
    flavor: 'Clack clack clack but make it productive.',
    effect: { kind: 'perClick', currency: 'knowledge', amount: 2 },
    cost: { knowledge: 100, money: 150 },
    unlocksAtYear: 'sophomore',
  },
  {
    id: 'stack_overflow',
    name: '📖 Stack Overflow Premium',
    flavor: 'Read questions marked duplicate of duplicates.',
    effect: { kind: 'perClick', currency: 'knowledge', amount: 5 },
    cost: { knowledge: 300, money: 500 },
    unlocksAtYear: 'sophomore',
  },

  // ── Money multipliers ─────────────────────────────────────────────────
  {
    id: 'doordash',
    name: '🍔 DoorDash Tutoring',
    flavor: "Drive to a stranger's house. Explain pointers in their kitchen.",
    effect: { kind: 'perClick', currency: 'money', amount: 5 },
    cost: { money: 80 },
    unlocksAtYear: 'sophomore',
  },
  {
    id: 'linkedin',
    name: '💼 LinkedIn Premium',
    flavor: 'See exactly which recruiters are ghosting you.',
    effect: { kind: 'perClick', currency: 'applications', amount: 2 },
    cost: { money: 250 },
    unlocksAtYear: 'senior',
  },

  // ── Research multipliers ──────────────────────────────────────────────
  {
    id: 'self_cite',
    name: '📝 Self-Citation Loop',
    flavor: 'Boost your h-index. No reviewer will check.',
    effect: { kind: 'perClick', currency: 'research', amount: 3 },
    cost: { research: 8, money: 100 },
    unlocksAtYear: 'junior',
  },

  // ── Passive generators (locked during undergrad — preview) ────────────
  {
    id: 'office_hours',
    name: '📚 Office Hours Worship',
    flavor: 'Ask the same question for the third time.',
    effect: { kind: 'perSecond', currency: 'knowledge', amount: 0.5 },
    cost: { knowledge: 500 },
    unlocksAtYear: 'sophomore',
    lockedUntilInternship: true,
  },
  {
    id: 'copilot',
    name: '🤖 GitHub Copilot',
    flavor: 'Auto-completes your dignity away.',
    effect: { kind: 'perSecond', currency: 'money', amount: 3 },
    cost: { money: 1200 },
    unlocksAtYear: 'junior',
    lockedUntilInternship: true,
  },
  {
    id: 'career_center',
    name: '🎓 Career Center Newsletter',
    flavor: 'Daily emails from 14 startups you have never heard of.',
    effect: { kind: 'perSecond', currency: 'applications', amount: 0.5 },
    cost: { applications: 3, money: 200 },
    unlocksAtYear: 'senior',
    lockedUntilInternship: true,
  },
  {
    id: 'ra_position',
    name: '🧪 RA Position',
    flavor: 'Run experiments your PI does not fully understand.',
    effect: { kind: 'perSecond', currency: 'research', amount: 0.3 },
    cost: { research: 5, knowledge: 300 },
    unlocksAtYear: 'junior',
    lockedUntilInternship: true,
  },
];

/**
 * Lookup by id. Convenient for store actions that take an item ID.
 */
export const SHOP_ITEMS_BY_ID = Object.fromEntries(SHOP_ITEMS.map((i) => [i.id, i]));
