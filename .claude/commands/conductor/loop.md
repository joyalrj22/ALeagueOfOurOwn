---
description: Conductor — toggle autonomous loop mode on/off for the active implement run
argument-hint: "on | off | status"
allowed-tools: Read, Write, Edit, Bash
---

# /conductor:loop

Flip the autonomous-continuation loop on or off for the currently active
`/conductor:implement` run, without restarting it. Writes the `mode` field of
`conductor/.loop-state.json`, which the `Stop` hook
(`.claude/hooks/conductor-loop.sh`) reads on every turn-end.

Requested action: **$ARGUMENTS** (`on` → loop · `off` → manual · `status` → report)

## Protocol

1. **Locate the sentinel.** Read `conductor/.loop-state.json`. If it does not
   exist, there is no active loop-capable run — tell the user to start one
   with `/conductor:implement <track> --loop` (or `--manual`) and stop.

2. **`status`** (or no argument): report `track_id`, `mode`,
   `iterations`/`max_iterations`, `stall_strikes`, then stop.

3. **`on`:** set `mode` to `"loop"`. **`off`:** set `mode` to `"manual"`.
   Edit the JSON in place, preserving the other fields.

4. **Confirm.** Echo the new mode. Note it takes effect at the next
   turn-end, and the project default for *new* runs stays whatever
   `conductor/conductor.config.json` says.

Keep this command side-effect-free beyond the sentinel file.
