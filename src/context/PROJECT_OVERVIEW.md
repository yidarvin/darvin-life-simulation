# Life is a Simulation — Project Overview

## What this is

A clicker/idle game in the Cookie Clicker / Universal Paperclips tradition, themed as a CS career simulator. The player progresses from CS major (freshman year) through undergraduate years, then a Summer Internship event, then chooses one of three "real" career tracks (FAANG, Startup, PhD) or falls into a fourth (Upwork freelancing) on failure. Each track has 7 ranks. Currencies are earned through clicks and passive automation. Each rank-up consumes currencies in a transactional level-up.

## The pitch

- Click activities for currencies (🧠 Knowledge, 💵 Money, 📄 Research, 📨 Applications).
- Buy upgrades that multiply clicks or generate currencies passively.
- Survive set-piece events (Summer Internship, Senior-Year Job Offer).
- Choose your post-grad path. Or fail and land on Upwork.
- Climb the 7-rank career ladder. Each rank introduces a new gameplay mechanic.
- Swap tracks if it's strategically better (with rank-drop penalties).
- Reach any of four endgames — or chase all of them in one run.

## Player goals

The game offers two play modes:

1. **Career mode (1x speed)** — default, casual pace, reach any endgame at your own pace, continue past endgame to chase the others.
2. **Devmode (10x speed)** — for testing and speedrun rehearsal. Toggleable via a footer button. Hideable in production via a flag in the store.

The game has no leaderboards or persistent meta-progress in v1. Each run is fresh; reset is one-click.

## Tone

Sarcastic CS humor. Self-aware about tech industry tropes. Loving roast, not bitter rant. Specific reference points:

- Silicon Valley (HBO show) at its driest
- /r/ProgrammerHumor at its best
- Hacker News comment threads
- LinkedIn cringe captured affectionately
- Real CS culture details (PSet 7, "no major issues" 4-star reviews, etc.)

The tone is **not**:

- Mean-spirited or punching down
- Politically polemical
- Vague generic humor
- Mocking individuals (real or fictional)

It **is**:

- Specific to CS/tech culture
- Detail-driven (real things real CS people experience)
- Self-deprecating
- Occasionally dark, never cruel

The Upwork track is loving roast of the platform — the project owner actually works at Upwork, so the humor reads as insider commentary, not hostility.

## Tech stack (locked)

- React 18 (vanilla JS, no TypeScript)
- Vite as build tool
- Tailwind CSS 3.4 with custom CRT theme tokens
- Zustand for state management
- VT323 + JetBrains Mono fonts (Google Fonts CDN)
- localStorage for save state
- Vercel for deployment
- npm

## File organization conventions

- **Game state**: lives in `src/game/state/` (Zustand store, slices per concern)
- **Mechanics**: per-rank behavior in `src/game/mechanics/`
- **Tracks**: track-specific code in `src/game/tracks/` (subfolder per track)
- **Events**: random event system in `src/game/events/`
- **UI components**: `src/components/` organized by role:
  - `shared/` — atoms (Button, Panel, Modal, Typography)
  - `panels/` — page-level panels (HUD, ShopPanel, ProgressPanel)
  - `actions/` — clickable action buttons
  - `modals/` — dialog overlays
- **Data**: shop items, events, copy in `src/data/` (separated from logic)
- **Hooks**: custom React hooks in `src/hooks/`
- **Utils**: pure utilities in `src/utils/`
- **Context**: design spec files in `src/context/` (this folder) — read but never edited from code

## Coding conventions

- **Components**: functional only. Named exports preferred (`export function Foo()`), with one default export per file allowed when it's the file's main subject.
- **Hooks**: prefix with `use`, return tuples or objects with named properties.
- **State**: Zustand store with selector hooks. Always select narrow slices to minimize rerenders. E.g., `const knowledge = useGameStore(s => s.currencies.knowledge)`.
- **Files**: one component per file. PascalCase for component files (`ShopItem.jsx`), camelCase for utilities (`formatCurrency.js`).
- **Imports**: external libs first, then internal (`@/...` or relative), then styles. One blank line between groups.
- **JSDoc**: optional but encouraged on game logic functions and store slices.
- **No prop-types**: prop-types disabled in ESLint. Document via JSDoc if needed.
- **CSS**: prefer Tailwind utility classes. Raw CSS only for animations and complex effects. Inline `style={{}}` for one-off custom values (like text-shadow glows).
- **No barrel files** (no `index.js` re-exports) — they slow Vite cold starts and obscure imports.

## Commit conventions

- Commit messages: `session NN: <imperative summary>` (e.g., `session 03: add currency engine and HUD`)
- Each session ends with one or more atomic commits.
- Push to `main` after each session unless otherwise specified.
- No PRs, no branches — solo project.

## Deployment

Final session deploys to Vercel via GitHub integration. Domain: subdomain of `darvinyi.com` (likely `simulation.darvinyi.com`).

## Out of scope for v1

- User accounts, authentication
- Leaderboards, social features
- Cloud sync
- Multiplayer
- Persistent meta-progress between runs (no prestige bonuses across resets)
- Pre-undergrad starting choices
- Mobile app (web only, but mobile-responsive)
- Analytics or telemetry
- Localization (English only)
- Audio / sound effects (silent game in v1)

## Glossary

- **Currency** — a tracked resource (Knowledge, Money, Research, Apps, Influence, Equity, Connects on Upwork).
- **Click multiplier** — shop upgrade that adds to per-click yield. One-time purchase, permanent.
- **Automation** — shop upgrade that adds to per-second passive generation. One-time purchase, permanent.
- **Rank** — a tier within a track (1–7). Rank-up is transactional.
- **Track** — career path (FAANG, Startup, PhD, Upwork). 7 ranks each.
- **Swap** — moving between tracks mid-run. Asymmetric rank-drop costs.
- **Endgame** — rank 7 win state. Each track has one. Player continues past it optionally.
- **Specialization** — one-time choice at rank 1, locked for the run.
- **Tick** — game logic update interval. Currently 100ms (10 Hz).
- **Devmode** — 10x speed toggle for testing/speedrunning.
