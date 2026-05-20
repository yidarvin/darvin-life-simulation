# Life is a Simulation

A CS career clicker / idle game. Build up from college to one of four track endings — or fall into Upwork and try to claw out.

Live: [simulation.darvinyi.com](https://simulation.darvinyi.com)

## What it is

- Four-year undergrad with progressive currency unlocks (Knowledge → Money → Research → Applications)
- Summer Internship event (90 in-game days, random sub-events, return offer or LinkedIn endorsement)
- Senior-Year Job Offer with three tracks (FAANG / Startup / PhD) or forced Upwork on fail
- Seven ranks per track, each unlocking a mechanic: specialization, random events, influence allocation, hires, hire management, teams, endgame
- Rock-paper-scissors track-swap topology with a 5-dialogue gauntlet for voluntary Upwork entry
- Track-specific endgames: Fellow Initiatives, Startup Exit, PhD Endowments, Upwork Courses
- Cross-cutting Burnout system + Annual Review

## Tech

- React 18 + Vite
- Tailwind CSS 3.4
- Zustand for state
- localStorage for saves
- No backend. No auth. No tracking.

## Local development

```bash
git clone https://github.com/yidarvin/life-is-a-simulation
cd life-is-a-simulation
npm install
npm run dev
```

Open http://localhost:5173.

To enable the 10× devmode speed toggle in the footer, add a `.env.local`:

```
VITE_SHOW_DEVMODE=true
```

## Architecture

- `src/components/` — UI; panels in `panels/`, flows (modal sequences) in `events/`, atoms in `shared/`
- `src/game/state/` — Zustand store, initial state, tick loop, persistence
- `src/data/` — gameplay data (events, hires, shop items, copy, career tracks)
- `src/utils/` — small helpers (gating, currency formatting, tax, burnout)
- `src/context/` — design specs (read by Claude Code during builds, not loaded at runtime)

## Save format

Saves persist to `localStorage` under the key `lifeIsASimulation:v1`. The schema is documented in `src/context/SAVE_LOAD_SPEC.md`. Schema bumps register migrations in `src/game/state/persistence.js`.

## Credits

Made by [Darvinyi](https://darvinyi.com). Built with Claude Code.

Music: Eric Skiff - Song Name - Resistor Anthems - Available at http://EricSkiff.com/music

## License

MIT.
