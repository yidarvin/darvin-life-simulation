/**
 * Random sub-events that fire during an internship. Selection and scheduling happens
 * at internship start (see store.beginInternship). All effects are currency deltas
 * applied directly to state.currencies.
 */
export const INTERNSHIP_EVENTS = [
  {
    id: 'pr_review_friday',
    title: 'PR review at 5:55pm Friday',
    flavor: 'Your manager opened a six-comment review thread one minute before they logged off for the weekend.',
    options: [
      { label: 'Address all comments by Monday EOD', effect: { knowledge: 50, influence: 4 } },
      { label: 'Push back: "let me know which are blocking"', effect: { influence: -2, knowledge: 10 } },
    ],
  },
  {
    id: 'team_lunch',
    title: 'Team lunch on Wednesday',
    flavor: "They're going to that ramen place. Five people deep into the same conversation about K8s.",
    options: [
      { label: 'Go and engage', effect: { influence: 6, money: -25 } },
      { label: 'Skip, work through lunch', effect: { knowledge: 30, influence: -1 } },
    ],
  },
  {
    id: 'oncall_shadowing',
    title: 'Shadow on-call rotation?',
    flavor: 'The senior eng offered to walk you through their on-call week. You will not be paid for the shadowing.',
    options: [
      { label: 'Yes, I want to learn', effect: { knowledge: 80, influence: 5 } },
      { label: 'Decline, focus on the project', effect: { knowledge: 20, influence: 0 } },
    ],
  },
  {
    id: 'hackweek',
    title: 'Internal hackweek',
    flavor: 'Four days, build something. Winners get a $50 gift card and a Slack shoutout.',
    options: [
      { label: 'Go for the win', effect: { knowledge: 100, influence: 8, money: 50 } },
      { label: 'Build something safe and ship it', effect: { knowledge: 40, influence: 3 } },
    ],
  },
  {
    id: 'demo_day',
    title: 'Demo your intern project',
    flavor: "Whole-org demo day. VP of Eng is on the call. Last year's intern crashed staging on stage.",
    options: [
      { label: 'Go big, show the stretch features', effect: { influence: 10, knowledge: 20 } },
      { label: 'Stick to the boring core flow', effect: { influence: 3, knowledge: 30 } },
    ],
  },
  {
    id: 'return_offer_signal',
    title: '1:1 with your manager',
    flavor: 'They asked, in a tone that could go either way, "so what are you thinking for after the internship?"',
    options: [
      { label: 'Express strong interest in returning', effect: { influence: 6 } },
      { label: '"Still keeping my options open"', effect: { influence: -1, knowledge: 15 } },
    ],
  },
  {
    id: 'production_incident',
    title: 'Staging is on fire',
    flavor: "You're an intern. You did not cause this. The PagerDuty alert is asking nicely if you can help.",
    options: [
      { label: 'Jump in, help debug', effect: { knowledge: 60, influence: 7 } },
      { label: 'Watch and learn from the channel', effect: { knowledge: 20, influence: 1 } },
    ],
  },
];

export const INTERNSHIP_EVENTS_BY_ID = Object.fromEntries(INTERNSHIP_EVENTS.map((e) => [e.id, e]));

/**
 * Pick 3 random events and schedule them at days ~25, ~55, ~80.
 */
export function buildEventSchedule(rng = Math.random) {
  const ids = [...INTERNSHIP_EVENTS].sort(() => rng() - 0.5).slice(0, 3).map((e) => e.id);
  return [
    { atDay: 25, eventId: ids[0] },
    { atDay: 55, eventId: ids[1] },
    { atDay: 80, eventId: ids[2] },
  ];
}
