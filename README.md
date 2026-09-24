# CCA-F Exam Simulator

A self-contained practice simulator for the **Claude Certified Architect – Foundations (CCA-F)**
certification exam, plus a study guide covering all five exam domains.

Single HTML file. No build step, no dependencies, no network calls, no tracking.

---

## What's here

| Path | What it is |
| --- | --- |
| `index.html` | The simulator — 107 questions, self-contained |
| `docs/CCA-F_Study_Guide.docx` | Study guide covering all five domains, exam logistics, and exam-day strategy |
| `CHEATSHEET.md` | Last-minute cram sheet — decision rules, per-domain reference, distractor patterns |
| `tools/make_guide.js` | Script that generates the study guide (`node tools/make_guide.js`, needs `npm i docx`) |
| `DEPLOY.md` | How to host it — Netlify, Firebase, local network, or offline |
| `PUSH-TO-GITHUB.md` | Creating the remote and pushing |
| `firebase.json`, `.firebaserc` | Firebase Hosting config (set your project ID in `.firebaserc`) |

## Run it

Open `index.html` in any browser. That's the whole story.

To serve it on your local network so phones and tablets can reach it:

```bash
python3 -m http.server 8000
# then visit http://<your-lan-ip>:8000 from any device on the same Wi-Fi
```

See [DEPLOY.md](DEPLOY.md) for hosting options and for adding it to a mobile home screen.

---

## The simulator

**Five modes**

- **Full mock** — 60 questions in 120 minutes, the real exam's shape and pacing. Domain-weighted to the blueprint, no feedback until submission, flag questions and jump between them with the navigator grid.
- **Half mock** — 25 questions, 50 minutes, same format in half the time.
- **Marathon** — all 107 questions, 214 minutes.
- **Quick drill** — 10 questions, untimed, explanation after each answer.
- **Domain drill** — every question from one chosen domain.

Mocks draw unseen questions first, so back-to-back attempts overlap as little as the bank
allows (13 of 60 between the first two). The home screen tracks how much of the bank you've
consumed, with a reset.

**Question formats**

Both formats the real exam uses:

- Single-answer multiple choice
- Multiple response, which states how many options to select and is **partially graded** —
  scored as `(correct − incorrect) ÷ required`, floored at zero, so selecting everything earns nothing

**Scoring**

Scaled 100–1000 against the real 720 pass mark, with a per-domain breakdown and a review of
every missed or partially-scored question. Option order is shuffled on each attempt so you
can't pattern-match answer positions. Attempt history persists in `localStorage`
(per-device — it does not sync between your phone and laptop).

**Domain coverage** follows the published exam blueprint:

| Domain | Weight | Questions |
| --- | --- | --- |
| 1. Agentic Architecture & Orchestration | 27% | 28 |
| 2. Tool Design & MCP Integration | 18% | 20 |
| 3. Claude Code Configuration & Workflows | 20% | 21 |
| 4. Prompt Engineering & Structured Output | 20% | 20 |
| 5. Context Management & Reliability | 15% | 18 |

Domain numbers follow the official blueprint order — they are *not* sorted by weight.
All 30 published task statements have question coverage.

---

## About the exam

60 scenario-based questions in 120 minutes, scored 100–1000 with **720 to pass**. Four scenarios
are drawn at random from a pool of six. Delivered by Pearson VUE, online-proctored or at a test
centre; closed book.

Currently open only to people at **Claude Partner Network** organizations, and registration
requires a company email on a recognized partner domain. $125 per attempt.

Full logistics — retake waiting periods, 12-month validity, ID requirements, and the
things that will get you turned away at check-in — are in the study guide.

---

## Sources and attribution

Questions are a mix of original items written against the published exam blueprint and items
adapted from community study material, principally:

- [paullarionov/claude-certified-architect](https://github.com/paullarionov/claude-certified-architect)
- [daronyondem/claude-architect-exam-guide](https://github.com/daronyondem/claude-architect-exam-guide) (CC BY 4.0)

Exam-day guidance draws on published first-hand accounts from candidates who passed.

**This repository contains no real exam content.** Nothing here is sourced from braindump
sites or leaked question banks — using those violates the certification candidate agreement
and can get a credential revoked.

Not affiliated with, endorsed by, or sponsored by Anthropic.

The majority of the bank is original. A minority of items were adapted from the community
material above; `daronyondem` is CC BY 4.0 and is attributed accordingly, while
`paullarionov` declares no licence, which by default means all rights reserved. If you are
the author of anything here and would like it removed or attributed differently, open an
issue and it will be handled promptly.
