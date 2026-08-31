---
description: Conductor — create a Linear issue (the spec) + a local plan.md track pointer
argument-hint: "<short track description>"
allowed-tools: Read, Write, Edit, Glob, Bash(git:*), Bash(ls:*), Bash(date:*)
---

# /conductor:newTrack

Create a new unit of Conductor work. **The Linear issue is the spec** — its
description holds requirements, acceptance criteria, and out-of-scope. The
local track directory carries only the executable `plan.md` plus a pointer
`metadata.json`. There is no `spec.md` and tracks are not registered in
`conductor/tracks.md` — Linear is the registry.

Team: **ALE** · https://linear.app/aleagueofourown/team/ALE/all

Track description from arguments: **$ARGUMENTS**

## Protocol

1. **Setup check.** Confirm `conductor/workflow.md` and `conductor/METHODOLOGY.md`
   exist. If not, stop and say Conductor setup is required.

2. **Get the description.** If `$ARGUMENTS` is empty, ask for a one-line
   description. Infer the type (feature / bug / chore) — don't ask the user
   to classify.

3. **Resolve the Linear issue (always).**
   - **Use existing** — given an `ALE-XXX` id or URL, fetch it via the Linear
     MCP tools and confirm scope matches.
   - **Create new** — propose a title, confirm with the user, create it via
     `mcp__Linear__save_issue` (no `id` = create) with `team: "ALE"`,
     `state: "Backlog"` unless the user names another status. Draft the
     spec **as the issue description**: Overview, Requirements, Acceptance
     Criteria, Out of Scope. Show it, get approval, then write it to the
     issue (`save_issue` with `id` + `description`).
   - **Skip for now** — `linear: null`; warn loudly the track has no spec
     home until backfilled, and that `/conductor:implement` will need one
     before starting real work.
   - If the Linear MCP tools aren't available in this session, tell the user
     to enable the Linear connector for this chat and pause here — don't
     fabricate an issue id.

4. **Draft `plan.md`.** Break the work into phases → tasks with `- [ ] Task:`
   markers (see `workflow.md`). Inject a final meta-task per phase:
   `- [ ] Task: Conductor - User Manual Verification '<Phase Name>' (Protocol in workflow.md)`.
   End the plan with `- [ ] Task: Mark ALE-XXX Done in Linear; link PR`. Show
   the plan, get approval, loop until approved. Keep the marker syntax exact
   — it's what the engine and the loop hook parse.

5. **Create artifacts.** Generate `track_id = <slug>_YYYYMMDD` (`date -u +%Y%m%d`;
   check it doesn't collide with an existing `conductor/tracks/` directory).
   Create `conductor/tracks/<track_id>/` and write:
   - `metadata.json` — pointer only: `track_id`, `linear`, `linear_url`.
   - `plan.md` — the approved plan.
   - `index.md` — pointer to the Linear issue + a short implementation-notes
     stub.

6. **Comment on the issue** (`mcp__Linear__save_comment`) noting the track
   path was opened, once the connector is available.

7. **Commit.** `git add conductor/tracks/<track_id>/` and commit
   `chore(conductor): add plan for ALE-XXX <title>`.

8. **Announce** the track id and that `/conductor:implement <track_id>` can
   start it.
