# eval the human performance and try to be affair  with the effect of AI Agent Coding Assistant

## background
In the era of AI, coding assistants have become increasingly prevalent, offering developers a powerful tool to enhance their productivity and code quality. However, it is crucial to evaluate the human performance in coding tasks and understand the impact of AI coding assistants on developers' efficiency and creativity. we try to evaluate the human performance.

Different users use different coding assistants, and the performance of the coding assistants may vary. Therefore, we need to evaluate the human performance in coding tasks while considering the influence of AI coding assistants.

## Core Problem

When AI generates most of the code, output quality reflects the AI tool as much as the human. Comparing a Claude Code user against a Copilot user on code quality alone is unfair. We need to isolate what the **human** contributes.

## Strategy 1: Focus on Tool-Agnostic Human Signals

The signals from [vibe-coding.md](vibe-coding.md) already measure the human layer, not AI output quality:

| Signal | Why it's tool-agnostic |
|---|---|
| Fix-cycle depth | Measures human debugging ability, not AI generation quality |
| Curation score | Measures whether human filters AI output, regardless of AI used |
| Scope control | Measures human's ability to decompose work |
| First-push CI pass rate | Measures human's verification discipline |
| Test intent | Measures human's understanding of failure modes |

A strong engineer using a weak AI and a strong engineer using a strong AI should both show low fix-cycle depth and high curation — they arrive there differently but the human signal is the same.

## Strategy 2: Detect and Stratify by AI Tool

Identify which AI was used, then compare within cohorts rather than across them.

**Detection signals:**
- `Co-Authored-By` tags in commit messages (Claude, Copilot, etc.)
- Tool-specific markers (`Generated with Claude Code`, `GitHub Copilot`, etc.)
- Config files in repo (`.cursor/`, `.github/copilot/`)
- Code style fingerprints (each AI has subtle patterns)

**Scoring approach:**
```
Raw scores → Group by detected AI tool → Compare within group
                                       → Normalize across groups using baseline calibration
```

This produces "among Cursor users, this person is top 20%" rather than unfair cross-tool comparisons.

## Strategy 3: Measure What AI Can't Do for You

Some aspects are inherently human regardless of tool:

- **Architecture decisions** — which modules, what abstractions, how to separate concerns. The human chooses; the AI implements.
- **Commit narrative** — how the commit history tells the story of feature development. AI generates individual commits; humans shape the sequence.
- **What gets rejected** — revert-then-redo, partial adoption, scope reduction. The selection process is purely human.
- **Cross-cutting consistency** — maintaining consistent patterns across AI-generated code reflects the human's design vision.

## Strategy 4: Controlled Task Probes (for hiring/assessment)

When you can assign tasks directly:

- Give everyone the **same task** with intentionally ambiguous spec
- Allow any AI tool
- Measure process, not just output:
  - How they interpreted ambiguity (engineering judgment)
  - Whether they asked clarifying questions (communication)
  - Fix-cycle depth and curation during the task
  - Whether they can explain/modify the code afterward without AI

## Strategy 5: Comprehension Verification

Differentiate juniors with strong AI from seniors with weak AI:

- **Bug injection** — present a bug in their own code, measure time-to-diagnosis
- **Modification requests** — ask them to change behavior in code they submitted. If they can't navigate it, they didn't understand the AI's output.
- **Explain-the-tradeoff** — ask why a pattern was chosen over alternatives. Seniors articulate; juniors repeat AI comments.

Note: This requires interaction with the person, so it works for hiring but not passive repo evaluation.

## Integrated Pipeline

```
Data Collection (GitHub API)
        │
AI Tool Detection
  ├── Commit message markers
  ├── Repo config files
  └── Style fingerprinting
        │
Tool-Agnostic Signal Extraction (existing pipeline)
  ├── Fix-cycle depth
  ├── Test intent
  ├── Curation score
  ├── Scope ratio
  └── First-push CI pass rate
        │
Stratified Scoring
  ├── Within-tool-cohort percentile
  ├── Cross-tool normalized score (calibrated against baselines per tool)
  └── Architecture/judgment score (tool-independent)
```

## Key Insight

You don't need to remove the AI's influence — you need to measure what the human adds on top of it. The existing signals in [vibe-coding.md](vibe-coding.md) already do this. The main gaps are:

1. **Stratification layer** — grouping by AI tool for fair comparison
2. **Comprehension verification** — for high-stakes evaluations where passive signals aren't enough