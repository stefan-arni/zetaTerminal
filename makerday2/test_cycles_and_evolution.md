# Zeta Terminal — Test Cycles & Product Evolution

**Document type:** Living record of product decisions, learnings, and iteration
**Last updated:** 2026-03-27
**Purpose:** Pitch presentation reference + ongoing team memory

> **LIVING DOCUMENT INSTRUCTIONS:** Every time a meaningful change happens — prompt tweak, UI shift, new test run, user feedback, judge reaction — add it here with a timestamp. This is the product's memory.

---

## Test Cycle 1: The Terminal/Workflow Era
*Commits: `45e60b6` (marketing wizard), `500715a` (brand audit flow)*

**What we built:**
A 4-step SaaS wizard: Brand Intel → Brand Audit & Strategy → Schedule → Mission Control. The core concept was a marketing automation tool — founders would upload assets, chat with an AI to define strategy, and the AI would configure recurring cron jobs (daily activation messages, referral pushes, influencer content calendars, retention sequences). The AI could call `suggest_workflow`, `modify_workflow`, `pause_workflow` tools inline in chat, and users managed everything from a "Mission Control" dashboard.

The system prompt framed Zeta as: *"an AI marketing strategist built for solopreneurs and small founding teams"* whose primary output was schedulable marketing automations. Its expertise was explicitly framed around growth mechanics — activation, retention loops, referral programs, cold start problems.

**The workflow types it could create:**
- `daily-activation` — drive users to take action today
- `retention-sequence` — re-engage quiet users
- `referral-push` — amplify referral programs
- `influencer-content` — content calendars for founder-influencers
- `community-engagement` — Discord sequences
- `promo-event` — time-limited challenges
- `agent-outreach` — partner/affiliate management

**Assumption we were testing:**
Founders know what they need to do for marketing — they just need the right automation tools configured for them. The AI helps them get from "I should be doing this" to "this is actually running on a schedule."

**What we learned:**
The automation-first frame skips an earlier, more important problem. First-time startup founders don't have validated positioning, a known audience, or a clear strategy yet. Handing them a workflow scheduler before they've done that work is like giving someone a meal prep service before they know what diet they're on. The "Mission Control" step — where they could review and launch automations — felt procedurally complete but emotionally hollow. What would they actually launch?

**Evidence:**
- The 4-step flow felt like onboarding a SaaS product, not getting strategic help. Users move through steps because the UI tells them to, not because each step produces something they needed.
- The AI's conversation style ("Ask one or two questions at a time. Mirror back what you heard.") produced competent but generic suggestions. No tension, no push-back, no "that's not going to work."
- "Mission Control" as a label signals control of running things. But founders at this stage don't have running things yet.

**What this told us to do next:**
The product needs to earn the right to suggest automations. That means solving the strategic problem first — who are you talking to, what do you actually say, what should you do this week. Automation is the downstream action, not the entry point.

---

## Test Cycle 2: The Agent Conversation Shift
*Session: Makerday2 prep — full UI and prompt overhaul*

**What we built/changed:**

*System prompt:* Completely replaced the "marketing strategist + workflow tool" persona with a fractional CMO persona. The new opening:

> *"You are Zeta — an experienced fractional CMO sitting down with a first-time startup founder for their initial strategy session. You've already researched their business..."*

Key behavioral changes:
- **Opens by referencing something specific** from their materials — never asks "what do you do"
- **One question per message** — hard rule, never a list of questions
- **2-4 sentences max per conversational turn**
- **Pushes back by default** — "Everyone is not a target audience," "Social media is not a strategy — which platform, what content, why would anyone care?"
- **Delivers a structured Marketing Brief** after 3-5 exchanges, not just open-ended advice

*Navigation:* 4 steps → 3 steps. Removed Schedule and Mission Control entirely.

| Before | After |
|--------|-------|
| ① Brand Intel | ① Brand Intel |
| ② Brand Audit & Strategy | ② Strategy Session |
| ③ Schedule | ③ Your Playbook |
| ④ Mission Control | *(removed)* |

*Interaction model:* Previously, the user had to type something to start the conversation. After this change, the strategy session **auto-starts** — when you land on Step 2, Zeta immediately opens with a specific observation about your scraped content. No prompt needed. The session owns its own opening.

*Chat placeholder:* "Describe your business, audience, or challenge..." → **"Talk to your CMO..."**

*UI copy:* "automation" → "workflows / recommended plays", "marketing dashboard" → "AI fractional CMO", "Mission Control" → removed.

**Assumption we were testing:**
The interaction model matters as much as the content. A session that feels like talking to a smart, informed human produces better strategic output than a session that feels like filling in fields on a form.

**What we learned:**
The auto-start (Zeta opens the session) dramatically changes the power dynamic. Instead of the founder explaining their business from scratch, the CMO already knows — and opens with an observation. This mirrors how a real consultant session works. It also creates immediate specificity: Zeta says something about *your* site, not a generic opener.

**Evidence:**
Real opening message from a Budget Buddy test session:
> *"I looked at your working doc for Budget Buddy. The focus on an adult, no-nonsense personal finance tool is clear, but I'm curious about the 'Buddy AI' voice being jaded and direct. Was that an intentional character choice, or did it develop that way over time?"*

This is the right tone — informed, specific, slightly challenging. It doesn't ask "what do you do." It's already past that.

**What this told us to do next:**
The conversation itself was now working. The problem shifted to the output: the Marketing Brief that Zeta delivered was still too generic. Observations that could apply to any startup weren't useful. We needed to make the brief more opinionated and more specific to this exact founder's situation.

---

## Test Cycle 3: Prompt Refinement + Specificity
*Session: Iterative prompt engineering during build*

**What we built/changed:**

**Marketing Brief format redesigned** — from a general "Top 3 Moves" list to an explicit time-horizon structure:

| Before | After |
|--------|-------|
| Move 1 / Move 2 / Move 3 with "Effort: Medium" | 🔴 DO NOW (This Week) / 🟡 DO SOON (Next 30 Days) / 🟢 BUILD TOWARD (Next 90 Days) |
| Time estimates: "Medium effort" | Time estimates: "2 hours", "1 week to set up" |
| Generic signal: "Positive feedback" | Specific signal: "You identify key dissatisfaction points common among the users" |

**New hard constraint added to system prompt:**
> *"When the founder has done NO user testing (they've said so explicitly), the DO NOW move must always be 'talk to humans first' — interviews, community posts, DMs. Not building, not launching, not advertising. Specifically: 'Find 5 people who match your target user. Have a 20-minute conversation with each one.'"*

**Conversational formatting rules added:**
- Use `**bold**` to call out the one most important thing per message (one or two instances max)
- Use `*italics*` for nuance — *"That's the real question."* or *"This works — if you're patient."*
- Each distinct thought on its own line with a blank line between
- Question always on its own line at the end

**Before (actual output, original prompt):**
> "Move 1: Validate Your Voice — Post a simple teaser about Budget Buddy's defining features. Signal to watch: Positive feedback or constructive criticism from potential users. Effort: Medium"

**After (actual output, refined prompt):**
> "🔴 DO NOW (This Week): User Conversations
> - What: Find 5 potential users who fit your target profile. Engage them in 20-minute conversations about their current budgeting tools and challenges.
> - Why first: Understanding their needs will help refine both your product and marketing messages.
> - Takes: 2 hours.
> - You'll know it worked when: You identify key insights or dissatisfaction points common among the users."

**Assumption we were testing:**
Generic strategic advice is noise. The value of a CMO session is that recommendations are so specific to your situation that they couldn't be copy-pasted into a different founder's brief.

**What we learned:**
The time-horizon structure (DO NOW / DO SOON / BUILD TOWARD) does two things: it creates clarity about sequencing, and it forces the AI to acknowledge that a 90-day move is not appropriate this week. The "no testing → must talk to humans first" constraint is the most important rule in the prompt for pre-validation founders. It prevents the AI from recommending product launches to someone who has never had a real customer conversation.

**Evidence:**
The Budget Buddy session (full output recorded in `cmo-input.md`):
- Session correctly identified: jaded AI voice, no user testing, no marketing done yet
- DO NOW recommendation: "Find 5 potential users... 20-minute conversations" — not "launch a landing page", not "post on Reddit"
- Brief correctly included a "NOT YET" section: "Don't spend on ads yet — without clear messaging and user feedback, ad spend is premature"
- The specificity test: could this brief apply to a different startup? No. The voice analysis, the YNAB competitor comparison, the "jaded vs. direct" framing — all Budget Buddy-specific.

**What this told us to do next:**
The brief content was now good. The problem was the UX: the brief rendered as a chat bubble — a wall of markdown text at the bottom of a conversation. That's not how you present a strategic document. A CMO deliverable deserves its own view.

---

## Test Cycle 4: The Playbook UI — Document View Evolution
*Session: Tonight's build sprint*

**What we built/changed:**

**Phase 4a — Brief separation from chat:**
The brief no longer renders as a chat message. When Zeta begins generating the Marketing Brief, the chat shows a spinner card: *"Generating your marketing brief... Loading into Your Playbook."* When streaming finishes, the app auto-transitions to Step 3. The brief lives in its own view.

**Phase 4b — Section cards:**
Brief content is parsed on `---` dividers. Each of the 5 sections becomes its own `rounded-2xl border bg-surface` card:
- Brand Positioning
- First Audience (Your Next 50 Users)
- Top 3 Moves
- Not Yet
- This Week: One Thing ← brand-tinted card (`border-brand/25 bg-brand/[0.03]`) to signal it as the action item

**Phase 4c — Colored move sub-cards:**
The three time-horizon moves get visual identity via Lucide SVG icons:
- `<Zap />` in red for DO NOW — urgency
- `<Clock />` in yellow for DO SOON — consideration
- `<TrendingUp />` in emerald for BUILD TOWARD — growth horizon

No emoji anywhere in the document — emoji stripped from all rendered text. Visual identity comes from card structure and vector icons.

**Phase 4d — Table of contents sidebar:**
Left panel (`w-60`) with sticky navigation. Clicking a section smoothly scrolls the document. TOC updates active section on click.

**Phase 4e — Cohesive design across all steps:**
Applied the same card language (`rounded-2xl border border-white/[0.08] bg-surface px-7 py-6`) to Step 1 (Upload). Section headers use `text-[10px] uppercase tracking brand` labels throughout. Brand-tinted cards (`border-brand/20 bg-brand/[0.03]`) used consistently for "active/important" signals — ingested assets in Step 1, brief-loading card in Step 2, This Week card in Step 3.

**Assumption we were testing:**
A strategic deliverable presented as a document (not a chat message) signals credibility and usability. Founders should be able to navigate to any section, reference it independently of the conversation, and feel like they've received something they can act on.

**What we learned:**
The transition from chat → document view creates a natural "mode shift" in the session. The conversation phase feels exploratory; the playbook phase feels conclusive. That shift is appropriate to the product's purpose: you're not just chatting with an AI, you're getting a deliverable.

**Evidence:**
- Scrollable document with per-section cards is significantly more readable than a single markdown wall
- The DO NOW card with a `<Zap />` icon in red immediately draws attention to the highest-priority action — no scanning required
- TOC sidebar makes the brief feel like a real CMO document, not a chatbot response
- Export JSON button: founders can copy the full session (role/content format) for follow-up analysis

**Mock workflow cards (bottom of Playbook):**
Three pre-built workflow templates appear after the brief:
1. Community Listening (`<Bell />`) — Reddit/Discord keyword monitoring
2. Beta Waitlist Email (`<Mail />`) — auto-welcome on signup
3. Weekly Check-in (`<Calendar />`) — Monday community posting habit

Clicking "Activate" changes button state to "Activated ✓" (emerald). These are mocked — no real backend. The intent is to show that strategy → execution is one click away.

**What this told us to do next:**
The full loop works: Brand Intel → Strategy Session → Your Playbook. The next question is: what happens after the first session? The brief is static. A real CMO relationship is ongoing.

---

## Test Cycle 5: Step 1 Humanization — Zeta Is Present from Screen One
*Session: Makerday2 build sprint continuation*

**What we built/changed:**

Step 1 (Brand Intel) was a form — URL inputs, a file upload zone, and a generic "assets ingested" counter. It was functional but impersonal. Zeta wasn't there yet.

Two new components replaced the generic UI:

**`ZetaIntro`** — a card at the top of Step 1 where Zeta speaks in first person. Detects whether this is the user's first session or a returning session via `localStorage.getItem("zeta_session_count")`:
- First visit: *"Before we talk, I do my homework. Give me your site URL and a competitor or two..."*
- Returning: *"Good to see you back. Drop any updates — new pages, new docs, anything that's changed since last time..."*

**`ZetaReadList`** — replaces the generic "X assets ingested" counter. After a URL is scraped, instead of a number, Zeta's read list appears with `CheckCircle2` icons per file and an auto-generated sentence: *"I've read through your site and 2 competitors. I'll have observations ready."*

**Scrape button state**: After a successful scrape, the button changes to a `CheckCircle2 + "Read"` state in brand color — not just clearing the input, but confirming Zeta has read it.

**CTA copy is context-aware:**
- First session → "Start strategy session"
- Returning → "Start next session"

The session counter increments in `handleNext()` so it reflects the session being *started*, not the one being completed.

**Assumption we were testing:**
If Zeta is present and speaking on screen 1, the emotional contract of the product is established before the strategy session even starts. The user isn't uploading into a void — they're briefing someone.

**What we learned:**
The upload step is not just an intake form. It's the moment the founder hands over their context. The framing should match that — Zeta receiving the information, not the user submitting to a system. "I'll read through everything before we sit down" sets up the opening of the strategy session as a consequence of this step, not a separate experience.

**What this told us to do next:**
The full emotional arc now works: Zeta introduces herself and asks to be briefed (Step 1) → Zeta opens the session with a specific observation (Step 2) → Zeta delivers a structured document (Step 3). Session awareness (first visit vs. returning) is currently a simple counter. The deeper version — Zeta referencing what was discussed last time — is a Test Cycle 6 / roadmap item.

---

## Test Cycle 6: The Flywheel (Next Phase — Roadmap)
*Status: Defined, not yet built — roadmap*

**What we're building toward:**

The current product delivers a one-time strategic snapshot. The real value emerges from persistence and iteration:

**1. Returning sessions**
Founder comes back two weeks later: "I did the 5 user interviews. Here's what I heard." Zeta reviews the brief from the previous session, compares the new information against its original recommendations, and either validates the direction or adjusts it. The brief is a living document that evolves.

**2. Session memory and context layering**
Each session adds to the context: what was tried, what worked, what the founder learned. The system prompt dynamically injects historical context alongside the current session's materials. Over time, Zeta knows this founder — not just their website.

**3. Workflow performance signals**
When a founder activates a workflow (community listening, waitlist email, check-in habit), real data starts coming back. Did the 5 interviews produce insights? Did the landing page get signups? The AI can pull these signals in and adjust the next brief accordingly.

**4. The data flywheel**
Across founders: what patterns emerge? Which DO NOW recommendations actually get done? Which sessions produce briefs where the "Not Yet" list turns out to have been correct? The aggregate signal from many founder sessions creates training data for better recommendations — a proprietary dataset that no generic LLM has.

**The pitch frame:**
> *"Every session makes the next one smarter. Every founder who uses Zeta makes the product better for the next founder. That's the flywheel."*

**Metrics to track:**
- Session-to-brief completion rate (do founders reach the Playbook?)
- Brief-to-action rate (do they click Activate? Do they come back?)
- Return session rate (do they come back for session 2?)
- Brief quality score (will need human evaluation rubric)

---

## Development Artifacts

### Screenshots to capture for presentation
- [ ] **Step 1 (Brand Intel)** — URL input cards with scrape button, assets ingested in brand-tinted card
- [ ] **Step 2 (Strategy Session)** — Zeta opening message referencing specific content (Budget Buddy example), one question per message, push-back exchange
- [ ] **Step 2 → Step 3 transition** — the spinner card: "Generating your marketing brief... Loading into Your Playbook"
- [ ] **Step 3 (Your Playbook)** — full document view: section cards, DO NOW/DO SOON/BUILD TOWARD colored sub-cards with Zap/Clock/TrendingUp icons
- [ ] **Step 3 detail** — This Week callout card (brand-tinted), TOC sidebar active state
- [ ] **Workflow activation** — mock cards before and after "Activate" click
- [ ] **Step indicator** — all three steps complete (Brand Intel ✓, Strategy Session ✓, Your Playbook active)

### Before/after comparisons worth showing
1. **System prompt persona** — Original ("AI marketing strategist, workflow types...") vs. Current ("fractional CMO, already researched your business")
2. **Step navigation** — Original 4-step wizard (Brand Intel / Brand Audit & Strategy / Schedule / Mission Control) vs. Current 3-step flow
3. **Brief format** — Original "Move 1: Validate Your Voice — Effort: Medium" vs. Current "DO NOW: Find 5 users, 20-minute conversations, Takes: 2 hours"
4. **Brief rendering** — Chat bubble (markdown wall) vs. Document view (section cards)
5. **Opening message** — Before auto-start (user had to click a button) vs. After (Zeta opens immediately with a specific observation)

### Real session outputs to reference
- **Budget Buddy session** (full transcript in `cmo-input.md`): shows the complete arc from opening observation → 4-turn conversation → Marketing Brief delivery
- **Key exchange:** Zeta correctly identified no user testing and pushed back: *"Without that testing, you're assuming your style will land well with your target users — but it might not."*
- **DO NOW output:** Correctly prescribed user interviews before anything else — not launch, not ads, not content

---

## Update Log

| Date | Change | Learning |
|------|--------|----------|
| 2026-03-26 | Built original 4-step wizard with workflow automations | Foundation: SSE streaming, tool calling, file ingestion working |
| 2026-03-26 | Added URL scraping + brand audit flow | Scraper works well; competitor context improves AI quality |
| 2026-03-26 | Full system prompt rewrite: fractional CMO persona | Tone shift from "helpful tool" to "informed advisor" |
| 2026-03-26 | Removed Schedule + Mission Control steps; added Your Playbook | Reduced friction; automation is downstream of strategy |
| 2026-03-26 | Added auto-start: Zeta opens the session without user prompt | Session ownership shifts to Zeta; feels like a real CMO meeting |
| 2026-03-26 | Added Brand Intel Summary card (later removed as redundant) | The opening message in Step 2 already IS the brand intel; two summaries was confusing |
| 2026-03-26 | Brief detection + auto-advance to Step 3 | Seamless transition; no manual "View brief" click needed |
| 2026-03-26 | Brief renders in chat (markdown wall) | Readable but not document-quality; needs its own view |
| 2026-03-26 | DO NOW / DO SOON / BUILD TOWARD format + time estimates | Specificity dramatically improved; constraint for no-testing founders is critical |
| 2026-03-27 | Brief separated from chat: spinner → transition → document view | Mode shift from conversation to deliverable feels intentional |
| 2026-03-27 | Section cards + colored move sub-cards + TOC sidebar | Document structure makes brief scannable and credible |
| 2026-03-27 | Emoji stripped; replaced with Lucide SVG icons | More polished; consistent with app's professional visual language |
| 2026-03-27 | Cohesive card language applied to Steps 1 + 2 | All three steps now feel like one product, not three separate UIs |
| 2026-03-27 | Step 1 humanization: ZetaIntro card + ZetaReadList component | Zeta is present from screen 1; upload step no longer feels like a form |
| 2026-03-27 | First vs. returning session detection via localStorage counter | Copy, CTA, and Zeta's intro message adapt to whether this is session 1 or session N |
| 2026-03-27 | Scrape button → "Read ✓" state after successful URL ingestion | Immediate feedback that Zeta has read the content; reinforces the CMO-has-done-homework frame |
| 2026-03-27 | Added short-circuit rule: skip marketing question if founder reveals zero users/pre-validation | Was asking "have you tried any marketing?" after founder said "no users yet" — pointless, wastes turns, already implied by the DO NOW rule |
| 2026-03-27 | Extended short-circuit: "built it for myself / no users" answers both user-audience AND marketing history questions | Zeta was still capable of asking "who do you see as your first users?" even after founder said they have none — same dead-end pattern |
| 2026-03-27 | Added "I don't know" handling: offer a frame, don't repeat the question | No guidance for genuine founder uncertainty caused loop behavior — ask the same thing differently until time runs out |
| 2026-03-27 | Brief one-liner: infer competitor from category if none provided, don't ask mid-session | Was burning a conversational turn asking "who's your main competitor?" just to fill the template slot |
| 2026-03-27 | Fixed: scraped context not being used — AI gave generic responses | Root cause: JS-rendered sites return near-empty HTML to the scraper; `content` was <150 chars. Now `buildSystemPrompt` detects thin content, labels it as "SCRAPE RETURNED MINIMAL CONTENT," and tells the AI to acknowledge the scrape failed and ask the founder to describe the product. When content IS rich, AI is now instructed to open by naming something specific from the scraped page (domain/headline) rather than saving all observations for later. |

---

*Add new entries to the Update Log as they happen. For major changes, create a new Test Cycle section.*
