# Mechanics Spec

Game mechanics are layered: base mechanics introduced during undergrad/internship, seven rank mechanics that unlock progressively in the career tracks, and cross-cutting sub-mechanics.

## Base mechanics (pre-career)

### Clicking

The fundamental input. Each click on an action button increments the associated currency by `state.perClick[currency]`.

```js
function clickAction(currency) {
  const yield = state.perClick[currency];
  state.currencies[currency] += yield;
  spawnFloatText(`+${yield}`);
}
```

### Click multipliers (shop, undergrad-tier)

Permanent purchases that increase per-click yield. Stack additively.

```js
buyClickMultiplier(currency, amount) {
  state.perClick[currency] += amount;
}
```

### Automation / passive generators (unlocked at Internship completion)

Permanent purchases that add to per-second passive yield. Apply on each game tick (100ms = 10Hz).

```js
buyPassive(currency, ratePerSec) {
  state.perSecond[currency] += ratePerSec;
}

function tick(dtSeconds) {
  for (const c of Object.keys(state.perSecond)) {
    state.currencies[c] += state.perSecond[c] * dtSeconds * speedMultiplier;
  }
}
```

Where `speedMultiplier` is `1` in career mode, `10` in devmode.

### Transactional level-up

When you cross a rank's threshold, currencies are **consumed** in exchange for the rank-up. Not a one-way gate — it's a transaction.

```js
function levelUp() {
  if (!canAfford(rankCost(currentRank + 1))) return;
  pay(rankCost(currentRank + 1));
  state.rank += 1;
  triggerRankMechanic(state.rank);
}
```

Costs from `CURRENCY_SPEC.md`.

## The seven rank mechanics

Each is shared across all four tracks but flavored per track. Unlocked at the specified rank. Once unlocked, it persists for the rest of the run regardless of track swaps (though the **content** flavors with current track).

### Rank 1 — Specialization

**Unlock**: entry into a track (rank 1 of FAANG, Startup, PhD, or Upwork).

**Mechanic**: one-time choice from 3 options per track. Each option grants +20% to one currency's generation rate, locked for the rest of the run. The choice also gates some later content (specific events, certain endgames).

**Per-track options**:

- **FAANG**: Backend / Frontend / ML
- **Startup**: B2B / B2C / DeepTech
- **PhD**: Theory / Applied / Interdisciplinary
- **Upwork**: WordPress / Logo Design / "AI Agents"

**UI**: a modal at rank 1 entry asking the player to choose. No cancel option (must pick).

**State**: `state.specialization = { track, choice }`. Read by other mechanics for gates.

### Rank 2 — Events

**Unlock**: rank 2 of current track.

**Mechanic**: Random events fire periodically as banners at the top of the play area. Each event has 2–3 options: claim a bonus, ignore, or pay a cost for a bigger payoff.

**Trigger**: Poisson-distributed timer with mean of ~30 seconds in career mode. Events draw from a track-specific event bank (see `EVENTS_SPEC.md`).

**Examples**:
- FAANG: "Bug bash weekend — give up Saturday for +200 Knowledge?"
- Startup: "Term sheet from $hostile_VC — accept (+5000 Equity, −2 Influence) / decline (no change)?"
- PhD: "Conference deadline — pull all-nighter (+50 Research) / sleep (no change)?"
- Upwork: "Client paid 4 stars instead of 5. Feedback: 'no major issues.' JSS −2."

Events are dismissable. Dismissed events don't fire again that session.

### Rank 3 — Influence multipliers

**Unlock**: rank 3 of current track.

**Mechanic**: A new panel appears: "Influence allocator." The player can spend Influence to add a passive multiplier to one of: Knowledge, Money, Research. Each allocation is fixed and persistent until reallocated.

**Mechanic detail**: per 100 Influence spent, +5% to the chosen currency's per-second generation rate. Reallocation has a 30-second cooldown (in-game time).

**UI**: a small allocator panel with three buttons (one per target currency), showing current allocation in basis points or percent.

**Why it matters**: Influence becomes the strategic currency — players choose which currency to accelerate, with consequences for what mechanics they can afford later.

### Rank 4 — Hire individuals

**Unlock**: rank 4 of current track.

**Mechanic**: A new "Hires" panel appears. The player can spend Money + Influence to hire named individuals who generate currencies passively. Each hire has a procedurally-generated name and a stat profile.

**Per-track flavor**:
- FAANG: "Hired Jake (E5 SWE) — generates 8 Money/sec, 2 Knowledge/sec"
- Startup: "Hired Priya (Founding Engineer, 1.5% equity) — generates 4 Money/sec, 3 Equity/sec"
- PhD: "Took on Marcus (PhD candidate) — generates 6 Research/sec, 1 Knowledge/sec"
- Upwork: "Subcontracted Diana (logo designer) — generates 5 Money/sec, you mark up 30%"

**Hire generation**: Names are pulled from a static list per track. Stats are randomized within a band tied to current rank. Hire roster is bounded (max 5 at rank 4, more at higher ranks).

**State**:
```js
state.hires = [
  { id, name, generatedAt, baseRates: { money: 8, knowledge: 2 }, level: 1, multiplier: 1.0 }
]
```

### Rank 5 — Manage hires

**Unlock**: rank 5 of current track.

**Mechanic**: Hires gain a `level` field. Spend Influence (or specific currency depending on track) to level up a hire, increasing its generation rate by 1.5x per level (capped at level 5).

You can also fire a hire (removes them but no refund) or **poach** a hire from a competitor track (spend Money/Influence to gain a high-rank hire mid-run). Poaching is rare and expensive.

**UI**: each Hire row gets a "Level up" button and a "Fire" button. Poach opportunities appear via events.

### Rank 6 — Form teams

**Unlock**: rank 6 of current track.

**Mechanic**: Group hires into teams. Each team has:

- A manager (one of your hires, designated)
- Members (1–4 other hires)
- A composition bonus (multiplier based on team makeup)

Composition bonuses:

- All same specialty: +25% to that specialty's generation
- Mixed specialties: +15% to all currencies they generate
- Has both Knowledge generator and Money generator: +10% Money
- Has manager with level >= 3: +20% to manager's primary stat

**Per-track flavor**:
- FAANG: "Backend Team" / "Platform Team"
- Startup: "Engineering" / "Sales" / "Product"
- PhD: "Lab — ML Subgroup"
- Upwork: "Agency: Quick-Turn Logos" / "Agency: Full-Stack Sprints"

**UI**: a "Teams" panel with drag-and-drop or click-to-add team builder.

### Rank 7 — Strategic endgame

**Unlock**: rank 7 (endgame) of current track. Different mechanic per track.

- **FAANG (Fellow / VP)**: "Strategic initiatives" — declare a quarterly priority that gives +30% multiplier to one currency company-wide for 60 seconds. 5-minute cooldown.
- **Startup (IPO / Exit)**: "Stock price minigame" — a live stock price ticks with random news events. Buy/sell decisions affect Money. Hit a target valuation to "exit" for a huge Money + Equity bonus.
- **PhD (Named Chair)**: "Department policy" — set university-wide policies that affect your generation and attract top students (poach new high-rank hires periodically).
- **Upwork (Platform Influencer)**: "Course sales" — bypass the platform tax by selling courses to aspiring freelancers. Pure Money + Influence generator. The dark mirror of the platform itself.

**Endgame trigger**: When the rank 7 mechanic is "completed" (track-specific condition), the endgame modal fires. Player can keep playing past it to chase other tracks' endgames.

## Cross-cutting sub-mechanics

### Burnout (🔥)

A meter that accumulates from clicking and from owning many hires. Visible in the HUD post-internship.

**Accumulation rules**:
- +0.1 per click action
- +0.05/sec per Hire owned (passive)
- +0.5 per Event interaction (positive or negative)

**Effects**:
- Burnout < 50: no effect
- Burnout 50–80: −10% to all generation rates (yellow indicator)
- Burnout 80–100: −30% to all generation rates (red indicator, "Burnout warning" modal once)
- Burnout >= 100: hard pause — no generation, no clicks register until reduced

**Reduction**:
- Vacation event (spend 1000 Money) — clears 50 Burnout instantly
- Sabbatical event (PhD/FAANG only, spend 10000 Money + 50 Influence) — clears all Burnout
- Passive decay: −0.05/sec when not clicking

**UI**: a meter in the HUD with color coding. Modal warning at 80.

### Annual Review (📅)

Periodic pacing event. Every 90 seconds of in-game time (9 seconds in devmode), an Annual Review fires.

**Mechanic**: Compare currencies earned this period vs prior period.

- Improved on all currencies: +25% Money bonus and "Promotion notice" toast
- Improved on 2–3: no effect, "Standard review" toast
- Improved on 0–1: "Performance Improvement Plan" debuff (−10% all rates for 60 seconds)

**Why it matters**: forces sustained engagement rather than burst-and-idle.

**UI**: a small badge in the HUD showing time until next review.

## Modal system

Several mechanics show modals: Specialization choice, Rank-up confirmation, Endgame reached, Burnout warning, the 5-dialogue Upwork gauntlet, etc.

All modals share a single `<Modal>` atom built in a later session. They support:

- Single or chained dialogs (next/previous navigation)
- A "Cancel" affordance
- An "OK" / acknowledge affordance
- Optional payload (continue with state change)

State pattern: `state.activeModal = { kind, payload }`. Setting to `null` closes.
