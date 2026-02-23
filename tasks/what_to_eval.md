# What to evaluate
https://alidocs.dingtalk.com/i/spaces/1nRzl5BRdA23dXbx/overview?rnd=0.7540390410703759


## Scenario 1: Just the Diff

### For Single Commit:

```plaintext
GET /repos/{owner}/{repo}/commits/{ref}
Headers: Accept: application/vnd.github.v3.diff

```
---


## Scenario 2: Diff + Same Files (Full Content)

### Step 1: Get the diff (as above)

### Step 2: Get file contents for each changed file:

```plaintext
GET /repos/{owner}/{repo}/contents/{path}?ref={branch_or_commit_sha}

```

*   Returns base64 encoded content
    
*   Limited to files < 1MB
    
*   Can specify `ref` to get the file at a specific commit
    

### For files > 1MB, use Git Blobs API:

```plaintext
GET /repos/{owner}/{repo}/git/blobs/{file_sha}

```
---

## Scenario 3: Diff + File Context + Related Files + Repo Structure

### Step 1: Get the diff (as above)

### Step 2: Get repository tree structure:

```plaintext
GET /repos/{owner}/{repo}/git/trees/{tree_sha}?recursive=1

```

*   `tree_sha` can be a commit SHA or branch name
    
*   `recursive=1` gets the entire tree (up to 100,000 entries)
    
*   Returns all files with their paths, SHAs, and sizes
    

### Step 3: Get specific file contents:

Use Contents API or Blobs API as needed for individual files

### Step 4 (Optional): Get related files context:

```plaintext
GET /repos/{owner}/{repo}/contents/{directory_path}

```

*   List contents of specific directories
    
*   Navigate the directory structure
    

---

## files need to be excluded
- vendor files
- lockfiles
- generated code
- large binary files (e.g. images, videos, datasets)


## Important Notes:

1.  **Rate Limits**: Authenticated requests get 5,000 requests/hour
    
2.  **File Size Limits**:
    
    *   Contents API: < 1MB (returns base64 encoded)
        
    *   Blobs API: Any size (recommended for large files)
        
3.  **Tree Recursion**: Limited to 100,000 entries
    
4.  **Caching Headers**: Use ETags and `If-None-Match` for efficient caching
    
5.  **Media Types**:
    
    *   `application/vnd.github.v3.diff` for diff format
        
    *   `application/vnd.github.v3.patch` for patch format
        
    *   `application/vnd.github.v3.raw` for raw file content
        

---

## Key API Patterns for Your Use Case

### For PR Analysis with Caching:

```python
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
---

## GraphQL API

optionally the **GraphQL API** for richer PR/review metadata and fewer round-trips.

---

## Decision: How to Fetch Repo Data

### The Problem

We need repo data for two distinct purposes:
1. **Running tests / compiling** — requires actual files on disk
2. **Evaluating author's engineering capability with LLM** — requires diffs and code context

### Options Considered

#### `git clone` (full clone)
- Downloads **entire repository history** — every version of every file that ever existed
- Git stores **full snapshots** (blobs), not diffs. Each commit points to complete file copies. Diffs are computed on the fly, never stored. (Packfiles delta-compress similar blobs as a storage optimization, but the data model is full snapshots.)
- A repo with 5MB of current source could have a 500MB+ `.git/` folder
- Pros: full history available locally, can run any git command
- Cons: heavy on disk and network, overkill if you don't need history

#### `git clone --depth 1` (shallow clone)
- Downloads only the latest commit snapshot, no history
- Much lighter than full clone
- Pros: real files on disk, can run tests, small footprint
- Cons: still requires Git installed, `.git/` directory overhead, updating requires `git fetch --depth 1 && git reset --hard`

#### GitHub Archive API (tarball)
- `GET /repos/{owner}/{repo}/tarball/{ref}` — downloads a `.tar.gz` of the repo at a specific commit
- No `.git/` directory at all — pure source files
- Pros: lightest possible download, no Git dependency, simple extract-and-use
- Cons: no incremental update — must re-download on each new commit

#### Scenario 3: API-based (Diff + File Context + Related Files + Repo Structure)
- Fetches only targeted pieces via GitHub REST API
- Pros: minimal data transfer, surgical precision, works anywhere with HTTP
- Cons: cannot run tests (no files on disk), subject to API rate limits (5,000 req/hour)

### What Each Approach Reveals for Engineering Evaluation

| Input | What it reveals |
|---|---|
| Diffs | Code change quality, reasoning, refactoring skill, test coverage habits |
| Full files of changed code | Whether changes fit surrounding code style, module understanding |
| Repo tree structure | Project organization, separation of concerns, config hygiene |

An LLM reads code — it doesn't run it. So for LLM-based evaluation, diffs + file context is sufficient. Full clone is unnecessary.

### Conclusion

Use a **two-method approach**:

1. **GitHub Archive API** (`GET /repos/{owner}/{repo}/tarball/{ref}`) — for tasks that need actual files on disk (running tests, compiling, static analysis). Re-download when the target commit changes.

2. **Scenario 3** (Diff + File Context + Related Files + Repo Structure via API) — for LLM-based evaluation of the author's engineering capability. Feed diffs + file context into the LLM for scoring.

### Pipeline

```
New commit detected
  ├── Archive API → download tarball → extract → run tests / compile
  └── REST API (Scenario 3) → fetch diff + file context → feed to LLM → evaluate
```

---

## Sources:

*   [REST API endpoints for commits - GitHub Docs](https://docs.github.com/en/rest/commits/commits)
    
*   [REST API endpoints for repository contents - GitHub Docs](https://docs.github.com/en/rest/repos/contents)
    
*   [REST API endpoints for Git trees - GitHub Docs](https://docs.github.com/en/rest/git/trees)
    
*   [How to Get Pull Request Data Using GitHub API | Towards Data Science](https://towardsdatascience.com/how-to-get-pull-request-data-using-github-api-b91891cbd54c/)
    
*   [GitHub REST API | Tree API to get remote repo files list](https://itsallbinary.com/github-rest-api-tree-api-to-get-remote-repo-files-list-metadata-recursively-programmatically-without-cloning-in-local/)