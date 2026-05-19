/**
 * Year-transition data.
 *
 * Each entry describes what happens when the player advances OUT of that year.
 * `threshold` is the transactional cost — currencies are deducted on advance.
 * `unlocks` is the currency that becomes visible in the next year.
 *
 * `requiresEvent` flags transitions that should be handled by an event flow rather
 * than direct year-bump. Session 13 lets `tryAdvanceYear()` reject those transitions
 * with the event name as a reason; sessions 14 and 15 handle them properly.
 */
export const YEAR_TRANSITIONS = {
  freshman: {
    nextYear: 'sophomore',
    nextStage: 'undergrad',
    threshold: { knowledge: 100 },
    unlocks: 'money',
    flavor: 'You learned what `git push --force` does. You learned why you shouldn\'t.',
  },
  sophomore: {
    nextYear: 'junior',
    nextStage: 'undergrad',
    threshold: { knowledge: 250, money: 300 },
    unlocks: 'research',
    requiresEvent: 'summer_internship',
    flavor: 'You declared a major. Twice.',
  },
  junior: {
    nextYear: 'senior',
    nextStage: 'undergrad',
    threshold: { knowledge: 600, money: 800, research: 25 },
    unlocks: 'applications',
    flavor: 'You finally understood pointers. Then you forgot.',
  },
  senior: {
    nextYear: null,
    nextStage: 'career',
    threshold: { knowledge: 1000, money: 1500, research: 50, applications: 10 },
    unlocks: null,
    requiresEvent: 'senior_year_job_offer',
    flavor: 'You wrote your last problem set. You won\'t miss them. You will miss them.',
  },
};

/**
 * Display labels for year keys (used in UI without leaking the internal lowercase).
 */
export const YEAR_LABELS = {
  freshman: 'Freshman',
  sophomore: 'Sophomore',
  junior: 'Junior',
  senior: 'Senior',
};
