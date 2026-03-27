# Design System — Zeta Terminal

## Product Context
- **What this is:** AI fractional CMO for first-time startup marketing leads. Users upload brand intel, run a strategy session with an opinionated AI CMO, get a marketing brief with Top 3 Moves, then execute those moves week by week.
- **Who it's for:** First-time founders who need a marketing strategist but can't afford one full-time.
- **Space/industry:** B2B SaaS tooling, AI productivity, growth/marketing
- **Project type:** Web app — multi-step flow with persistent engagement loop

## Aesthetic Direction
- **Direction:** Industrial/Utilitarian — "The Briefing Room"
- **Decoration level:** Minimal (typography and elevation carry all the weight)
- **Mood:** Authoritative, not friendly. Your CMO left you a game plan — this isn't a task manager, it's an engagement with a senior advisor. Dark, tight, intentional. Confidence over delight.
- **Anti-patterns to avoid:** SaaS dashboard feel (rounded stat cards, colored progress bars, gamified streaks), chatbot feel (bubbly UI, large avatars, emoji-heavy), generic dark mode (purple gradient blobs, three-column icon grids)

## Typography
- **Display/Hero:** Geist — 700 weight, -0.02em tracking, for page titles and workflow names
- **Body:** Geist — 400/500 weight, comfortable line-height (1.6), for card descriptions and chat
- **UI/Labels:** Geist — 600 weight, 0.08-0.12em tracking, uppercase, 10-11px for section labels and status tags
- **Data/Tables:** Geist Mono — tabular-nums, for timestamps, week labels, move numbers
- **Code:** Geist Mono — for AI-generated copy outputs in chat
- **Scale:**
  - xs: 10px / 11px — section labels, metadata
  - sm: 12px / 13px — card descriptions, secondary text
  - base: 14px — body text, chat messages
  - md: 15px / 16px — card titles
  - lg: 18px / 20px — section headings
  - xl: 24px / 28px — page heroes

## Color
- **Approach:** Restrained — brand accent is rare and meaningful; neutrals carry the interface
- **Background:** `oklch(0.098 0 0)` — near-black, warm neutral
- **Surface:** `oklch(0.14 0 0)` — slight elevation, used for cards and panels
- **Surface Hover:** `oklch(0.17 0 0)` — interactive state
- **Card:** `oklch(0.13 0 0)` — workflow cards, slightly darker than surface
- **Primary/Brand:** `oklch(0.65 0.18 270)` — purple accent, CTAs, active states, focus rings
- **Brand Muted:** `oklch(0.65 0.18 270 / 12%)` — button backgrounds, highlight fill
- **Foreground:** `oklch(0.95 0 0)` — primary text
- **Muted Foreground:** `oklch(0.50 0 0)` — secondary text, descriptions
- **Border:** `oklch(1 0 0 / 8%)` — default card borders (very subtle)
- **Border Strong:** `oklch(1 0 0 / 15%)` — hover/active borders
- **Status — In Progress:** amber `#f59e0b` with `rgba(245,158,11,0.12)` background — pulsing dot
- **Status — Done:** green `#34d399` — static dot, card dimmed to 65% opacity
- **Status — Not Started:** `fg-subtle` — muted gray dot, no emphasis

## Spacing
- **Base unit:** 4px
- **Density:** Comfortable on cards (24px internal padding); tight on metadata (8-12px gaps)
- **Scale:** 2(2px) 4(4px) 8(8px) 12(12px) 16(16px) 20(20px) 24(24px) 32(32px) 40(40px) 48(48px)
- **Card internal:** 24px padding, 16px gap between sections, 20px gap between action and footer

## Layout
- **Approach:** Grid-disciplined for workflow cards, single-column for chat detail
- **Workflow grid:** `repeat(auto-fill, minmax(260px, 1fr))` — fills 1-3 columns depending on screen
- **Max content width:** 900px centered
- **Border radius scale:**
  - sm: 7px (badges, small elements)
  - md: 10px (buttons, inputs, cards)
  - lg: 14px (workflow cards, panels)
- **Elevation model:** Background → Surface → Card (three layers, no drop shadows — borders only)

## Motion
- **Approach:** Minimal-functional — transitions that aid comprehension only
- **Card hover:** `border-color 0.15s, box-shadow 0.15s` — subtle glow on brand color
- **Top accent bar on card:** `opacity 0.15s` — appears on hover
- **Button hover:** `background 0.12s, color 0.12s` — work-on-this button fills to brand
- **In Progress dot:** `pulse` animation 2s infinite — `opacity 1 → 0.5 → 1`
- **No entrance animations** — content appears immediately, no stagger or fade-in

## Dashboard-Specific: Workflow Cards

The workflow cards for "Top 3 Moves" are the primary interface. They must feel **substantial** — these are commitments, not suggestions.

### Card anatomy (top to bottom):
1. **Move number** — `MOVE 01` in mono uppercase, fg-subtle — contextualizes the card within the brief
2. **Title** — 15px semibold — the name of the move
3. **Action** — 12.5px muted — the specific thing to do this week
4. **Divider** — 1px border
5. **Signal** — `SIGNAL` label (mono uppercase) + text — what to watch to know if it's working
6. **Footer** — status badge (dot + text) on left, "Work on this →" button on right

### Status visual treatment:
- **Not Started:** muted gray dot, no special styling on card
- **In Progress:** amber accent bar at card top (always visible), amber pulse dot, card has warm amber tint in background gradient
- **Done:** card dimmed to 65% opacity, title has line-through, "Review →" button instead of "Work on this →"

### Check-in banner:
- Left-bordered card (`border-left: 3px solid brand`) at top of dashboard
- CMO voice — week number + prompt + sub-description
- CTA button flush right: "Start weekly check-in →"

## Dashboard-Specific: Workflow Chat

When a user clicks into a workflow, the view transitions to a focused chat:
- **Header:** back link, workflow title + signal context
- **System prompt:** tactical CMO — gives copy-pasteable outputs, stays focused on the one move
- **Chat bubbles:** AI uses `card` background with slight border; user uses `surface-hover`
- **Input:** same pattern as main strategy chat

## Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-27 | Workflow cards use typographic status (tone) not badge status (label) | Avoids SaaS/gamified feel; status is conveyed through card opacity, line-through, and dot color rather than colored pills |
| 2026-03-27 | Check-in banner uses CMO voice, not "New Session" button | The engagement model is ongoing advisor, not SaaS tool — the week number and prompt text reinforce this |
| 2026-03-27 | No entrance animations | Content appears immediately; animations on a business tool feel like fidgeting |
| 2026-03-27 | Amber for In Progress, not brand purple | Purple is reserved for CTAs and interactive focus — In Progress is a status, not an action |
| 2026-03-27 | Initial design system created | Created by /design-consultation based on existing globals.css + product context |
