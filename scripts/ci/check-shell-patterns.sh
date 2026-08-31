#!/usr/bin/env bash
# check-shell-patterns.sh — fetch-and-exec / reverse-shell pattern scanner.
#
# Defends against the indirect-prompt-injection -> off-repo-payload attack class
# (the "clean repo, malicious README/init step" pattern used against coding
# agents) by failing CI / pre-push if a commit introduces the primitives that
# turn "run the setup step" into code execution: a remote fetch piped into an
# interpreter, a base64 blob piped to a shell, or a raw socket to a non-local
# host.
#
# See SECURITY.md.
#
# Usage:
#   scripts/ci/check-shell-patterns.sh [files...]   # scan given files (pre-commit)
#   scripts/ci/check-shell-patterns.sh              # scan all tracked files (CI)
#
# Suppress a reviewed, known-safe line with a trailing:  # nosec: shell-pattern
set -uo pipefail

cd "$(git rev-parse --show-toplevel 2>/dev/null || echo .)"

# Build the file list: explicit args (pre-commit) or all tracked files (CI).
if [ "$#" -gt 0 ]; then
  mapfile -t FILES < <(printf '%s\n' "$@")
else
  mapfile -t FILES < <(git ls-files)
fi

# Only scan text we care about; skip vendored / generated / lockfile trees.
filter() {
  local f="$1"
  case "$f" in
    *.sh|*.bash|*.py|*.js|*.mjs|*.cjs|*.ts|Makefile|*/Makefile|Dockerfile*|*/Dockerfile*|*.cmd) return 0 ;;
    *) return 1 ;;
  esac
}
case_skip() {
  case "$1" in
    # This scanner necessarily contains the very patterns it hunts for.
    scripts/ci/check-shell-patterns.sh) return 0 ;;
    */node_modules/*|.git/*|*/.git/*|*/dist/*|*/build/*) return 0 ;;
    *) return 1 ;;
  esac
}

# ── Pattern tiers ────────────────────────────────────────────────────────────
# FAIL (tier 1): the exact attack primitives. Any hit fails the check.
#   1. remote fetch  | interpreter        e.g. curl <url> | bash , dig <rec> | sh
#   2. base64 -d     | shell              e.g. <blob> | base64 -d | bash
#   3. raw socket to a NON-local host     e.g. reverse shell over /dev/<proto>
FAIL_FETCH_EXEC='(curl|wget|dig|nslookup)[[:space:]]+[^|]*\|[[:space:]]*(bash|sh|zsh|python3?|node|ruby|perl)([[:space:]]|$)'
FAIL_B64_EXEC='base64[[:space:]]+(-d|--decode)[^|]*\|[[:space:]]*(bash|sh|zsh)([[:space:]]|$)'
FAIL_DEVTCP='/dev/(tcp|udp)/'

# WARN (tier 2): supply-chain / suspicious shapes. Printed, non-fatal.
WARN_NPX='npx[[:space:]]+(-y|--yes)[[:space:]]+[^@[:space:]]+([[:space:]]|$)'   # unpinned npx fetch-and-run
WARN_BASHC_VAR='bash[[:space:]]+-c[[:space:]]+"\$'                               # bash -c "$var" (exec of a variable)

fail=0
warn=0

scan() {
  local re="$1" label="$2" tier="$3" f line text
  for f in "${FILES[@]}"; do
    [ -f "$f" ] || continue
    case_skip "$f" && continue
    filter "$f" || continue
    while IFS= read -r hit; do
      line="${hit%%:*}"; text="${hit#*:}"
      case "$text" in *"# nosec: shell-pattern"*) continue ;; esac
      if [ "$tier" = "devtcp" ]; then
        case "$text" in
          *127.0.0.1*|*localhost*|*0.0.0.0*|*::1*) continue ;;
        esac
      fi
      if [ "$tier" = "warn" ]; then
        case "$(echo "$text" | sed 's/^[[:space:]]*//')" in
          \#*|//*|\**) continue ;;
        esac
      fi
      if [ "$tier" = "warn" ]; then
        printf 'WARN  %s:%s  (%s)\n    %s\n' "$f" "$line" "$label" "$(echo "$text" | sed 's/^[[:space:]]*//')"
        warn=$((warn + 1))
      else
        printf 'FAIL  %s:%s  (%s)\n    %s\n' "$f" "$line" "$label" "$(echo "$text" | sed 's/^[[:space:]]*//')"
        fail=$((fail + 1))
      fi
    done < <(grep -nE "$re" "$f" 2>/dev/null)
  done
}

scan "$FAIL_FETCH_EXEC" "remote fetch piped to interpreter" fail
scan "$FAIL_B64_EXEC"   "base64 decode piped to shell"       fail
scan "$FAIL_DEVTCP"     "raw socket to non-local host"       devtcp
scan "$WARN_NPX"        "unpinned npx (pin to @version)"     warn
scan "$WARN_BASHC_VAR"  "bash -c on a variable's contents"   warn

echo
if [ "$warn" -gt 0 ]; then
  echo "shell-pattern: $warn warning(s) — review for supply-chain / injection risk."
fi
if [ "$fail" -gt 0 ]; then
  echo "shell-pattern: $fail BLOCKING finding(s) — fetch-and-exec / reverse-shell primitive introduced."
  echo "  If a finding is a reviewed false positive, append '# nosec: shell-pattern' to the line."
  exit 1
fi
echo "shell-pattern: OK (no fetch-and-exec / reverse-shell primitives)."
exit 0
