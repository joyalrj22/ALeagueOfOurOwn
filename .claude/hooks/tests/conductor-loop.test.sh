#!/usr/bin/env bash
# Assertion harness for .claude/hooks/conductor-loop.sh.
# Run: bash .claude/hooks/tests/conductor-loop.test.sh
set -uo pipefail

HOOK="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/conductor-loop.sh"
pass=0
fail=0

setup() {
  WORKDIR="$(mktemp -d)"
  mkdir -p "$WORKDIR/conductor/tracks/demo_20260101"
  export CLAUDE_PROJECT_DIR="$WORKDIR"
}

teardown() {
  rm -rf "$WORKDIR"
}

write_plan() {
  # $1 = number of [ ] tasks, $2 = number of [x] tasks
  local todo="$1" done_n="$2" f="$WORKDIR/conductor/tracks/demo_20260101/plan.md"
  : > "$f"
  for _ in $(seq 1 "$todo"); do echo "- [ ] Task: t" >> "$f"; done
  for _ in $(seq 1 "$done_n"); do echo "- [x] Task: t abc1234" >> "$f"; done
}

write_state() {
  cat > "$WORKDIR/conductor/.loop-state.json" <<JSON
{"track_id":"demo_20260101","mode":"$1","iterations":${2:-0},"max_iterations":${3:-60},"last_done_count":${4:-0},"stall_strikes":${5:-0}}
JSON
}

assert_allow() {
  local desc="$1" out
  out="$(echo '{}' | "$HOOK")"
  if [ -z "$out" ]; then
    echo "PASS: $desc"; pass=$((pass+1))
  else
    echo "FAIL: $desc (expected empty output, got: $out)"; fail=$((fail+1))
  fi
}

assert_block() {
  local desc="$1" out
  out="$(echo '{}' | "$HOOK")"
  if echo "$out" | grep -q '"decision":"block"'; then
    echo "PASS: $desc"; pass=$((pass+1))
  else
    echo "FAIL: $desc (expected a block decision, got: $out)"; fail=$((fail+1))
  fi
}

# 1. No sentinel file -> allow.
setup
assert_allow "no sentinel -> allow stop"
teardown

# 2. mode=manual -> no-op.
setup
write_plan 3 0
write_state manual
assert_allow "mode=manual -> allow stop"
teardown

# 3. mode=loop, tasks remain -> block.
setup
write_plan 2 1
write_state loop
assert_block "mode=loop, tasks remain -> block"
teardown

# 4. mode=loop, all done -> allow + sentinel removed.
setup
write_plan 0 3
write_state loop
assert_allow "mode=loop, plan complete -> allow stop"
[ -f "$WORKDIR/conductor/.loop-state.json" ] && { echo "FAIL: sentinel not cleaned up on completion"; fail=$((fail+1)); } || { echo "PASS: sentinel cleaned up on completion"; pass=$((pass+1)); }
teardown

# 5. iteration cap reached -> allow + sentinel removed.
setup
write_plan 5 0
write_state loop 60 60
assert_allow "iteration cap reached -> allow stop"
teardown

# 6. stall detection: 3 consecutive no-progress blocks -> allow on the 3rd.
setup
write_plan 2 0
write_state loop 0 60 0 2
assert_allow "3rd consecutive stall -> allow stop"
teardown

echo
echo "conductor-loop.test.sh: $pass passed, $fail failed."
[ "$fail" -eq 0 ]
