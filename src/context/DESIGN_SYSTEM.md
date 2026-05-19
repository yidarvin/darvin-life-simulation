# Life is a Simulation — Design System

A CRT terminal aesthetic with teal phosphor on near-black. Inspired by real amber/green CRT monitors of the 80s retuned to teal, Mr. Robot's terminal scenes, and modern flat design (no gradients, no skeuomorphism).

All tokens here are wired into `tailwind.config.js` for utility class access.

## Color palette

### Backgrounds

| Token (Tailwind class) | Hex | Use |
|---|---|---|
| `bg` / `bg-bg` | `#0d0d0d` | Main page background; panel-title cutout color |
| `bg-elevated` | `#181818` | Panel surface, modal background |
| `bg-deep` | `#060606` | Action buttons, shop items, input backgrounds |

### Phosphor (teal accent)

| Token | Hex | Use |
|---|---|---|
| `phosphor` (default) | `#2dd4bf` | Primary teal — main text, default accents |
| `phosphor-bright` | `#5eead4` | Highlights, titles, hover states, completion glows |
| `phosphor-dim` | `#4a857e` | Secondary/muted text — descriptions, captions, labels |
| `phosphor-faint` | `#1d3633` | Subtle borders, dividers, very low contrast |

### Semantic

| Token | Hex | Use |
|---|---|---|
| `error` | `#dc2626` | Errors, warnings, save failures |

## Color usage rules

- **Headlines, key UI**: `phosphor-bright` with text-shadow glow
- **Body text**: `phosphor` (default body color set on `<body>`)
- **Secondary text**: `phosphor-dim`
- **Borders default**: `phosphor-faint`
- **Borders on hover**: `phosphor` (brightening transition)
- **Disabled state**: opacity 0.4, `cursor-not-allowed`
- **Owned/installed state**: opacity 0.45, `border-dashed`, name suffix `" [installed]"`
- **Completed progress bar**: fill becomes `phosphor-bright` instead of `phosphor`

## Typography

### Font stacks (already wired in Tailwind config)

```css
--font-display: 'VT323', monospace;
--font-mono: 'JetBrains Mono', monospace;
```

Tailwind classes: `font-display`, `font-mono`. JetBrains Mono is the default on `body`.

### Type scale

| Use | Font | Size | Weight | Notes |
|---|---|---|---|---|
| Page title `<h1>` | display | 56px | 400 | Phosphor-bright with text-shadow glow |
| Modal title `<h2>` | display | 44px | 400 | Same glow treatment |
| Stage marker | display | 32px | 400 | Used for things like "JUNIOR YEAR REACHED" |
| HUD currency value | display | 36px | 400 | Tabular nums; small glow |
| Panel title (the `[ tab ]`) | mono | 11px | 400 | Uppercase, letter-spacing `0.16em`, phosphor-dim |
| Section heading | mono | 13px | 500 | Used inside panels for sub-headings |
| Body | mono | 14px | 400 | Default body text |
| Caption / flavor | mono | 11–12px | 400 | Italic for flavor text, phosphor-dim |
| Action button label | mono | 13px | 500 | "$ ./script.sh" style |
| Action button reward | mono | 11px | 500 | Uppercase, letter-spacing `0.06em` |

### Glow effects

Glow on bright text uses inline `style` (not a utility — too custom):

```jsx
<h1 style={{ textShadow: '0 0 10px rgba(45, 212, 191, 0.45), 0 0 24px rgba(45, 212, 191, 0.2)' }}>
```

The cursor blink at the end of the main title uses the `animate-blink` Tailwind keyframe:

```jsx
<span className="inline-block w-[0.5em] h-[0.85em] bg-phosphor-bright animate-blink ml-1 align-[-2px]" />
```

## Spacing rhythm

8px base unit. Common gaps:

- Tight: 6px (`gap-1.5`)
- Default: 16px (`gap-4`) between elements within a panel
- Section: 20px (`mb-5`) between panels
- Page padding: 32px (`p-8`) top/bottom, 16px (`p-4`) sides; tighter on mobile

## Box patterns

### Panel (the canonical container)

A bordered box with a "tab" label at top-left interrupting the border. The label's background of `bg-bg` (`#0d0d0d`) matches the page background, creating a cutout effect.

```jsx
<div className="relative border border-phosphor-faint bg-bg-elevated p-5 pb-4 mb-5">
  <span className="absolute -top-2.5 left-3.5 bg-bg px-2.5 text-[11px] tracking-[0.16em] uppercase text-phosphor-dim z-10">
    [ Panel title ]
  </span>
  {/* content */}
</div>
```

### Action button

Dark background, thin border, terminal-styled label with `$ ` prefix via `::before`, flavor text, reward label:

```jsx
<button className="bg-bg-deep border border-phosphor-faint p-4 cursor-pointer text-left relative overflow-hidden transition-colors hover:border-phosphor hover:bg-[#11201d] active:scale-[0.98]">
  <div className="text-phosphor-bright font-medium mb-1 before:content-['$_'] before:text-phosphor-dim">
    ./do_pset.sh
  </div>
  <div className="text-phosphor-dim text-[11px] italic leading-snug mb-2.5">
    Spend three hours hunting an off-by-one error.
  </div>
  <div className="text-phosphor-bright text-[11px] font-medium tracking-wider uppercase">
    +1 Knowledge
  </div>
</button>
```

### Shop item

Three-column grid: info / effect / cost.

```jsx
<div className="grid grid-cols-[1fr_auto_auto] gap-4 items-center p-2.5 px-3.5 bg-bg-deep border border-phosphor-faint cursor-pointer transition-colors hover:border-phosphor hover:bg-[#11201d]">
  <div>
    <div className="text-phosphor font-medium text-[13px]">☕ Triple Espresso</div>
    <div className="text-phosphor-dim text-[11px] italic">Becomes 30% personality, 70% espresso.</div>
  </div>
  <div className="text-phosphor-bright text-[11px]">+1 Knowledge / click</div>
  <div className="text-phosphor-dim text-[12px] tabular-nums min-w-[100px] text-right">$10</div>
</div>
```

States:

- **Affordable & not owned**: full opacity, hover effect active
- **Cannot afford**: `opacity-40`, `cursor-not-allowed`, no hover
- **Owned**: `opacity-45`, `border-dashed`, name suffix `" [installed]"`, cursor default

### Progress bar

Thin horizontal bar with glow on the filled portion:

```jsx
<div className="h-3 bg-bg-deep border border-phosphor-faint relative overflow-hidden">
  <div
    className="h-full bg-phosphor transition-[width] duration-300"
    style={{ width: '42%', boxShadow: '0 0 10px rgba(45, 212, 191, 0.5)' }}
  />
</div>
```

When complete (current >= goal), the fill switches to `bg-phosphor-bright`.

### Modal overlay

Semi-transparent backdrop, centered modal box with phosphor border glow:

```jsx
<div className="fixed inset-0 bg-[rgba(13,13,13,0.94)] flex items-center justify-center z-[100] animate-fade-in p-5">
  <div
    className="bg-bg-elevated border border-phosphor p-9 max-w-[580px] text-center"
    style={{ boxShadow: '0 0 50px rgba(45, 212, 191, 0.35)' }}
  >
    {/* content */}
  </div>
</div>
```

Modal close button:

```jsx
<button className="mt-5 bg-bg-deep border border-phosphor text-phosphor-bright px-7 py-2.5 font-mono cursor-pointer text-[11px] uppercase tracking-[0.14em] transition-colors hover:bg-phosphor hover:text-bg">
  Acknowledge
</button>
```

## Animation patterns

All keyframes are configured in `tailwind.config.js` (set up in session 01):

| Class | Use | Duration |
|---|---|---|
| `animate-blink` | Cursor at end of title | 1.1s steps(1) infinite |
| `animate-float-up` | "+1 Knowledge" rising from action buttons | 0.9s ease-out forwards |
| `animate-fade-in` | Modal overlay appearance | 0.5s ease-out |

No spring animations, no decorative motion. Motion is functional: feedback on action, attention to events. Respect `prefers-reduced-motion` where possible (no critical UI relies on animation).

## Iconography

Emojis for currencies and key concepts:

| Concept | Emoji |
|---|---|
| Knowledge | 🧠 |
| Money | 💵 |
| Research | 📄 |
| Applications | 📨 |
| Influence | 🌟 |
| Equity | 🏛️ |
| Connects (Upwork) | 🪙 |
| Burnout | 🔥 |
| Reset / refresh | ↻ |
| Cursor / terminal | (block char) |

No other icon set (no Lucide, no Heroicons, no Tabler). Emojis only, used sparingly and with intent.

## Voice & tone in copy

See `COPY_REGISTRY.md` (added in session 04) for the full voice guide and copy bank.

Quick principles:

- **Specific over generic** — "PSet 7" is funnier than "homework"
- **Self-deprecating over mocking**
- **Lowercase is fine in flavor text** (terminal vibe)
- **Sentence case for headings** — never Title Case
- **ALL CAPS only for retro CRT moments** (e.g., "JUNIOR YEAR REACHED")
- **One emoji per element max** — don't decorate

## Mobile responsiveness

Breakpoint of concern: `< 640px` (Tailwind `sm:`). At that size:

- Title shrinks from 56px → 38px
- HUD value shrinks from 36px → 26px
- 4-column action grid collapses to 2-column
- Shop items stack vertically (single column)
- Progress label/value columns shrink

Reference media query (already partially set up):

```css
@media (max-width: 640px) {
  h1 { font-size: 38px; }
  /* etc. */
}
```

Prefer Tailwind's `sm:` prefix in components rather than raw media queries.

## Accessibility minimums

- All interactive elements have a focus ring (use Tailwind default + custom phosphor color)
- Color contrast: phosphor (`#2dd4bf`) on bg (`#0d0d0d`) is WCAG AA compliant for body text
- Phosphor-dim (`#4a857e`) on bg is AA compliant for body text but tight — avoid using it for critical info
- No text smaller than 11px
- All buttons have accessible names (either text content or `aria-label`)
- Modals trap focus (handle in session that builds the Modal atom)
