# Stay on current branch

Keeps all code edits on the currently checked-out git branch. Prohibits
creating, switching to, or renaming branches unless the user explicitly
requests it in the same turn. Use always at session start, before any git
command, when implementing features, committing, pushing, or opening PRs.

**Default:** work on whatever branch is already checked out. All edits and
commits stay there until the user explicitly asks for a new branch.

## Hard rule

Do **not** create, switch to, or rename a branch unless the user
**explicitly** requests it in the **same turn**, using clear intent such as:

- "create a branch", "new branch", "branch off", "checkout -b", "git switch -c"
- "rename this branch", "move this work to a branch called …"

If the user did not ask, **never** run:

- `git checkout -b …` / `git switch -c …`
- `git branch …` (when the goal is to start work on a new branch)
- `gh pr create` flows that silently create a branch first

## Allowed without explicit branch request

- `git status`, `git diff`, `git log`, `git branch` (read-only)
- `git add`, `git commit` on the **current** branch when the user asked to commit
- `git push` on the **current** branch when the user asked to push
- `git checkout <existing-branch>` only when the user explicitly asked to
  switch to that branch by name

## Why

This repo has a `staging` → `main` merge-order requirement enforced by
`.github/workflows/pr-merged-to-staging.yml`. Silently branching off the
wrong base, or renaming a branch mid-work, breaks that check and confuses PR
history. Staying put by default avoids both.
