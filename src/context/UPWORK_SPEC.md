# Upwork Spec

Upwork is the fourth career track — the failure-state fallback and a peer track for voluntary entry. It shares the same 7-rank structure and rank mechanics as FAANG/Startup/PhD, but layers on three **trap mechanics** unique to it. These sub-mechanics are what make Upwork mechanically worse than the other tracks even when you're winning.

## Sub-mechanic 1: 🪙 Connects

Upwork's bidding currency, applied to gigs.

### Regeneration

- Base regen: 10 Connects per in-game day (a "day" = 10 real seconds in career mode, 1 sec in devmode)
- Soft cap: 100 (regen pauses above this; players are encouraged to spend)

### Spending

Connects are spent to apply to gigs. The "apply" action is what events use to deliver rewards in Upwork:

- Each gig application costs 10–16 Connects (varies by gig tier)
- Application success rate: 5–10% (most are burned for nothing)
- A success either delivers a flat reward or transitions to a multi-step gig event

### Buying with Money

When Connects run out:

- Bundle: 50 Connects for $7.50 (so $0.15 each)
- Bundle: 200 Connects for $25 (so $0.125 each, slight bulk discount)
- "The currency you buy with currency to apply to jobs that may pay you currency."

### Display

In the HUD, shown alongside other currencies but visually distinct (slightly dimmer color or a separator). Only appears when current track is Upwork.

### State

```js
state.upwork.connects = 40;           // starting balance on entry
state.upwork.connectsLastRegen = ts;  // for regen scheduling
```

## Sub-mechanic 2: ⭐ Job Success Score (JSS)

Your numeric rating. Gates higher-tier gigs.

### Rules

- Starts at 100% on entry (no completed gigs yet)
- Drops from:
  - Bad reviews (random events) — usually −2 to −5 per incident
  - Declined active gigs — −1 per decline
  - Mid-project cancellations (rare) — −10
- Recovers slowly:
  - +0.5 per successful gig completion
  - Specific positive events can give +1 to +2

### Tier gating

- JSS >= 90: Top Rated tier (rank 3) unlocked
- JSS >= 90 AND $20K lifetime earned: Top Rated Plus (rank 4) unlocked
- JSS < 90: lose Top Rated tier (and its rate bonus) until you grind back

### Display

Always visible in HUD when on Upwork, formatted as `JSS: 87%` with color coding:

- 90–100: phosphor-bright (good)
- 80–89: phosphor (cautionary, normal color)
- < 80: error red (bad)

### Penalty visibility

When JSS drops, show a small toast: `JSS −2 (client review: 'no major issues')`.

## Sub-mechanic 3: 📉 Platform tax

Upwork takes 10% of all Money earned while on the Upwork track.

### Implementation

```js
function earnMoney(amount) {
  if (state.currentTrack === 'upwork') {
    const tax = Math.floor(amount * 0.10);
    state.upwork.platformTaxLifetime += tax;
    amount -= tax;
  }
  state.currencies.money += amount;
}
```

Apply on all Money sources: clicks, passive trickle, event rewards. **Exception**: rank 7 (Platform Influencer) "course sales" bypass the tax. That's the path out.

### Visible counter

A small HUD-adjacent counter: `Lost to platform: $487.20 lifetime`. Continuously updates. Pure psychological friction.

## The 5-dialogue gauntlet

Triggered only when the player **voluntarily** swaps from FAANG/Startup/PhD into Upwork (NOT triggered by forced entry from a failed Senior-Year Job Offer). Five sequential modals; cancel at any one aborts the swap.

Each dialog uses the standard `<Modal>` atom with title, body text, "Continue" button, and "Cancel" button.

### Dialog 1 — Standard warning

**Title**: Are you sure?

**Body**:
> Voluntarily leaving {currentTrackLabel} for Upwork will drop you to rank {newRank} ({newRankLabel}) and add three new mechanics: Connects, Job Success Score, and a 10% platform tax.
>
> This is reversible — you can swap back at −2 ranks later — but you'll be rebuilding from the bottom.

**Buttons**: `Continue` / `Cancel`

### Dialog 2 — The trap details

**Title**: Just so we're clear

**Body**:
> Connects regenerate at 10 per day. Each gig application costs 10–16 Connects. Application acceptance rate is 5–10%.
>
> Job Success Score starts at 100% and drops on bad reviews. Below 90%, you lose Top Rated tier and its rate bonus.
>
> Upwork takes 10% of every gig you complete. That counter never resets.
>
> Still in?

**Buttons**: `Yes` / `No`

### Dialog 3 — The LinkedIn moment

**Title**: One more thing

**Body**:
> Your LinkedIn title will say "Founder & CEO at {playerName} LLC" from this moment forward.
>
> People will assume your company has one employee. They will be correct.
>
> You will start using the word "consulting" in conversation. You will not be able to stop.

**Buttons**: `Acknowledged` / `Cancel`

### Dialog 4 — The financial reality

**Title**: We need to talk about money

**Body**:
> Your former colleagues will offer you "consulting" work at 30% of your old rate, then ghost you mid-project.
>
> The IRS will become your closest pen pal. You will learn what a quarterly estimated tax payment is. You will pay it late.
>
> Your accountant — whom you do not yet have — will charge $400/hour to tell you what you already know.
>
> Last chance to back out.

**Buttons**: `I want this` / `Cancel`

### Dialog 5 — The game gives up

**Title**: Fine

**Body**:
> Welcome to Upwork. Please upload a profile photo. We recommend something that looks like a hostage situation.
>
> Your starting balance: 40 Connects, $0, JSS 100%.
>
> Good luck out there.

**Buttons**: `Begin` (no Cancel — at this point the swap commits when you click Begin)

After Dialog 5's "Begin": execute the swap (set currentTrack='upwork', rank=newRank, etc.). State changes are atomic; if for any reason the swap fails between Dialog 5's render and click, log the error and leave the player in their prior track.

## Upwork rank tier flavor (display names)

When showing the rank in HUD/UI, use the tier name:

| Rank | Display name |
|---|---|
| 1 | New Freelancer |
| 2 | Rising Talent |
| 3 | Top Rated |
| 4 | Top Rated Plus |
| 5 | Expert-Vetted |
| 6 | Agency Owner |
| 7 | Platform Influencer |

These names also appear in events ("You've been promoted to Rising Talent!") and on the rank-up modal.

## Upwork rank mechanics flavoring (recap)

Each of the seven rank mechanics has Upwork-flavored content. See `MECHANICS_SPEC.md` for the universal mechanic; this is the Upwork voice:

- **Rank 1 Specialization**: "WordPress themes" / "Logo design (you'll undercut graphic designers)" / "AI agents (clients don't know what they want)"
- **Rank 2 Events**: see Upwork events in `EVENTS_SPEC.md`
- **Rank 3 Influence allocation**: "Build a personal brand" — slot Connects-saved or JSS-recovery into the allocator
- **Rank 4 Hires**: subcontract other freelancers (markup their rates 30%, the cycle of exploitation deepens)
- **Rank 5 Manage**: "Mentor your subcontractors via 6am Zoom calls"
- **Rank 6 Teams**: "Form an agency" — branded multi-specialist groups
- **Rank 7 Strategic — Platform Influencer**: sell courses ("How I Make $50K/Month on Upwork") to aspiring freelancers. Course sales are pure Money + Influence, tax-free, with high variance based on Influence stockpile.

## Endgame trigger

Reach $10,000 in **course sales** (tracked separately as `state.upwork.courseSales`). At that point fire the endgame modal:

**Title**: Platform Influencer

**Body**:
> You've made $10K selling courses about how to make money on Upwork to people trying to make money on Upwork.
>
> Your largest revenue source is a $497 "Connects optimization masterclass."
>
> Your YouTube subscribers think you're "an inspiration." Your former clients have started ghosting you the same way they used to.
>
> The cycle is complete.

The endgame doesn't auto-end the run. Player can keep going.
