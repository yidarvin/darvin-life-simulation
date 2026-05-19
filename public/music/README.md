# Music files

Drop chiptune `.mp3` files here, one per music key. Game phases map to music keys
via `src/data/musicMap.js`; multiple phases can share a music file.

## Files (13 total)

| File | Game phases |
|---|---|
| `undergrad-early.mp3` | freshman + sophomore |
| `undergrad-late.mp3` | junior + senior |
| `internship.mp3` | internship |
| `faang-low.mp3` | FAANG ranks 1-3 |
| `faang-mid.mp3` | FAANG ranks 4-5 |
| `faang-high.mp3` | FAANG ranks 6-7 |
| `startup-low.mp3` | Startup ranks 1-3 |
| `startup-mid.mp3` | Startup ranks 4-5 |
| `startup-high.mp3` | Startup ranks 6-7 |
| `phd-low.mp3` | PhD ranks 1-3 |
| `phd-mid.mp3` | PhD ranks 4-5 |
| `phd-high.mp3` | PhD ranks 6-7 |
| `upwork.mp3` | All three Upwork tiers (no variation by design) |

Composed in BeepBox (https://www.beepbox.co/). Missing files degrade silently.

## Composition notes

- 30-60 second loop, ~128 kbps MP3
- Test the loop point — the last bar should land back on the tonic
- For variations within a career track (low/mid/high), start with the same base
  composition and modify (add a counter-melody for mid, speed up + thicker
  arrangement for high)
- Upwork is intentionally one song repeating across all tiers — the lack of
  progression is the point
