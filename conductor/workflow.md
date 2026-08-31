# Conductor workflow

The task lifecycle every Conductor engine command (`/conductor:*`) follows.
Preserve the task-marker syntax and the Phase Completion heading below — the
engine and the `Stop`-hook loop parse for them.

## Task markers

```
- [ ] Task: <short description>
- [~] Task: <short description>          # in progress
- [x] Task: <short description> <sha7>   # done, with the commit SHA that did it
```

## Standard Task Workflow

1. Select the next `[ ]` task in `plan.md` (or the one named).
2. Mark it `[~]` and commit the plan update (or fold into the same commit as
   the implementation).
3. Implement it. Write a test first when the logic is genuinely tricky
   (scoring/standings math, anything with edge cases) — this repo doesn't
   mandate red/green TDD for everything, but it's the right call there.
   Otherwise: build it, then verify by driving it — run it, hit the endpoint,
   click through the UI.
4. Run the relevant checks before committing:
   - `npm --prefix ui run lint` for anything under `ui/`.
   - `scripts/ci/check-shell-patterns.sh` for anything under `scripts/`,
     `api/`, `services/`, `repositories/`, or any `.sh`/`.cmd` file.
5. Commit with a descriptive message.
6. Record the 7-char commit SHA next to the `[x]` task marker and commit the
   plan update.

## Phase Completion Verification and Checkpointing Protocol

`plan.md` groups tasks into **phases**. Each phase ends with an injected
meta-task: `- [ ] Task: Conductor - User Manual Verification '<Phase Name>' (Protocol in workflow.md)`.
When you reach it:

1. **Scope diff.** Summarize what the phase actually changed vs. what
   `plan.md` said it would.
2. **Run the checks.** Lint (§ Standard Task Workflow step 4), plus a smoke
   test of the phase's happy path.
3. **Pause for the human.** Present the summary and results, then use
   `AskUserQuestion` (or ask directly) for an explicit go/no-go before
   starting the next phase. Do not proceed on silence or assumption.
   - **Exception — loop mode.** If `/conductor:implement` is running in
     `loop` mode (`conductor/.loop-state.json` → `mode: "loop"`), skip the
     manual pause: record that the checkpoint was auto-verified against the
     checks in step 2, and continue to the next phase. See
     `METHODOLOGY.md` §7.
4. **Checkpoint.** Once approved, mark the meta-task `[x]` and continue.

## Definition of done (a track is ready to close)

- All `plan.md` tasks are `[x]` with recorded SHAs.
- `npm --prefix ui run lint` is clean for anything touched under `ui/`.
- `scripts/ci/check-shell-patterns.sh` is clean for anything touched under
  `scripts/`, `api/`, `services/`, `repositories/`.
- No real secret committed (see `SECURITY.md`).
- The Linear issue's acceptance criteria are satisfied — re-read the issue
  before closing; if scope changed mid-track, reconcile before marking Done.

## Two things not to relax

1. **Cost guardrail on any paid API you add.** The moment this repo calls
   something billed (Google Places, an LLM, SMS, etc.), give it a cap/kill
   switch before merging.
2. **No real secrets or real user data**, ever, in this repo or in a track
   file. Mock data only until there's a real deployment with real auth.
