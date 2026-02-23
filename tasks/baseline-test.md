# Baseline Test for LLM-Based Engineering Evaluation

## Problem

We need to determine the standard to evaluate an author's engineering capability with an LLM. The key question is: how do we find the right repos to test on? We want to ensure that the repos we choose are representative of the kinds of code changes we want to evaluate.

## Approach: Synthetic Test Repos

Created two purpose-built repos to serve as baseline test fixtures at opposite ends of the skill spectrum:

### eval_test_junior (Junior-Level)
- **Repo:** https://github.com/bjzgcai/eval_test_junior
- **Stack:** Vanilla JavaScript, HTML, CSS
- **Structure:** Flat — 5 files total (`index.html`, `script.js`, `style.css`, `.gitignore`, `LICENSE`)
- **Commits:** 50, each adding a single feature with terse messages ("h1", "redo", "dark mode")
- **Characteristics:** No tests, no docs, no build tooling, no modular architecture

### eval_test_senior (Senior-Level)
- **Repo:** https://github.com/bjzgcai/eval_test_senior
- **Stack:** TypeScript with strict config
- **Structure:** Modular — `src/core/`, `src/modules/`, `src/utils/`, `__tests__/`, `docs/`, `.github/workflows/`
- **Commits:** 49, using conventional commit format (`feat:`, `test:`, `chore:`, `docs:`, `ci:`)
- **Characteristics:** Jest tests, ESLint, CI/CD pipeline, ARIA accessibility, API documentation, plugin architecture

### Why These Repos

Both repos build the same thing (a rich text editor), which controls for domain complexity and isolates the skill-level signal. The differences show up in:

| Dimension | Junior | Senior |
|---|---|---|
| Language choice | Vanilla JS | TypeScript (strict) |
| Architecture | Single flat files | Modular with separation of concerns |
| Commit discipline | Terse, no convention | Conventional commits, atomic features |
| Testing | None | Unit + integration tests |
| CI/CD | None | GitHub Actions |
| Documentation | None | API docs + README |
| Accessibility | None | ARIA, keyboard navigation |

## Known Limitations

1. **Synthetic histories** — Both repos have artificially clean commit progressions (one feature per commit, no bug fixes, no reverts, no refactoring). Real development is messier. The evaluator should eventually be validated against real-world repos.

2. **Same domain** — Both are rich text editors. Doesn't test whether the evaluator generalizes to other project types (API backends, CLI tools, data pipelines).

3. **No mid-level** — Only junior and senior, no intermediate. If the evaluation rubric needs to distinguish fine-grained levels (e.g., P5/P6/P7), an intermediate repo would help test scoring granularity.

## Purpose

These repos serve as:

- **Smoke test** — Verify the pipeline works end-to-end: fetch diffs via REST API, fetch file context, feed to LLM, get evaluation scores.
- **Sanity check** — Confirm the LLM consistently rates the senior repo higher than the junior repo across evaluation dimensions.
- **Calibration baseline** — Establish a floor (junior) and ceiling (senior) for score ranges before testing on real repos.

## Next Steps

- [ ] Run the evaluation pipeline against both repos
- [ ] Compare LLM scores to validate expected junior < senior ordering
- [ ] Add a mid-level test repo for finer-grained calibration
- [ ] Validate against real (non-synthetic) open-source repos
- [ ] Test across different project domains
