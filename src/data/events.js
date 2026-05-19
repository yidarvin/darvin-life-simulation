/**
 * Random event bank. Fired by the Poisson scheduler in store.tick.
 *
 * Shape:
 *   id           - unique key; tracked in state.events.firedEventIds for one-shot
 *   track        - 'any' | 'faang' | 'startup' | 'phd' | 'upwork'
 *   minRank      - inclusive lower rank bound (default 2)
 *   maxRank      - inclusive upper rank bound (default 7)
 *   title        - modal title
 *   flavor       - body paragraph
 *   options      - 1-3 choices, each with `label` and `effect: { currency: delta }`
 *
 * Effect currencies: knowledge, money, research, applications, influence, equity, burnout
 * (Burnout deltas accumulate but have no mechanical effect until session 27.)
 */
export const EVENTS = [
  // ── FAANG ─────────────────────────────────────────────────────────────
  {
    id: 'faang_bug_bash_weekend',
    track: 'faang',
    title: 'Bug bash weekend',
    flavor: "PM wants volunteers. Your weekend, their KPIs.",
    options: [
      { label: 'Volunteer', effect: { knowledge: 300, influence: 8, burnout: 10 } },
      { label: 'Decline', effect: { influence: -3 } },
    ],
  },
  {
    id: 'faang_refactor_sprint',
    track: 'faang',
    title: 'Refactor sprint',
    flavor: "Two weeks of tech-debt paydown. Big Knowledge bump, no Money.",
    options: [
      { label: 'Lead the sprint', effect: { knowledge: 800, influence: 12 } },
      { label: 'Stay on the roadmap', effect: { money: 500 } },
    ],
  },
  {
    id: 'faang_oncall_hell',
    track: 'faang',
    minRank: 3,
    title: 'On-call rotation from hell',
    flavor: "PagerDuty fired at 3am for a stale stat. Then at 5am. Then 6:30.",
    options: [
      { label: 'Power through', effect: { money: 1500, burnout: 25 } },
      { label: 'Swap with a senior, owe them', effect: { influence: -8 } },
    ],
  },
  {
    id: 'faang_promo_packet',
    track: 'faang',
    minRank: 3,
    title: 'Mid-cycle calibration',
    flavor: "Your manager wants a promo packet by Friday. They claim it's optional.",
    options: [
      { label: 'Write the packet', effect: { knowledge: 400, influence: 15, burnout: 8 } },
      { label: '"Maybe next cycle"', effect: { influence: -5 } },
    ],
  },
  {
    id: 'faang_reorg_rumor',
    track: 'faang',
    title: 'Reorg rumor',
    flavor: "Slack channel #general-leadership just went private. Have a nice weekend.",
    options: [
      { label: '(read it on Blind anyway)', effect: {} },
    ],
  },

  // ── STARTUP ───────────────────────────────────────────────────────────
  {
    id: 'startup_term_sheet',
    track: 'startup',
    minRank: 2,
    title: 'Hostile term sheet',
    flavor: "$hostile_VC offered. Sign for +equity, lose Influence. Or walk.",
    options: [
      { label: 'Sign', effect: { equity: 2000, influence: -20 } },
      { label: 'Walk', effect: { influence: 10 } },
    ],
  },
  {
    id: 'startup_founder_dinner',
    track: 'startup',
    title: 'Founder dinner',
    flavor: "Networking with other CEOs. Open bar. They're all on diet Diet Coke.",
    options: [
      { label: 'Network hard', effect: { influence: 40, money: -200 } },
      { label: 'Sneak out early', effect: { knowledge: 50 } },
    ],
  },
  {
    id: 'startup_pivot_pressure',
    track: 'startup',
    title: 'Customer wants a pivot',
    flavor: "Biggest customer wants you to rebuild the product. They're 40% of revenue.",
    options: [
      { label: 'Rebuild for them', effect: { money: 2000, research: -100, burnout: 15 } },
      { label: 'Lose the contract', effect: { money: -1500, influence: 5 } },
    ],
  },
  {
    id: 'startup_yc_office_hours',
    track: 'startup',
    minRank: 2,
    maxRank: 4,
    title: 'YC office hours',
    flavor: "PG-era advice. Three sentences. Will change your life.",
    options: [
      { label: 'Take notes', effect: { knowledge: 200, influence: 25 } },
    ],
  },
  {
    id: 'startup_acquirer_dm',
    track: 'startup',
    minRank: 4,
    title: 'Acquirer in DMs',
    flavor: "FAANG VP wants to buy you out. The offer ends Friday.",
    options: [
      { label: 'Take the exit', effect: { money: 50000, equity: -3000, influence: -10 } },
      { label: 'Hold for IPO', effect: { influence: 30 } },
    ],
  },

  // ── PhD ───────────────────────────────────────────────────────────────
  {
    id: 'phd_neurips_deadline',
    track: 'phd',
    title: 'NeurIPS deadline in 48 hours',
    flavor: "Your experiments haven't converged. Your advisor is on sabbatical in Italy.",
    options: [
      { label: 'Pull through', effect: { research: 600, burnout: 25, knowledge: 200 } },
      { label: 'Skip the cycle', effect: { research: 50 } },
    ],
  },
  {
    id: 'phd_reviewer_2',
    track: 'phd',
    minRank: 2,
    title: 'Reviewer #2',
    flavor: "Reject. \"Authors fail to cite my own work.\" The citation count is suspicious.",
    options: [
      { label: 'Appeal politely', effect: { influence: -5, research: 100 } },
      { label: 'Resubmit elsewhere', effect: { research: 200 } },
    ],
  },
  {
    id: 'phd_advisor_dropped',
    track: 'phd',
    minRank: 2,
    maxRank: 3,
    title: 'Advisor left for industry',
    flavor: "They took a Director role at Octopus Inc. You inherit half their grad students.",
    options: [
      { label: 'Find a new advisor', effect: { influence: 20, research: -300, knowledge: 100 } },
    ],
  },
  {
    id: 'phd_grant_won',
    track: 'phd',
    minRank: 3,
    title: 'NSF grant funded',
    flavor: "Three years of funding. Lab equipment. A first-year RA who is somehow already smarter than you.",
    options: [
      { label: '(claim)', effect: { money: 8000, research: 400, influence: 30 } },
    ],
  },
  {
    id: 'phd_tenure_letters',
    track: 'phd',
    minRank: 5,
    title: 'External tenure letters submitted',
    flavor: "Three senior professors at peer departments wrote glowingly. One was your enemy.",
    options: [
      { label: '(internalize the praise)', effect: { influence: 50, research: 300 } },
    ],
  },

  // ── UPWORK (where the comedy lives) ───────────────────────────────────
  {
    id: 'upwork_amazon_clone',
    track: 'upwork',
    title: '"$50 to build me a website like Amazon"',
    flavor: 'Must work on iPhone and Smart TV. Long-term opportunity for the right freelancer!',
    options: [
      { label: 'Accept the gig', effect: { money: 50, burnout: 8 } },
      { label: 'Decline politely', effect: {} },
      { label: 'Decline impolitely', effect: { influence: -3 } },
    ],
  },
  {
    id: 'upwork_test_project',
    track: 'upwork',
    title: '"Test project, no pay until full delivery"',
    flavor: 'Looking for someone serious. 12 Connects to apply. They have 47 applications already.',
    options: [
      { label: 'Apply anyway', effect: { influence: -1 } },
      { label: 'Skip', effect: {} },
    ],
  },
  {
    id: 'upwork_jss_drop',
    track: 'upwork',
    minRank: 2,
    title: '4-star review',
    flavor: 'Client gave you 4 stars. Feedback: "no major issues." The 4 stars hit your JSS.',
    options: [
      { label: '(accept the bruise)', effect: { money: 200, burnout: 5 } },
    ],
  },
  {
    id: 'upwork_exposure_offer',
    track: 'upwork',
    title: '"Cofounder opportunity"',
    flavor: 'No pay until first revenue. Compensation: exposure. They linked a Calendly.',
    options: [
      { label: 'Send a polite no', effect: {} },
      { label: 'Block and report', effect: { influence: 2 } },
    ],
  },
  {
    id: 'upwork_course_featured',
    track: 'upwork',
    minRank: 5,
    title: '"Your course made r/Upworked"',
    flavor: 'Mostly mocking, but the link clicks are real. Course sales spike.',
    options: [
      { label: '(thank the haters)', effect: { money: 1500, influence: 80 } },
    ],
  },
];

export const EVENTS_BY_ID = Object.fromEntries(EVENTS.map((e) => [e.id, e]));

/**
 * Filter the event bank for events eligible to fire from the given state.
 */
export function getEligibleEvents(state) {
  const fired = new Set(state.events.firedEventIds);
  return EVENTS.filter((e) => {
    if (fired.has(e.id)) return false;
    if (e.track !== 'any' && e.track !== state.career.currentTrack) return false;
    const rank = state.career.rank;
    if (rank < (e.minRank ?? 2)) return false;
    if (rank > (e.maxRank ?? 7)) return false;
    return true;
  });
}

/**
 * Pick one eligible event at random. Returns null if no candidates.
 */
export function pickEligibleEvent(state) {
  const candidates = getEligibleEvents(state);
  if (candidates.length === 0) return null;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

/**
 * Poisson inter-arrival time. Mean = 30s career, 3s devmode.
 */
export function nextEventDelayMs(devMode) {
  const meanSec = devMode ? 3 : 30;
  return -Math.log(1 - Math.random()) * meanSec * 1000;
}
