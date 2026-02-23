import type { BlogPost } from './index';

export const post: BlogPost = {
  slug: 'git-concepts',
  title: 'Git Concepts: Author vs Committer vs Contributor',
  date: '2026-02-23',
  author: 'Carter Wu',
  content: `
# concept 概念术语

## Author vs Committer (Conceptual Difference)

**Author**

*   The person who originally **wrote the code/changes**
*   The one who created the content
*   Includes: name, email, and timestamp of when the changes were made

**Committer**

*   The person who **applied/committed** the changes to the repository
*   The one who recorded the commit
*   Includes: name, email, and timestamp of when it was committed

### When They Differ

In most cases, author and committer are the **same person**. But they differ in scenarios like:

1.  **Patch workflows**: Someone emails a patch, another person applies it
2.  **Cherry-picking**: You cherry-pick someone else's commit to another branch
3.  **Rebasing**: The committer date/info updates, but author stays original
4.  **Pull requests**: A maintainer merges/rebases someone else's PR
5.  **Applying patches**: Using \`git am\` to apply patches from email

### Example Scenario

\`\`\`plaintext
Author:     Alice <alice@example.com>  (wrote the code on Monday)
Committer:  Bob <bob@example.com>      (applied it on Tuesday)
\`\`\`

This would happen if Alice submitted a patch and Bob (the maintainer) committed it to the repository.

### In Your JSON File

Looking at the file you opened, it likely has:

*   \`author\`: Who wrote the code
*   \`email\`: Author's email
*   (May also have committer fields if they're different from author)

In open source projects, preserving the original author information is important for attribution, even when someone else commits the changes.

### Contributor (GitHub/Platform concept, Gitee dont get this contributor in their statistic)

*   **Anyone who has commits merged into the repository**
*   This is a GitHub UI aggregation, not a Git concept. (it uses git commit.author attribution)
*   Shown on the "Contributors" page (what you're viewing in the screenshot)
*   Includes statistics like:
    *   Total commits
    *   Lines added (++)
    *   Lines deleted (--)
    *   Contribution timeline

## commit.author vs author

\`\`\`json
{
  "sha": "1b1850ee59ec6f6e8a67106f429eae56542c1133",
  "node_id": "C_kwDOP2Zrm9oAKDFiMTg1MGVlNTllYzZmNmU4YTY3MTA2ZjQyOWVhZTU2NTQyYzExMzM",
  "commit": {
    "author": {
      "name": "lexicalmathical",
      "email": "lexicalmathical@gmail.com",
      "date": "2025-11-02T10:34:22Z"
    },
    "committer": {
      "name": "lexicalmathical",
      "email": "lexicalmathical@gmail.com",
      "date": "2025-11-02T10:34:22Z"
    },
    "message": "Fix AnalysisView to load from database when authenticated..."
  },
  "author": null,
  "committer": null
}
\`\`\`

They represent different things:

### \`commit.author\`

*   This is the **Git commit author** information
*   Contains: name, email, and date from the Git commit metadata

### \`author\`

\`\`\`json
"author": null
\`\`\`

*   This is the **GitHub user account** object
*   It's \`null\` here, meaning the email \`lexicalmathical@gmail.com\` is not associated with a GitHub account (or the account couldn't be matched)

### Key Difference

This is a **GitHub API response** structure that includes:

*   **Git-level data** (\`commit.author\`): Raw Git commit information
*   **GitHub-level data** (\`author\`): The GitHub user profile who made the commit

If the author had a linked GitHub account, it would show something like:

\`\`\`json
"author": {
  "login": "lexicalmathical",
  "id": 12345,
  "avatar_url": "...",
  ...
}
\`\`\`

So \`commit.author\` is always the Git metadata, while \`author\` is the GitHub user association (which can be \`null\`).

## diff/patch 区别

\`\`\`python
diff --git a/foo.js b/foo.js
index e69de29..4b825dc 100644
--- a/foo.js
+++ b/foo.js
@@ -1,3 +1,5 @@
+const x = 1;
\`\`\`

*   Shows:
    *   file paths
    *   added / removed lines
*   Does **not** include:
    *   commit metadata
    *   author info
    *   commit message
*   Best for:
    *   LLM code-quality analysis
    *   Logic changes
    *   Style / architecture judgment

👉 **Use this when your LLM is "reviewing code".**

\`\`\`python
From 9fceb02 Mon Sep 17 00:00:00 2001
From: Alice <alice@example.com>
Date: Tue, 24 Dec 2024 10:00:00 +0800
Subject: [PATCH] Add x initialization

diff --git a/foo.js b/foo.js
...
\`\`\`

*   Includes:
    *   commit SHA
    *   author
    *   date
    *   commit message
*   Same diff body as \`.diff\`
*   Best for:
    *   reproducing commits
    *   tooling
    *   provenance / intent analysis

👉 **Use this when your LLM also evaluates commit intent or discipline.**

## 使用Commit or PR

### Commit

*   A **snapshot** of your code at a specific point in time
*   Contains changes to files (additions, deletions, modifications)
*   Has a unique SHA identifier (e.g., \`3413f33\`)
*   Lives in your Git history
*   Can be local (on your machine) or pushed to remote (GitHub)

**Example:**

\`\`\`plaintext
commit 3413f33
Author: Carter
Date: Dec 20, 2025

    docs: add MIT License

    - Added LICENSE file
    - Updated README
\`\`\`

---

### Pull Request (PR)

*   A **collection of one or more commits** that you want to merge into a branch
*   A GitHub/GitLab/Bitbucket feature (not part of Git itself)
*   A **request for review** and discussion before merging
*   Contains:
    *   Multiple commits
    *   Conversation/comments
    *   Code review
    *   CI/CD checks
    *   The diff of all commits combined

**Example:**

\`\`\`plaintext
PR #123: Add user authentication feature
├── commit 1: Add login form UI
├── commit 2: Implement JWT authentication
├── commit 3: Add password hashing
└── commit 4: Fix typo in error message

Total changes: +500 lines, -50 lines across 12 files
\`\`\`

---

### Key Differences

| Aspect | Commit | Pull Request |
| --- | --- | --- |
| **Scope** | Single snapshot | Multiple commits |
| **Purpose** | Record changes | Request to merge changes |
| **Location** | Git (local/remote) | GitHub/GitLab (remote only) |
| **Collaboration** | Individual action | Team review process |
| **Contains** | Code changes | Commits + discussion + reviews |

Commits alone don't show:

*   ❌ Why they made decisions
*   ❌ How they collaborate
*   ❌ How they respond to feedback
*   ❌ Their communication clarity
*   ❌ Their testing philosophy
*   ❌ The complete feature context

但是并不是每一个仓库都遵循PR机制, 有一些是直接push 到分支

\`\`\`plaintext
Does repo have PRs (>5 PRs by user)?
├─ YES → Use PR-based evaluation (full context)
│   └─ Supplement with commit patterns for extra signals
│
└─ NO → Use commit-based evaluation
    ├─ Group commits into logical features
    ├─ Analyze commit messages heavily
    ├─ Infer quality from code patterns
    └─ Note: "Collaboration data unavailable"
\`\`\`
  `.trim()
};
