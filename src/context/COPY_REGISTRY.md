# Copy Registry & Voice Guide

The master list of player-facing copy and the voice principles behind it. Other sessions reference this when writing UI strings.

## Voice principles

The game's voice is **sarcastic CS humor**. Specific = funnier than generic. Self-deprecating > mocking. Loving roast > bitter rant.

### Do

- Reference real CS culture: PSet numbers, off-by-one errors, Stack Overflow reputation, Diet Coke at startups, the "we're a family" YC trope, NeurIPS deadlines, Reviewer #2.
- Be specific: "Spend three hours hunting an off-by-one error" beats "Solve a hard problem."
- Use lowercase in flavor text — terminal vibe, lower stakes.
- Use sentence case for headings.
- Allow the game to occasionally show concern for the player (e.g., the burnout modal, the 5-dialogue gauntlet). The game has a personality.
- Reference real platforms by name when the joke needs it (Upwork, LinkedIn, Stack Overflow, GitHub Copilot, Claude). These are part of the joke, not affiliate placements.
- Punctuate dryly. Periods are funny.

### Don't

- Make political jokes, take partisan stances, or reference politicians.
- Mock specific real people (the joke is the culture, not the people).
- Use generic "haha, programming is hard" jokes that any non-programmer would write.
- Use exclamation points except for events where excitement is in-character (rare).
- Title Case headings. ALL CAPS only for retro CRT moments ("JUNIOR YEAR REACHED").
- Use emojis decoratively. Each emoji should mean something (currency, severity, special class).
- Use modern texting/slang ("lol", "ngl", "fr"). The voice is dry, not online.

### Tonal range

The game spans:

- **Dry observational** (most flavor text) — "The recruiter will not read it."
- **Sympathetic mock** (events, dialogs) — "We need to talk about money."
- **Resigned acceptance** (endgames, modals) — "The cycle is complete."
- **Occasional warmth** (rare, end of runs) — "You did it. Sort of."

## Section A — Action button copy

The four undergrad clickable actions. Once a currency unlocks, the corresponding action becomes available.

### Knowledge action (unlocked Freshman year)

- **Command label**: `./do_pset.sh`
- **Flavor**: Spend three hours hunting an off-by-one error.
- **Reward label**: +N Knowledge

### Money action (unlocked Sophomore year)

- **Command label**: `./ta_section.sh`
- **Flavor**: Explain recursion to five students who "kind of get it."
- **Reward label**: +$N

### Research action (unlocked Junior year)

- **Command label**: `./beg_advisor.sh`
- **Flavor**: Wash glassware. Maybe get a coauthor credit. Maybe not.
- **Reward label**: +N Research

### Applications action (unlocked Senior year)

- **Command label**: `./fire_off_cv.sh`
- **Flavor**: Customize a cover letter. The recruiter will not read it.
- **Reward label**: +N Application

### Post-grad action labels

Once in a career track, the same four currencies are still earned via clicks, but the action labels re-skin per track. The slot positions don't change; just the strings.

#### FAANG

| Slot | Command | Flavor |
|---|---|---|
| Knowledge | `./push_pr.sh` | Push code. Reviewer requests "minor changes" (rewrite the whole thing). |
| Money | `./check_rsu_vest.sh` | Watch the stock chart. Pretend you don't. |
| Research | `./read_internal_paper.sh` | Skim the FAANG-Brain ArXiv preprint. Add it to your queue. |
| Applications | `./refer_a_friend.sh` | Submit a referral for the $5K bonus you'll forget to claim. |

#### Startup

| Slot | Command | Flavor |
|---|---|---|
| Knowledge | `./read_docs.sh` | The docs are out of date. Read the source. |
| Money | `./close_deal.sh` | Sales call. Two no-shows, one "let me think about it." |
| Research | `./customer_interview.sh` | They want a feature you already shipped. Call it discovery. |
| Applications | `./investor_update.sh` | Compose a quarterly email. Skip the bad news. |

#### PhD

| Slot | Command | Flavor |
|---|---|---|
| Knowledge | `./run_experiment.sh` | The cluster's down. Try again in an hour. Or tomorrow. |
| Money | `./grade_assignments.sh` | A hundred CS50 problem sets. Caffeine intensifies. |
| Research | `./write_paper.sh` | Citation 47 doesn't say what you said it says. |
| Applications | `./apply_for_grant.sh` | Re-skin last year's proposal. Pray. |

#### Upwork

| Slot | Command | Flavor |
|---|---|---|
| Knowledge | `./read_brief.sh` | "Make me a website like Amazon. Budget: $50." |
| Money | `./complete_gig.sh` | Deliver the gig. Upwork takes 10%. Smile in the review. |
| Research | `./fix_clients_code.sh` | Their last freelancer used jQuery. In 2025. You sigh. |
| Applications | `./bid_on_gig.sh` | Burn 16 Connects. Get auto-rejected. Burn 16 more. |

## Section B — Shop item copy (undergrad tier)

These are the click-multiplier items available during undergrad. Passive generators unlock at Summer Internship completion.

| ID | Name | Flavor | Effect |
|---|---|---|---|
| `espresso` | ☕ Triple Espresso | Becomes 30% personality, 70% espresso. | +1 Knowledge/click |
| `study_group` | 👥 Study Group | Trauma bond with your classmates. | +2 Knowledge/click |
| `office_hours` | 📚 Office Hours Worship | Ask the same question for the third time. | +0.5 Knowledge/sec (auto-unlock placeholder; only enable after internship) |
| `mech_keyboard` | ⌨️ Mechanical Keyboard | Clack clack clack but make it productive. | +2 Knowledge/click |
| `stack_overflow` | 📖 Stack Overflow Premium | Read questions marked duplicate of duplicates. | +5 Knowledge/click |
| `doordash` | 🍔 DoorDash Tutoring | Drive to a stranger's house. Explain pointers in their kitchen. | +$5/click |
| `copilot` | 🤖 GitHub Copilot | Auto-completes your dignity away. | +$3/sec (auto-unlock placeholder) |
| `linkedin` | 💼 LinkedIn Premium | See exactly which recruiters are ghosting you. | +2 Applications/click |
| `career_center` | 🎓 Career Center Newsletter | Daily emails from 14 startups you have never heard of. | +0.5 Applications/sec (placeholder) |
| `ra_position` | 🧪 RA Position | Run experiments your PI does not fully understand. | +0.3 Research/sec (placeholder) |
| `self_cite` | 📝 Self-Citation Loop | Boost your h-index. No reviewer will check. | +3 Research/click |

Implementation note: items marked "placeholder" are passive generators that won't actually fire during undergrad — they're listed in the shop for visibility but locked (greyed) until the Summer Internship event completes. The lock is enforced in the shop purchase logic.

## Section C — Modal copy templates

### Year transition modal (end of Freshman / Sophomore / Junior year)

**Title**: `End of {YEAR} year`

**Body**:
> You survived. {YEAR}-year transcript: {N} problem sets debugged. {M} cans of cold brew. {ONE_LINE_FLAVOR_PER_YEAR}.
>
> Next: {NEXT_YEAR} year. Unlocking {NEW_CURRENCY}.

**Per-year flavor lines** (the `{ONE_LINE_FLAVOR_PER_YEAR}` slot):

- Freshman → Sophomore: "You learned what `git push --force` does. You learned why you shouldn't."
- Sophomore → Junior: "You declared a major. Twice."
- Junior → Senior: "You finally understood pointers. Then you forgot."

### End of Sophomore Year modal (gate to Internship event)

**Title**: End of sophomore year

**Body**:
> Two years of CS coursework. You survived with most of your sanity intact and a marginally-respectable resume.
>
> Next up: the Summer Internship interview cycle. Hope you have applications stockpiled.

**Button**: `Proceed to internship`

### Internship offer modal (internship event start)

**Title**: Summer internship offer

**Body**:
> {COMPANY_NAME} is offering you a summer internship. {COMPANY_FLAVOR}
>
> 90 days. Perform well, you get a return offer. Perform poorly, you get a LinkedIn endorsement.

**Buttons**: `Accept` / `Decline`

Sample company name / flavor pairs (rotate randomly):

- "DataMesh Industries" — "Series C. Their pitch deck mentions 'AI' 27 times."
- "Octopus Inc." — "FAANG-adjacent. Famously bad coffee."
- "Reverberate AI" — "Pre-seed. The founder DMed you on LinkedIn."
- "Quantworth Capital" — "Quant. They asked you about polar bears in the interview."
- "Sigmoid Labs" — "Research-y. The team has 4 PhDs and one TPM with vibes."

### Rank-up modal (post-grad, generic template)

**Title**: Promoted: {NEW_RANK_LABEL}

**Body**:
> You traded {COSTS} for a rank-up. {RANK_FLAVOR}
>
> {NEW_MECHANIC_UNLOCKED_DESCRIPTION}

**Button**: `Acknowledged`

Where `{RANK_FLAVOR}` is one of:

- L4: "Your impostor syndrome has gained a level."
- L5: "You can use the word 'leadership' on your resume. Slightly."
- L6: "You started getting calendar invites without context."
- L7: "Calibration committees now include you. You are now part of the problem."
- L8: "You no longer code. You leave comments in design docs."
- Series A: "TechCrunch noticed. Two recruiters from Octopus Inc. just DMed."
- Series B: "Your headcount doubled. The org chart is now in Notion. Nobody updates it."
- Series C: "You hired a Chief of Staff. They run your calendar. They run your life."
- Series D: "An IPO banker bought you lunch. They ordered a salad."
- Postdoc: "Your advisor is now your 'colleague.' You still call them Dr. {LASTNAME}."
- Assistant Professor: "You have grad students. They have questions you cannot answer."
- Associate Professor: "Tenured. You can finally say what you think. You don't."
- Full Professor: "You wrote the textbook. Sales of your textbook: 14 last quarter."

### Track choice modal (Senior-Year Job Offer event, on pass)

**Title**: Senior year — job offer

**Body**:
> Three tracks open up:
>
> - **FAANG** — high salary, low ownership. Your name on a million org-chart squares.
> - **Startup** — low salary, high equity, 60% chance of liquidation event being "we shut down."
> - **PhD** — almost no salary. Your name on three papers.
>
> Choose carefully. You can swap later but it costs.

**Buttons**: `FAANG` / `Startup` / `PhD`

### Failure modal (Senior-Year Job Offer event, on fail)

**Title**: No offer

**Body**:
> The job market this year is "challenging." Your applications have collectively received {N} responses, {M} interviews, and zero offers.
>
> Time to go freelance. Welcome to Upwork.

**Button**: `Begin Upwork track`

(No Cancel — forced entry.)

### Endgame modal templates (one per track)

#### FAANG endgame: "Fellow"

**Title**: Distinguished Fellow

**Body**:
> Your name is now a section in the company's official engineering ladder doc.
>
> Three product orgs build on your former proposals. Two of those projects are quietly winding down. One won an industry award you've already forgotten you received.
>
> Your manager is now your former skip-level's skip-level. Your skip-level is in your performance review chain.
>
> You have reached the top of the FAANG track.

#### Startup endgame: "Exit"

**Title**: $1B paper valuation

**Body**:
> The IPO bell has rung. Your equity vested. The stock is up 12% on day one and down 30% by month three.
>
> Your cofounder has gone full-time on their podcast. Your investors have moved to their next bet.
>
> You can stop checking Hacker News for posts about you now. You won't, but you can.
>
> You have reached the top of the Startup track.

#### PhD endgame: "Named Chair"

**Title**: The {SUBJECT} Chair

**Body**:
> An endowed chair. Three of your former students are now junior faculty. Your h-index is high enough that your name appears in undergraduate textbooks.
>
> You answer email twice a year.
>
> You have reached the top of the PhD track.

#### Upwork endgame: "Platform Influencer"

**Title**: Platform Influencer

**Body**:
> You've made $10,000 selling courses about how to make money on Upwork to people trying to make money on Upwork.
>
> Your largest revenue source is a $497 "Connects optimization masterclass."
>
> Your YouTube subscribers think you're "an inspiration." Your former clients have started ghosting you the same way they used to.
>
> The cycle is complete.

All four endgames have a common footer button:

**Button**: `Acknowledge — keep playing`

After dismissal, the player continues with full agency. They can chase another endgame, swap tracks, or just keep accumulating.

### Burnout warning modal (fires once when burnout hits 80)

**Title**: Burnout warning

**Body**:
> Your generation rates have dropped 30%. Your hires haven't been managed in a while. You drafted a Slack message and didn't send it.
>
> Spend $1,000 on a vacation event to clear 50 burnout. Or push through and accept the penalty.
>
> If burnout hits 100, generation halts entirely until reduced.

**Button**: `Acknowledged`

### Reset confirmation (browser native confirm)

> Wipe the run and start over?

(Use browser `confirm()` for v1. No fancy custom modal — the destructive nature is appropriate for a native dialog.)

## Section D — The 5-dialogue gauntlet

Reproduced from `UPWORK_SPEC.md` for centrality. This is the most-tested copy in the game; if you change one of these lines, change it in UPWORK_SPEC.md too.

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

**Buttons**: `Begin` (no Cancel)

After Dialog 5's "Begin" click: the swap commits atomically.

## Section E — Specialization choice copy

Shown at rank 1 entry of each track. One-time choice, locked for the run.

### FAANG specializations

**Title**: Pick a specialty

**Body**: The internal job-leveling document refers to all roles as "Software Engineer." But your manager will ask which queue you want to be in.

| Option | Flavor | Effect |
|---|---|---|
| Backend | "You will become known for the time you saved the team from a redis outage at 3am. Promotion delayed by six months for unclear reasons." | +20% Money |
| Frontend | "You will fight with the design team about pixel placement. You will lose. You will accept it." | +20% Knowledge |
| ML | "You will reuse the same notebook for three years. It will become unmaintainable. You will become indispensable." | +20% Research |

### Startup specializations

**Title**: Pick a wedge

**Body**: Your investors want to know what you're "primarily" focused on. Pick something with a roadmap.

| Option | Flavor | Effect |
|---|---|---|
| B2B SaaS | "Your customers are CFOs. They want a spreadsheet export. Always." | +20% Money |
| B2C | "Your users have 47-character email addresses. Half are bots. You can't tell which half." | +20% Influence |
| DeepTech | "You sell to enterprises with 18-month sales cycles. You raise on patents." | +20% Research |

### PhD specializations

**Title**: Pick a subfield

**Body**: Your advisor wants you to "commit." This is also for the candidacy paperwork.

| Option | Flavor | Effect |
|---|---|---|
| Theory | "You will derive bounds. The bounds will be tight. Three people in the world will care." | +20% Research |
| Applied | "You will build systems that work. Reviewers will call them 'engineering.' You will be hurt." | +20% Knowledge |
| Interdisciplinary | "You will collaborate across departments. Your CV will say 'cross-cutting.' Your hiring committee will not know what to do with you." | +20% Influence |

### Upwork specializations

**Title**: Pick a niche

**Body**: Your profile needs a tagline. "Generalist" doesn't rank in search.

| Option | Flavor | Effect |
|---|---|---|
| WordPress themes | "You will explain to clients that yes, you can fix it, no, it's not "just" a quick change." | +20% Money |
| Logo design (undercutting graphic designers) | "Your competitive advantage is being faster and cheaper than people who went to design school." | +20% Knowledge |
| "AI agents" | "Clients have no idea what they want. You have no idea what they want. The deliverable is whatever you ship." | +20% Influence |

## Section F — Tooltip / micro-copy

For HUD currency labels (hover state, eventual):

- 🧠 Knowledge — "Acquired by clicking problem sets and reading Stack Overflow."
- 💵 Money — "Cash on hand. Some of it is yours after taxes."
- 📄 Research — "Citations, papers, code that worked once. Currency of academia."
- 📨 Applications — "Cover letters that will be filtered by ATS regex."
- 🌟 Influence — "Reputation. Cashable, sort of, sometimes."
- 🏛️ Equity — "On-paper wealth. Vests with a 1-year cliff and a 4-year schedule."
- 🪙 Connects — "What you pay Upwork to apply to gigs Upwork doesn't read."

## Section G — Footer & meta copy

Footer text (small, dim):

- `Reset run` button
- `Devmode: 1x` / `Devmode: 10x` toggle
- `saved` / `save failed` indicator

Mid-page footer (below scroll, small):

> A clicker game by [Darvinyi](https://darvinyi.com). Built with Claude Code. Critical reception: my mom says it's "interesting."

## Implementation note

When implementing UI, import strings from `src/data/copy.js`, which mirrors this registry's structure. Don't hardcode strings in component files. The registry is the source; code imports from it.

For the data file structure (added in session 13 or so):

```js
// src/data/copy.js
export default {
  actions: {
    undergrad: { knowledge: { ... }, money: { ... }, ... },
    faang: { ... },
    startup: { ... },
    phd: { ... },
    upwork: { ... },
  },
  shop: [ ... ],
  modals: {
    yearTransition: { ... },
    rankUp: { ... },
    burnoutWarning: { ... },
    endgame: { faang: {...}, startup: {...}, phd: {...}, upwork: {...} },
  },
  gauntlet: [ ... ],
  specialization: {
    faang: [...], startup: [...], phd: [...], upwork: [...],
  },
  tooltips: { ... },
};
```
