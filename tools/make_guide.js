const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType,
  LevelFormat, TableOfContents, PageBreak
} = require('docx');
const fs = require('fs');

const ACCENT = "C15F3C"; // Anthropic-ish terracotta
const GREY = "595959";

const bullets = {
  config: [{
    reference: "bul",
    levels: [{
      level: 0, format: LevelFormat.BULLET, text: "•",
      style: { paragraph: { indent: { left: 360, hanging: 260 } } }
    }]
  }]
};

function h1(t) { return new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 360, after: 160 }, children: [new TextRun({ text: t, color: ACCENT })] }); }
function h2(t) { return new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 280, after: 120 }, children: [new TextRun({ text: t })] }); }
function h3(t) { return new Paragraph({ heading: HeadingLevel.HEADING_3, spacing: { before: 200, after: 100 }, children: [new TextRun({ text: t })] }); }
function p(runs, opts = {}) {
  if (typeof runs === 'string') runs = [new TextRun(runs)];
  return new Paragraph({ spacing: { after: 120 }, children: runs, ...opts });
}
function b(text) { return new TextRun({ text, bold: true }); }
function r(text) { return new TextRun(text); }
function bullet(runs) {
  if (typeof runs === 'string') runs = [new TextRun(runs)];
  return new Paragraph({ numbering: { reference: "bul", level: 0 }, spacing: { after: 80 }, children: runs });
}
function code(text) { return new TextRun({ text, font: "Consolas", size: 20, color: "7A3E2A" }); }

function cell(text, opts = {}) {
  const runs = [new TextRun({ text, bold: !!opts.bold, color: opts.color, size: 20 })];
  return new TableCell({
    width: { size: opts.w, type: WidthType.DXA },
    shading: opts.shade ? { type: ShadingType.CLEAR, fill: opts.shade } : undefined,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: [new Paragraph({ children: runs })]
  });
}

function table(headers, rows, widths) {
  return new Table({
    columnWidths: widths,
    width: { size: widths.reduce((a, c) => a + c, 0), type: WidthType.DXA },
    rows: [
      new TableRow({ tableHeader: true, children: headers.map((h, i) => cell(h, { w: widths[i], bold: true, color: "FFFFFF", shade: ACCENT })) }),
      ...rows.map((row, ri) => new TableRow({ children: row.map((c, i) => cell(c, { w: widths[i], shade: ri % 2 ? "F5EDE8" : undefined })) }))
    ]
  });
}

const kids = [];

// ===== Title =====
kids.push(new Paragraph({ spacing: { before: 2400, after: 200 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Claude Certified Architect", bold: true, size: 64, color: ACCENT })] }));
kids.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: "Foundations (CCA-F) — Exam Study Guide", size: 36, color: GREY })] }));
kids.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [new TextRun({ text: "Prepared for Ashwini · Updated August 2026", size: 24, color: GREY })] }));
kids.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Covers all five exam domains, the six scenario contexts, and 10 practice questions", size: 22, italics: true, color: GREY })] }));
kids.push(new Paragraph({ children: [new PageBreak()] }));

// ===== TOC =====
kids.push(h1("Contents"));
kids.push(new TableOfContents("Table of Contents", { hyperlink: true, headingStyleRange: "1-2" }));
kids.push(new Paragraph({ children: [new PageBreak()] }));

// ===== 1. Exam overview =====
kids.push(h1("1. Exam Overview"));
kids.push(p([r("The "), b("Claude Certified Architect – Foundations (CCA-F)"), r(" is Anthropic's first official certification, launched March 12, 2026 alongside the Claude Partner Network. It is a 301-level credential for solution architects and developers who design production applications with Claude. It tests architectural judgment — when to use a subagent, when to escalate to a human, when plan mode helps — not trivia about model internals.")]));
kids.push(table(
  ["Attribute", "Details"],
  [
    ["Format", "60 scenario-based questions: multiple choice AND multiple response (each item states how many to select; multiple-response items are partially graded)"],
    ["Scenarios", "4 drawn at random from a pool of 6; several questions per scenario"],
    ["Time", "120 minutes (~135 min total seat time with check-in and survey)"],
    ["Scoring", "Scaled 100–1,000; passing score 720. Score shown on screen immediately"],
    ["Delivery", "Pearson VUE — online proctored (OnVUE) or test centre. Closed book; no notes, AI, or browser translation"],
    ["Eligibility", "Claude Partner Network organizations only. Requires a company email on a recognized partner domain; personal email will not work. Must be 18+ with government ID"],
    ["Cost", "$125 per attempt (raised from $99 on June 30, 2026); Select/Preferred/Global Premier tiers get 50% off automatically"],
    ["Retakes", "14 days after a 1st fail, 30 after a 2nd, 90 after a 3rd; max 4 attempts per rolling 12 months, full fee each time"],
    ["Validity", "12 months. Renewal is a free non-proctored assessment; if it lapses, you retake the full paid exam"],
    ["Recommended experience", "6+ months hands-on with the Claude API, Agent SDK, Claude Code, and MCP"],
    ["Reschedule / cancel", "At least 48 hours before your appointment. Inside 48 hours, or a no-show, forfeits the fee. Cancelling in Pearson does NOT trigger a refund — email certifications-support@anthropic.com"],
    ["Regional limits", "OnVUE online proctoring unavailable for IDs from Belarus, Cuba, North Korea, Russia, Syria and restricted Ukraine regions (test centre instead). Iran suspended entirely since Sept 8, 2026"],
    ["Registration", "anthropic-partners.skilljar.com — register and pay, then schedule via Pearson. Registration stays valid 5 years"]
  ],
  [2100, 7260]
));
kids.push(p(""));
kids.push(h2("Domain weights"));
kids.push(table(
  ["#", "Domain", "Weight", "≈ Questions"],
  [
    ["1", "Agentic Architecture & Orchestration", "27%", "16"],
    ["2", "Tool Design & MCP Integration", "18%", "11"],
    ["3", "Claude Code Configuration & Workflows", "20%", "12"],
    ["4", "Prompt Engineering & Structured Output", "20%", "12"],
    ["5", "Context Management & Reliability", "15%", "9"]
  ],
  [600, 5160, 1400, 2200]
));
kids.push(p(""));
kids.push(h2("The six scenario contexts"));
kids.push(p("Questions are grouped under scenarios. You get 4 of these 6, drawn randomly:"));
kids.push(bullet([b("Customer support resolution agent — "), r("returns, billing disputes, account issues; 80%+ first-contact resolution target. The trap answers ignore when the agent should escalate instead of resolve.")]));
kids.push(bullet([b("Code generation with Claude Code — "), r("team-wide Claude Code configuration: slash commands, CLAUDE.md hierarchy, plan mode vs. direct execution.")]));
kids.push(bullet([b("Multi-agent research system — "), r("a coordinator delegates to search, analysis, synthesis, and report-writing subagents; tested on orchestration, context passing, and partial failures.")]));
kids.push(bullet([b("Developer productivity tools — "), r("navigating unfamiliar codebases; built-in tools (Read, Write, Bash, Grep, Glob) and MCP server integration.")]));
kids.push(bullet([b("Claude Code in CI/CD — "), r("automated reviews, test generation, PR feedback; the -p flag, --output-format json, session isolation, minimizing false positives.")]));
kids.push(bullet([b("Structured data extraction — "), r("pulling data from messy documents; JSON schema validation, nullable fields to prevent hallucination, batch processing.")]));

// ===== Domain 1 =====
kids.push(h1("2. Domain 1 — Agentic Architecture & Orchestration (27%)"));
kids.push(p("The heaviest domain. Expect design decisions: single agent or multi-agent, workflow or agent, how to decompose a task, what to do when a subagent fails."));
kids.push(h2("The agentic loop"));
kids.push(p([r("An agent is a model using tools in a loop: "), b("gather context → take action → verify work → repeat"), r(". Every architectural question comes back to this. The model decides the next step from tool results; the harness enforces stopping conditions (max turns, budget) and permissions.")]));
kids.push(h2("Workflows vs. agents — pick the simplest thing"));
kids.push(bullet([b("Workflow"), r(" (fixed steps, LLM calls chained by code): use when the path is predictable — e.g. classify ticket → draft reply → check policy. Cheaper, testable, deterministic.")]));
kids.push(bullet([b("Agent"), r(" (model decides the path): use when requests are ambiguous or open-ended and the number/order of steps can't be known in advance.")]));
kids.push(bullet([r("Exam heuristic: answers that add agents/complexity 'for flexibility' when a simple workflow satisfies the requirement are usually wrong. Anthropic's guidance is to find the simplest architecture that works.")]));
kids.push(h2("Single-agent vs. multi-agent"));
kids.push(bullet([r("Stay "), b("single-agent"), r(" when tasks are sequential and share context — splitting adds latency and lossy handoffs.")]));
kids.push(bullet([r("Go "), b("multi-agent"), r(" when work parallelizes cleanly (breadth-first research), when specialists need different tools/prompts, or when a subtask would flood the main context window.")]));
kids.push(bullet([b("Orchestrator–worker"), r(" is the canonical pattern: a lead agent decomposes the task, spawns subagents with clear, bounded briefs (objective, output format, tool guidance), then synthesizes results. Subagents don't see each other's context — the orchestrator must pass everything a worker needs in its brief.")]));
kids.push(h2("Task decomposition and context passing"));
kids.push(bullet("Give each subagent one objective, an explicit output format, and effort/budget guidance. Vague briefs cause duplicated work and gaps."));
kids.push(bullet("Results should come back compact and structured (findings, not transcripts). The orchestrator's context is the scarce resource."));
kids.push(h2("Handling partial failures"));
kids.push(bullet("If one of several parallel subagents fails, prefer graceful degradation: return the successful results, flag the gap, retry or re-scope the failed branch — not abort everything, and not silently pretend nothing failed."));
kids.push(bullet("Retry transient errors (rate limits, timeouts) with backoff; don't retry deterministic failures (validation, auth) without changing the input."));
kids.push(h2("Escalation to humans"));
kids.push(bullet("Design explicit escalation criteria: low confidence, missing permissions/data, actions above a risk threshold (refunds over a limit, destructive operations), or the user asks for a human."));
kids.push(bullet("Escalate with a summary of what was tried and gathered, so the human doesn't start from zero. First-contact-resolution targets never justify an agent guessing on a case it can't verify."));

// ===== Domain 4 =====
kids.push(h1("3. Domain 2 — Tool Design & MCP Integration (18%)"));
kids.push(h2("Writing tools Claude can use correctly"));
kids.push(bullet([b("Descriptions are prompts."), r(" Say what the tool does, when to use it, and when NOT to — especially for similar-sounding tools. Most tool-selection bugs are description bugs, not model bugs.")]));
kids.push(bullet("Avoid overlapping tools; merge or sharply differentiate them. Fewer, well-named, well-scoped tools beat many ambiguous ones. Distribute tools across agents so each agent sees only what its role needs."));
kids.push(bullet("Input schemas: descriptive parameter names, enums for closed sets, required vs. optional made deliberate. Return concise, high-signal results — huge payloads burn context."));
kids.push(h2("Structured error responses"));
kids.push(bullet([r("Return errors to the model as data it can act on: an "), code("errorCategory"), r(" (e.g. validation, not_found, rate_limit), an "), code("isRetryable"), r(" flag, and a human-readable message suggesting the fix. This lets the agent decide: retry, change inputs, try another tool, or escalate. Raising an unstructured exception (or hiding the failure) strands the loop.")]));
kids.push(h2("MCP essentials"));
kids.push(bullet([b("Primitives: tools"), r(" (model-invoked actions), "), b("resources"), r(" (application-controlled data/context), "), b("prompts"), r(" (user-invoked templates). Know which is which — 'expose read-only reference data' → resource, 'let the model act' → tool.")]));
kids.push(bullet([b("Transports:"), r(" stdio for local/same-machine servers; streamable HTTP for remote/shared servers. Remote servers typically add OAuth-based auth.")]));
kids.push(bullet("Advanced topics that appear: sampling (server asks the client's model for a completion), notifications (server-initiated updates), and keeping servers stateless for scale."));

// ===== Domain 2 =====
kids.push(h1("4. Domain 3 — Claude Code Configuration & Workflows (20%)"));
kids.push(h2("CLAUDE.md hierarchy"));
kids.push(p("Memory files load in order, more specific overriding/adding to more general:"));
kids.push(bullet([b("Enterprise policy"), r(" (managed, org-wide) → "), b("user level"), r(" ("), code("~/.claude/CLAUDE.md"), r(", personal, all projects) → "), b("project root"), r(" ("), code("CLAUDE.md"), r(", checked in, shared with the team) → "), b("subdirectory CLAUDE.md"), r(" (loaded when working in that subtree).")]));
kids.push(bullet([r("Team conventions belong in the project CLAUDE.md (committed); personal preferences belong at user level. "), code("CLAUDE.local.md"), r(" / not-committed variants hold machine-local settings.")]));
kids.push(bullet([code(".claude/rules/"), r(" holds modular rule files; YAML frontmatter with path globs scopes a rule to matching files only — the exam likes 'apply this rule only to frontend code' setups.")]));
kids.push(h2("Slash commands and skills"));
kids.push(bullet([r("Custom slash commands are Markdown prompt templates in "), code(".claude/commands/"), r(" (project) or "), code("~/.claude/commands/"), r(" (personal); "), code("$ARGUMENTS"), r(" injects what the user typed.")]));
kids.push(bullet([r("Skills are directories with a "), code("SKILL.md"), r(" whose frontmatter has "), code("name"), r(" and "), code("description"), r(" (the description drives automatic triggering — write it for the model). "), code("allowed-tools"), r(" restricts what a skill may use; "), code("context: fork"), r(" runs it in a subagent so its work doesn't consume the main context.")]));
kids.push(h2("Plan mode vs. direct execution"));
kids.push(bullet("Plan mode makes Claude research and propose an approach before editing anything. Choose it for multi-file refactors, unfamiliar codebases, or risky changes needing review. Direct execution is right for small, well-understood edits — planning everything wastes time and tokens."));
kids.push(h2("Headless mode and CI/CD"));
kids.push(bullet([code("claude -p \"prompt\""), r(" runs non-interactively (print mode) for pipelines; "), code("--output-format json"), r(" gives machine-parseable output (result, cost, session id) for downstream steps.")]));
kids.push(bullet([r("Each headless invocation is a "), b("fresh, isolated session"), r(" — no memory of previous runs unless you pass "), code("--resume <session-id>"), r(" or "), code("--continue"), r(". Exam questions probe this: two pipeline steps don't share context by default.")]));
kids.push(bullet([r("CI review quality: constrain with explicit review criteria and severity categories to minimize false positives; "), code("--allowedTools"), r(" limits what the pipeline run may do; hooks can gate or log tool use.")]));
kids.push(h2("MCP in Claude Code"));
kids.push(bullet([code(".mcp.json"), r(" at the project root defines project-scoped MCP servers (shared with the team via version control); user scope makes a server available across your projects; local scope keeps it private to one project. Choose scope by who should get the server.")]));

// ===== Domain 3 =====
kids.push(h1("5. Domain 4 — Prompt Engineering & Structured Output (20%)"));
kids.push(h2("Prompting principles the exam rewards"));
kids.push(bullet([b("Explicit criteria beat vague instructions."), r(" 'Flag SQL built by string concatenation with user input' outperforms 'be careful about security'. Wrong answers on the exam are usually the vague ones.")]));
kids.push(bullet([b("Few-shot examples"), r(" are the highest-leverage fix for ambiguous or judgment-call cases (e.g. edge cases in classification) — show 2–3 worked examples including a tricky one.")]));
kids.push(bullet("Use XML tags to separate instructions, context, and examples; put long documents before the question; give Claude an out ('if the information is not present, say so')."));
kids.push(bullet("Chain of thought (think step by step / extended thinking) helps multi-step reasoning; prefilling the assistant turn constrains format in non-tool settings."));
kids.push(h2("Guaranteed structured output"));
kids.push(bullet([r("The most reliable way to get schema-conforming JSON is "), b("tool use"), r(": define a tool whose input schema is your target shape and force it with "), code("tool_choice"), r(". The model must emit arguments matching the JSON schema.")]));
kids.push(bullet([b("Nullable fields prevent hallucination."), r(" If a document may lack a value, make the field nullable/optional. A required field forces the model to invent something — a classic exam trap.")]));
kids.push(bullet([b("Validation-retry loop:"), r(" validate output against the schema (plus business rules); on failure, re-prompt with the specific validation errors attached. Bound the retries and route persistent failures to review — don't retry forever, don't silently accept bad data.")]));
kids.push(h2("Batch processing"));
kids.push(bullet([r("The "), b("Message Batches API"), r(" processes large asynchronous workloads (up to ~100k requests per batch, most complete within an hour, 24-hour window) at "), b("50% of standard token cost"), r(". Right answer whenever the scenario says 'thousands of documents, not latency-sensitive'. Real-time user interactions stay on the standard API.")]));
kids.push(h2("Multi-pass architectures"));
kids.push(bullet("For high-accuracy review/extraction: separate passes with narrow criteria (extract → validate → judge) beat one mega-prompt. A second 'reviewer' pass with explicit rubric cuts false positives."));

// ===== Domain 5 =====
kids.push(h1("6. Domain 5 — Context Management & Reliability (15%)"));
kids.push(h2("Managing the finite context window"));
kids.push(bullet([b("Compaction/summarization:"), r(" when a long session nears the limit, summarize the conversation and continue with the summary — preserve decisions, constraints, and unresolved items; drop raw tool transcripts.")]));
kids.push(bullet([b("Structured note-taking:"), r(" persist key facts to a scratchpad file outside the context window and re-read what's needed. Right answer for 'critical detail from hour 1 must survive to hour 3'.")]));
kids.push(bullet([b("Subagent delegation:"), r(" for large-codebase exploration, send a subagent to search and return a compact digest instead of pulling thousands of lines into the main context.")]));
kids.push(bullet([b("Just-in-time retrieval:"), r(" keep lightweight identifiers (paths, ids) and fetch content when needed, instead of pre-loading everything.")]));
kids.push(h2("Reliability patterns"));
kids.push(bullet("Error propagation in multi-agent systems: decide per-branch whether to fail fast (dependency broken → stop early with a clear error) or degrade gracefully (independent branch failed → partial results, flagged). Never let one branch's failure silently corrupt the synthesis."));
kids.push(bullet("Escalation design: confidence thresholds, risk tiers, and 'what the human receives' (context summary, evidence, attempted actions) are all fair game."));
kids.push(bullet("Prompt caching: cache stable prefixes (system prompt, tool definitions, long documents) to cut cost and latency on repeated calls — order content stable-first to maximize hits."));

// ===== Prep plan =====
kids.push(h1("7. Preparation Path"));
kids.push(p("All official prep is free on anthropic.skilljar.com (Anthropic Academy — about 15–20 hours total). Recommended order for an intermediate candidate:"));
kids.push(table(
  ["Step", "Resource", "Maps to"],
  [
    ["1", "Building with the Claude API", "Domains 2, 4 — tool use, structured output"],
    ["2", "Intro to MCP + MCP: Advanced Topics", "Domain 2"],
    ["3", "Claude Code 101 + Claude Code in Action", "Domain 3"],
    ["4", "Introduction to Subagents / Agent Skills", "Domains 1, 3"],
    ["5", "AI Capabilities and Limitations", "Domains 1, 5 — escalation, reliability"],
    ["6", "Official exam guide sample questions", "All — the authoritative scope document"]
  ],
  [700, 4560, 4100]
));
kids.push(p(""));
kids.push(p([b("Note: the official practice exam was retired"), r(" when delivery moved to Pearson VUE on June 30, 2026. The sample questions inside the exam guide are now the only official practice material, which makes third-party and self-built practice sets more important than they used to be.")]));
kids.push(p(""));
kids.push(h2("Hands-on work the exam guide recommends"));
kids.push(bullet("Build one agent end-to-end with the Agent SDK: real tool calls, structured errors, a subagent."));
kids.push(bullet([r("Configure Claude Code on a real repo: CLAUDE.md hierarchy, a path-scoped rule in "), code(".claude/rules/"), r(", one custom skill with "), code("allowed-tools"), r(", an MCP server in "), code(".mcp.json"), r(".")]));
kids.push(bullet("Build a small extraction pipeline: tool_use with a JSON schema, nullable fields, a validation-retry loop, and one Message Batches run."));
kids.push(h2("What passing candidates report"));
kids.push(p("Themes from published exam reports by people who passed (scores in the 830–880 range):"));
kids.push(bullet([b("The hardest items have two plausible answers. "), r("The recurring example: programmatic enforcement versus prompt-based guidance for a critical tool sequence. Both sound reasonable until you ask what "), b("guarantee"), r(" each provides. When two options both 'work', pick the one with the stronger reliability guarantee.")]));
kids.push(bullet([b("Escalation questions are the trickiest. "), r("The exam tests precise judgment about when an agent escalates versus retries versus resolves. The three defensible triggers are a policy gap or authority limit, an explicit request for a human, and inability to make further progress — not customer tone, not tool-call count.")]));
kids.push(bullet([b("Context management is underrated and heavily tested. "), r("Trimming verbose tool outputs, passing structured facts instead of raw responses between agents, scratchpad files, and the lost-in-the-middle effect all come up more than candidates expect.")]));
kids.push(bullet([b("Claude Code is the most common weak spot. "), r("Candidates from an API/agent background consistently report CLAUDE.md hierarchy, path-scoped rules, and plan mode as their biggest study gap — and that two focused weeks was enough to close it.")]));
kids.push(bullet([b("Time is not the constraint. "), r("Typical reports use ~105 of the 120 minutes including a full review pass. One candidate noted that second-guessing during review cost more answers than it saved.")]));
kids.push(h2("Exam-day strategy"));
kids.push(bullet("120 minutes / 60 questions = 2 minutes each. Read the scenario constraints first (targets, scale, latency) — the correct answer satisfies the stated constraint, not the generally fanciest architecture."));
kids.push(bullet("Distractors are usually: (a) over-engineering, (b) ignoring escalation/failure handling, (c) vague prompting, (d) the right tool at the wrong scope. Eliminate those first."));
kids.push(bullet("On multiple-response items, the question states how many to select. They are partially graded, so an incomplete-but-correct selection still scores — never leave one blank."));
kids.push(bullet("Flag and move on; scenario framing means later questions often refresh your memory of the setup."));
kids.push(bullet("Practical: confirm your Pearson profile name matches your ID exactly and run the OnVUE system test days ahead. A name mismatch at check-in forfeits the fee with no appeal."));

// ===== Practice questions =====
kids.push(new Paragraph({ children: [new PageBreak()] }));
kids.push(h1("8. Practice Questions"));
kids.push(p("Answers with explanations follow at the end. (25 more questions are in your interactive quiz.)"));

const qs = [
  ["A support agent must hit 80% first-contact resolution. A user disputes a $2,400 charge, above the agent's $500 refund authority. Best action?",
   ["A. Issue the refund — resolution target takes priority", "B. Refuse and end the conversation", "C. Escalate to a human with a summary of the account, dispute details, and verification already gathered", "D. Ask the user to call back later"],
   "C", "Escalation criteria (authority limits) override resolution targets. Escalating WITH gathered context preserves value; A violates authority, B and D abandon the customer."],
  ["A coordinator spawns 4 research subagents in parallel. One fails after the others return good results. Best design?",
   ["A. Discard everything and restart the whole task", "B. Synthesize the 3 successful results, flag the gap, and retry or re-scope the failed branch", "C. Ignore the failure and present results as complete", "D. Have the coordinator redo the failed work itself in its main context"],
   "B", "Graceful degradation: keep successful work, be transparent about the gap, retry the failed branch. A wastes work; C misleads; D floods the orchestrator's context."],
  ["A team wants a coding rule applied only to files under frontend/. Best mechanism?",
   ["A. Add it to ~/.claude/CLAUDE.md", "B. A rule file in .claude/rules/ with YAML frontmatter path-scoping it to frontend/**", "C. Repeat the rule in every prompt", "D. A custom slash command developers must remember to run"],
   "B", "Path-scoped rules in .claude/rules/ apply automatically to matching files and are shared via the repo. A is personal and global; C and D rely on humans remembering."],
  ["In CI, step 1 runs `claude -p` to analyze a PR; step 2 runs `claude -p` to write tests and needs step 1's findings. What's true?",
   ["A. Step 2 automatically sees step 1's session", "B. Sessions are isolated; pass step 1's output explicitly (e.g. JSON output into step 2's prompt, or --resume)", "C. Use --output-format json in step 1 and step 2 auto-loads it", "D. Both steps must run in one terminal"],
   "B", "Headless invocations are fresh sessions. Context must be passed explicitly via output piping or session resume."],
  ["Extracting invoice data where some invoices have no PO number. The schema should:",
   ["A. Require po_number so it's never missing", "B. Make po_number nullable/optional so the model can return null when absent", "C. Default po_number to 'UNKNOWN' in the prompt", "D. Skip invoices without PO numbers"],
   "B", "Required fields force fabrication. Nullable fields give the model a truthful way out — the canonical anti-hallucination schema design."],
  ["50,000 archived contracts need extraction; results due within a day. Most cost-effective approach?",
   ["A. Standard Messages API calls in a loop", "B. Message Batches API — async, 50% token discount, fits the latency budget", "C. One giant prompt with all contracts", "D. Fine-tune a model first"],
   "B", "Non-latency-sensitive bulk work is exactly what Batches is for. A costs double; C blows the context window; D is unnecessary."],
  ["Claude keeps picking search_customers when it should use lookup_customer_by_id. Best fix?",
   ["A. Remove search_customers", "B. Rewrite both descriptions to state precisely when to use each (exact ID known → lookup; fuzzy criteria → search)", "C. Lower temperature", "D. Add a third router tool"],
   "B", "Tool-selection errors are usually description problems. Differentiate the descriptions; removing capability or adding indirection doesn't address the confusion."],
  ["An MCP tool hits a rate limit. Best error response to the model?",
   ["A. Throw an unhandled exception", "B. Return success with an empty result", "C. Structured error: errorCategory 'rate_limit', isRetryable true, message 'Rate limited; retry after 30s'", "D. Log server-side and return nothing"],
   "C", "Structured, actionable errors let the agent decide to wait and retry. A crashes the loop; B and D hide the failure and corrupt downstream reasoning."],
  ["A 3-hour agent session must preserve a decision made in the first 10 minutes. Most reliable pattern?",
   ["A. Rely on the context window", "B. Write key decisions to a structured scratchpad/notes file and re-read as needed", "C. Repeat the decision in every message", "D. Increase max tokens"],
   "B", "Persisting structured notes outside the context survives compaction and truncation. A fails at the limit; C bloats context; D doesn't extend the window."],
  ["A code-review bot in CI produces too many false positives. Highest-impact fix?",
   ["A. Tell it to 'be more careful'", "B. Replace vague guidance with explicit categorical criteria (what to flag, what to ignore) and severity definitions; optionally add a second review pass", "C. Run it three times and union the results", "D. Switch to a bigger model only"],
   "B", "Explicit criteria are the exam's favorite prompting principle; unioning runs (C) increases false positives. Vague meta-instructions (A) do little."]
];

qs.forEach((q, i) => {
  kids.push(p([b(`Q${i + 1}. `), r(q[0])], { spacing: { before: 160, after: 60 } }));
  q[1].forEach(opt => kids.push(new Paragraph({ indent: { left: 360 }, spacing: { after: 40 }, children: [new TextRun({ text: opt, size: 21 })] })));
});

kids.push(new Paragraph({ children: [new PageBreak()] }));
kids.push(h1("9. Answer Key"));
qs.forEach((q, i) => {
  kids.push(p([b(`Q${i + 1}: ${q[2]}. `), r(q[3])]));
});

kids.push(h1("10. Sources"));
kids.push(bullet("Certification FAQ (authoritative on format, eligibility, retakes, validity): anthropic-partners.skilljar.com/page/faq-certifications"));
kids.push(bullet("Exam delivery: Pearson VUE — Claude Certification Program by Anthropic (pearsonvue.com/us/en/anthropic.html)"));
kids.push(bullet("Free courses: Anthropic Academy — anthropic.skilljar.com"));
kids.push(bullet("Domain/scenario breakdown: 'The Claude Certified Architect Exam: 5 Domains, 6 Scenarios' (dev.to, AWS Community Builders, Apr 2026)"));
kids.push(bullet("Exam experience reports: Ihor Sasovets, 'CCA-F: My Learning Journey and Exam Experience' (Medium, Jun 2026, scored 839); Kamal Dhungana, 'How I Passed the CCA-F Exam' (Medium, Jul 2026)"));
kids.push(bullet("Community study guides: github.com/paullarionov/claude-certified-architect · github.com/daronyondem/claude-architect-exam-guide"));
kids.push(p([b("Note on candidate reports: "), r("posts written before June 30, 2026 describe a single-answer-only format and a 6-month retake wait. Both changed at the Pearson migration — the format now includes multiple-response items, and retake waits are 14/30/90 days. Details in this guide reflect the certification FAQ as of August 2026; confirm on the official page before booking.")]));

const doc = new Document({
  numbering: bullets,
  styles: {
    default: {
      document: { run: { font: "Calibri", size: 22 }, paragraph: { spacing: { line: 276 } } },
      heading1: { run: { size: 32, bold: true, color: ACCENT }, paragraph: { spacing: { before: 360, after: 160 } } },
      heading2: { run: { size: 26, bold: true, color: "3D3833" } },
      heading3: { run: { size: 23, bold: true, color: GREY } }
    }
  },
  features: { updateFields: true },
  sections: [{
    properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1080, bottom: 1080, left: 1260, right: 1260 } } },
    children: kids
  }]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(require("path").join(__dirname,"..","docs","CCA-F_Study_Guide.docx"), buf);
  console.log("written", buf.length);
});
