## What to evaluate
https://alidocs.dingtalk.com/i/spaces/1nRzl5BRdA23dXbx/overview?rnd=0.7540390410703759

### patch diffs 

### If you’re feeding patch diffs (recommended) + files changed in those diffs (selectively, not all files)

Median target: ~60k tokens input

Typical workable band: 30k–120k tokens

Hard cap (cost/control): 150k–200k tokens

Why: in many real repos, a “typical” commit is often ~20–200 changed lines; 50 commits often lands around a few thousand changed lines total. Diffs are “token-dense” (paths, +/- lines, context), but not insane unless there are vendor files / lockfiles / generated code.


### If you’re feeding full files after each commit (not recommended)

Median target: 200k–800k+ tokens
This balloons fast because you repeatedly include unchanged code. Better to use diffs + selective file snapshots.

## files need to be excluded
- vendor files
- lockfiles
- generated code
- large binary files (e.g. images, videos, datasets)