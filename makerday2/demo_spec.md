# Zeta Terminal — Claude Code Implementation Spec (Final)

## Codebase Context

**Repo:** https://github.com/stefan-arni/zetaTerminal
**Stack:** Next.js 15, TypeScript strict, Tailwind 4, shadcn/ui, OpenAI GPT-4o
**State:** React Context + useReducer + localStorage (no backend)
**AI route:** `app/api/chat/route.ts` (SSE streaming)
**System prompt:** `lib/ai/system-prompt.ts` — `buildSystemPrompt(files, workflows)`
**Tools:** `lib/ai/tools.ts` — suggest_workflow, modify_workflow, pause_workflow, request_file_info

### Current File Map

```
app/
  api/chat/route.ts          ← SSE streaming endpoint
  api/debrief/route.ts       ← new (Stefan added)
  api/scrape/route.ts        ← new (Stefan added - URL scraping)
  page.tsx                   ← Main page, renders step components

components/
  steps/
    upload-step.tsx          ← STEP 1: Brand Intel (URL inputs, file upload, scrape)
    strategy-step.tsx        ← STEP 2: Brand Audit & Strategy (chat interface)
    schedule-step.tsx        ← STEP 3: Schedule (workflow config)
    review-step.tsx          ← STEP 4: Mission Control (review/launch)
  chat/
    chat-interface.tsx       ← Chat UI component (used by strategy-step)
    message-bubble.tsx       ← Individual message rendering
    cron-suggestion-card.tsx ← Workflow suggestion cards in chat
    typing-indicator.tsx
  layout/
    step-indicator.tsx       ← Top nav showing 4 steps
    header.tsx / shell.tsx / sidebar.tsx
  workflows/
    workflow-card.tsx / workflow-list.tsx

context/
  stepper-context.tsx        ← Controls currentStep, STEP_COMPONENTS map
  chat-context.tsx           ← Chat messages state
  files-context.tsx          ← Uploaded files + scraped content state
  workflows-context.tsx      ← Workflow configuration state

lib/
  ai/system-prompt.ts        ← buildSystemPrompt() — THE KEY FILE
  ai/tools.ts                ← Function calling definitions
  constants.ts
  types.ts
```

### What Stefan Already Built (Respect This)
- URL scraping endpoint (`api/scrape/route.ts`) — working, keep it
- File upload + ingestion UI (`upload-step.tsx`) — working, keep it
- System prompt already positions as "fractional CMO for first-time founders"
- Brand audit flow: scrapes landing page + competitors, reads docs, does audit
- Process order: Brand audit → Positioning → Strategy → Automations
- SSE streaming with function calling — working, keep it
- Dark UI theme — looks good, keep it

---

## What We're Changing (and Why)

The app currently feels like a 4-step SaaS wizard. We want it to feel like a session with a human CMO. The architecture stays the same. We're changing prompts, UI copy, and one step's rendering behavior.

---

## CHANGE 1: System Prompt Rewrite

**File:** `lib/ai/system-prompt.ts`

The current `buildSystemPrompt(files, workflows)` function already injects file contents and workflow context. Keep that injection logic. Replace the persona/behavior sections of the prompt with the following.

**Replace the prompt content (keep the dynamic injection of files/workflows) with:**

```typescript
// The core persona and behavior instructions
// (Keep the existing file/workflow injection code that wraps around this)

const SYSTEM_PROMPT_CORE = `
You are Zeta — an experienced fractional CMO sitting down with a first-time startup founder for their initial strategy session. You've already researched their business — all scraped landing pages, competitor pages, and uploaded documents are provided below.

## YOUR PERSONALITY
- Direct and opinionated. When a founder says something vague, call it out.
- Talk like a smart experienced friend — not a consultant, not a chatbot.
- Don't hedge. Make clear recommendations with reasoning.
- Warm but honest. Say "that's not going to work, here's why" when needed.
- Concise. Short paragraphs. 2-4 sentences per message in conversation.

## SESSION FLOW

### If files/URLs were provided (Brand Intel available):
1. OPEN by referencing something specific you found in their materials. Don't ask "what do you do" — you already know. Say something like: "I looked at your site. [Specific observation]. Tell me — is that intentional, or did it just end up that way?"
2. Ask ONE follow-up question at a time. Wait for the answer. Respond with a brief insight (1-2 sentences), then ask your next question.
3. You're trying to uncover three things the research couldn't tell you:
   a) The gap between what the founder intends and what the site communicates
   b) Who the actual first users are (not the aspirational market)
   c) What they've tried for marketing and what happened
4. After 3-5 exchanges, transition: "Alright, I've got a clear picture. Here's your Marketing Brief."

### If no files/URLs were provided:
1. Ask 2-3 diagnostic questions to understand the business, one at a time.
2. Then proceed to the Marketing Brief.

## CONVERSATION RULES
- ONE question per message. Never list multiple questions.
- Keep messages SHORT. 2-4 sentences max per turn.
- Be opinionated and push back:
  - "Everyone" is not a target audience.
  - "We're better" is not differentiation. How? Why would a customer notice?
  - "Social media" is not a strategy. Which platform? What content? Why would anyone care?
- When you see a disconnect between founder intent and their messaging, name it directly: "You want to be seen as [X], but your site reads as [Y]. That's a fixable problem."

## MARKETING BRIEF FORMAT
When you transition to delivering the brief, use this exact structure:

---

🎯 **BRAND POSITIONING**

**One-liner:** "[Product] is [what] for [specific who] who [specific need]. Unlike [main competitor], [concrete differentiator]."

**The Gap:** [2-3 sentences on the disconnect between founder intent and customer perception]

**Brand Voice:** [3 adjectives + 1 sentence on what this means in practice]

---

👥 **FIRST AUDIENCE (Your Next 50 Users)**

**Who:** [A specific person — not a demographic. "Solo founders in year one who are technical enough to build but freeze when it comes to marketing" — not "founders aged 25-40"]

**Where to find them:** [2-3 specific online places with names — subreddits, Discords, newsletters, communities]

**What's on their mind:** [1-2 concerns this audience has that connect to the product]

---

🚀 **TOP 3 MOVES** (In Priority Order)

**Move 1: [Specific name]**
- Do this: [Concrete action]
- Why now: [Why this matters at their stage]
- Signal to watch: [What metric/response tells them it's working]
- Effort: Low / Medium / High

**Move 2: [Specific name]**
- Do this:
- Why now:
- Signal to watch:
- Effort:

**Move 3: [Specific name]**
- Do this:
- Why now:
- Signal to watch:
- Effort:

---

🚫 **NOT YET**

**Don't [thing 1]:** [Why — 1-2 sentences]
**Don't [thing 2]:** [Why — 1-2 sentences]

---

📅 **THIS WEEK: ONE THING**

**Do this by Friday:** [Single specific action]
**Why:** [What signal it generates]
**If it works:** [Next step]
**If it doesn't:** [What to try instead]

---

## IMPORTANT CONSTRAINTS
- Every recommendation must be SPECIFIC to this founder's business. If it could apply to any startup, rewrite it.
- Do NOT generate content (social posts, emails, ad copy) unless specifically asked.
- Do NOT jump to workflow/automation suggestions until after the Marketing Brief is delivered.
- After delivering the brief, you may suggest relevant automations using the available tools if they map to the recommended moves.
`;
```

**Key implementation note:** The existing `buildSystemPrompt` function injects file contents (landing pages at 4000 chars, competitor pages at 3000 chars, docs at 3000 chars) and workflow context. KEEP that injection code. Just replace the persona/instruction sections that wrap around it. The file/workflow context should still be injected between the instructions and the conversation.

---

## CHANGE 2: Brand Intel Summary (Post-Scrape)

**File:** `components/steps/upload-step.tsx`
**Also may need:** `app/api/scrape/route.ts` or a new endpoint

After the user scrapes their URLs and before they move to Step 2, add a **Brand Intel Summary** that appears on the upload step page.

### Option A (simpler — do this if time is short):
After scraping completes, make a call to the chat API (or a separate endpoint) with the scraped content and this prompt to generate a summary. Display it as a card on the upload step page.

```typescript
const BRAND_INTEL_SUMMARY_PROMPT = `
You are a fractional CMO preparing for your first meeting with a startup founder. You've just reviewed their website and competitor sites. Produce a brief pre-meeting summary.

Format exactly like this:

**Your current message:** [1-2 sentences — what the website actually communicates to a first-time visitor. Be honest, not generous.]

**Your implied audience:** [Who the site seems to be talking to based on language and positioning]

**Competitor snapshot:**
- [Competitor name]: [1 sentence positioning] — [1 sentence on strength or gap vs. founder]

**3 things that jumped out:**
1. [Most important observation]
2. [Second observation]  
3. [Third observation]

Keep this under 150 words. Be direct.
`;
```

### UI:
- Render as a dark card/panel below the ingested assets list
- Header: "What I Found" or "Brand Intel Summary"
- Below the card, change the CTA button text to: **"Let's talk about what I found →"**

### Option B (if time is really short):
Skip the summary card. The system prompt already does the brand audit as the opening message in Step 2. The summary is a nice-to-have but the demo works without it.

---

## CHANGE 3: Step Labels and Navigation

**File:** `components/layout/step-indicator.tsx`
**File:** `app/page.tsx` (the STEP_COMPONENTS map and step metadata)
**File:** `context/stepper-context.tsx`

### Step indicator — change from 4 steps to 3:

| Current | New |
|---------|-----|
| ① Brand Intel | ① Brand Intel |
| ② Brand Audit & Strategy | ② Strategy Session |
| ③ Schedule | ③ Your Marketing Brief |
| ④ Mission Control | *(removed)* |

### In `app/page.tsx`:
Update the STEP_COMPONENTS map and any step metadata (labels, descriptions, numbers):

```typescript
const STEP_COMPONENTS = {
  upload: UploadStep,      // Step 1: Brand Intel
  strategy: StrategyStep,  // Step 2: Strategy Session  
  brief: BriefStep,        // Step 3: Your Marketing Brief (see Change 5)
}

// Update step metadata:
// Step 1: "Brand Intel" — "Drop your URLs and docs — I'll research you before we talk"
// Step 2: "Strategy Session" — "Your fractional CMO, already informed"
// Step 3: "Your Marketing Brief" — "Your strategy, your first moves, ready to execute"
```

### In `context/stepper-context.tsx`:
Update the step definitions to reflect 3 steps instead of 4. Remove or merge the schedule/review steps.

---

## CHANGE 4: Chat Interface Tweaks

**File:** `components/steps/strategy-step.tsx`
**File:** `components/chat/chat-interface.tsx`
**File:** `components/chat/message-bubble.tsx`

### Chat input placeholder:
Find the input/textarea element and change the placeholder text:
- Current: "Describe your business, audience, or challenge..."
- New: **"Talk to your CMO..."**

### Message rendering:
The current message-bubble.tsx renders markdown. This is fine — keep it. The Marketing Brief will come through as a long markdown message with headers and emoji. It should render well with the existing markdown support.

### Typing indicator:
If there's a typing/loading message, consider changing it to something like "Zeta is thinking..." or keep as-is.

---

## CHANGE 5: Marketing Brief Step (Optional — P2 Priority)

**New file:** `components/steps/brief-step.tsx`

This is nice-to-have for the demo. If time allows:

Create a new step component that renders the Marketing Brief as a standalone document view rather than as a chat message. It would pull the last AI message (the brief) from chat context and render it in a polished document layout.

**If time is short:** Skip this. The Marketing Brief will render just fine as a chat message in the strategy step using existing markdown rendering. The 3-step nav can still show "Your Marketing Brief" as step 3, and it just renders the strategy-step chat where the brief is visible at the bottom of the conversation.

**Simplest approach:** Keep the STEP_COMPONENTS map at 3 entries but have step 3 also render StrategyStep (the chat) — just with a different header. The brief is already in the chat.

```typescript
const STEP_COMPONENTS = {
  upload: UploadStep,
  strategy: StrategyStep,
  brief: StrategyStep,  // Same component, different header — brief is in the chat
}
```

---

## CHANGE 6: Global UI Copy

**File:** `components/layout/header.tsx`
- Add tagline: **"Your AI Fractional CMO"** near the Zeta logo/title

**File:** `components/steps/upload-step.tsx`
- Step subtitle: **"Drop your URLs and docs — I'll research you before we talk"**
- Keep existing functionality (URL inputs, scrape buttons, file upload)

**File:** `components/steps/strategy-step.tsx`
- Step subtitle: **"Your fractional CMO — already informed, ready to dig in"**

**Anywhere in the codebase** that references:
- "automation" → consider changing to "recommended plays" or "workflows"
- "Mission Control" → remove or replace
- "marketing dashboard" → "AI fractional CMO"

---

## CHANGE 7: AGENTS.md / CLAUDE.md Update

**File:** `AGENTS.md`

Add context so future Claude Code sessions understand the app's purpose:

```markdown
## Product Context
Zeta Terminal is an AI fractional CMO for first-time startup marketing leads.
The flow: Brand Intel (scrape URLs + docs) → Strategy Session (informed AI conversation) → Marketing Brief (strategic deliverable with actionable recommendations).
The AI should behave like an experienced CMO — opinionated, direct, concise — not like a SaaS tool or chatbot.
```

---

## Priority Order — Do In This Order

### P0 — Must have for demo (do these first)
1. **System prompt rewrite** (`lib/ai/system-prompt.ts`) — Replace persona/behavior sections with the new prompt above. Keep file/workflow injection logic. This is the single highest-impact change.
2. **Chat input placeholder** (`components/chat/chat-interface.tsx` or `components/steps/strategy-step.tsx`) — Change to "Talk to your CMO..."
3. **Step labels** (`step-indicator.tsx`, `page.tsx`, `stepper-context.tsx`) — 3 steps instead of 4, new names and descriptions.

### P1 — Should have for demo
4. **Brand Intel Summary card** (`upload-step.tsx`) — After scraping, show summary before transition to chat.
5. **Header tagline** (`header.tsx`) — Add "Your AI Fractional CMO"
6. **UI copy sweep** — Change automation/dashboard language to CMO/strategy language wherever visible.

### P2 — Nice to have
7. **Brief step** — Separate rendering of the Marketing Brief as a document view.
8. **Workflow connection** — After brief is delivered, surface relevant workflow suggestions.

---

## What NOT to Change
- `app/api/chat/route.ts` — SSE streaming works, don't touch it
- `app/api/scrape/route.ts` — URL scraping works, don't touch it  
- `lib/ai/tools.ts` — Function calling definitions, keep them (the new prompt just delays when they're invoked)
- `context/` state management pattern — keep React Context + useReducer + localStorage
- `components/chat/` rendering infrastructure — keep message bubbles, markdown rendering, typing indicator
- `components/ui/` — shadcn components, don't touch
- Visual theme / Tailwind styles — the dark theme looks good
- `components/workflows/` — keep these, they'll be used after the brief is delivered

---

## Claude Code Opening Prompt

Copy-paste this to start your Claude Code session:

```
Read the repo at https://github.com/stefan-arni/zetaTerminal (or the local clone).

I need to make changes for a demo tomorrow. Here's the priority:

1. FIRST: Open lib/ai/system-prompt.ts. I need to rewrite the persona and behavior sections of buildSystemPrompt(). Keep the file/workflow injection logic — just replace the instruction text. I'll paste the new prompt content.

2. SECOND: Update step-indicator.tsx, page.tsx, and stepper-context.tsx to show 3 steps instead of 4:
   - Step 1: "Brand Intel" — "Drop your URLs and docs — I'll research you before we talk"
   - Step 2: "Strategy Session" — "Your fractional CMO, already informed"  
   - Step 3: "Your Marketing Brief" — "Your strategy, your first moves, ready to execute"

3. THIRD: Change the chat input placeholder to "Talk to your CMO..."

Start with #1 — show me the current system-prompt.ts so I can see what to keep and what to replace.
```

---

## Testing Checklist

After changes, run through the full flow:

- [ ] App loads, shows 3-step indicator (Brand Intel → Strategy Session → Your Marketing Brief)
- [ ] Step 1: Enter a URL + competitor, scrape works, assets show up
- [ ] Click through to Step 2
- [ ] AI opens with a specific observation from the scraped content (NOT "tell me about your business")
- [ ] AI asks one question at a time, keeps messages short (2-4 sentences)
- [ ] AI pushes back on vague answers
- [ ] After 3-5 exchanges, AI delivers the Marketing Brief in the structured format
- [ ] Brief has all sections: Positioning, Audience, Top 3 Moves, Not Yet, This Week
- [ ] Recommendations are specific to the business (not generic)
- [ ] Screenshot everything for the demo