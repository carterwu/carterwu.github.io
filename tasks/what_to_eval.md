# How to Fetch Repo Data for Evaluation

Reference: https://alidocs.dingtalk.com/i/spaces/1nRzl5BRdA23dXbx/overview?rnd=0.7540390410703759

---

## Problem

We need repo data for two distinct purposes:

1. **Running tests / compiling** — requires actual files on disk
2. **Evaluating an author's engineering capability with an LLM** — requires diffs and code context

These two purposes have fundamentally different data requirements. A test runner needs a filesystem; an LLM reads text. This distinction drives the entire decision below.

---

## Key Insight

An LLM reads code — it doesn't run it. For LLM-based evaluation, we only need enough context for the model to judge the quality of changes:

| Input | What it reveals |
|---|---|
| Diffs | Code change quality, reasoning, refactoring skill, test coverage habits |
| Full files of changed code | Whether changes fit surrounding code style, module understanding |
| Repo tree structure | Project organization, separation of concerns, config hygiene |

A full clone is unnecessary for this purpose. We just need diffs + file context.

---

## Options Considered

### 1. `git clone` (full clone)

- Downloads **entire repository history** — every version of every file that ever existed
- Git stores full snapshots (blobs), not diffs. Each commit points to complete file copies. Diffs are computed on the fly, never stored. (Packfiles delta-compress similar blobs as a storage optimization, but the data model is full snapshots.)
- A repo with 5MB of current source could have a 500MB+ `.git/` folder
- **Pros:** full history available locally, can run any git command
- **Cons:** heavy on disk and network, overkill if you don't need history

### 2. `git clone --depth 1` (shallow clone)

- Downloads only the latest commit snapshot, no history
- Much lighter than full clone
- **Pros:** real files on disk, can run tests, small footprint
- **Cons:** still requires Git installed, `.git/` directory overhead, updating requires `git fetch --depth 1 && git reset --hard`

### 3. GitHub Archive API (tarball)

- `GET /repos/{owner}/{repo}/tarball/{ref}` — downloads a `.tar.gz` of the repo at a specific commit
- No `.git/` directory at all — pure source files
- **Pros:** lightest possible download, no Git dependency, simple extract-and-use
- **Cons:** no incremental update — must re-download on each new commit

### 4. GitHub REST API (targeted fetching)

- Fetches only specific pieces (diffs, file contents, tree structure) via API calls
- **Pros:** minimal data transfer, surgical precision, works anywhere with HTTP
- **Cons:** cannot run tests (no files on disk), subject to API rate limits (5,000 req/hour)

### Comparison

| Approach | Files on disk | History | Data transfer | Good for tests | Good for LLM eval |
|---|---|---|---|---|---|
| Full clone | Yes | Full | Heavy | Yes | Overkill |
| Shallow clone | Yes | None | Medium | Yes | Overkill |
| Archive API (tarball) | Yes | None | Light | Yes | Overkill |
| REST API (targeted) | No | N/A | Minimal | No | Yes |

No single approach satisfies both needs efficiently. Full clone / shallow clone can do everything but waste resources on LLM evaluation. The REST API is perfect for LLM evaluation but can't run tests.

---

## Decision: Two-Method Approach

Combine the best tool for each purpose:

1. **GitHub Archive API** — for tasks that need files on disk (running tests, compiling, static analysis). Re-download when the target commit changes.

2. **GitHub REST API (targeted fetching)** — for LLM-based evaluation. Fetch only diffs + file context + repo structure, then feed to the LLM for scoring.

### Pipeline

```
New commit detected
  ├── Archive API → download tarball → extract → run tests / compile
  └── REST API → fetch diff + file context → feed to LLM → evaluate
```

---

## Implementation: REST API for LLM Evaluation

The REST API approach fetches data at three levels of context, depending on how much the LLM needs:

### Level 1: Just the Diff

```plaintext
GET /repos/{owner}/{repo}/commits/{ref}
Headers: Accept: application/vnd.github.v3.diff
```

### Level 2: Diff + Full File Contents

Step 1 — Get the diff (as above).

Step 2 — Get file contents for each changed file:

```plaintext
GET /repos/{owner}/{repo}/contents/{path}?ref={branch_or_commit_sha}
```

- Returns base64 encoded content
- Limited to files < 1MB
- Can specify `ref` to get the file at a specific commit

For files > 1MB, use the Git Blobs API:

```plaintext
GET /repos/{owner}/{repo}/git/blobs/{file_sha}
```

### Level 3: Diff + File Context + Related Files + Repo Structure

Step 1 — Get the diff.

Step 2 — Get repository tree structure:

```plaintext
GET /repos/{owner}/{repo}/git/trees/{tree_sha}?recursive=1
```

- `tree_sha` can be a commit SHA or branch name
- `recursive=1` gets the entire tree (up to 100,000 entries)
- Returns all files with their paths, SHAs, and sizes

Step 3 — Get specific file contents (Contents API or Blobs API as needed).

Step 4 (optional) — Get related files context:

```plaintext
GET /repos/{owner}/{repo}/contents/{directory_path}
```

### Combined Pattern

```plaintext
# 1. Get diff
GET /repos/{owner}/{repo}/commits/{ref}
Headers: Accept: application/vnd.github.v3.diff

# 2. Get tree structure for context
GET /repos/{owner}/{repo}/git/trees/{commit_sha}?recursive=1

# 3. Get specific file contents
GET /repos/{owner}/{repo}/contents/{path}?ref={commit_sha}

# 4. Get related files context
GET /repos/{owner}/{repo}/contents/{directory_path}
```

Optionally use the **GraphQL API** for richer PR/review metadata and fewer round-trips.

---

## Files to Exclude

- Vendor files
- Lockfiles
- Generated code
- Large binary files (images, videos, datasets)

---

## API Constraints

| Constraint | Limit |
|---|---|
| Rate limit (authenticated) | 5,000 requests/hour |
| Contents API file size | < 1MB (base64 encoded) |
| Blobs API file size | Any size |
| Tree recursion | 100,000 entries |

**Caching:** Use ETags and `If-None-Match` headers for efficient caching.

**Media types:**
- `application/vnd.github.v3.diff` — diff format
- `application/vnd.github.v3.patch` — patch format
- `application/vnd.github.v3.raw` — raw file content

---

## Evaluation Standard

> **[Engineer Level Evaluation Standard](https://gitee.com/zgcai/oscanner/blob/main/engineer_level.md)** — the rubric used to assess an engineer's capability based on their code contributions.

---

## Sources

- [REST API endpoints for commits - GitHub Docs](https://docs.github.com/en/rest/commits/commits)
- [REST API endpoints for repository contents - GitHub Docs](https://docs.github.com/en/rest/repos/contents)
- [REST API endpoints for Git trees - GitHub Docs](https://docs.github.com/en/rest/git/trees)
- [How to Get Pull Request Data Using GitHub API | Towards Data Science](https://towardsdatascience.com/how-to-get-pull-request-data-using-github-api-b91891cbd54c/)
- [GitHub REST API | Tree API to get remote repo files list](https://itsallbinary.com/github-rest-api-tree-api-to-get-remote-repo-files-list-metadata-recursively-programmatically-without-cloning-in-local/)
