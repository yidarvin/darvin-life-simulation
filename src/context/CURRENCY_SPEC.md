# Currency Spec

Six currencies total. Each is unlocked at a specific stage; before unlock, the currency is hidden from the UI entirely (don't show a "??" placeholder).

## The six currencies

| Currency | Emoji | Unlocked at | Source |
|---|---|---|---|
| Knowledge | 🧠 | Freshman year | Problem set clicks; some shop multipliers |
| Money | 💵 | Sophomore year | Part-time job clicks; some passives; rank salaries (later) |
| Research | 📄 | Junior year | Research project clicks; passives; per-rank events |
| Applications | 📨 | Senior year | Internship/job application clicks; passive generators |
| Influence | 🌟 | Post-internship | Internship completion bonus; networking events; rank-3 multipliers |
| Equity | 🏛️ | Post-job-offer | RSU vests (FAANG), founder shares (Startup), advisor warrants (PhD), zero (Upwork) |

Connects (🪙) is an **Upwork-only** sub-currency, specified in `UPWORK_SPEC.md`.

## Display

In the HUD, currencies appear in their unlock order, left-to-right:

`🧠 | 💵 | 📄 | 📨 | 🌟 | 🏛️`

Locked currencies are not rendered at all (no empty slots, no "?"s).

## Click yields (base, pre-multiplier)

| Action | Currency | Base yield per click |
|---|---|---|
| `./do_pset.sh` (problem set) | 🧠 Knowledge | 1 |
| `./ta_section.sh` or similar (job) | 💵 Money | 5 |
| `./beg_advisor.sh` (research) | 📄 Research | 1 |
| `./fire_off_cv.sh` (app) | 📨 Applications | 1 |

Click multipliers from the shop stack additively. E.g., starting at +1, buying Triple Espresso (+1) and Study Group (+2) yields +4 per click.

## Per-track generation rates (post-grad, baseline relative)

Once the player is in a career track, rank-up requirements scale and tracks gain passive trickles based on rank. The strength of each track per currency:

| Currency | FAANG | Startup | PhD | Upwork |
|---|---|---|---|---|
| 💵 Money | high (5x) | medium (2x) | very low (0.5x) | low after 10% tax (1.5x) |
| 🏛️ Equity | medium (1x) | very high (5x) | none (0x) | none (0x) |
| 📄 Research | low (0.5x) | low (0.5x) | very high (5x) | near zero (0.2x) |
| 🌟 Influence | low (0.5x) | medium (2x) | high (3x) | very low until rank 7, then surges |
| 🧠 Knowledge | medium (2x) | low (1x) | high (3x) | low (1x) |

Numbers in parentheses are relative multipliers applied to a base passive trickle that scales with rank.

## Passive trickles per rank (baseline)

At rank N in any track, the base passive rate is `BASE_TRICKLE × rank_N`, where `BASE_TRICKLE = 1 unit/second` and gets multiplied by the per-track rate above. Concretely:

```
trickle(track, currency, rank) = BASE_TRICKLE * rank * track_multiplier(track, currency)
```

Example: FAANG L5 (rank 3) Money trickle = `1 * 3 * 5 = 15/sec` baseline.
Example: PhD postdoc (rank 3) Research trickle = `1 * 3 * 5 = 15/sec` baseline.

Shop items (automation) add on top of these baseline trickles.

## Conversion rules

Currencies don't auto-convert. Specific mechanics may consume one currency to produce another (e.g., the rank-3 Influence multiplier mechanic spends Influence to boost output of another currency).

No "exchange rate" UI in v1. All conversions are mechanic-mediated.

## Rank-up costs

Each rank requires all four post-grad currencies (💵 Money, 📄 Research, 🌟 Influence, 🏛️ Equity) plus 🧠 Knowledge for some early ranks. Apps are consumed by the Senior-Year Job Offer event but not by rank-ups directly.

Reference cost schedule per rank (across all tracks; track flavor doesn't change the cost):

| Rank | 🧠 Knowledge | 💵 Money | 📄 Research | 🌟 Influence | 🏛️ Equity |
|---|---|---|---|---|---|
| 1 (entry) | (n/a — entry only, no cost) | (n/a) | (n/a) | (n/a) | (n/a) |
| 1 → 2 | 50 | 200 | 5 | 10 | 0 |
| 2 → 3 | 100 | 800 | 20 | 30 | 50 |
| 3 → 4 | 250 | 3,000 | 80 | 100 | 200 |
| 4 → 5 | 500 | 12,000 | 250 | 400 | 800 |
| 5 → 6 | 1,000 | 50,000 | 800 | 1,500 | 3,000 |
| 6 → 7 | 2,000 | 200,000 | 2,500 | 5,000 | 12,000 |

Numbers are starting balance — tuneable in playtesting. The pattern is roughly ~4x growth per rank, with Money scaling faster than other currencies (it's the high-volume currency).

## Undergrad currency thresholds

The undergrad years aren't transactional rank-ups — currencies aren't consumed when advancing years. Instead, advancing requires a minimum balance in newly-unlocked currencies:

| Year transition | Threshold to advance |
|---|---|
| Freshman → Sophomore | 🧠 30 |
| Sophomore → Junior | 🧠 80, 💵 200 |
| Junior → Senior | 🧠 200, 💵 800, 📄 25 |
| Senior → Internship | 🧠 400, 💵 2000, 📄 75, 📨 50 |

These are gates, not costs. Currencies stay after advancement.

The Senior-Year Job Offer event consumes Applications and gates entry to FAANG/Startup/PhD or forced entry to Upwork.

## Internship completion bonus

Completing the Summer Internship event grants:

- Variable Influence (5–25 based on performance score)
- Variable Money (proportional to performance)
- A return offer flag (used by the Senior-Year Job Offer event)

See `EVENTS_SPEC.md` for the full internship mechanic.

## Equity vesting

Equity is unique: it doesn't tick passively in the same way other currencies do. Instead:

- **FAANG**: RSUs vest at rank-up — gaining a rank grants a large one-time Equity bump (1–4 cliff vests per rank). Numbers in `CAREER_TRACKS.md`.
- **Startup**: founder shares are granted at Pre-seed (rank 1) entry, then diluted at every funding round (rank-up): −20% of current Equity is consumed at each rank-up. Net Equity still grows from valuation jumps, but dilution is a real cost.
- **PhD**: Equity is zero until rank 7 (Named Chair) where an endowment grants a fixed amount.
- **Upwork**: Equity is always zero.

Implementation: Equity is just a number stored in state. The per-track mechanics adjust it on rank-up events.

## Tabular display rules

All currency values displayed in the HUD use:

- `Math.floor(value)` for whole-number display (no decimals)
- `toLocaleString()` for thousands separators
- `font-variant-numeric: tabular-nums` to prevent layout jitter
- Money is prefixed with `$`
- Other currencies are unprefixed in the value but always emoji-labeled in the HUD cell
