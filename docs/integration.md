# Text-to-Video Integration — Setup & Architecture

## What changed vs. the original repo

The original text-to-video pipeline was a standalone repo. It has been absorbed into this JAL monorepo. Here is what is different:

| Aspect | Original | This repo |
|---|---|---|
| LLM for prompt coaching | Local Ollama (Llama 3) | OpenAI API (`gpt-4o-mini` by default) |
| Video generation | Magic Hour API | Magic Hour API — unchanged |
| Frontend | Separate app | Integrated as `make-solution` step in the JAL workflow |
| Backend route | Standalone Express | Mounted at `/api/video` inside `backend/src/index.ts` |
| Mock/demo mode | None | `MOCK` toggle in the UI — no real API calls needed |

---

## API Keys — where to put them

All keys go in **`backend/.env`** (copy from `backend/.env.example`, never commit `.env`).

```
# Required for the AI prompt coach (real mode)
OPENAI_API_KEY=sk-proj-...your-key-here...

# Optional — change the model used for coaching (default: gpt-4o-mini)
OPENAI_MODEL=gpt-4o-mini

# Required for video generation (real mode)
MAGIC_HOUR_API_KEY=mh-...your-key-here...
```


---

## How to run

```bash
# 1 — backend
cd backend && npm run dev

# 2 — frontend
cd frontend && npm run dev
```

The frontend Vite dev server proxies all `/api/*` requests to `http://localhost:3001`, so no CORS setup is needed locally.

---

## System flow (real mode)

```
User types prompt
  → POST /api/video/coach   { prompt, mode: "real" }
      → OpenAI gpt-4o-mini evaluates prompt
      → Returns { isReadyForGeneration, tips[] }
  → (repeat until isReadyForGeneration === true)
  → POST /api/video/generate { prompt, mode: "real" }
      → Magic Hour POST /v1/text-to-video  (creates async job)
      → Backend polls GET /v1/video-projects/{jobId} every 4 s
      → Returns download URL when status === "complete"
  → Frontend plays the video
```

## System flow (mock mode — for demos)

Toggle the `MOCK` button in the bottom-right corner of the screen. No API keys needed.

```
User types prompt
  → POST /api/video/coach  { prompt, mode: "mock" }
      → Backend counts calls; after 2 calls returns isReadyForGeneration: true
      → No OpenAI call made
  → POST /api/video/generate { prompt, mode: "mock" }
      → Backend waits 15 s (fake loading), then returns the next .mp4
        from demo-files/videos/ in sequence
      → No Magic Hour call made
```

### Adding demo videos

Place any `.mp4` files inside `demo-files/videos/`. The backend serves them via `GET /api/video/mock/video/:filename` and cycles through them in alphabetical order each time a new video is generated.

---

## Code locations

| What | File |
|---|---|
| Backend route (coach + generate) | `backend/src/routes/video.ts` |
| OpenAI client (`callOllamaText`) | `backend/src/services/ollamaClient.ts` |
| Route registration | `backend/src/index.ts` line 6 + 16 |
| Frontend API wrapper | `frontend/src/services/videoService.ts` |
| State machine / hook | `frontend/src/hooks/useVideoWorkflow.ts` |
| Main UI component | `frontend/src/components/solution/MakeSolutionStudio.tsx` |
| Tool selector (first screen) | `frontend/src/components/solution/ToolSelector.tsx` |
| TS types | `frontend/src/types/video.ts` |
| Demo videos directory | `demo-files/videos/` |

---

## Corrections made during integration

The following bugs were found and fixed as part of writing this document:

1. **OpenAI JSON mode not enforced for coach** — `callOllamaText` was being called without `jsonMode: true`, meaning OpenAI could return plain prose instead of JSON. Fixed by adding an optional `jsonMode` parameter to `callOllamaText` and passing `true` from the coach route.

2. **Magic Hour request body was malformed** — `aspect_ratio` and `model` were placed at the top level of the request body. Per the Magic Hour API spec, `model` must be inside the `style` object and dimensions must use `{ width, height }` inside a `dimensions` key, not `aspect_ratio`. Fixed in `createMagicHourJob`.

3. **Dead code removed** — After the mock coach was simplified to a call counter, the functions `loadDemoCoachScript`, `findBestDemoStep`, and the `DemoCoachStep`/`DemoCoachScriptFile` interfaces were no longer called. These have been removed from `video.ts`.
