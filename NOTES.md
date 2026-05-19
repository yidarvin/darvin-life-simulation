# Notes — post-session-29 backlog

## Balance to revisit
- Hire base rates likely too high at L6+ (verify with full playthrough timing)
- Influence allocation cap ×5 may be too generous; consider ×3
- Annual Review bonus $2,500 is large early, irrelevant late — scale with track multiplier?
- Burnout threshold 80→50% debuff is harsh; consider 90 or softer multiplier (0.7 instead of 0.5)

## Edge cases not yet covered
- Cross-tab concurrent writes (multi-tab open → last write wins; could lose state)
- localStorage quota exceeded (rare but possible if user has many sites filling 5MB)
- System clock changes mid-run (Date.now() going backwards would break timers)

## UX polish ideas
- Toast notifications for random events instead of full modals (per EVENTS_SPEC)
- Sound effects (subtle CRT beeps on rank-up, etc.)
- Achievement system — first endgame, all 4 endgames, "took Upwork voluntarily" badge
- Stats screen — total clicks, total time played, currencies earned over time
- Save export / import (JSON download/upload)
- Settings panel — sound toggle, devmode toggle, theme variants
- `formatLargeNumber` helper — counters become unwieldy past $10M

## Future content
- More random events per track (currently 5-6 each; aim for 15+ per track)
- More shop items (especially career-tier items not yet built)
- More internship companies (currently 6)
- More specialization options (3 per track; could be 5)
- More hire role types per track
- Per-track endgame content (currently 3 options per track; could be 6)

## Architecture cleanup
- `getEffectiveMultiplier` takes full state; could narrow to primitives for testability
- Several `fauxState` reconstructions in components — refactor when API stabilizes
- Color tokens added but arbitrary values not swept; do a search-and-replace
