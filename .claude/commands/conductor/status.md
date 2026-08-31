---
description: Conductor — status overview from Linear (in-progress issues) + local plans
argument-hint: "(no args)"
allowed-tools: Read, Glob, Bash
---

# /conductor:status

Produce a status overview of Conductor tracks. Read-only — never modifies
files.

## Protocol

1. **Read Linear (primary).** List active issues for team **ALE** via the
   Linear MCP `list_issues` (filtered to `state: "In Progress"` — this
   workspace has no separate In Review state, see `METHODOLOGY.md` §4). If the
   Linear MCP tools aren't in this session's tool list, say so plainly and
   fall back to local track directories only.

2. **Read local plans.** For each active issue that has a matching track
   directory (`metadata.json.linear` == the issue id), read its `plan.md`;
   count tasks by marker (`[ ]` pending, `[~]` in progress, `[x]` done) and
   note the current phase.

3. **Orphan check.** List any `conductor/tracks/` directory whose
   `metadata.json.linear` does not correspond to an active Linear issue
   (either done and not archived, or the issue is missing/cancelled) —
   flag for cleanup.

4. **Summarize:**
   - **As of:** current date/time.
   - **Overall:** one-line health (e.g. "2 in progress, 1 in review").
   - **In progress:** each `ALE-XXX` + status + (if tracked) phase and
     `tasks_done / tasks_total (pct%)`.
   - **Next action:** the next `[ ]` task in the most-advanced tracked issue.
   - **Orphaned tracks:** from step 3, if any.
   - **Blockers:** anything flagged in a plan's implementation notes.

Keep it scannable.
