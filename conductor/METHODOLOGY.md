# Conductor Methodology — Ownership & Extension Guide

Conductor tracks units of work as plain files plus a **Linear issue** for spec
and status. This doc defines the conventions; [`workflow.md`](./workflow.md)
defines the per-task lifecycle the engine commands follow.

**Linear workspace:** A League of Our Own · team **ALE** ·
https://linear.app/aleagueofourown/team/ALE/all

---

## 1. The two layers

| Layer | What it is | Where it lives | Edit policy |
|---|---|---|---|
| **Engine** (the directive prompts that drive the lifecycle) | `newTrack`, `implement`, `status`, `review`, `revert`, `loop` | `.claude/commands/conductor/*.md` | Change lifecycle *behaviour* in `workflow.md`/this file first; touch a command file only for tool-binding mechanics. |
| **Workspace** (your project content) | Everything under `conductor/tracks/`, `conductor/archive/`, this file, `workflow.md` | `conductor/` | Own it — shape it to the project. |

The engine delegates the real task lifecycle to `conductor/workflow.md` — that
delegation is the extension seam. Routine changes (a new lint command, a new
quality gate) belong in `workflow.md`, not in a command file.

---

## 2. The extension seam — `conductor/workflow.md`

When editing `workflow.md`, preserve these structural anchors or the engine
stops parsing correctly:

- Task markers `- [ ] Task:` / `[~]` (in progress) / `[x]` (done, optionally
  `[x] … <sha7>`).
- The heading **"Phase Completion Verification and Checkpointing Protocol"** —
  its presence is what makes `newTrack` inject the per-phase meta-task
  `- [ ] Task: Conductor - User Manual Verification '<Phase Name>' (Protocol in workflow.md)`.
- The **Standard Task Workflow** step list.

Everything else — the actual lint/test commands, commit scopes — is yours to
align with reality as the stack grows.

---

## 3. Track anatomy (Linear-first)

**The Linear issue is the spec.** Its description holds requirements,
acceptance criteria, and out-of-scope notes. A track directory is a thin local
*execution* artifact, not a second copy of the issue.

A track is a directory `conductor/tracks/<slug>_YYYYMMDD/` containing:

```
<slug>_YYYYMMDD/
├── index.md        # one-line pointer to the Linear issue + plan
├── metadata.json   # POINTER only — track_id + linear id/url (no status, no spec copy)
└── plan.md         # phased task breakdown with [ ]/[~]/[x] markers (engine + loop-hook contract)
```

**What there is no local copy of:**

- **No `spec.md`.** The Linear issue description is the canonical spec. A
  track may keep a thin implementation-notes section in `index.md`, but never
  a duplicate of the acceptance criteria — a local copy only drifts.
- **No separate registry file.** Linear's issue list (`list_issues`, or the
  [ALE board](https://linear.app/aleagueofourown/team/ALE/all)) is the
  registry. `conductor/tracks.md` is not used for new tracks (see §5).
- **No `status` field in `metadata.json`.** The Linear issue status is the
  single source of truth for lifecycle state (§4).

### `metadata.json` schema (pointer only)

```json
{
  "track_id": "<slug>_YYYYMMDD",
  "linear": "ALE-XXX",
  "linear_url": "https://linear.app/aleagueofourown/issue/ALE-XXX/…"
}
```

Completed tracks: mark the Linear issue Done and move the directory to
`conductor/archive/<track_id>/` — `plan.md` is a useful record of the
task-by-task execution trail, including recorded commit SHAs.

---

## 4. Status lives in Linear

| Lifecycle | Linear status | `plan.md` markers (local execution only) |
|---|---|---|
| Not started | Backlog / Todo | all `[ ]` |
| Active | In Progress | mixture of `[~]`/`[x]` |
| Done | Done | all `[x]`, archived |
| Dropped | Canceled | directory removed or left |

This workspace has no separate "In Review" state — when a track is ready
for review, leave the issue **In Progress**, comment the PR link on it
(`save_comment`), and move it to **Done** once merged. If you later add an
"In Review" state in Linear's workflow settings, update this table.

The `[ ]/[~]/[x]` markers in `plan.md` are **local execution state** only —
they drive the Standard Task Workflow and the autonomous-loop `Stop` hook
(which counts markers in the local file). They say nothing authoritative the
Linear issue doesn't already say.

---

## 5. `tracks.md` (not used for new tracks)

`conductor/tracks.md` exists only as a placeholder; every new track is tracked
via its Linear issue instead. Do not add rows to it going forward — if this
project later needs an offline index independent of Linear, revisit that
decision explicitly rather than half-using both.

---

## 6. Extension recipes

**Add or change a lifecycle rule** (e.g. "run the frontend lint before every
commit") → edit `conductor/workflow.md`.

**Link a track to Linear** → capture `ALE-XXX`, write the pointer
`metadata.json` (§3), keep the acceptance criteria **on the issue**, and end
`plan.md` with a "Mark ALE-XXX Done" task.

**Create / implement / review / revert a track** → use the engine commands:
`/conductor:newTrack`, `/conductor:implement`, `/conductor:status`,
`/conductor:review`, `/conductor:revert`, `/conductor:loop`.

---

## 7. Autonomous loop — the loop/manual switch

By default Conductor is **human-gated**: the Phase Completion Verification and
Checkpointing Protocol in `workflow.md` pauses for an explicit "yes" at every
phase boundary. As an **opt-in** alternative, `/conductor:implement` can run
task-by-task **autonomously** — a `Stop` hook re-engages the session until the
active track's `plan.md` is all `[x]`.

**The switch — `mode` ∈ {`loop`, `manual`}:**

| Mode | Behaviour |
|---|---|
| `loop` | The `Stop` hook blocks the stop while tasks remain and instructs the session to resume the next task. The per-phase manual pause is superseded. |
| `manual` *(default)* | The `Stop` hook is a no-op; the human-gated phase protocol runs unchanged. |

Resolution precedence (most specific wins): per-run flag `--loop`/`--manual`
on `/conductor:implement` → mid-run `/conductor:loop on|off` → project default
`conductor/conductor.config.json` (`implement_mode`, shipped as **`manual`**).

**Moving parts:**

- `conductor/conductor.config.json` — committed project default.
- `conductor/.loop-state.json` — **per-run, gitignored** sentinel:
  `{track_id, mode, iterations, max_iterations, last_done_count, stall_strikes}`.
  Written by `/conductor:implement` on entry, deleted on finalize, toggled by
  `/conductor:loop`.
- `.claude/hooks/conductor-loop.sh` — the `Stop` hook (registered in
  `.claude/settings.json`). Counts `plan.md` task markers and **fails open**
  (any missing tool / unreadable file / parse error → allow the stop).
- `.claude/hooks/tests/conductor-loop.test.sh` — runnable assertion harness.

**Safety guards (so a loop always terminates):**

- **Iteration cap** — `max_iterations` (default 60) consecutive blocks, then stop.
- **Stall detection** — 3 consecutive blocks with no new `[x]` Task → stop.
- **Opt-in only** — no sentinel or `mode != "loop"` ⇒ the hook does nothing.

On any terminal condition the hook deletes the sentinel and lets the session
stop normally. Keep loop mode **off** for any track whose content you don't
fully trust (e.g. a plan seeded from an untrusted source).

## See also

[Workflow](./workflow.md) · [Tracks archive](./archive/) ·
[`linear-issues` skill](../.claude/skills/linear-issues.md)
