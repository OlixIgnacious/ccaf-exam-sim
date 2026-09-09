# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project overview

**CCA-F Exam Simulator** — a self-contained practice exam for the Claude Certified Architect – Foundations certification. The entire application is a single `index.html` file with embedded JavaScript and CSS, no build step or dependencies required.

**Key facts:**
- 70 practice questions across 5 domains (Agentic Architecture, Claude Code, Prompt Engineering, Tool Design, Context Management)
- Four exam modes: exam simulation (25 questions, 50 min), full mock (70 questions, 140 min), quick drill (10 questions, untimed), domain drill (single domain)
- Multiple-response questions use partial grading: `(correct − incorrect) ÷ required`, floored at zero
- Attempt history persists in browser `localStorage` (per-device, not synced)
- Exam scoring scaled 100–1000 with 720 passing mark
- Questions and scenarios shuffled on each attempt so you can't memorize answer positions

---

## Structure and files

| File/Directory | Purpose |
| --- | --- |
| `index.html` | The entire simulator — ~62KB self-contained HTML/CSS/JS. Question bank embedded as the `BANK` JavaScript array. |
| `tools/make_guide.js` | Node.js script that generates `docs/CCA-F_Study_Guide.docx` from embedded data structures. Requires `npm install docx`. |
| `docs/CCA-F_Study_Guide.docx` | Generated Word document study guide covering all five domains, exam logistics, and practice questions. Regenerate after question bank changes. |
| `firebase.json` | Firebase Hosting config: serves index.html with no-cache headers and clean URLs. |
| `.firebaserc` | Firebase project ID (placeholder; set yours before deploying). |
| `DEPLOY.md` | Hosting instructions for Netlify, Firebase, local network, or offline. |
| `README.md` | Public documentation and question sourcing attribution. |

---

## Running and testing

### Test the simulator locally

```bash
# Option 1: Direct browser file open
open index.html

# Option 2: Serve on local network (for phone/tablet testing)
python3 -m http.server 8000
# Then visit http://<your-lan-ip>:8000 from any device on the same Wi-Fi
```

The app requires no build step, no npm dependencies, and no backend. It's fully functional in any browser, offline included.

### Regenerate the study guide (Word document)

```bash
cd tools
npm install docx
node make_guide.js
```

This writes `docs/CCA-F_Study_Guide.docx` from the hardcoded structures in `make_guide.js`. Regenerate after updating question text, domain weights, or exam logistics in the script.

---

## Code architecture

### Question bank and data structure

All 70 questions are embedded in `index.html` as the `BANK` array. Each question object:

```javascript
{
  s: "scenario_name",  // One of: MA, CI, CS, CG, DX, DP (6 total)
  d: domain_number,    // 1–5 (mapped to DOMAINS constant)
  q: "Question text",
  o: ["Option A", "Option B", "Option C", "Option D"],  // 4 options
  a: answer_index,     // 0–3, index of correct answer(s)
  e: "Explanation text"
}
```

For **multiple-response questions**, the `a` value is an array of indices instead: `a: [0, 2]` means select both option 0 and option 2.

### Domains and weights

```javascript
const DOMAINS = {
  1: "Agentic Architecture & Orchestration",
  2: "Claude Code Configuration & Workflows",
  3: "Prompt Engineering & Structured Output",
  4: "Tool Design & MCP Integration",
  5: "Context Management & Reliability"
};

const WEIGHT = {
  1: .27,  // 27% → ~16 questions
  2: .20,  // 20% → ~12 questions
  3: .20,  // 20% → ~12 questions
  4: .18,  // 18% → ~11 questions
  5: .15   // 15% → ~9 questions
};
```

When the "exam simulation" mode runs, it draws 25 questions weighted by these percentages.

### Scoring logic

**Single-answer questions:** 1 point if correct, 0 if wrong.

**Multiple-response questions:** `max(0, (correct − incorrect) ÷ required)`. Example: if 3 answers are required and you select 2 correct + 1 wrong, you score `(2 − 1) ÷ 3 = 0.33` points.

**Exam score:** `100 + (total_points ÷ 70) × 900`, rounded and scaled to stay in 100–1000 range.

### UI state management

- Exam state is held in memory (not persisted until submission)
- After submission, the attempt record is saved to `localStorage` under key `attempts`
- localStorage structure: `attempts` is a JSON array of attempt objects, each containing attempt timestamp, score, mode, answers, and full results
- Question shuffling happens at mode start (Fisher-Yates shuffle in the `shuffle` function)

### Key functions in index.html

- `shuffle(arr)` — Fisher-Yates shuffle of the question array
- `selectAnswer(qIndex, optIndex)` — Record an answer selection
- `submitAttempt()` — Score the exam, save to localStorage, show results
- `renderApp()` — Main render function that outputs the UI based on current state
- `calculateScore(answers)` — Compute scaled score and per-domain breakdown
- `getReviewItems()` — Build the review section showing every missed/partial question

---

## Common development tasks

### Adding or editing questions

1. Open `index.html` in an editor
2. Find the `BANK = [...]` array (starts around line 109 in the current file)
3. Add or modify question objects with structure shown above
4. Save and test: open in browser to verify the new question appears and scoring works
5. If you modify question text or add questions, regenerate the study guide: `cd tools && node make_guide.js`

**Maintain domain balance:** After changes, verify the exam simulation mode still draws the right proportion of questions from each domain. Spot-check by running multiple simulations and viewing the per-domain breakdown.

### Updating exam logistics or study guide

Study guide data is hardcoded in `tools/make_guide.js`. If you update:
- Exam cost, retake windows, or validity
- Domain descriptions
- Scenario details
- Practice questions or exam tips

Edit those values directly in `make_guide.js`, then regenerate: `node make_guide.js`.

### Testing mobile experience

The app is mobile-responsive and PWA-capable (home-screen icon support). Test on actual devices:

```bash
python3 -m http.server 8000
# Open http://<your-lan-ip>:8000 on a phone/tablet on the same Wi-Fi
# iOS: Share → Add to Home Screen
# Android: ⋮ menu → Add to Home screen
```

Check that:
- Touch targets are large enough (40×40 px on mobile, enforced in CSS @media)
- Scrolling is smooth and text is readable at small sizes
- Option selection and timer display work without layout shift

### Deploying

See `DEPLOY.md` for detailed instructions. Quick versions:

**Firebase Hosting (free Spark tier):**
```bash
firebase login
# Set your project ID in .firebaserc
firebase deploy --only hosting
```

**Netlify Drop (no CLI):**
1. Go to https://app.netlify.com/drop
2. Drag this folder onto the page
3. Get an instant live URL

**Local network only (no internet):**
```bash
python3 -m http.server 8000
```

---

## Technical decisions and constraints

### Single HTML file (no build)

The entire application is intentionally one self-contained `.html` file. This means:
- No package.json, webpack, or build pipeline for the app itself
- All JavaScript and CSS are inlined (no external requests except PWA icons, which are optional)
- Questions and data are hardcoded, not fetched from an API
- Simplicity and reliability are the goal — no framework churn, no dependency vulnerabilities

The study guide generator (`make_guide.js`) is separate and optional — you can edit questions without regenerating it, and regenerate it only when needed.

### No backend, no tracking

All state lives in the browser:
- Attempt history saved to `localStorage` only (never sent anywhere)
- No analytics, no server logs
- Privacy by design: open offline, no network calls
- The trade-off: attempt history doesn't sync between devices

### localStorage keys

- `attempts` — JSON array of attempt records for this device

Clearing browser data or using private browsing erases history. This is intentional for privacy; if you need cross-device sync, the app would need a backend (e.g., Firebase Realtime DB or Supabase).

---

## Before publishing or going public

1. **Question sourcing attribution:** `README.md` notes that some questions are adapted from community material. If making the repo public, confirm the licence terms of upstream sources. Material without a declared licence is "all rights reserved" by default.
2. **Firebase project ID:** The `.firebaserc` placeholder must be replaced with an actual Firebase project ID before deployment.
3. **Test across browsers and devices:** Exam simulators must be reliable. Test on current versions of Chrome, Safari, Firefox, and Edge, and on iOS and Android.
4. **Attempt history edge cases:** Verify localStorage persistence works correctly on private browsing, after browser data wipe, and across Safari's ITP restrictions if applicable.

---

## Useful quick reference

**Exam blueprint (domain distribution in a 25-question exam simulation):**
- Domain 1 (27%): ~7 questions
- Domain 2 (20%): ~5 questions
- Domain 3 (20%): ~5 questions
- Domain 4 (18%): ~4–5 questions
- Domain 5 (15%): ~3–4 questions

**Scenario codes:**
- MA = Multi-Agent Research System
- CI = Claude Code in CI/CD
- CS = Customer Support Agent
- CG = Code Generation with Claude Code
- DX = Structured Data Extraction
- DP = Developer Productivity Tools

**Color palette (CSS custom properties in `:root`):**
- `--accent: #C15F3C` (terracotta, used for headers and highlights)
- `--ok: #2e7d4f` (green, for correct answers)
- `--bad: #c0392b` (red, for wrong answers)
- `--muted: #7a6f66` (gray, for secondary text)
