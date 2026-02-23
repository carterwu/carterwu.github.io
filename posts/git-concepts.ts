import type { BlogPost } from './hello-github';

export const post: BlogPost = {
  slug: 'git-concepts',
  title: 'Git Concepts: Author vs Committer vs Contributor',
  date: '2026-02-23',
  author: 'Carter Wu',
  content: `
## Author vs Committer

**Author**
- The person who originally **wrote the code/changes**
- The one who created the content
- Includes: name, email, and timestamp of when the changes were made

**Committer**
- The person who **applied/committed** the changes to the repository
- The one who recorded the commit
- Includes: name, email, and timestamp of when it was committed

### When They Differ

In most cases, author and committer are the **same person**. But they differ in scenarios like:

1. **Patch workflows**: Someone emails a patch, another person applies it
2. **Cherry-picking**: You cherry-pick someone else's commit to another branch
3. **Rebasing**: The committer date/info updates, but author stays original
4. **Pull requests**: A maintainer merges/rebases someone else's PR
5. **Applying patches**: Using \`git am\` to apply patches from email

### Example

\`\`\`
Author:     Alice <alice@example.com>  (wrote the code on Monday)
Committer:  Bob <bob@example.com>      (applied it on Tuesday)
\`\`\`

This would happen if Alice submitted a patch and Bob (the maintainer) committed it to the repository.

---

## commit.author vs author (GitHub API)

In the GitHub API response for a commit, there are two different "author" fields:

**\`commit.author\`** — Git commit metadata:

\`\`\`json
"commit": {
  "author": {
    "name": "lexicalmathical",
    "email": "lexicalmathical@gmail.com",
    "date": "2025-11-02T10:34:22Z"
  }
}
\`\`\`

- This is the **Git-level** author information
- Contains: name, email, and date from the raw Git commit

**\`author\`** (top-level) — GitHub user account:

\`\`\`json
"author": null
\`\`\`

- This is the **GitHub user account** object
- \`null\` means the email is not associated with a GitHub account
- If linked, it would contain \`login\`, \`id\`, \`avatar_url\`, etc.

So \`commit.author\` is always the Git metadata, while \`author\` is the GitHub user association (which can be \`null\`).

---

## Contributor (GitHub/Platform Concept)

- **Anyone who has commits merged into the repository**
- This is a GitHub UI aggregation, not a Git concept (it uses \`commit.author\` attribution)
- Shown on the "Contributors" page
- Includes statistics like:
  - Total commits
  - Lines added (++)
  - Lines deleted (--)
  - Contribution timeline

Note: Gitee does not count contributors the same way in their statistics.
  `.trim()
};
