# Events Spec

The Events mechanic (Rank 2 unlock) introduces random banner events that punctuate the idle loop. Events are how the game stays interesting between clicks — they force decisions, deliver flavor, and create timing pressure.

## Architecture

### Triggering

Events fire at Poisson-distributed intervals once the player is at Rank 2 or higher of any career track. Default means:

- **Career mode**: ~30 seconds between events (so ~2/min average)
- **Devmode**: ~3 seconds between events (compressed for testing/speedrunning)

```js
function scheduleNextEvent() {
  const meanSec = state.devMode ? 3 : 30;
  // Inverse CDF sampling for exponential dist:
  const delay = -Math.log(1 - Math.random()) * meanSec * 1000;
  state.nextEventAt = Date.now() + delay;
}
```

A maximum of one event banner is visible at a time. If a new event triggers while one is active, it queues (queue depth max 3; overflow drops oldest queued).

### Lifecycle

1. **Trigger** — RNG selects an eligible event from the current track's event bank.
2. **Banner display** — slides in from the top with title, flavor, and 1–3 option buttons.
3. **Player interaction** — click an option, or click the Dismiss (×) corner.
4. **Resolution** — option's effect applies to game state; banner slides out.
5. **Cooldown** — that event ID is added to `firedEventIds`; it won't fire again this session. Resets on run reset.

### State

```js
state.eventSystem = {
  enabled: false,            // true once any track reaches rank 2
  nextEventAt: null,         // timestamp ms
  activeEvent: null,         // { id, ...payload } or null
  queue: [],                 // pending events
  firedEventIds: new Set(),  // already-fired this session
};
```

## Eligibility filtering

When picking an event from the bank, filter by:

- `event.track === currentTrack` OR `event.track === 'any'`
- `currentRank >= event.minRank` AND `currentRank <= event.maxRank`
- `!firedEventIds.has(event.id)` (one-shot per session)
- Optional `event.requiresSpec` — only fires if specialization matches
- Optional `event.requiresFlag` — game-state preconditions (e.g., `hasHires`)

If filter returns empty, defer the next trigger and try again on next tick. Don't crash.

## Event types

| Type | Description |
|---|---|
| `bonus` | Pure positive. Pick to claim, or dismiss to ignore. |
| `tradeoff` | 2 options with conflicting upsides — must choose. |
| `threat` | Negative outcome by default; spend currency to mitigate. |
| `flavor` | No mechanical effect, pure copy. Dismissable only. Rare. |

## Event shape

```js
{
  id: 'faang_bug_bash_weekend',
  track: 'faang',          // or 'any' / 'startup' / 'phd' / 'upwork'
  minRank: 2,
  maxRank: 7,
  type: 'tradeoff',
  title: 'Bug bash weekend',
  flavor: 'PM is asking for volunteers. Your weekend, their KPIs.',
  options: [
    {
      label: 'Volunteer',
      apply: (state) => {
        state.currencies.knowledge += 200;
        state.currencies.influence += 5;
        state.burnout += 8;
      },
    },
    {
      label: 'Decline',
      apply: (state) => {
        state.currencies.influence -= 2;
      },
    },
  ],
}
```

Effect functions should be pure-ish: they receive (and mutate) the store's state object. Track-level rates and rank-up status remain managed by the store; events should not directly change `state.rank` or `state.currentTrack`.

## Sample event banks (4–6 per track, illustrative)

Full bank lives in `src/data/events.js` (created in session 19). These are starting samples.

### FAANG (illustrative)

| ID | Type | Title | Flavor |
|---|---|---|---|
| `faang_bug_bash_weekend` | tradeoff | Bug bash weekend | "PM wants volunteers. Your weekend, their KPIs." |
| `faang_refactor_sprint` | bonus | Refactor sprint | "Two weeks of tech-debt paydown. Big Knowledge bump." |
| `faang_oncall_hell` | threat | On-call rotation | "PagerDuty fired at 3am for a stale stat. −Sleep, +Money, +Burnout." |
| `faang_perf_review` | tradeoff | Mid-cycle calibration | "Manager wants a packet by Friday. Push back or comply?" |
| `faang_reorg_rumor` | flavor | Reorg rumor | "Slack channel #general-leadership just went private. Have a nice weekend." |
| `faang_promo_packet` | bonus | Promo packet accepted | "Your packet cleared calibration. Stage advance unlocked." |

### Startup (illustrative)

| ID | Type | Title | Flavor |
|---|---|---|---|
| `startup_term_sheet` | tradeoff | Hostile term sheet | "$hostile_VC offered. Sign for +5000 Equity, −20 Influence. Or walk." |
| `startup_founder_dinner` | bonus | Founder dinner | "Networking with other CEOs. +30 Influence, −$500." |
| `startup_pivot_pressure` | threat | Customer wants a pivot | "Lose them or rebuild the product. −Money OR −Research." |
| `startup_yc_office_hours` | bonus | YC office hours | "PG-era advice. +50 Knowledge, +10 Influence." |
| `startup_burn_alarm` | threat | Runway warning | "Six months left. Cut staff or raise emergency bridge." |
| `startup_acquirer_dm` | tradeoff | Acquirer in DMs | "FAANG VP wants to buy you out. Take the exit or hold for IPO?" |

### PhD (illustrative)

| ID | Type | Title | Flavor |
|---|---|---|---|
| `phd_neurips_deadline` | tradeoff | NeurIPS deadline | "48 hours. Pull through (+80 Research, +15 Burnout) or skip the cycle." |
| `phd_reviewer_2` | threat | Reviewer #2 | "Reject. 'Authors fail to cite my own work.' Spend Influence to appeal?" |
| `phd_advisor_dropped` | threat | Advisor left for industry | "Find new advisor. Lose Research progress for 60 sec." |
| `phd_grant_won` | bonus | NSF grant funded | "+$5000 over 3 years. Lab funded. Big Influence boost." |
| `phd_oral_qual` | tradeoff | Oral qualifying exam | "Pass: rank-up boost. Fail: lose 200 Knowledge, retry next semester." |
| `phd_tenure_letters` | bonus | External letters submitted | "Tenure case strengthened. +Reputation chain unlocked." |

### Upwork (illustrative — and where the comedy lives)

| ID | Type | Title | Flavor |
|---|---|---|---|
| `upwork_amazon_clone` | threat | "$50 to build me a website like Amazon" | "Must work on iPhone and Smart TV. Long-term opportunity!" |
| `upwork_test_project` | tradeoff | "Test project, no pay until full delivery" | "Looking for someone serious. 12 Connects to apply." |
| `upwork_webcam_request` | tradeoff | "Trust-building exercise" | "Client wants you to keep the webcam on. Accept for 2x rate, decline for normal." |
| `upwork_jss_drop` | threat | 4-star review | "Client gave you 4 stars. Feedback: 'no major issues.' JSS −2." |
| `upwork_exposure_offer` | flavor | "Cofounder opportunity" | "No pay until first revenue. Compensation: exposure. They linked a Calendly." |
| `upwork_ai_agent` | tradeoff | "AI agent project, just like ChatGPT" | "Budget: $200. Total scope: an AGI. Pick your move." |
| `upwork_urgent_4hr` | threat | URGENT: 4-hour deadline | "Budget: $25. Will pay you in 5-star review." |
| `upwork_diet_coke_culture` | flavor | "We're like a family at this YC startup" | "Pay is below market but we have unlimited Diet Coke." |
| `upwork_subcontractor_ghost` | threat | Subcontractor ghosted | "Mid-project, JSS at risk. Spend $500 to hire emergency replacement." |
| `upwork_course_featured` | bonus | "Your course made r/Upworked" | "+200 Influence, course sales boosted." |

## Annual Review event

A special periodic event (separate from the Rank 2 random pool). See `MECHANICS_SPEC.md` "Annual Review" section. Fires every 90 seconds in career mode (9 sec in devmode), not Poisson-random.

```js
{
  id: 'annual_review',
  type: 'special',
  title: 'Annual performance review',
  flavor: '[track-specific copy here]',
  trigger: 'periodic',
  interval: 90_000,
}
```

## Vacation / sabbatical events (Burnout-mitigating)

Fire automatically when Burnout >= 80 and player hasn't dismissed one recently. Not random — triggered by state.

| ID | Cost | Effect |
|---|---|---|
| `vacation_short` | $1,000 | −50 Burnout |
| `sabbatical_full` (FAANG/PhD only) | $10,000 + 50 Influence | −all Burnout |

## Implementation note

In the rank-2 mechanic session (later), build the event banner component, the trigger scheduler, and the firedEventIds tracking. The actual event bank (`src/data/events.js`) is populated in its own session and can grow over time.
