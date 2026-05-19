/**
 * Undergrad shop items. Career-tier items (rank-1+ generators, hires, etc.) come in later sessions.
 *
 * Items with `lockedUntilInternship: true` are hidden from the shop until the player has
 * completed the summer internship (i.e., reached junior year). The shop filter in
 * ShopPanel.jsx handles the gating; the buy guard in store.js mirrors it as a defense.
 *
 * Item shape:
 *   {
 *     id: string,
 *     name: string,
 *     flavor: string,
 *     cost: { [currency]: amount },
 *     effect: { kind: 'perClick' | 'perSecond' | 'instant', currency, amount },
 *     unlocksAtYear?: 'freshman' | 'sophomore' | 'junior' | 'senior',
 *     lockedUntilInternship?: boolean,
 *     requiresRank?: number,    // Optional rank-gate for career-tier items (future use).
 *                               // Ownership persists across ranks; the bonus only counts
 *                               // when career.rank >= requiresRank.
 *                               // For `instant` items the rank gate is ALSO a visibility gate
 *                               // (ShopPanel hides them until the rank is met) since a lump
 *                               // sum can't be deferred — buying early would just consume cash
 *                               // for no benefit.
 *     requiresTrack?: string,   // Optional track-gate for career-tier items. Ownership
 *                               // persists across swaps; the bonus only counts while
 *                               // career.currentTrack === requiresTrack. Also hides the
 *                               // item from the shop on other tracks.
 *   }
 *
 * `instant` effect: on purchase, grants `amount` of `currency` to the player's wallet
 * once, then the item is added to `shop.owned` to prevent re-buying. No ongoing bonus.
 * Used for expensive one-time influence bursts that help bridge rank-up costs.
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
    id: 'ra_position',
    name: '🧪 RA Position',
    flavor: 'Run experiments your PI does not fully understand.',
    effect: { kind: 'perSecond', currency: 'research', amount: 0.3 },
    cost: { research: 5, knowledge: 300 },
    unlocksAtYear: 'junior',
    lockedUntilInternship: true,
  },

  // ── Track-gated career items ──────────────────────────────────────────
  {
    id: 'vesting_schedule',
    name: '📜 Vesting Schedule',
    flavor: 'Four-year vest, one-year cliff. The cliff is right now.',
    effect: { kind: 'perSecond', currency: 'equity', amount: 0.5 },
    cost: { money: 2000 },
    requiresTrack: 'startup',
  },
  {
    id: 'secondary_sale',
    name: '🏦 Secondary Sale',
    flavor: "Sell a sliver of your founders' shares back to the cap table.",
    effect: { kind: 'perSecond', currency: 'equity', amount: 3 },
    cost: { money: 25000, influence: 500 },
    requiresTrack: 'startup',
    requiresRank: 3,
  },

  // ── Influence: FAANG (0.5× track rate — they need help) ───────────────
  {
    id: 'faang_tech_talk',
    name: '🎙️ Internal Tech Talk',
    flavor: 'Twelve people attend. Three of them are Distinguished. One asks a question.',
    effect: { kind: 'instant', currency: 'influence', amount: 200 },
    cost: { money: 6000 },
    requiresTrack: 'faang',
    requiresRank: 2,
  },
  {
    id: 'faang_promo_packet',
    name: '📑 Promo Packet Drafting',
    flavor: 'Three pages of impact. Two pages of metrics. One page of nothing.',
    effect: { kind: 'perSecond', currency: 'influence', amount: 1 },
    cost: { money: 18000 },
    requiresTrack: 'faang',
    requiresRank: 3,
  },
  {
    id: 'faang_press_profile',
    name: '📰 Press Profile Placement',
    flavor: "PR firm gets you in a 'Top 40 Engineering Leaders' list. You are #38.",
    effect: { kind: 'instant', currency: 'influence', amount: 1500 },
    cost: { money: 60000 },
    requiresTrack: 'faang',
    requiresRank: 4,
  },

  // ── Influence: Startup ────────────────────────────────────────────────
  {
    id: 'startup_cocktail_hour',
    name: '🍸 Investor Cocktail Hour',
    flavor: 'Open bar. Closed deal. Two follow-ups, one ghosting, one term sheet.',
    effect: { kind: 'instant', currency: 'influence', amount: 150 },
    cost: { money: 4000 },
    requiresTrack: 'startup',
    requiresRank: 1,
  },
  {
    id: 'startup_advisor_network',
    name: '🤝 Advisor Network',
    flavor: '0.25% common stock each. Twelve advisors. None reply to email.',
    effect: { kind: 'perSecond', currency: 'influence', amount: 1.5 },
    cost: { money: 12000 },
    requiresTrack: 'startup',
    requiresRank: 2,
  },
  {
    id: 'startup_techcrunch',
    name: '📈 TechCrunch Feature',
    flavor: 'Headline implies you invented the category. You did not invent the category.',
    effect: { kind: 'instant', currency: 'influence', amount: 1200 },
    cost: { money: 35000 },
    requiresTrack: 'startup',
    requiresRank: 3,
  },

  // ── Influence: PhD ────────────────────────────────────────────────────
  {
    id: 'phd_keynote',
    name: '🎤 Conference Keynote',
    flavor: 'Forty minutes. Eighty slides. Two questions. One was about lunch.',
    effect: { kind: 'instant', currency: 'influence', amount: 400 },
    cost: { money: 2000, research: 500 },
    requiresTrack: 'phd',
    requiresRank: 2,
  },
  {
    id: 'phd_journal_editor',
    name: '📊 Journal Editorship',
    flavor: 'You reject papers identical to the ones you accepted last issue.',
    effect: { kind: 'perSecond', currency: 'influence', amount: 2 },
    cost: { money: 6000, research: 1500 },
    requiresTrack: 'phd',
    requiresRank: 4,
  },
  {
    id: 'phd_textbook',
    name: '📚 Textbook Royalty Tour',
    flavor: 'Required reading at 14 R1s. Returned-for-refund at 9 of them.',
    effect: { kind: 'instant', currency: 'influence', amount: 2000 },
    cost: { money: 15000, research: 4000 },
    requiresTrack: 'phd',
    requiresRank: 5,
  },

  // ── Influence: Upwork (0.1× until rank 7 — they REALLY need help) ─────
  {
    id: 'upwork_review_campaign',
    name: '🌟 Review Begging Campaign',
    flavor: '"Quick favor — if it\'s not 5 stars please reply first." It works.',
    effect: { kind: 'instant', currency: 'influence', amount: 100 },
    cost: { money: 1200 },
    requiresTrack: 'upwork',
    requiresRank: 2,
  },
  {
    id: 'upwork_cold_dm_funnel',
    name: '📨 Cold DM Funnel',
    flavor: 'Automated outreach to 4,000 LinkedIn strangers. Twelve respond. One signs.',
    effect: { kind: 'perSecond', currency: 'influence', amount: 0.6 },
    cost: { money: 5000 },
    requiresTrack: 'upwork',
    requiresRank: 3,
  },
  {
    id: 'upwork_influencer_era',
    name: '🎥 LinkedIn Influencer Era',
    flavor: 'Daily posts. Hooks like "I almost gave up freelancing in 2019." You started in 2022.',
    effect: { kind: 'instant', currency: 'influence', amount: 900 },
    cost: { money: 20000 },
    requiresTrack: 'upwork',
    requiresRank: 4,
  },
];

/**
 * Lookup by id. Convenient for store actions that take an item ID.
 */
export const SHOP_ITEMS_BY_ID = Object.fromEntries(SHOP_ITEMS.map((i) => [i.id, i]));
