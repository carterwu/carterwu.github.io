# Evaluating Code Quality in the Vibe Coding Era

## Background

AI agents (Claude Code, Cursor, Copilot, etc.) now generate a significant portion of application code. This changes the evaluation problem: traditional metrics like lines written, commit frequency, or code coverage numbers become less meaningful when AI produces most of the code.

The core shift: the developer's role moves from **writing** code to **curating and verifying** it.

---

## The Challenge: Read-Only Evaluation

Our evaluation pipeline uses the GitHub REST API to fetch diffs, file context, and repo structure — then feeds them to an LLM for scoring (see [what_to_eval.md](what_to_eval.md)). The LLM reads code but doesn't run it.

This creates a fundamental gap:

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

### Vibe Coding Makes This Harder

AI-generated code often **looks** structurally correct but has subtle semantic errors. The code "reads well" because the LLM that wrote it optimizes for readability, not necessarily correctness. This means read-only evaluation is more likely to be fooled by AI-written code than by human-written code.

---

## What Read-Only (LLM) Evaluation Can Assess

### 1. Code Structure & Architecture (tree API)
- Module separation, directory organization, dependency graph
- Whether concerns are properly separated
- Appropriate abstraction levels

### 2. Change Quality (diffs)
- Atomic, focused changes vs. mixed concerns
- Dead code cleanup
- Edge case handling
- Whether changes fit surrounding context

### 3. Commit Discipline (patch format)
- Message quality, conventional commits
- Atomic vs. kitchen-sink commits
- Fix-to-feature ratio

### 4. Testing Habits (diffs + tree)
- Tests written alongside features
- Test structure and naming conventions
- Edge case coverage patterns

### 5. Type Safety & Correctness Signals (file contents)
- Strict mode usage, `any` avoidance
- Error handling patterns
- Null/undefined handling

---

## Compensation Strategies (Closing the Read-Only Gap)

### 1. CI Status as Execution Proxy
The highest-value addition — read CI results without running anything:
```
GET /repos/{owner}/{repo}/commits/{ref}/check-runs
GET /repos/{owner}/{repo}/commits/{ref}/status
```
This tells you if the author's commits pass the repo's own quality gates. The repo's infrastructure already ran the tests.

### 2. Cross-Reference Consistency Checks
The LLM can verify internal consistency without execution:
- Import paths vs. actual file tree
- Test files referencing functions that exist in source
- CI config paths matching project structure

### 3. Pattern-Based Smell Detection
Strong proxies for "this code doesn't work":
- Nonexistent import paths
- Wrong API argument counts/types
- Copy-paste errors, unreachable code
- Configuration contradictions

### 4. Temporal Analysis Across Commits
Read the commit sequence, not just individual snapshots:
- Does the author fix their own bugs quickly?
- Do they iterate or ship-and-forget?
- Are fix commits addressing self-introduced issues?

### 5. PR Review Signals (when available)
```
GET /repos/{owner}/{repo}/pulls/{number}/reviews
GET /repos/{owner}/{repo}/pulls/{number}/comments
```
- Review iteration count before merge
- Whether feedback is addressed or ignored
- Nature of requested changes (fundamental vs. style)

---

## AI-Authorship Detection Signals

When evaluating repos in the vibe coding era, these signals help identify AI-generated code:

- **Co-authored-by markers** — explicit attribution (e.g., `Co-Authored-By: Claude`)
- **Commit message style** — AI messages tend to be overly structured with bullet lists; human messages reference context and people
- **Code style uniformity** — AI output is unnaturally consistent; human code has personal quirks and evolves over time
- **Feature-to-test ratio** — vibe coders tend to skip tests because the AI output looks correct
- **Dependency bloat** — AI tends to add libraries for things that could be a few lines of code

---

## Two Evaluation Modes

| Mode | Tools | Strengths | Limitations |
|---|---|---|---|
| **LLM (read-only)** | Diffs, file contents, tree structure, CI status, PR metadata | Scalable, no infrastructure needed, assesses design and discipline | Cannot verify runtime correctness |
| **Agent (with execution)** | All of the above + compile + test execution + static analysis | Verifies actual correctness, catches runtime issues | Requires infrastructure, slower, harder to scale |

The LLM mode is sufficient for evaluating engineering discipline, architectural thinking, and code quality patterns. The agent mode is needed when you must verify that the code actually works — which matters more in the vibe coding era where "looks correct" is no longer a reliable proxy for "is correct."

---

## References

- [what_to_eval.md](what_to_eval.md) — data fetching strategy
- [baseline_test.md](baseline_test.md) — synthetic test repos for calibration
- [concept.md](concept.md) — Git terminology and PR vs. commit evaluation
