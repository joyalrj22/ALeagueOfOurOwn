# Security

## Coding-agent hygiene

This repo is actively worked on by AI coding agents (Claude Code, Cursor, etc).
Two lightweight controls keep an indirect prompt injection (a malicious
README/PR/dependency instruction) from turning into credential theft or a
reverse shell:

1. **`scripts/ci/check-shell-patterns.sh`** — scans changed files for the
   fetch-and-exec / reverse-shell primitives (`curl … | bash`, `base64 -d | sh`,
   a non-local `/dev/tcp` socket, an unpinned `npx -y`). Wired into
   `.pre-commit-config.yaml` (`check-shell-patterns`, runs on commit) and
   runnable standalone: `scripts/ci/check-shell-patterns.sh`. A reviewed false
   positive can be suppressed inline with a trailing `# nosec: shell-pattern`.
2. **Secret-file deny lists** — `.claude/settings.json` (`permissions.deny`)
   blocks Claude Code's file-read tool from opening `.env`, `*.pem`/`*.key`,
   `id_rsa`, and `*serviceaccount*.json`; `.cursorignore` does the same for
   Cursor. This doesn't stop a shell command from `cat`-ing a secret, but it
   closes the cheapest exfiltration path — an agent (or an injected
   instruction) directly reading a credential file via its read tool.

If you add a new secret-bearing filename convention, add it to both files.

## Reporting

This is an early-stage prototype with no production deployment yet — no
formal disclosure process is in place. Open an issue or contact the
maintainers directly for anything sensitive.

## What's NOT covered yet

No secrets currently exist in this repo (mock data only, no live API keys).
Once real credentials are introduced (a database connection string, an OAuth
secret, etc.), add: a `.env.example` with no real values, egress
restrictions on wherever this deploys, and a rotation plan for anything that
ever touched a coding-agent environment.
