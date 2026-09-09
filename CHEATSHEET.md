# CCA-F Last-Minute Cheatsheet

Read this the morning of the exam. It is not a substitute for the courses — it's a
compression of the decision rules the exam actually tests.

**Exam:** 60 scenario questions · 120 min · scaled 100–1000 · **720 to pass** · closed book
4 scenarios drawn from a pool of 6 · multiple-choice **and** multiple-response (each item
states how many to select; partially graded)

**Domains (official numbering):**

| # | Domain | Weight | ~Items |
|---|---|---|---|
| 1 | Agentic Architecture & Orchestration | 27% | 16 |
| 2 | Tool Design & MCP Integration | 18% | 11 |
| 3 | Claude Code Configuration & Workflows | 20% | 12 |
| 4 | Prompt Engineering & Structured Output | 20% | 12 |
| 5 | Context Management & Reliability | 15% | 9 |

---

## The three rules that decide most questions

If you remember nothing else:

**1. Guarantees beat guidance.**
When two options both "work," pick the one enforcing the rule in *code* rather than in a
prompt. Hooks, tool-schema constraints, and programmatic preconditions give deterministic
guarantees. System prompts, few-shot examples, and "tell the model to be careful" do not.
This is the single most common tiebreaker on hard items.

**2. Simplest architecture that satisfies the stated constraint.**
Scenarios give you targets (resolution rate, latency, scale, cost). The right answer meets
*that* constraint. Answers that add agents, layers, classifiers, or routers "for flexibility"
are usually wrong. Workflow beats agent when the path is predictable.

**3. Fix the root cause, not the symptom.**
Misrouting between tools → rewrite the *descriptions*, don't add a router. Duplicate work
across subagents → partition the task *before* delegating, don't dedupe after. Vague review
output → define explicit *criteria*, don't say "be more thorough."

---

## Domain 1 — Agentic Architecture & Orchestration (27%)

*7 task statements. The heaviest domain — expect design and debugging judgment.*

**Agentic loop:** gather context → act → verify → repeat. The model picks the next step from
tool results; the harness enforces stopping conditions (max turns, budget) and permissions.

**Workflow vs. agent**
- Workflow (code chains fixed LLM calls): path is predictable. Cheaper, testable, deterministic.
- Agent (model decides path): ambiguous, open-ended, step count unknowable in advance.

**Single vs. multi-agent** — go multi only when at least one holds:
- subtasks are genuinely independent and parallelizable
- a subtask would flood the main context window
- specialists need different tools/prompts

Multi-agent costs *more* tokens, still needs synthesis, and is wrong for sequential
shared-context work. Those three claims appear as distractors.

**Orchestrator–worker (hub-and-spoke)** is the canonical pattern. Subagents see neither the
orchestrator's context nor each other's, so the brief must carry everything: **objective,
output format, tool guidance, effort budget**. Results come back compact and structured —
findings, not transcripts. Keep the coordinator as the hub: it gives central visibility,
uniform error handling, and control over what each agent receives.

**Task decomposition** bounds coverage. If a report misses whole subject areas but every
subagent succeeded, the coordinator decomposed too narrowly. Partition the space *before*
delegating to prevent duplicated work.

**Hooks (Agent SDK)**
- `PreToolUse` — intercept *before* execution. Use to hard-block a disallowed call (refund over
  limit, destructive op). This is how you enforce business rules deterministically.
- `PostToolUse` — transform results as they return. Use to normalize inconsistent formats or
  trim verbose payloads before they enter context.

**Sessions:** resume continues the same timeline; **fork** branches from current context while
preserving the original — use it to explore alternatives without polluting the main thread.

**Failure handling**
- Independent branch fails → **degrade gracefully**: return successes, flag the gap, retry/re-scope.
- Dependent branch fails → **fail fast** with a clear error. Continuing produces garbage.
- Retry transient faults (rate limit, timeout) with backoff. Never blind-retry deterministic
  failures (validation, auth) — they'll fail identically.

---

## Domain 2 — Tool Design & MCP Integration (18%)

*5 task statements. Your thinnest practice area — give it extra minutes.*

**Descriptions are prompts.** State what the tool does, *when to use it*, and *when not to*.
Most tool-selection bugs are description bugs. For similar-sounding tools, differentiate the
names and descriptions — don't bolt on a routing classifier or few-shot examples.

**Constrain capability at the interface.** If an agent misuses a general tool, replace it with
a narrower one that makes the misuse impossible (`fetch_url` → `load_document` that validates
document formats). Least privilege by design beats prompt-level discouragement.

**Distribute tools by role.** Each agent gets only what its job needs. A shared pool of 40
tools inflates both the decision space and context cost.

**Structured errors** — return failures as data the model can act on:
```
{ errorCategory: "not_found" | "validation" | "rate_limit" | ...,
  isRetryable: true | false,
  message: "human-readable, suggests the fix" }
```
Never: raw stack traces, server telemetry, unhandled exceptions, or — worst — a fake success
with an empty result. Those strand or corrupt the loop.

**MCP primitives**
| Primitive | Controlled by | Use for |
|---|---|---|
| **Tool** | model-invoked | actions the model decides to take |
| **Resource** | application-controlled | read-only data/context (docs, reference material) |
| **Prompt** | user-invoked | reusable templates the user triggers |

**Transports:** `stdio` for local/same-machine · **streamable HTTP** for remote/shared servers
(typically with OAuth). Advanced topics that appear: sampling (server asks the client's model
for a completion), notifications (server-initiated updates), stateless servers for scale.

**MCP config scope in Claude Code:** project `.mcp.json` (committed, team-wide) · user scope
(personal, across your projects) · local (private to one project). Choose by *who should get it*.

**`isError: true`** is how a tool reports a business-level failure (customer not found). Protocol
errors are for malformed requests and transport problems — not outcomes.

**Built-in tools:** search first, then read. `Grep`/`Glob` to locate, `Read` only confirmed hits.
Never cat a repo into context.

**`tool_choice`:** `auto` lets the model decide; forcing a specific tool *guarantees* invocation.
Use forcing when output must always be structured.

---

## Domain 3 — Claude Code Configuration & Workflows (20%)

*6 task statements.*

**CLAUDE.md hierarchy** (general → specific, all compose):
enterprise policy → user `~/.claude/CLAUDE.md` (personal, all projects) → project-root
`CLAUDE.md` (committed, team-wide) → subdirectory `CLAUDE.md` (loaded in that subtree).
`CLAUDE.local.md` = machine-local, uncommitted. Use `@path` imports to keep the core file lean
while making detail available.

Non-conflicting directives at different levels *coexist* — recognizing a false conflict is
itself a question type.

**`.claude/rules/`** — modular rule files with YAML frontmatter globs, applied automatically to
matching paths. The right answer whenever conventions vary by area (React vs. API vs. tests) or
when relevant files are scattered. Beats stuffing everything in root CLAUDE.md (bloats context,
relies on inference) and beats a CLAUDE.md per directory.

**Commands vs. skills**
- Slash command: user-invoked prompt template in `.claude/commands/` (project, committed) or
  `~/.claude/commands/` (personal). `$ARGUMENTS` injects input.
- Skill: directory with `SKILL.md`; its **description drives automatic triggering** — write it
  for the model. `allowed-tools` restricts capability; `context: fork` runs it in a subagent so
  its work stays out of the main window.

**Version-controlled and shared with the team:** `.claude/commands/`, `.claude/rules/`,
project `.mcp.json`. *Not* shared: `~/.claude/*`, user-scope MCP, `CLAUDE.local.md`.

**Plan mode** when: multi-file refactor, unfamiliar codebase, several viable approaches, or the
change is risky enough to want review before edits land. **Direct execution** for small,
well-understood changes. Planning everything wastes time and tokens.

**`/compact`** at a natural boundary when context fills mid-task — preserves decisions,
constraints, and open items; drops stale exploration.

**CI/CD**
- `-p` / `--print` = non-interactive. (`--batch` and `CLAUDE_HEADLESS` **do not exist**.)
- `--output-format json` (+ `--json-schema`) for machine-parseable findings you can post as
  inline PR comments.
- **Each invocation is an isolated session.** Cross-step state must be passed explicitly —
  pipe the JSON output, or `--resume <session-id>`. This is tested repeatedly.
- `--allowedTools` limits what a pipeline run may do.

---

## Domain 4 — Prompt Engineering & Structured Output (20%)

*6 task statements.*

**Explicit criteria over vague instructions.** "Flag SQL built by string concatenation with user
input" beats "be careful about security." When output is inconsistent *and* instructions are
already detailed, the fix is **few-shot examples** (3–4 showing the exact target shape),
not more instructions.

**Structured output:** define a tool whose input schema is your target shape and force it with
`tool_choice`. Schema validation at the API level — a structural guarantee, not a request.
For non-tool calls, **prefill** the assistant turn to constrain format.

**Nullable fields prevent hallucination.** If a value may be genuinely absent, make it
nullable/optional. A required field forces fabrication. Classic trap.

**Schema valid ≠ semantically correct.** A record can pass JSON Schema and still claim a $12
invoice total against $1,200 of line items. Business-rule validation is a separate layer.

**Validation-retry loop:** validate → on failure re-prompt *with the specific errors attached* →
bound the retries → route persistent failures to human review. Never blind-retry identical
input; never loosen the schema until it passes; never silently drop.

**Message Batches API:** ~50% token discount, async, up to 24h, large request counts. Correct
whenever work is scheduled and latency-tolerant (overnight reports, weekly audits, archive
backfills). **Disqualified** when: a person is waiting (blocking pre-merge checks, interactive
chat) or the workflow needs **iterative tool calls mid-request** — fire-and-forget can't pause,
run a tool, and resume. Use `custom_id` to correlate results; order is not guaranteed. Failures
are per-request, not all-or-nothing.

**Multi-pass beats one mega-prompt.** For a 14-file PR: per-file passes for local issues, then a
separate integration pass for cross-file flows. Root cause is attention dilution — a bigger
context window does *not* fix it, and consensus-voting across runs suppresses real bugs.

**Independent reviewer beats self-review.** A second instance without access to the generator's
reasoning avoids confirmation bias. The model already talked itself out of the issue.

**Reducing false positives:** explicit categorical criteria + few-shot examples + temporarily
disabling measurably noisy categories. Rationale and confidence *inside* each finding cut
triage time without filtering anything out.

---

## Domain 5 — Context Management & Reliability (15%)

*6 task statements. Underrated and heavily tested.*

**Four context strategies:**
1. **Compaction** — summarize, keeping decisions, constraints, unresolved items.
2. **Structured note-taking** — persist facts to a scratchpad file outside the window; re-read
   as needed. Survives compaction and crashes.
3. **Subagent delegation** — send a subagent to explore; get back a compact digest.
4. **Just-in-time retrieval** — keep identifiers (paths, IDs), fetch content on demand.

Raising `max_tokens` does not extend the input window. Pre-loading everything is the
anti-pattern all four exist to avoid.

**Lost in the middle:** models attend most reliably to the start and end of long inputs. Fix by
putting a key-findings summary **first** and adding explicit section headings throughout — not
by rotating order or summarizing everything away.

**Reduce tokens at the source.** Have upstream agents return structured facts (claims, quotes,
relevance scores) rather than raw page content and reasoning traces.

**Crash recovery** needs checkpointed state persisted to durable storage after each completed
step — not a bigger context window.

**Escalation triggers — memorize these three:**
1. Policy gap / authority limit / exception the agent can't authorize
2. Customer explicitly asks for a human
3. Agent cannot make further progress

**Not** triggers: customer tone or frustration on a resolvable issue, tool-call count, task
duration. Resolution-rate targets never justify guessing on an unverifiable, high-stakes case.

**Structured handoff contains:** identifiers · what was verified · actions attempted · the
blocking reason · recommended next step. Not raw transcripts, not full chain-of-thought.

**Technical permission ≠ authorization.** Irreversible/destructive actions get a confirmation
tier or hard limit regardless of what the API allows. Pair with a preview-then-confirm tool
interface.

**Stale data:** re-fetch volatile values after any state-changing event in the conversation.

**Provenance travels with the fact.** Attach source attribution (and date) to each extracted
claim as it moves between agents — you cannot reconstruct it at synthesis time. On conflicting
sources: keep both, annotate the conflict with attribution, escalate reconciliation upward.
Don't silently pick a winner.

**Distinguish failure types.** A timeout (access failure, may retry) and "0 results" (valid,
informative finding) are semantically different. Conflating them causes wrong recovery.

**Coverage annotations** on partial results: say which conclusions are well-supported and where
gaps exist. Graceful degradation *with transparency*.

**Prompt caching:** cache stable prefixes (system prompt, tool definitions, long documents);
order stable content first to maximize hits.

---

## Distractor patterns — eliminate these first

- Adds an agent, classifier, router, or layer that the stated constraint doesn't require
- Enforces a hard business rule via prompt wording instead of code
- Silently swallows a failure, or reports failure as success with empty results
- Says "be more careful / more thorough / more detailed" instead of defining criteria
- Right mechanism, wrong scope (user-level config where the team needs it; a personal command
  where a committed one belongs)
- Solves a *different* problem (sentiment analysis for complexity; a bigger context window for
  attention dilution; fine-tuning for a prompt issue)
- Blind retry of a deterministic failure
- Shifts the burden to humans ("make developers split their PRs")

---

## Exam-day mechanics

- **2 minutes per question.** Typical passers use ~105 of 120 minutes including a review pass.
- **Read the constraints in the scenario stem first** — targets, scale, latency, authority
  limits. The correct answer satisfies *those*, not general best practice.
- **Multiple-response items are partially graded** and state how many to select. Never leave one
  blank; equally, don't over-select — a wrong pick typically cancels a right one. If confident
  on 2 of 3, submit those 2.
- **Flag and move on.** Later questions in a scenario often refresh the setup.
- **Don't over-revise.** Reported repeatedly: second-guessing during review costs more answers
  than it saves. Change an answer only on a concrete realization, not a feeling.
- **Before exam day:** Pearson profile name must match your government ID *exactly* (a mismatch
  at check-in forfeits the fee, no appeal), and run the OnVUE system test on the actual machine
  and network you'll use.

---

*Original content written against the published CCAR-F exam blueprint (v1.0, July 2026) and its
30 task statements. Not affiliated with Anthropic. Contains no real exam content.*
