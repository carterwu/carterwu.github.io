# Git Identity Evidence for GitHub and Gitee Evaluation

## Q1: Can one GitHub or Gitee account use several Git author names or emails?

Yes. A single platform account can be associated with commits made from different machines using different local Git configs.

For example:

```bash
# Machine A
git config --global user.name "Carter Wu"
git config --global user.email "personal@example.com"

# Machine B
git config --global user.name "Carter Wu"
git config --global user.email "work@example.com"
```

This can still resolve to one GitHub or Gitee account if those emails are bound to the same platform account.

The important point is that Git stores only free-form name and email strings. GitHub and Gitee then try to map those strings to a real platform account.

## Q2: Is `commit.author` more important than `commit.committer` for contribution?

Usually yes for coding contribution, but not always for overall engineering contribution.

- `commit.author` means the person who originally wrote the change.
- `commit.committer` means the person, tool, or system that applied that commit object to the repository.

For capability evaluation, they should be interpreted separately:

| Field | Main meaning | Best used for |
|---|---|---|
| `commit.author` | Original writer of the change | Implementation, code ownership, bug fixing, feature work |
| `commit.committer` | Person or system that applied the commit | Integration, rebasing, cherry-picking, release work, maintenance |

If Alice writes a patch and Bob applies it, the commit may look like this:

```text
Author:    Alice <alice@example.com>
Committer: Bob <bob@example.com>
```

That should not be read as Bob writing Alice's code. It means Alice is the implementation signal, while Bob is the integration signal.

## Q3: Can someone use a fake email in Git config and push it to GitHub or Gitee?

Yes, technically. Git itself does not verify that `user.email` is real or belongs to the person making the commit.

For example:

```bash
git config user.name "Some Name"
git config user.email "fake@example.com"
git commit -m "Example commit"
git push
```

The commit can still exist in repository history if the authenticated pushing account has permission to push.

However, the platform may not attribute that commit to the pusher. GitHub and Gitee generally need the commit email to match an email bound or verified on the platform account.

## Q4: What happens if the raw commit email is fake, old, or not bound to any account?

Usually the commit remains valid, but account attribution becomes weak or missing.

Possible outcomes:

- The commit appears in repository history.
- It may not count toward the user's contribution graph.
- It may not link to the user's GitHub or Gitee profile.
- The platform account field may be `null` or unresolved.
- If the email belongs to another verified account, it may be attributed to that other account.
- If signed commits, verified authors, or branch protection rules are required, the commit may be rejected or shown as unverified.

Using someone else's email or name intentionally is misleading and should not be treated as reliable evidence.

## Q5: Does Gitee behave the same as GitHub for these attribution rules?

Mostly yes.

Gitee also depends on the relationship between raw Git metadata and the platform account. If local Git email does not match the email configured on Gitee, contributions may not be counted or may show as an unknown/visitor identity.

So the same practical rule applies:

```text
The authenticated account that pushes the commit is not enough by itself.
The commit email should match an email bound to the platform account.
```

For privacy, prefer the platform's no-reply/private email feature instead of inventing a fake email.

## Q6: Should evaluation use raw `commit.author` / `commit.committer`, or GitHub/Gitee account identity?

Use the platform-resolved account identity as the primary identity signal, and keep raw Git metadata as supporting evidence.

Recommended priority:

1. Platform-resolved account ID/login.
2. Verified or bound email associated with that account.
3. Raw Git `commit.author` and `commit.committer` metadata.
4. Push actor or event actor.

Raw Git fields are easy to misconfigure or fake. Platform-resolved accounts are not perfect, but they are usually safer for attribution.

## Q7: Can the commit's GitHub or Gitee account field be `null`?

Yes. This is normal.

A GitHub API commit response, for example, can contain both raw Git metadata and resolved platform account objects:

```json
{
  "commit": {
    "author": {
      "name": "Alice",
      "email": "alice@example.com"
    },
    "committer": {
      "name": "Bob",
      "email": "bob@example.com"
    }
  },
  "author": null,
  "committer": {
    "login": "bob"
  }
}
```

This means:

- `commit.author.email` is raw Git metadata.
- `author` is the platform-resolved account object.
- `author: null` means the platform did not map the raw author email to a user account.
- `committer.login: "bob"` means the committer did resolve to a platform account.

## Q8: Why can the platform account field be `null`?

Common reasons:

- The email is not added or verified on any platform account.
- The email is fake, mistyped, old, or no longer bound.
- The user used another machine with different `git config user.email`.
- The commit was imported from another system such as GitLab, SVN, Gerrit, or mailing-list patches.
- The commit was made by automation with an unlinked email.
- A GitHub no-reply email is pushed to Gitee, or a Gitee no-reply email is pushed to GitHub.
- The account was deleted, renamed, suspended, private, or hidden by enterprise settings.
- The platform API does not expose the mapping in that response.
- Platform indexing or cache has not caught up yet.

A `null` account does not mean the commit is invalid. It only means the platform did not resolve the raw Git identity to a platform user.

## Q9: How should engineering capability evidence be modeled?

Do not collapse everything into one raw commit count. Store separate evidence dimensions.

Suggested model:

```json
{
  "platform": "github",
  "repo": "owner/repo",
  "sha": "abc123",
  "platform_author_login": "alice",
  "platform_author_id": 12345,
  "platform_committer_login": "bob",
  "platform_committer_id": 67890,
  "git_author_name": "Alice A.",
  "git_author_email": "alice@company.com",
  "git_committer_name": "Bob B.",
  "git_committer_email": "bob@company.com",
  "pushed_by": "carol",
  "identity_confidence": {
    "author": "high",
    "committer": "high"
  }
}
```

Interpretation:

| Evidence type | Preferred identity | Evaluation meaning |
|---|---|---|
| Implementation evidence | Platform-resolved author account | Code writing, design, debugging, ownership |
| Integration evidence | Platform-resolved committer account | Applying patches, rebasing, merging, release maintenance |
| Delivery evidence | PR author, merge actor, push actor | Shipping workflow and project delivery |
| Review evidence | PR review/comment account | Code review, collaboration, mentoring, design judgment |
| Raw metadata evidence | Git author/committer name and email | Audit trail and fallback identity matching |

## Q10: How should identity confidence be assigned?

A simple confidence model:

| Confidence | Signals |
|---|---|
| High | Platform account resolves; email is bound/verified; PR or review activity supports the same identity |
| Medium | Raw email is known and consistent across repos/time, but platform account is missing |
| Low | Only raw name matches; email is fake-looking, shared, outdated, or inconsistent |

For evaluation, raw Git data should not be ignored, but it should not be the primary identity key when platform account data is available.

## Final Recommendation

For GitHub and Gitee engineering evaluation:

1. Use platform-resolved account identity as the main attribution key.
2. Use `commit.author` mostly for implementation evidence.
3. Use `commit.committer` mostly for integration and maintenance evidence.
4. Keep raw Git name/email for audit, fallback matching, and debugging.
5. Assign confidence levels instead of assuming every commit maps cleanly to a real person.
6. Combine commit evidence with PR reviews, issues, comments, tests, and code impact before judging engineering capability.

In short: evaluate code authorship from platform-resolved author accounts when possible, evaluate maintenance from platform-resolved committer accounts, and treat raw Git metadata as useful but weak evidence.
