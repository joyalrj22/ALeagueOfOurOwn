---
description: Conductor — revert a track / phase / task by reverting its git commits
argument-hint: "[track|phase|task <name>] (optional; guided menu if omitted)"
allowed-tools: Read, Edit, Glob, Bash(git:*)
---

# /conductor:revert

Revert a logical unit of Conductor work by finding and reverting its git
commits, then resyncing `plan.md`. Multiple confirmation checkpoints are
mandatory — never revert without explicit approval.

Requested target: **$ARGUMENTS**

## Protocol

1. **Select the target.** If named, locate it in the relevant `plan.md` and
   confirm. Otherwise scan active tracks and offer up to 4 candidates
   (in-progress first) to choose from.

2. **Reconcile with git.** Collect the implementation commit SHAs recorded in
   `plan.md` for the target scope, plus their plan-update commits (plus, for
   a whole-track revert, the track-creation commit). Locate them with
   `git log`; if a recorded SHA is missing (rewritten history), find the
   closest message match and confirm. Warn on merge commits.

3. **Present the plan.** Show the exact commits and the action
   (`git revert --no-edit <sha>`, newest → oldest). Ask for a final go/no-go.

4. **Execute & verify.** On approval, run the reverts in order. On conflict,
   stop and hand back manual-resolution instructions. On success, edit the
   affected `plan.md` markers back to `[ ]`/`[~]` and commit the correction.

5. **Linear.** If the revert undoes completed work, set the Linear issue
   status back (e.g. Done → In Progress) via the Linear MCP.

6. **Announce** completion and the resynced plan state.
