#!/usr/bin/env bash
# Stop hook — Conductor autonomous-continuation loop.
#
# When an active /conductor:implement run has opted into LOOP mode, this
# re-engages Claude task-by-task until the track's plan.md is all `[x]` or a
# guard trips. Otherwise it is a complete no-op.
#
# Activation is OPT-IN and per-run: it does nothing unless the sentinel
# conductor/.loop-state.json exists AND its `mode` is "loop". The sentinel is
# written/removed by /conductor:implement and toggled by /conductor:loop.
#
# Contract: print {"decision":"block","reason":...} and exit 0 to prevent the
# stop and feed `reason` to Claude as the next instruction; exit 0 with no
# output to allow the stop. Fails open everywhere — any missing tool,
# unreadable file, or parse error allows the stop, so this can never trap a
# session.
#
# Loop bounds:
#   * max_iterations  — hard ceiling on consecutive blocks (default 60).
#   * stall detection — 3 consecutive blocks with no new `[x]` Task → stop.

set -uo pipefail

allow_stop() { exit 0; }

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." 2>/dev/null && pwd)}"
[ -n "${PROJECT_DIR:-}" ] || allow_stop
STATE="$PROJECT_DIR/conductor/.loop-state.json"

# Drain stdin so the hook does not block if Claude Code pipes the event JSON.
input="$(cat 2>/dev/null || true)"
: "${input:-}"

command -v jq >/dev/null 2>&1 || allow_stop
[ -f "$STATE" ] || allow_stop

mode="$(jq -r '.mode // "manual"' "$STATE" 2>/dev/null || echo manual)"
[ "$mode" = "loop" ] || allow_stop

track_id="$(jq -r '.track_id // empty' "$STATE" 2>/dev/null || true)"
[ -n "$track_id" ] || allow_stop

plan=""
for base in tracks archive; do
  cand="$PROJECT_DIR/conductor/$base/$track_id/plan.md"
  if [ -f "$cand" ]; then plan="$cand"; break; fi
done
[ -n "$plan" ] || { rm -f "$STATE" 2>/dev/null; allow_stop; }

todo="$(grep -cE '^[[:space:]]*-[[:space:]]*\[( |~)\][[:space:]]*Task:' "$plan" 2>/dev/null)"; todo="${todo:-0}"
done_count="$(grep -cE '^[[:space:]]*-[[:space:]]*\[x\][[:space:]]*Task:' "$plan" 2>/dev/null)"; done_count="${done_count:-0}"

iterations="$(jq -r '.iterations // 0' "$STATE" 2>/dev/null || echo 0)"; iterations="${iterations:-0}"
max_iter="$(jq -r '.max_iterations // 60' "$STATE" 2>/dev/null || echo 60)"; max_iter="${max_iter:-60}"
last_done="$(jq -r '.last_done_count // 0' "$STATE" 2>/dev/null || echo 0)"; last_done="${last_done:-0}"
strikes="$(jq -r '.stall_strikes // 0' "$STATE" 2>/dev/null || echo 0)"; strikes="${strikes:-0}"

if [ "$todo" -le 0 ] 2>/dev/null; then
  rm -f "$STATE" 2>/dev/null
  allow_stop
fi

if [ "$iterations" -ge "$max_iter" ] 2>/dev/null; then
  rm -f "$STATE" 2>/dev/null
  allow_stop
fi

if [ "$done_count" -le "$last_done" ] 2>/dev/null; then
  strikes=$((strikes + 1))
else
  strikes=0
fi
if [ "$strikes" -ge 3 ] 2>/dev/null; then
  rm -f "$STATE" 2>/dev/null
  allow_stop
fi

iterations=$((iterations + 1))
tmp="$(mktemp 2>/dev/null || echo "${STATE}.tmp")"
if jq --argjson it "$iterations" --argjson dc "$done_count" --argjson st "$strikes" \
     '.iterations=$it | .last_done_count=$dc | .stall_strikes=$st' \
     "$STATE" >"$tmp" 2>/dev/null; then
  mv "$tmp" "$STATE" 2>/dev/null || rm -f "$tmp" 2>/dev/null
else
  rm -f "$tmp" 2>/dev/null
fi

reason="Conductor loop (iteration ${iterations}/${max_iter}): ${todo} task(s) remain in conductor/.../${track_id}/plan.md. Resume /conductor:implement — select the next [ ] task and follow conductor/workflow.md -> Standard Task Workflow (implement -> lint -> commit -> record 7-char SHA next to [x] -> commit plan update). At a phase boundary, auto-verify against workflow.md's checks and continue (loop mode skips the manual pause). If blocked or repeatedly erroring on a task, write a short blocker note into plan.md and stop instead of retrying."

if ! jq -cn --arg r "$reason" '{decision:"block", reason:$r}' 2>/dev/null; then
  printf '{"decision":"block","reason":"Conductor loop: %s task(s) remain in %s/plan.md. Resume /conductor:implement."}\n' "$todo" "$track_id"
fi
exit 0
