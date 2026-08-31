# Linear issues (ALE-XXX)

Workflow for linking agent work to Linear issues. Use whenever the user
mentions Linear, an `ALE-XXX` id, an issue URL, starting or finishing issue
work, opening a PR for a ticket, or invoking a `/conductor:*` command.

**Workspace:** A League of Our Own · team **ALE** ·
https://linear.app/aleagueofourown/team/ALE/all

## Prerequisite: the Linear connector must be enabled for this chat

This repo's Linear integration runs through Claude's Linear MCP connector.
If the `mcp__Linear__*` tools aren't in your tool list, the connector is
authenticated at the account level but toggled off for this chat — ask the
user to enable it in the chat's connector settings, and don't fabricate
issue ids or state changes while it's unavailable. `/conductor:status` and
`/conductor:newTrack` both check for this and stop cleanly if it's missing.

## Creating issues (default status)

When creating a new issue, set `state: "Backlog"` unless the user explicitly
names another status in the same turn (e.g. "put it in Todo", "start it In
Progress"). Don't invent a more-advanced default just because the work feels
ready to start.

## Session workflow

1. **Resolve the issue** at the start of any ticketed work — fetch it via
   the Linear MCP `get_issue` tool (or ask the user for the `ALE-XXX` id /
   URL if not given).
2. **Keep traceability.** Reference `ALE-XXX` in commit messages and PR
   titles (`ALE-XXX: <summary>`) so history is greppable back to the issue.
3. **Update at milestones**, not on every commit: when work starts (In
   Progress), when a PR opens (leave state In Progress, comment the PR link
   — this workspace has no separate In Review state), and when it's done
   (Done). Don't spam comments per commit.
4. **The issue is the spec** for anything tracked as a Conductor track — see
   `conductor/METHODOLOGY.md` §3. Don't create a parallel `spec.md`.

## Conductor tracks

A Conductor track (`conductor/tracks/<slug>_<date>/`) points at exactly one
Linear issue via `metadata.json.linear`. The engine commands
(`/conductor:newTrack`, `/conductor:implement`, `/conductor:status`,
`/conductor:review`, `/conductor:revert`) read and write the issue directly
via the Linear MCP — there is no local copy of status or acceptance
criteria to keep in sync. See `conductor/METHODOLOGY.md` for the full model.

## If the MCP tools are unavailable

Don't fall back to scraping the Linear web app or guessing issue content.
Tell the user the connector needs to be enabled, and either wait or continue
with local-only work (skipping the Linear-touching steps) if they'd rather
proceed without ticket sync for now.
