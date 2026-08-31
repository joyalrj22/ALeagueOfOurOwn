---
description: Conductor — implement a track by executing its plan.md task-by-task
argument-hint: "[track id or ALE-XXX] [--loop|--manual] (optional; defaults to next incomplete)"
allowed-tools: Read, Write, Edit, Glob, Bash
---

# /conductor:implement

Execute a Conductor track by working its `plan.md` task-by-task, following
`conductor/workflow.md` — the single source of truth for how each task is
implemented, tested, and committed.

Requested track: **$ARGUMENTS**

## Protocol

1. **Select the track.** Resolve `$ARGUMENTS` to a track directory under
   `conductor/tracks/` (by `track_id` or by `metadata.json.linear`). If
   empty, look for an In Progress Linear issue with a matching track via the
   Linear MCP `list_issues`; if none, ask which track to work. Confirm
   before proceeding.

2. **Mark in progress.** Set the Linear issue to **In Progress**
   (`mcp__Linear__save_issue` with the issue `id` and
   `state: "In Progress"`). There is no local status field to sync — the
   issue is it.

3. **Resolve the loop/manual switch and write the run sentinel.**
   Precedence: `--loop`/`--manual` in `$ARGUMENTS` → project default in
   `conductor/conductor.config.json` (`implement_mode`) → `manual`. Write
   `conductor/.loop-state.json` (gitignored, per-run):
   ```json
   { "track_id": "<this track id>", "mode": "loop|manual",
     "iterations": 0, "max_iterations": 60,
     "last_done_count": 0, "stall_strikes": 0 }
   ```
   In `manual` mode the `Stop` hook is a no-op and the human-gated Phase
   Completion Protocol runs unchanged. In `loop` mode the hook re-engages
   this session task-by-task until `plan.md` is all `[x]` or a guard trips.
   Mid-run, the user can flip modes with `/conductor:loop on|off`.

4. **Load context.** Read `plan.md`. Fetch the Linear issue description (the
   spec) via `mcp__Linear__get_issue` and confirm the plan still matches
   its scope. Announce `Implementing ALE-XXX via track <id>`.

5. **Execute tasks.** Work `plan.md` tasks in order, following
   `conductor/workflow.md` → **Standard Task Workflow** for each one, and the
   **Phase Completion Verification and Checkpointing Protocol** at each phase
   boundary.

6. **Finalize.** When all tasks are `[x]`: re-read the Linear issue and
   confirm its acceptance criteria still match what shipped — reconcile
   before closing if scope drifted. Set the Linear issue to **Done** via
   `mcp__Linear__save_issue` (this workspace has no separate In Review
   state — see `METHODOLOGY.md` §4). Delete
   `conductor/.loop-state.json` (the `Stop` hook also self-deletes it on a
   complete plan, but remove it here for cleanliness). Offer to archive the
   track directory to `conductor/archive/<track_id>/`.

Keep edits scoped to the selected track. On a hard failure, stop and report
rather than guessing — don't retry the same failing step more than twice.
