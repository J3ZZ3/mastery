# MASTERY

**AI-powered learning recovery for Grade 8–9 Mathematics.**
Six specialist agents find the gap behind a learner's mistakes, design a targeted intervention, guide practice, verify recovery with fresh questions, and hand the teacher evidence and a recommended next step.

MASTERY is a hackathon prototype. All learners are fictional. A diagnosis is presented as an evidence-supported hypothesis, never a permanent label.

---

## Quick start

Requires **Node.js 20+** (the server uses native `fetch`, ESM and `node:test`).

```bash
npm install
npm run dev
```

- Client: <http://localhost:5173>
- API + SSE: <http://localhost:8787>
- Health check: <http://localhost:8787/api/health>

`npm run dev` runs the Express server and Vite together. The Vite client proxies `/api` to port `8787`.

### Production-style run

```bash
npm run build
npm start
```

Express serves the built client and API from <http://localhost:8787>.

### Vercel frontend and Render backend

- On Render, leave the root directory blank, use `npm ci` as the build command
  and `npm start` as the start command. Render supplies `PORT`.
- On Vercel, use the repository root, `npm run build` and output directory
  `dist`. Do not use `npm run dev` as the build command.
- `vercel.json` proxies `/api` requests to
  `https://mastery-583l.onrender.com` and serves the SPA for frontend routes.
  Update that destination if the Render service URL changes.
- Set backend variables such as `AI_PROVIDER=demo`, `MASTERY_THRESHOLD=80`
  and `DEMO_DELAY_MS=450` on Render. OpenAI credentials, if used, belong on
  Render only; do not use `VITE_` variables for secrets.
- Push changes to the connected branch and redeploy Vercel. Check
  `/api/health`, `/api/learners` and a frontend deep link on the Vercel URL.

Render's default filesystem is ephemeral: `server/data/db.json` can be lost
on restart or redeploy. A persistent disk is an option for a single-instance
demo; the JSON repository is not a shared production database. The prototype
has no authentication and its demo reset endpoint is public: use fictional
data only and secure access before storing real learner information.

### Other scripts

```bash
npm test        # end-to-end API tests (full recovery + retry + validation)
npm run reset   # reset server/data/db.json to the seeded demo
```

Demo data can also be reset from the sidebar in the UI.

---

## Demo script

### 1. Thabo Mokoena — the complete recovery journey

Thabo starts with no learning cycle.

1. Open **Overview → Thabo Mokoena → Enter learner workspace**.
2. Start the diagnostic. His sample answers are **pre-filled and editable**:
   `d1: -1`, `d2: 3`, `d3: 3`, `d4: 6`, `d5: 3` → **2/5**.
3. Submit. The Assessment, Diagnostic and Learning Designer agents run in sequence:
   - diagnosis: **negative number operations**
   - evidence: three wrong answers, including subtracting a negative and applying a sign
   - intervention: number line, three worked examples, three practice questions.
4. Work through the lesson and **Guided practice**. Each answer is checked by the Tutor Agent; hints appear before the correct result is revealed. The sample practice answers are pre-filled and can be edited.
5. Finish practice. The Mastery Agent creates five **fresh** questions, not repeats of the diagnostic.
6. Submit the pre-filled mastery answers. Attempt 1 is **4/5 (80%)**, meeting the threshold. Thabo completes the cycle and the Teacher Insight Agent writes the teacher summary.

**To see the adaptation path:** on the mastery check, change two correct answers to wrong options so the score falls below 80%. The Mastery Agent returns `retry`, the Learning Designer produces an **adapted attempt 2** with slower steps and fresh practice, and a second mastery check follows. If attempt 2 is also below 80%, the cycle completes with a teacher-review recommendation.

### 2. Sipho Ndlovu — recovered

A seeded completed cycle: **2/5** diagnostic → **5/5** mastery after one intervention. Open his teacher profile to see the full evidence trail and teacher insight.

### 3. Lerato Dlamini — needs support

A seeded completed cycle: **0/5** diagnostic → two mastery attempts at **3/5**, below the threshold. The cycle is marked `complete_support`; the teacher insight recommends a teacher-led review rather than another independent retry.

Switch learners inside the learner workspace or open **Teacher Dashboard → learner profile**.

---

## The six agents

| Agent | Responsibility | Key output |
| --- | --- | --- |
| **Assessment** | Scores each diagnostic item, identifies recurring error patterns, cites misconceptions | `assessmentReportSchema` |
| **Diagnostic** | Forms a gap hypothesis, distinguishes a surface slip from a concept gap, states confidence | `diagnosticSchema` |
| **Learning Designer** | Builds a short intervention with sections, number line, worked examples and practice; adapts on retry | `interventionSchema` |
| **Tutor** | Checks practice answers, gives hints/feedback, summarises readiness | `tutorResultSchema` |
| **Mastery** | Generates fresh follow-up questions, evaluates against the threshold, compares with the initial score | `masteryQuestionsSchema`, `masteryResultSchema` |
| **Teacher Insight** | Converts the completed cycle into a concise teacher summary, evidence, recommendation and next step | `teacherInsightSchema` |

Every agent receives structured input, returns a structured object validated by **Zod**, and records start/completed/failed events.

### Orchestration guarantees

- The workflow is driven by the **submitted answers**, not a scripted animation.
- Each agent output is validated before persistence and before the next hand-off.
- Agent results are persisted after every step, so a refresh resumes the session.
- A failed step marks the session `error`; `LLM` failures fall back to a deterministic, validated result.
- Mastery is `80%` with a maximum of **2 attempts** (`server/config.js`).
- A failed first attempt triggers one adapted intervention; exhaustion or a pass runs Teacher Insight and completes the cycle.
- SSE publishes live agent events; the client also receives a snapshot on connect and can fall back to polling.

---

## Architecture

```text
server/
  agents/            six agent implementations (deterministic compute + provider call)
  orchestration/     learningRecoveryOrchestrator.js, eventBus.js
  providers/         demoProvider.js, openaiProvider.js, provider status
  validation/        Zod request, agent-output and provider-output schemas
  domain/            diagnostic and mastery question bank, skill labels
  db/                seed.js, store.js (local JSON persistence)
  services/          serialisation (strips answer keys), learner/teacher projections
  routes/            Express API + SSE endpoint
  app.js/index.js    HTTP app and server bootstrap

src/
  pages/             Overview, LearnerWorkspace, AgentActivity, TeacherDashboard,
                     TeacherLearnerDetail, NotFound
  components/        AppShell, AgentTimeline, Questionnaire, DiagnosisCard,
                     LessonPanel, PracticePanel, ResultSummary, WorkflowStepper,
                     NumberLine, shared UI primitives
  context/           app boot, learner selection, reset, toasts
  lib/               API client, live SSE hook, formatting, constants
```

### API surface

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | status, provider mode, threshold, counts |
| `GET` | `/api/learners` | learner states for the workspace |
| `GET` | `/api/learners/:id/progress` | learner + current/latest session |
| `POST` | `/api/learning-sessions` | start or resume a cycle |
| `GET` | `/api/learning-sessions/:id` | session snapshot |
| `GET` | `/api/learning-sessions/:id/events` | **SSE** snapshot + live agent events |
| `POST` | `/api/learning-sessions/:id/diagnostic` | run Assessment → Diagnostic → Designer |
| `POST` | `/api/learning-sessions/:id/practice/check` | per-question Tutor check |
| `POST` | `/api/learning-sessions/:id/practice` | evaluate practice + prepare mastery |
| `POST` | `/api/learning-sessions/:id/mastery` | evaluate mastery, adapt or complete |
| `GET` | `/api/teacher/overview` | stats, learner rows, recent activity |
| `GET` | `/api/teacher/learners/:id` | full evidence and insight |
| `GET` | `/api/activity` | cross-learner event feed |
| `POST` | `/api/demo/reset` | restore seeded data |

Answer keys are stripped from every client payload except the explicit `demoAnswer` hint used for the demo learner.

---

## AI provider modes

### Demo (default, no keys required)

```env
AI_PROVIDER=demo
```

No model calls are made. Each agent computes a real result from the submitted answers and passes it through the same schema/provider contract. A small `DEMO_DELAY_MS` delay (default `450ms`) makes the hand-offs visible. The agent timeline shows real orchestrator events, not fake progress.

### OpenAI-compatible

Set these **server-side only** (copy `.env.example` to `.env`):

```env
AI_PROVIDER=openai
OPENAI_API_KEY=your-key
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o-mini
OPENAI_TIMEOUT_MS=18000
```

Each agent makes a chat-completions request with a deterministic fallback object included as the required JSON shape. The response is parsed, validated with Zod, and used only if valid. On a network error, timeout, malformed JSON or schema failure, the server logs a warning and uses the validated fallback, so the learning cycle never breaks.

The provider in use is visible in the sidebar and returned by `/api/health`.

### Other settings

```env
PORT=8787
MASTERY_THRESHOLD=80
DEMO_DELAY_MS=450
```

`MASTERY_THRESHOLD` is read by the server. The client reads the active threshold from session/health data.

---

## Persistence

The prototype persists to `server/data/db.json` through a small repository layer with a serialised write queue. The file is generated on first boot and gitignored. `npm run reset` or the UI reset action rebuilds the seeded learners, sessions and event history.

No Supabase or hosted database is required for the demo.

---

## Verification

```bash
npm test
```

The test suite covers:

1. health, reset and seeded cohort
2. Thabo's complete six-agent recovery:
   - pre-filled demo answers
   - **2/5** diagnostic
   - negative-operations diagnosis
   - three Tutor-checked practice items
   - **4/5 (80%)** mastery pass
   - teacher insight and `complete_pass` teacher status
3. the below-threshold path for Lerato:
   - adapted attempt 2
   - exhausted attempts → `complete`
   - `complete_support` teacher status
4. invalid request handling (missing learner, incomplete diagnostic)

The production client is verified with `npm run build`. A browser-level check of the Thabo flow and teacher dashboard is described in the demo script above.

---

## Design principles

- **Evidence before labels.** Confidence and specific answers are always shown with a diagnosis.
- **Adapt, don't repeat.** A failed mastery check changes the explanation, reduces cognitive load and uses fresh practice questions.
- **The teacher decides.** The Teacher Insight Agent recommends; it does not assign a permanent category or make the final educational decision.
- **No answer leakage.** Practice hints do not reveal the answer; correct answers are withheld from normal client payloads.
- **Accessible by default.** Semantic landmarks, labelled controls, keyboard-focus styles, a skip link, radio-group semantics, live regions for feedback, and responsive layouts.

---

## Known limitations

- Local JSON persistence is single-process and intended for a demo, not concurrent production use.
- No authentication, authorisation or multi-tenancy. The learner/teacher switcher is navigation, not a security boundary.
- One topic (`Integers and introductory algebra`) with a small question bank; adding new gaps requires new lesson and mastery sets.
- Mastery threshold and attempt limit are configuration values; there is no teacher override UI.
- The deterministic demo provider does not call a language model. The OpenAI mode depends on an external model and deliberately falls back on any failure, so output quality varies with the model.
- SSE subscribers are in memory. Reconnecting clients receive a session snapshot, but events are not replayed from a separate durable log.
- No formal accessibility audit or analytics; the UI has been designed for keyboard and screen-reader use but not certified against WCAG.
