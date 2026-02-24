# Evaluating Code Quality in the Vibe Coding Era

## Background

AI agents (Claude Code, Cursor, Copilot, etc.) now generate a significant portion of application code. This changes the evaluation problem: traditional metrics like lines written, commit frequency, or code coverage numbers become less meaningful when AI produces most of the code.

The core shift: the developer's role moves from **writing** code to **curating and verifying** it.

---

## Part 1: Read-Only (LLM) Evaluation

Our evaluation pipeline uses the GitHub REST API to fetch diffs, file context, and repo structure — then feeds them to an LLM for scoring (see [what_to_eval.md](what_to_eval.md)). The LLM reads code but doesn't run it.

### What Read-Only Evaluation Can Assess

#### 1. Code Structure & Architecture (tree API)
- Module separation, directory organization, dependency graph
- Whether concerns are properly separated
- Appropriate abstraction levels

#### 2. Change Quality (diffs)
- Atomic, focused changes vs. mixed concerns
- Dead code cleanup
- Edge case handling
- Whether changes fit surrounding context

#### 3. Commit Discipline (patch format)
- Message quality, conventional commits
- Atomic vs. kitchen-sink commits
- Fix-to-feature ratio

#### 4. Testing Habits (diffs + tree)
- Tests written alongside features
- Test structure and naming conventions
- Edge case coverage patterns

#### 5. Type Safety & Correctness Signals (file contents)
- Strict mode usage, `any` avoidance
- Error handling patterns
- Null/undefined handling

### Limitations with Vibe-Coded Output

AI-generated code often **looks** structurally correct but has subtle semantic errors. The code "reads well" because the LLM that wrote it optimizes for readability, not necessarily correctness. This means read-only evaluation is more likely to be fooled by AI-written code than by human-written code.

| Signal | Visible via read? | Requires execution? |
|---|---|---|
| Code structure & architecture | Yes | No |
| Change quality (diffs) | Yes | No |
| Commit discipline | Yes | No |
| Test existence & patterns | Yes | No |
| Does it compile? | No | Yes |
| Do tests pass? | No | Yes |
| Runtime behavior (deadlocks, leaks) | No | Yes |
| Dependency resolution | No | Yes |
| Build pipeline validity | No | Yes |

### Compensation Strategies (Closing the Read-Only Gap)

These techniques approximate execution results without actually running code — how far can read-only get?

#### 1. CI Status as Execution Proxy
The highest-value addition — read CI results without running anything:
```
GET /repos/{owner}/{repo}/commits/{ref}/check-runs
GET /repos/{owner}/{repo}/commits/{ref}/status
```
This tells you if the author's commits pass the repo's own quality gates. The repo's infrastructure already ran the tests.

#### 2. Cross-Reference Consistency Checks
The LLM can verify internal consistency without execution:
- Import paths vs. actual file tree
- Test files referencing functions that exist in source
- CI config paths matching project structure

#### 3. Pattern-Based Smell Detection
Strong proxies for "this code doesn't work":
- Nonexistent import paths
- Wrong API argument counts/types
- Copy-paste errors, unreachable code
- Configuration contradictions

#### 4. Temporal Analysis Across Commits
Read the commit sequence, not just individual snapshots:
- Does the author fix their own bugs quickly?
- Do they iterate or ship-and-forget?
- Are fix commits addressing self-introduced issues?

#### 5. PR Review Signals (when available)
```
GET /repos/{owner}/{repo}/pulls/{number}/reviews
GET /repos/{owner}/{repo}/pulls/{number}/comments
```
- Review iteration count before merge
- Whether feedback is addressed or ignored
- Nature of requested changes (fundamental vs. style)

---

## Part 2: Agent Evaluation (with Tools)

When read-only evaluation hits its ceiling — especially with vibe-coded output that looks correct but isn't — agent evaluation closes the gap by actually executing code.

### What Agent Evaluation Unlocks

#### 1. Compilation & Build Verification
The most basic execution check: does the code compile?
- Run the project's build command and capture exit codes + error output
- Detect dependency resolution failures (missing packages, version conflicts)
- Catch type errors that read-only analysis might miss (complex generics, cross-module type flow)

#### 2. Test Execution
Move from "tests exist" to "tests pass":
- Run the test suite and capture pass/fail results
- Identify flaky tests vs. genuine failures
- Measure actual code coverage (not just whether test files exist)
- Detect tests that pass trivially (e.g., empty assertions, mocked-out everything)

#### 3. Runtime Behavior Analysis
Catch issues invisible to static reading:
- Deadlocks and race conditions under concurrent execution
- Memory leaks and resource handle exhaustion
- Infinite loops and runaway recursion
- Incorrect error propagation (swallowed exceptions, wrong error types)

#### 4. Static Analysis Tooling
Run the project's own linters and analyzers:
- ESLint, Clippy, mypy, etc. with the project's configuration
- Security scanners (npm audit, cargo audit, Snyk)
- Complexity metrics (cyclomatic complexity, cognitive complexity)
- Dead code detection via tree-shaking / unused export analysis

#### 5. Integration & Environment Checks
Verify the code works in context:
- Database migrations apply cleanly
- API contracts match between services
- Environment variable usage matches `.env.example` or config schemas
- Docker builds succeed and containers start

### Infrastructure Requirements

Agent evaluation requires significantly more setup than read-only:

| Requirement | Purpose |
|---|---|
| **Sandboxed execution environment** | Isolate untrusted code (containers, VMs, or secure runtimes) |
| **Language-specific toolchains** | Node.js, Rust, Python, Go, etc. per repo |
| **Dependency installation** | `npm install`, `pip install`, `cargo build` before running |
| **Time limits & resource caps** | Prevent runaway builds from consuming infrastructure |
| **Artifact capture** | Collect build output, test results, coverage reports |

This is the core tradeoff: agent evaluation gives you ground truth about correctness, but at the cost of infrastructure complexity, execution time, and security surface area.

### AI-Authorship Detection Signals

When evaluating repos in the vibe coding era, these signals help identify AI-generated code (available to both modes, but agent mode can verify claims):

- **Co-authored-by markers** — explicit attribution (e.g., `Co-Authored-By: Claude`)
- **Commit message style** — AI messages tend to be overly structured with bullet lists; human messages reference context and people
- **Code style uniformity** — AI output is unnaturally consistent; human code has personal quirks and evolves over time
- **Feature-to-test ratio** — vibe coders tend to skip tests because the AI output looks correct
- **Dependency bloat** — AI tends to add libraries for things that could be a few lines of code

---

## Part 3: Choosing Between Them

### When Read-Only Is Sufficient

Read-only evaluation works well for assessing **engineering discipline and judgment** — the human layer on top of AI-generated code:

- Evaluating commit discipline, PR hygiene, and code organization
- Detecting whether an engineer curates AI output or ships it raw
- Screening large numbers of candidates or repos quickly (scales linearly with API calls, not compute)
- Assessing architectural thinking and design decisions
- Situations where CI status is available as an execution proxy

### When You Need Agent Evaluation

Agent evaluation becomes necessary when **correctness matters more than process**:

- The codebase has no CI pipeline (no execution proxy available)
- You need to verify that AI-generated code actually works, not just looks right
- Runtime behavior is the primary concern (performance, concurrency, resource management)
- The evaluation must produce a binary "this works / this doesn't" verdict
- You're calibrating read-only signals against ground truth (do repos that "read well" also compile and pass tests?)

### Hybrid Approach

The most practical architecture uses both:

1. **Read-only as the first pass** — cheap, fast, scales to many repos. Produces scores for discipline, architecture, and curation.
2. **Agent evaluation as targeted verification** — run only on candidates or repos that pass the read-only threshold. Confirms that high-scoring code actually works.
3. **Calibration loop** — periodically run agent evaluation on read-only-scored repos to check whether read-only scores correlate with actual correctness. If they diverge, tune the read-only prompts.

---

## Junior vs. Senior Discrimination Signals

When both junior and senior engineers use AI agents, the code itself looks similar — the AI optimizes for readability regardless of who prompted it. The distinguishing signals shift from code quality to **engineering judgment**: what the human does before, during, and after the AI generates output.

### 1. Fix-Cycle Depth (deterministic, no LLM needed)

The strongest single signal. Walk the commit sequence and detect self-fix chains per file path.

**How to measure:** For each file, build a timeline of commits by the same author. When commit N touches the same lines (or same function scope) as commit N-1 or N-2, that's a self-fix. Count the chain length.

| Pattern | Chain length | Interpretation |
|---|---|---|
| Feature → done | 0 | Correct on first pass (or untested) |
| Feature → fix → done | 1 | Normal iteration |
| Feature → fix → fix → fix | 3+ | Retry loop — asking AI to fix without understanding why |

- **Senior signal:** average chain length ≤ 1. Diagnoses root cause, fixes once.
- **Junior signal:** average chain length ≥ 3. Feeds error back to AI repeatedly until it works.

**Data source:** commit diffs grouped by file path + author, compared via line overlap or function-level AST matching.

**Evaluation mode:** Read-only (deterministic). Extends Compensation Strategy #4 (Temporal Analysis) with a concrete, computable metric.

### 2. Test Intent (LLM-assisted)

Checking whether tests exist alongside features misses the subtler junior pattern: AI-generated tests that only cover the happy path.

**How to measure:** Feed the LLM:
- The feature diff (what changed)
- The corresponding test diff (what's being tested)
- Ask: "Do these tests verify failure modes, edge cases, and boundary conditions — or only the success path?"

**Scoring rubric:**
- **Happy-path only** — tests verify the function returns correct output for obvious inputs (junior signal)
- **Boundary coverage** — tests include empty inputs, max values, type coercion, off-by-one (senior signal)
- **Failure mode coverage** — tests verify error handling, timeouts, concurrent access, malformed data (strong senior signal)
- **Implementation coupling** — tests assert internal implementation details that break on refactor (junior signal, even though it looks thorough)

**Evaluation mode:** Read-only (LLM-assisted). Replaces the binary "tests exist / tests don't exist" check with a quality spectrum.

### 3. Curation Signals (deterministic, no LLM needed)

Detecting AI authorship isn't enough — the critical question is whether the human **curated** that output. A senior using AI has high AI authorship AND high curation. A junior using AI has high AI authorship and zero curation.

**Signals to detect:**
- **Revert-then-redo** — a revert commit followed by a different implementation of the same feature (evidence of rejection)
- **Partial adoption** — AI generates changes across N files but only M < N appear in the commit (selective acceptance)
- **PR self-review comments** — author comments like "changed approach", "rewrote this", "went with X instead" on their own PR
- **Force-push rewrites** — feature branch history rewritten before merge (visible via PR timeline API)
- **Scope reduction** — early commits in a branch are large, later commits trim them down (editing AI output rather than shipping it raw)

**How to measure:**
```
# Revert detection
GET /repos/{owner}/{repo}/commits?author={user}
# Look for: "revert" in message → next commit touches same files with different approach

# PR self-comments
GET /repos/{owner}/{repo}/pulls/{number}/comments
# Filter: comment.user == PR author

# Force-push detection
GET /repos/{owner}/{repo}/pulls/{number}/events
# Filter: event.type == "force-pushed"
```

**Composite score:** `curation_score = (reverts + partial_adoptions + self_reviews + force_pushes) / total_ai_authored_commits`

- **Senior signal:** curation score > 0 (some evidence of filtering AI output)
- **Junior signal:** curation score ≈ 0 with high AI authorship (accepting everything)

**Evaluation mode:** Read-only (deterministic).

### 4. Commit Intent Analysis (LLM-assisted)

Seniors scope their prompts and commits tightly. Juniors accept bulk AI output that mixes concerns.

**How to measure:** Per commit, use an LLM to analyze the commit message and diff, returning:
- `intent_count` — number of distinct purposes detected in the commit
- `message_quality` — 0.0–1.0 score for how coherent and descriptive the commit message is
- `intents` — list of distinct intents identified (e.g. "fix auth token refresh", "update avatar styling")

```json
{
  "intent_count": 2,
  "message_quality": 0.3,
  "intents": ["fix auth token refresh", "update avatar styling"],
  "reason": "Two unrelated concerns in one commit, message is vague"
}
```

| Intent count | Message quality | Interpretation |
|---|---|---|
| 1 | > 0.7 | Focused — single clear purpose, well-described |
| 1–2 | 0.4–0.7 | Moderate — mostly focused, message could be clearer |
| 3+ | any | Kitchen-sink — multiple concerns mixed together |
| any | < 0.3 | Nonsense — "wip", "fix", "asdf", or empty message |

This catches cases directory-counting misses: a commit touching 1 file but doing 3 unrelated things, or 10 files for one well-described fix. Nonsensical commit messages are penalized regardless of diff structure.

**Evaluation mode:** LLM-assisted. Replaces the crude directory-counting heuristic with semantic intent detection.

### 5. First-Push CI Pass Rate (deterministic, no LLM needed)

A senior tests locally or mentally verifies before pushing. A junior pushes AI output directly and lets CI catch problems.

**How to measure:**
```
GET /repos/{owner}/{repo}/commits/{ref}/check-runs
```

For each PR, check whether the **first** push passes CI. Subsequent pushes that fix CI failures are self-fix signals (connects to Fix-Cycle Depth above).

- **Senior signal:** first-push pass rate > 80%
- **Junior signal:** first-push pass rate < 50% with multiple fix pushes before green

**Evaluation mode:** Read-only (deterministic). Extends CI Status as Execution Proxy from a binary pass/fail to a temporal pattern.

### Integrating These Signals into the Evaluation Pipeline

These analyzers sit between data collection and LLM scoring as a **signal extraction layer**:

```
Data Collection (GitHub API)
        │
Signal Extraction (deterministic + targeted LLM)
  ├── Fix-cycle depth         → number
  ├── Test intent score       → categorical (happy-path / boundary / failure-mode)
  ├── Curation score          → ratio
  ├── Commit intent score     → intent_count + message_quality per commit
  └── First-push pass rate    → percentage
        │
LLM Judgment (structured prompt with pre-computed signals)
  → Scores engineering judgment, not code quality
  → Uses 2-3 representative diffs selected by signal density
  → Calibrated against baseline repos (eval_test_junior, eval_test_senior)
```

The key design principle: **extract signals deterministically where possible, reserve LLM calls for judgment that requires reasoning** (like test intent analysis). This reduces token usage, improves consistency, and makes scores explainable — each score can point to the specific commits and metrics that drove it.

### Calibration Against Baseline Repos

Run the full signal extraction pipeline against `eval_test_junior` and `eval_test_senior` (see [baseline_test.md](baseline_test.md)). Expected signal differences:

| Signal | eval_test_junior (expected) | eval_test_senior (expected) |
|---|---|---|
| Fix-cycle depth | ≥ 2.5 | ≤ 1.0 |
| Test intent | Happy-path or no tests | Boundary + failure modes |
| Curation score | ~0 | > 0.1 |
| Commit intent | intent_count > 3, message_quality < 0.3 | intent_count = 1, message_quality > 0.7 |
| First-push CI pass rate | < 50% | > 80% |

If these signals don't clearly separate the two baselines, the analyzers need tuning before running against real repos.

---

## References

- [what_to_eval.md](what_to_eval.md) — data fetching strategy
- [baseline_test.md](baseline_test.md) — synthetic test repos for calibration
- [concept.md](concept.md) — Git terminology and PR vs. commit evaluation
