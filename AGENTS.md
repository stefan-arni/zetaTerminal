<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Zeta Terminal — Master Prompt

## Product Context
Zeta Terminal is an AI fractional CMO for first-time startup marketing leads.
The flow: Brand Intel (scrape URLs + docs) -> Strategy Session (informed AI conversation) -> Marketing Brief (strategic deliverable with actionable recommendations).
The AI should behave like an experienced CMO -- opinionated, direct, concise -- not like a SaaS tool or chatbot.

## Project Overview

Zeta Terminal is an AI fractional CMO for first-time startup founders. Users upload company files and URLs, chat with an AI agent that acts as their fractional CMO, and receive a strategic marketing brief with actionable recommendations.

**Current phase: Demo/MVP.** No backend/database. State lives in React Context + localStorage.

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS 4 |
| Components | shadcn/ui |
| State | React Context + useReducer |
| AI | OpenAI SDK (`openai`) — GPT-4o. API key in `.env.local` as `OPENAI_API_KEY`. |
| Forms | React Hook Form + Zod |
| Date/Time | date-fns |

## Coding Standards

- No `any`. No barrel exports. No `useEffect` for derived state.
- `@/` path aliases only. No inline styles. Tailwind only.
- Files: kebab-case. Components: PascalCase. No default exports except page/layout.
- Every async op needs try/catch. All interactive elements keyboard-accessible.

## AI Agent

- API route: `app/api/chat/route.ts` — POST, streams OpenAI responses via SSE
- System prompt: `lib/ai/system-prompt.ts` — dynamically injects uploaded files + active workflows
- Tools: `lib/ai/tools.ts` — OpenAI function calling format: `suggest_workflow`, `modify_workflow`, `pause_workflow`, `request_file_info`
- Frontend parses OpenAI streaming chunks, detects tool calls, renders `CronSuggestionCard` inline

## Environment Variables

```
OPENAI_API_KEY=           # Required for AI chat. Server-side only.
```
