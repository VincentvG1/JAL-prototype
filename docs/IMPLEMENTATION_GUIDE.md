# AI Prompt Coach & Review Loop — Implementation Guide
### JAL-Prototype Integration

---

## 1. Overview

This document is the authoritative integration guide for the **AI Prompt Coach & Review Loop** feature. It maps every new file to its purpose, explains all state transitions, and gives step-by-step integration instructions for an existing Next.js 14 (App Router) + Tailwind + TypeScript project.

---

## 2. New File Manifest

```
src/
├── types/
│   └── index.ts                          ← NEW — all shared TypeScript types
│
├── lib/
│   └── useVideoWorkflow.ts               ← NEW — central state machine hook
│
├── app/
│   ├── api/
│   │   ├── coach/
│   │   │   └── route.ts                  ← NEW — /api/coach POST endpoint
│   │   └── generate/
│   │       └── route.ts                  ← NEW (or REPLACE existing generate route)
│   └── video/
│       └── page.tsx                      ← NEW (or REPLACE your existing page)
│
└── components/
    ├── coach/
    │   ├── PromptInput.tsx               ← NEW — controlled textarea
    │   ├── PromptCoachFeedback.tsx       ← NEW — AI feedback card
    │   ├── ActionBar.tsx                 ← NEW — smart button row
    │   └── VideoPlayer.tsx               ← NEW — video display + regenerate
    └── ui/
        ├── ErrorBanner.tsx               ← NEW — dismissible error display
        └── StageIndicator.tsx            ← NEW — pipeline breadcrumb nav
```

### Files you need to MODIFY in your existing repo

| Existing file | What to change |
|---|---|
| `tailwind.config.ts` | Merge the `keyframes` and `animation` extensions from `tailwind.config.ts` in this deliverable |
| `package.json` | Add `@anthropic-ai/sdk` and `@fal-ai/serverless-client` if not already present |
| `.env.local` | Add `ANTHROPIC_API_KEY` and `FAL_KEY` (see `.env.local.example`) |
| Your existing generate API route | Either replace with the new `route.ts` or extract the Fal.ai call logic into it |

---

## 3. State Machine — Full Transition Diagram

```
                    ┌─────────────────────────────────────────────┐
                    │                                             │
        reset()     ▼                                             │
  ┌──────────────► idle ──── submitToCoach() ──► coaching         │
  │                 │                                │            │
  │                 │           (API in-flight)      │            │
  │                 │                                ▼            │
  │                 │                           [/api/coach]      │
  │                 │                                │            │
  │                 │              ┌─────────────────┘            │
  │                 │              │ feedback received            │
  │                 │              ▼                              │
  │                 │           coached ◄── submitToCoach() ──┐   │
  │                 │              │         (re-check)       │   │
  │                 │              │                          │   │
  │                 │     isReady? │                          │   │
  │                 │      YES     ▼                          │   │
  │                 │       generateVideo() ──► generating    │   │
  │                 │                               │         │   │
  │                 │          (API in-flight)      │         │   │
  │                 │                               ▼         │   │
  │                 │                         [/api/generate] │   │
  │                 │                               │         │   │
  │                 │                    ┌──────────┘         │   │
  │                 │                    │ video received     │   │
  │                 │                    ▼                    │   │
  │                 │               completed                 │   │
  │                 │                    │                    │   │
  │                 │           startRegenerate()             │   │
  │                 │            (sets prompt,                │   │
  │                 │             clears feedback)            │   │
  │                 └────────────────────┴────────────────────┘   │
  │                                                               │
  └───────────────────────────── reset() ────────────────────────┘
```

### Key invariant

**The "Generate Video" button is only enabled when `coachFeedback.isReadyForGeneration === true`.** There is no way to call `/api/generate` without passing through `/api/coach` first. This gate is enforced in both the UI (`ActionBar`) and the hook (`generateVideo` early-returns if the guard fails).

---

## 4. Step-by-Step Integration

### Step 1 — Install dependencies

```bash
npm install @anthropic-ai/sdk @fal-ai/serverless-client
```

### Step 2 — Add environment variables

Copy `.env.local.example` to `.env.local` and fill in:

```
ANTHROPIC_API_KEY=sk-ant-...
FAL_KEY=...
```

### Step 3 — Copy new files

Copy every file from the `src/` tree in this deliverable into your project. The directory structure mirrors standard Next.js App Router conventions.

### Step 4 — Merge Tailwind config

Open your existing `tailwind.config.ts` and add the `keyframes` and `animation` blocks from the deliverable version. Do **not** replace the whole file — only extend the `theme.extend` section.

### Step 5 — Wire up the page

If your existing entry point is (for example) `src/app/page.tsx`, you have two options:

**Option A — Replace** the page body with the contents of `src/app/video/page.tsx`. Keep your existing layout/providers wrapper intact.

**Option B — Route** to the new page by navigating users to `/video`. The new page is self-contained at `src/app/video/page.tsx`.

### Step 6 — Handle your existing generate logic

If you already have a `/api/generate` route:

1. Compare it with the new `route.ts`.
2. If your existing route has additional business logic (auth, DB writes, queuing), **keep that logic** and only replace the Fal.ai call portion with the pattern shown.
3. The response shape **must** conform to `GenerateResponse` from `src/types/index.ts` — the hook depends on `{ success: true, video: VideoResult }`.

### Step 7 — TypeScript path aliases

Ensure `tsconfig.json` has the `@/` alias pointing to `src/`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

## 5. Component API Reference

### `useVideoWorkflow()` — the state machine hook

| Return value | Type | Description |
|---|---|---|
| `promptStage` | `PromptStage` | Current lifecycle stage |
| `rawPrompt` | `string` | Controlled textarea value |
| `coachFeedback` | `CoachFeedback \| null` | Latest coach response |
| `currentVideo` | `VideoResult \| null` | Latest completed video |
| `error` | `string \| null` | Latest error message |
| `setRawPrompt(v)` | `fn` | Update textarea + invalidate coach |
| `submitToCoach()` | `async fn` | POST to /api/coach |
| `applyEnhancedPrompt()` | `fn` | Copies enhancedPrompt into rawPrompt |
| `generateVideo()` | `async fn` | POST to /api/generate (gated) |
| `startRegenerate()` | `fn` | Re-enters idle, preserves prompt |
| `reset()` | `fn` | Full state reset to initial |

### `PromptCoachFeedback` props

| Prop | Type | Description |
|---|---|---|
| `feedback` | `CoachFeedback` | The coach's structured response |
| `onApplyEnhanced` | `() => void` | Called when user clicks Apply |
| `enhancedApplied` | `boolean` | Controls ✓ Applied visual state |

### `ActionBar` props

| Prop | Type | Description |
|---|---|---|
| `stage` | `PromptStage` | Controls which button is rendered |
| `coachFeedback` | `CoachFeedback \| null` | Gates the Generate button |
| `rawPrompt` | `string` | Gates the Coach button (min 3 chars) |
| `onCoach` | `() => void` | Triggers submitToCoach |
| `onGenerate` | `() => void` | Triggers generateVideo |

---

## 6. The Coach LLM Prompt — Design Decisions

The system prompt in `/api/coach/route.ts` was written with these goals:

1. **Deterministic JSON** — instructs the model to return *only* valid JSON with no markdown fences
2. **Domain expertise** — frames the model as a Wan 2.1 specialist so tips are model-specific, not generic
3. **Preservation of intent** — explicitly forbids inventing subject matter, so `enhancedPrompt` is always a refinement, never a replacement
4. **Bounded output** — 2–5 tips, 80-word max on enhancedPrompt keeps the UI clean
5. **Graceful on good prompts** — even excellent prompts get 1–2 positive tips so the feedback card always has value

To tune the threshold between "not ready" and "ready", edit the qualitative criteria section of `SYSTEM_PROMPT` in `route.ts`.

---

## 7. Adding Auth / Rate-Limiting (recommended for production)

Both API routes are currently open. Before deploying:

```ts
// In /api/coach/route.ts and /api/generate/route.ts, add at the top of POST():

import { auth } from "@/lib/auth"; // your existing auth helper

const session = await auth();
if (!session) {
  return NextResponse.json({ success: false, error: "Unauthorised" }, { status: 401 });
}
```

For rate-limiting, Vercel's `@vercel/kv` with a sliding-window counter or `upstash/ratelimit` are recommended.

---

## 8. Testing Checklist

| Scenario | Expected behaviour |
|---|---|
| Submit empty prompt | Coach button disabled; no API call |
| Submit vague prompt ("a cat") | `isReadyForGeneration: false`; tips shown; Generate locked |
| Submit rich prompt | `isReadyForGeneration: true`; Generate unlocked |
| Click "Apply AI Enhanced Prompt" | Textarea updates; button shows ✓ Applied |
| Edit prompt after coaching | Coach result cleared; stage → idle; must re-check |
| Click "Generate Video" | Spinner shown; video card appears on success |
| Click "Regenerate" on completed video | Prompt populated; feedback cleared; stage → idle |
| API error from /api/coach | ErrorBanner shown; stage stays idle |
| API error from /api/generate | ErrorBanner shown; stage reverts to coached |
| Click "Start over" | Full reset; blank textarea |
