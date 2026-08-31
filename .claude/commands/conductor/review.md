---
description: Conductor — review a track's diff against its Linear issue's acceptance criteria
argument-hint: "[track id or ALE-XXX] (optional; defaults to in-progress track)"
allowed-tools: Read, Glob, Bash
---

# /conductor:review

Review a Conductor track's implementation against its Linear issue's
acceptance criteria — not a `spec.md`, the issue is the bar.

Requested track: **$ARGUMENTS**

## Protocol

1. **Identify the track & issue.** Resolve `$ARGUMENTS` to a track (or the
   in-progress one via `/conductor:status` logic); confirm. Read
   `metadata.json.linear` → `ALE-XXX`.

2. **Derive the revision range.** Read the track's `plan.md`; collect the
   commit SHAs recorded on `[x]` tasks (first → HEAD). If absent, diff
   against the base branch. Note any non-`[x]` task as an incomplete-track
   flag.

3. **Re-read the issue.** Fetch the current Linear issue (acceptance
   criteria may have been edited since the track started) via the Linear MCP
   `get_issue`.

4. **Review the diff** (`git diff <range>`) against:
   - the issue's acceptance criteria — does the change satisfy each one?
   - `scripts/ci/check-shell-patterns.sh` clean for anything under
     `scripts/`, `api/`, `services/`, `repositories/`.
   - `npm --prefix ui run lint` clean for anything under `ui/`.
   - obvious correctness/security issues in the diff itself.

5. **Report findings** — confirmed issues first, most severe first. Note
   plan-completion status from step 2.

6. **Close out.** If the user approves, comment the review summary on the
   Linear issue via `save_comment`; move it to **Done** once merged (this
   workspace has no separate In Review state — see `METHODOLOGY.md` §4).
   Offer to archive the track directory once merged.

This command does not fix findings itself — report them and let the user
decide what to address before merging.
