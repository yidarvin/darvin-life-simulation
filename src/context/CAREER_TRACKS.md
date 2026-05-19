# Career Tracks Spec

Four career tracks: three "real" tracks (FAANG, Startup, PhD) and one fallback (Upwork). Each has seven ranks. Ranks are equivalent across tracks for swap-cost purposes.

## Rank equivalency table

The same numeric rank (1–7) means equivalent seniority across all tracks for swap math:

| Rank | FAANG | Startup | PhD / Academia | Upwork |
|---|---|---|---|---|
| 1 | L3 new grad | Pre-seed idea | PhD year 1–2 | New Freelancer |
| 2 | L4 SWE II | Seed | PhD year 3–5 | Rising Talent |
| 3 | L5 Senior | Series A | Postdoc | Top Rated |
| 4 | L6 Staff | Series B | Assistant Professor | Top Rated Plus |
| 5 | L7 Senior Staff | Series C | Associate Professor | Expert-Vetted |
| 6 | L8 Principal | Series D | Full Professor | Agency Owner |
| 7 (endgame) | Fellow / VP | IPO / Exit | Named Chair | Platform Influencer |

## Swap topology

Players can swap tracks mid-run. Each swap costs rank drop — the amount depends on the direction (rock-paper-scissors among the top three, plus asymmetric Upwork edges).

### Rock-paper-scissors cycle (among top three)

| From → To | Cost | Visual |
|---|---|---|
| PhD → FAANG | −1 rank | "With cycle" (easy) |
| FAANG → Startup | −1 rank | "With cycle" (easy) |
| Startup → PhD | −1 rank | "With cycle" (easy) |
| FAANG → PhD | −3 ranks | "Against cycle" (hard) |
| Startup → FAANG | −3 ranks | "Against cycle" (hard) |
| PhD → Startup | −3 ranks | "Against cycle" (hard) |

### Upwork edges

| From → To | Cost | Notes |
|---|---|---|
| FAANG → Upwork | −1 rank | "I'm going freelance" |
| Startup → Upwork | −1 rank | "The startup didn't make it" |
| PhD → Upwork | −1 rank | "Couldn't get tenure" |
| Upwork → FAANG | −2 ranks | Climbing out is harder |
| Upwork → Startup | −2 ranks | Same |
| Upwork → PhD | −2 ranks | Same |

Rank cannot drop below 1. If math would put you at rank 0 or below, clamp to 1.

### Voluntary entry to Upwork: the 5-dialogue gauntlet

Triggered only by voluntary swap into Upwork (not by forced entry from a failed Senior-Year Job Offer). Five sequential modals, escalating from informative to dead-eyed resignation. Cancel at any one aborts the swap.

Full dialog content lives in `COPY_REGISTRY.md`.

## Per-track currency advantages

(Restated from `CURRENCY_SPEC.md` for at-a-glance reference; numbers are relative multipliers on a base trickle.)

| Currency | FAANG | Startup | PhD | Upwork |
|---|---|---|---|---|
| 💵 Money | 5× | 2× | 0.5× | 1.5× (after 10% platform tax) |
| 🏛️ Equity | 1× | 5× | 0× | 0× |
| 📄 Research | 0.5× | 0.5× | 5× | 0.2× |
| 🌟 Influence | 0.5× | 2× | 3× | 0.1× until rank 7, then 4× |
| 🧠 Knowledge | 2× | 1× | 3× | 1× |

## Per-track entry conditions

### FAANG, Startup, PhD

Entered via the Senior-Year Job Offer event. The player chooses one of the three based on accumulated stats. Choice is not gated — any combination of stats lets you pick any of the three (though some are obviously better suited).

Specialization choice happens immediately on entry (rank 1 mechanic).

### Upwork

**Entry mode A — Forced (failure path)**: If the player fails the Senior-Year Job Offer threshold, they are placed directly into Upwork at rank 1 (New Freelancer). No choice. No gauntlet (forced is forced).

**Entry mode B — Voluntary (mid-run swap)**: At any point post-grad, the player can choose to swap into Upwork from FAANG/Startup/PhD. Triggers the 5-dialogue gauntlet. If they confirm through all five, swap completes with −1 rank drop.

## Per-track endgame conditions

Reaching rank 7 itself isn't enough — the rank-7 mechanic has its own completion condition that triggers the endgame modal:

| Track | Endgame completion |
|---|---|
| FAANG | Run 5 successful "strategic initiatives" (5-min cooldown each, so this is a 25+ minute commitment at rank 7) |
| Startup | Hit a target valuation ($1B paper valuation) via the stock price minigame |
| PhD | Get 3 students to placement (passive event chain at Named Chair) |
| Upwork | Reach $10K in course sales (a special Money source that bypasses platform tax) |

The player can continue playing past any endgame. Reaching multiple endgames in one run is a player-set goal (no formal in-game reward in v1, but the runtime stats panel could show it).

## Per-track Hire (rank 4+) name banks

Each track has a static name list for procedurally generated Hires. Names are gender-neutral and culturally diverse. Roughly 30–50 names per track.

These will be filled in `data/hires.js` in a later session. Just note here that they exist per track.

## Equity vesting per track (rank-up bumps)

Equity isn't fully passive — it has cliff vests on rank-up.

### FAANG (RSU schedule)
| Rank-up | Equity granted |
|---|---|
| 1 → 2 | 50 |
| 2 → 3 | 200 |
| 3 → 4 | 800 |
| 4 → 5 | 3,000 |
| 5 → 6 | 12,000 |
| 6 → 7 | 50,000 |

### Startup (founder shares with dilution)
- At rank 1 entry: +10,000 Equity (founder grant)
- At each rank-up (funding round): current Equity × (1 − 0.20) is taken (dilution), then +1.5× rank's cash valuation added as Equity
- Net effect: founders typically end with 25–40% of their original "ownership" by rank 6, but absolute Equity grows dramatically due to valuation

### PhD
- Equity is 0 until rank 7
- At rank 7 entry: +20,000 Equity (endowed chair bonus)

### Upwork
- Equity is always 0
- Rank 7 (Platform Influencer) does not change this. Course sales are Money, not Equity.

## Swap mechanic implementation notes

```js
function swapTrack(toTrack) {
  const fromTrack = state.currentTrack;
  const cost = SWAP_COSTS[fromTrack][toTrack];
  const newRank = Math.max(1, state.rank - cost);

  if (toTrack === 'upwork' && state.isVoluntarySwap) {
    showFiveDialogGauntlet(() => completeSwap(toTrack, newRank));
  } else {
    completeSwap(toTrack, newRank);
  }
}

function completeSwap(toTrack, newRank) {
  state.currentTrack = toTrack;
  state.rank = newRank;
  // Hires from previous track are removed
  state.hires = [];
  // Teams disbanded
  state.teams = [];
  // Specialization reset (must pick again at rank 1)
  state.specialization = null;
  // Trigger rank 1 mechanic if applicable
  if (newRank === 1) showSpecializationModal(toTrack);
}
```

Specifics (which hires carry over, etc.) — none in v1. Clean break on swap.
