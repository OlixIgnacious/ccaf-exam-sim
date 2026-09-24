# CLAUDE.md

Guidance for Claude Code when working in this repository.

> Verified against `index.html` on 2026-09-24. If you change the code, re-verify the
> claims below — an earlier version of this file described functions that never existed.

---

## Project overview

**CCA-F Exam Simulator** — a practice exam for the Claude Certified Architect – Foundations
certification. The entire app is a single `index.html` with inlined CSS and JS. No build step,
no dependencies, no network calls, no backend.

- **107 questions**: 92 single-answer + 15 multiple-response
- **Four modes**: exam simulation (25 q / 50 min), full mock (107 q / 214 min), quick drill
  (10 q, untimed, immediate feedback), domain drill (all questions in one domain, untimed)
- Scaled scoring 100–1000 against the real **720** pass mark
- Option order reshuffled per attempt; attempt history in `localStorage`

---

## Files

| Path | Purpose |
| --- | --- |
| `index.html` | The whole app. Question bank is the `BANK` array. |
| `tools/make_guide.js` | Generates `docs/CCA-F_Study_Guide.docx`. Needs `npm install docx`. Writes to `docs/` via `__dirname`, so cwd doesn't matter. |
| `docs/CCA-F_Study_Guide.docx` | Generated study guide. Regenerate after editing the script. |
| `CHEATSHEET.md` | Last-minute cram sheet. Hand-written; **not** generated from the bank. |
| `DEPLOY.md` / `PUSH-TO-GITHUB.md` | Hosting and git instructions |
| `firebase.json`, `.firebaserc` | Firebase Hosting config (project ID is a placeholder) |

---

## Running

```bash
open index.html                 # just open it
python3 -m http.server 8000     # or serve for phone/tablet testing
```

Regenerate the study guide:

```bash
cd tools && npm install docx && node make_guide.js
```

---

## Architecture

### Domains — official blueprint order

Domain numbers follow the published CCAR-F v1.0 blueprint. **They are not ordered by weight.**
An earlier version of this repo numbered them by descending weight, which mislabelled D2/D3/D4.

```javascript
const DOMAINS = {
  1: "Agentic Architecture & Orchestration",     // 27%
  2: "Tool Design & MCP Integration",            // 18%
  3: "Claude Code Configuration & Workflows",    // 20%
  4: "Prompt Engineering & Structured Output",   // 20%
  5: "Context Management & Reliability"          // 15%
};
const WEIGHT = {1:.27, 2:.18, 3:.20, 4:.20, 5:.15};
```

### Scenario constants

Declared on one line above `BANK`; questions reference the constant, not a string literal.

```javascript
MA = "Multi-Agent Research System"      CI = "Claude Code in CI/CD"
CS = "Customer Support Agent"           CG = "Code Generation with Claude Code"
DX = "Structured Data Extraction"       DP = "Developer Productivity Tools"
```

### Question schema

**Single-answer** — `a` is the index of the one correct option:

```javascript
{s:CS, d:1, q:"Question text…",
 o:["Option A","Option B","Option C","Option D"],
 a:2, e:"Why the answer is right and the others aren't."}
```

**Multiple-response** — uses a **separate `m` key** holding an array of correct indices.
There is no `a` key. `isMR()` tests `Array.isArray(q.m)`, so a question written with
`a: [0,2]` would be treated as single-answer and score as wrong.

```javascript
{s:CS, d:5, q:"Which conditions should trigger escalation?",
 o:["…","…","…","…","…","…"],      // MR items carry 5–6 options
 m:[0,1,2], e:"…"}
```

The UI reads `q.m.length` to render "select N", so it must match the intended count.

### Scoring

```javascript
scoreOf(q, ans)
  single-answer:      ans === q.a ? 1 : 0
  multiple-response:  max(0, (hits − misses) / q.m.length)
```

`hits` = chosen indices that are in `q.m`; `misses` = chosen indices that aren't. Selecting
every option therefore scores **0**, by design — shotgunning must not pay. `pick()` also caps
selections at `q.m.length`, evicting the oldest, so "select all" isn't reachable in the UI.

Scaled score: `100 + (points / n) × 900` where **`n` is the question count of that attempt**,
not the bank size. A 25-question exam is scored out of 25.

### Question selection

`weightedDraw(n)` uses **largest-remainder apportionment**: floor each domain's share, then
hand out the leftover seats to the largest fractional remainders. An earlier version rounded
each share and subtracted the surplus from domain 1, which systematically under-sampled the
heaviest domain (24% drawn vs 27% target at n=25). If a domain can't supply its allocation,
the shortfall is backfilled from the remaining pool.

The bank is now shaped close to the blueprint (D1 26%, D2 19%, D3 20%, D4 19%, D5 17%),
and weighting is also applied at draw time.

### State and functions

Module-scoped state: `mode`, `order` (bank indices for this attempt), `perm` (per-question
shuffled option order), `idx`, `answers`, `flags`, `revealed`, `deadline`, `tick`, `drillDom`.

`answers[i]` is a number for single-answer, an array for multiple-response, `null` if untouched.

Real functions — there is no `selectAnswer`, `submitAttempt`, `renderApp`, `calculateScore`,
or `getReviewItems`:

| Function | Role |
| --- | --- |
| `home()` | Mode-select screen and attempt history |
| `startMode(m)` | Build `order`/`perm`, set timer, reset state |
| `weightedDraw(n)` | Blueprint-weighted question selection |
| `render()` | Single render function for the question view |
| `pick(i)` | Record a selection (toggles for MR, caps at `m.length`) |
| `reveal()` | Quick-drill "Check answer" for MR items |
| `scoreOf(q, ans)` | Score one question, 0–1 |
| `answered(i)` | Whether question `i` has a usable answer |
| `go(i)`, `toggleFlag()`, `trySubmit()` | Navigation, flagging, submit guard |
| `results(timedOut)` | Score, persist history, render breakdown and review |

### localStorage

One key: **`ccaf_hist`** — a JSON array of `{t, m, r, n, s}` (timestamp, mode label, raw score,
question count, scaled score), capped at the last 12 attempts. Wrapped in try/catch; failure is
non-fatal. Domain drills are deliberately not recorded.

---

## Common tasks

### Adding a question

1. Add an object to `BANK` in `index.html` using the schema above
2. Use the scenario **constant** (`MA`, not `"Multi-Agent Research System"`)
3. For MR, use `m:[…]` — never `a:[…]`
4. Verify before committing (see below)

### Verifying after changes

There's no test suite; the app is evaluated in Node with a DOM stub. Minimum checks:

```bash
# syntax
node -e "const s=require('fs').readFileSync('index.html','utf8');
         require('fs').writeFileSync('/tmp/c.js',s.match(/<script>([\s\S]*)<\/script>/)[1])" \
  && node --check /tmp/c.js
```

Then confirm: bank size, every question schema-valid, no duplicate stems, domain counts,
MR partial-credit math (all-correct = 1, all-options = 0, unanswered = 0), draw weighting
across repeated exam sims, and a full perfect run scoring 1000.

### Regenerating the study guide

Exam logistics and domain content are hard-coded in `tools/make_guide.js`. Edit there, then
`node make_guide.js`. Verify by rendering: convert to PDF with LibreOffice and view the pages.

---

## Constraints

- **Keep it one file.** No framework, no bundler, no external requests. Simplicity is the point.
- **No backend, no tracking.** All state is client-side; nothing is transmitted.
- **Light mode.** `:root { color-scheme: light }` — it's also published as a Cowork artifact,
  which renders light.
- Mobile: tap targets enlarge under `@media(max-width:620px)`; web-app meta tags allow
  Add to Home Screen.

---

## Exam facts (verify before relying on these)

Confirmed against Anthropic's certification FAQ on **2026-09-24**:

- 60 questions, 120 min (~135 min seat time), scaled 100–1000, **720 to pass**
- Multiple-choice **and** multiple-response; each item states how many to select
- 4 scenarios drawn from a pool of 6
- $125 per attempt; Select/Preferred/Global Premier partners get 50% off (Global Premier 100%
  through 2026-12-31)
- Retakes: 14 / 30 / 90 days after 1st / 2nd / 3rd fail; max 4 per rolling 12 months
- Certification valid 12 months; renewal is a free non-proctored assessment
- **Reschedule or cancel at least 48 hours ahead** — inside that window, or a no-show, forfeits
  the fee (this changed from 24 hours; re-check before asserting it)
- Eligibility: Claude Partner Network organizations only, company email on a recognized domain
- Delivery: Pearson VUE, OnVUE online or test centre. OnVUE unavailable for IDs from Belarus,
  Cuba, North Korea, Russia, Syria and restricted Ukraine regions; Iran suspended since
  2026-09-08
- The official practice exam was **retired** at the June 30 2026 Pearson migration

## Attribution

Questions are original or adapted from community study material (see `README.md`). The repo
contains **no real exam content**. Not affiliated with Anthropic. Confirm upstream licences
before making this repository public.
