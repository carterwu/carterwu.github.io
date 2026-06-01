# Git Identity Evidence: GitHub and Gitee Commit Fields

## Typical Commit Example

This Gitee API response is a good example because the raw Git identity exists, but the platform account identity is unresolved:

```json
{
  "url": "https://gitee.com/api/v5/repos/zgcai/oscanner/commits/851913683009e0e75f924daa7b625044dba872a9",
  "sha": "851913683009e0e75f924daa7b625044dba872a9",
  "html_url": "https://gitee.com/zgcai/oscanner/commit/851913683009e0e75f924daa7b625044dba872a9",
  "comments_url": "https://gitee.com/api/v5/repos/zgcai/oscanner/commits/851913683009e0e75f924daa7b625044dba872a9/comments",
  "commit": {
    "author": {
      "name": "CarterWu",
      "date": "2026-06-01T14:26:22+08:00",
      "email": "nkwuyanbiao@163.com"
    },
    "committer": {
      "name": "CarterWu",
      "date": "2026-06-01T14:26:22+08:00",
      "email": "nkwuyanbiao@163.com"
    },
    "message": "feat: improve commit author matching",
    "tree": {
      "sha": "32750aff3fe707e83f4aa7f37ae0263e563d8dbc",
      "url": "https://gitee.com/api/v5/repos/zgcai/oscanner/git/trees/32750aff3fe707e83f4aa7f37ae0263e563d8dbc"
    }
  },
  "author": null,
  "committer": null,
  "parents": [
    {
      "sha": "8823336627926894835633ecd6a867554e8593ad",
      "url": "https://gitee.com/api/v5/repos/zgcai/oscanner/commits/8823336627926894835633ecd6a867554e8593ad"
    }
  ]
}
```

Key observation:

```text
commit.author    exists: raw Git author metadata
commit.committer exists: raw Git committer metadata
author           null: platform did not resolve the Git author to a Gitee account
committer        null: platform did not resolve the Git committer to a Gitee account
```

## Q1: What is the difference between `author`, `commit.author`, and `commit.committer`?

They are different layers of identity.

| Field | Layer | Meaning |
|---|---|---|
| `commit.author` | Raw Git metadata | The person recorded by Git as the original writer of the change |
| `commit.committer` | Raw Git metadata | The person/tool recorded by Git as the one who applied the commit object |
| `author` | Platform account mapping | GitHub/Gitee account resolved from `commit.author.email`, or `null` |
| `committer` | Platform account mapping | GitHub/Gitee account resolved from `commit.committer.email`, or `null` |

In short:

```text
commit.author / commit.committer = data stored inside the Git commit object
author / committer               = GitHub/Gitee's best-effort account mapping
```

## Q2: Why are `author` and `committer` null in the example?

Because Gitee could not map the raw Git email to a Gitee account in that API response.

The raw Git metadata says:

```text
commit.author.email    = nkwuyanbiao@163.com
commit.committer.email = nkwuyanbiao@163.com
```

But the platform-level fields say:

```text
author    = null
committer = null
```

That means the commit is valid, but Gitee did not expose a resolved platform user for that author or committer.

Common reasons:

- The email is not bound to any Gitee account.
- The email is bound but not verified or not visible for this API mapping.
- The email belongs to a different platform account.
- The commit was pushed by someone else or imported from another system.
- The platform account exists, but Gitee did not resolve it in this response.

## Q3: In one commit, can the GitHub/Gitee account `author` be null?

Yes.

The platform account `author` can be `null` even when `commit.author.name` and `commit.author.email` exist.

Example meaning:

```json
{
  "commit": {
    "author": {
      "name": "CarterWu",
      "email": "nkwuyanbiao@163.com"
    }
  },
  "author": null
}
```

This means:

```text
Git knows the raw author name/email.
GitHub/Gitee did not map that raw author email to a platform account.
```

So for data collection, treat platform `author` as optional.

## Q4: In one commit, can the platform account email be null?

Yes.

Even when GitHub/Gitee resolves `author` to a platform account, the account email may be hidden, omitted, or unavailable through the API.

Do not assume this exists:

```text
author.email
committer.email
```

For platform identity, prefer stable account fields when available:

```text
author.id
author.login
author.username
committer.id
committer.login
committer.username
```

The raw Git emails are here instead:

```text
commit.author.email
commit.committer.email
```

## Q5: In one commit, can `commit.author.name` and `commit.author.email` be null?

Normally, no.

For a normal Git commit, the raw commit object contains an author line with name, email, and timestamp. GitHub/Gitee APIs usually return these as strings:

```text
commit.author.name
commit.author.email
commit.author.date
```

But two cautions matter:

1. The values are not verified. They can be fake, old, mistyped, or from another machine.
2. Very unusual or malformed imported commits may have empty or strange values, so parsers should still handle missing/empty values defensively.

Practical rule:

```text
Do not expect commit.author to identify a real platform user.
Expect it to identify what the Git commit claims.
```

## Q6: In one commit, can `commit.committer.name` and `commit.committer.email` be null?

Normally, no.

For a normal Git commit, the raw commit object also contains a committer line with name, email, and timestamp. GitHub/Gitee APIs usually return:

```text
commit.committer.name
commit.committer.email
commit.committer.date
```

But, like `commit.author`, these values are raw Git metadata and are not proof of a real account.

## Q7: Why should we use email rather than author name to gather user contributions in repos?

Because raw author names are too weak for identity matching.

Names have many problems:

- Many people can share the same name.
- One person can use many names, such as `CarterWu`, `Carter Wu`, or `carter`.
- Names are easy to fake.
- Names often change across machines or companies.
- Names are not the primary field GitHub/Gitee use for commit account mapping.

Emails are better than names because GitHub/Gitee usually map raw commits to platform accounts through the commit email.

However, the best identity key is still the platform account ID/login when available:

```text
Best:      platform author/committer id or login
Fallback:  raw Git email
Weakest:   raw Git name
```

So the recommended matching order is:

1. Use resolved GitHub/Gitee account ID/login if `author` or `committer` is not null.
2. If no platform account is resolved, use `commit.author.email` or `commit.committer.email` as fallback evidence.
3. Use `commit.author.name` or `commit.committer.name` only as weak supporting evidence.

## Q8: Should contribution evaluation use `commit.author` or `commit.committer`?

Use both, but for different meanings.

| Field | Evaluation perspective |
|---|---|
| `commit.author` | Implementation evidence: who originally wrote the code/change |
| `commit.committer` | Integration evidence: who applied, rebased, cherry-picked, or committed the change |
| Platform `author` | Higher-confidence implementation identity when resolved |
| Platform `committer` | Higher-confidence integration identity when resolved |

For engineering capability evaluation:

```text
Coding contribution      -> prefer platform author, fallback to commit.author.email
Maintenance contribution -> prefer platform committer, fallback to commit.committer.email
Review/collaboration     -> use PR reviews, comments, issues, and merge events
```

Do not collapse all of these into one raw commit count.

## Q9: If the authenticated user pushes a commit, does that prove they are the author?

No.

The account that pushes the commit is not necessarily the same as:

```text
commit.author
commit.committer
platform author
platform committer
```

Examples:

- A maintainer can push a patch written by someone else.
- A CI bot can push generated commits.
- A user can push commits with a fake or old email.
- A mirror/import job can push commits originally made elsewhere.

Push actor is delivery evidence, not direct authorship evidence.

## Q10: Are GitHub and Gitee the same in these fields?

They are conceptually very similar.

| Concept | GitHub | Gitee |
|---|---|---|
| Raw Git author | `commit.author` | `commit.author` |
| Raw Git committer | `commit.committer` | `commit.committer` |
| Platform author account | `author` | `author` |
| Platform committer account | `committer` | `committer` |
| Can platform account be null? | Yes | Yes |
| Raw name/email verified by Git? | No | No |
| Account mapping mainly depends on email? | Yes | Yes |

Main practical difference:

```text
GitHub and Gitee may expose different account object fields,
privacy behavior, and contribution counting details.
```

But the evaluation logic should be the same:

1. Prefer platform account identity when resolved.
2. Use raw Git email as fallback evidence.
3. Treat raw Git name as weak evidence.
4. Keep author and committer as separate contribution dimensions.

## Q11: What data should an evaluator store for each commit?

Store both raw Git metadata and platform-resolved identity.

```json
{
  "platform": "gitee",
  "repo": "zgcai/oscanner",
  "sha": "851913683009e0e75f924daa7b625044dba872a9",
  "html_url": "https://gitee.com/zgcai/oscanner/commit/851913683009e0e75f924daa7b625044dba872a9",
  "git_author_name": "CarterWu",
  "git_author_email": "nkwuyanbiao@163.com",
  "git_committer_name": "CarterWu",
  "git_committer_email": "nkwuyanbiao@163.com",
  "platform_author_id": null,
  "platform_author_login": null,
  "platform_committer_id": null,
  "platform_committer_login": null,
  "identity_confidence": {
    "author": "medium",
    "committer": "medium"
  }
}
```

Example confidence rules:

| Confidence | Meaning |
|---|---|
| High | Platform account resolves to a stable account ID/login |
| Medium | Platform account is null, but raw email is known and consistent |
| Low | Only raw name matches, or email is fake/unknown/inconsistent |

## Final Answer

For GitHub/Gitee repo contribution evaluation:

```text
Do not use raw author name as the main identity key.
Prefer platform account ID/login when available.
Use raw Git email as fallback matching evidence.
Use raw Git name only as weak supporting evidence.
Separate author contribution from committer contribution.
```

In the example commit, `commit.author` and `commit.committer` exist, but `author` and `committer` are null. That means the raw Git metadata is present, while Gitee did not resolve either identity to a platform account.
