import type { BlogPost } from './index';

export const post: BlogPost = {
  slug: 'eval-baseline-test',
  title: 'Baseline Testing for LLM-Based Engineering Evaluation',
  date: '2026-02-23',
  author: 'Carter Wu',
  content: `
# Baseline Testing for LLM-Based Engineering Evaluation

Before running an LLM-based evaluator against real-world repos, we need controlled test fixtures to verify the pipeline works and the scoring makes sense. This post documents the baseline testing approach.

---

## The Problem

We're building a system that evaluates an engineer's capability by feeding their code contributions (diffs, file context, repo structure) to an LLM. But how do we know the evaluator is working correctly?

We need repos where we **already know** the expected skill level, so we can check whether the LLM's scores match reality.

---

## Approach: Synthetic Test Repos

Two purpose-built repos at opposite ends of the skill spectrum, both implementing the same thing — a rich text editor:

### Junior-Level: eval_test_junior

- **Stack:** Vanilla JavaScript, HTML, CSS
- **Structure:** Flat — 5 files total (\`index.html\`, \`script.js\`, \`style.css\`)
- **Commits:** 50, each adding a single feature with terse messages ("h1", "redo", "dark mode")
- **No tests, no docs, no build tooling, no modular architecture**

### Senior-Level: eval_test_senior

- **Stack:** TypeScript with strict config
- **Structure:** Modular — \`src/core/\`, \`src/modules/\`, \`src/utils/\`, \`__tests__/\`, \`docs/\`
- **Commits:** 49, using conventional commit format (\`feat:\`, \`test:\`, \`chore:\`)
- **Jest tests, ESLint, CI/CD, ARIA accessibility, API documentation, plugin architecture**

---

## Why the Same Domain?

Both repos build a rich text editor. This controls for domain complexity and isolates the skill-level signal. The differences are purely in **how** the code is written:

| Dimension | Junior | Senior |
|---|---|---|
| Language | Vanilla JS | TypeScript (strict) |
| Architecture | Single flat files | Modular with separation of concerns |
| Commit discipline | Terse, no convention | Conventional commits |
| Testing | None | Unit + integration tests |
| CI/CD | None | GitHub Actions |
| Documentation | None | API docs + README |
| Accessibility | None | ARIA, keyboard navigation |

An LLM evaluator should clearly score these differently across every dimension.

---

## Known Limitations

**Synthetic histories.** Both repos have artificially clean commit progressions — one feature per commit, no bug fixes, no reverts, no refactoring. Real development is messier. The evaluator needs validation against real-world repos too.

**Same domain only.** Doesn't test whether the evaluator generalizes to API backends, CLI tools, data pipelines, or other project types.

**No middle ground.** Only junior and senior endpoints. If the evaluation rubric distinguishes fine-grained levels (P5/P6/P7), a mid-level repo would help test scoring granularity.

---

## What These Repos Test

1. **Pipeline smoke test** — Does the end-to-end flow work? Fetch diffs via REST API, fetch file context, feed to LLM, get scores back.

2. **Sanity check** — Does the LLM consistently rate the senior repo higher than the junior repo? If not, the evaluation prompt or rubric needs work.

3. **Score calibration** — Establish a floor (junior) and ceiling (senior) for score ranges before testing on real repos.

---

## Next Steps

- Run the evaluation pipeline against both repos
- Validate the expected junior < senior ordering across all scoring dimensions
- Add a mid-level test repo for finer-grained calibration
- Test against real open-source repos with known contributor skill levels
- Expand to different project domains
  `.trim()
};
