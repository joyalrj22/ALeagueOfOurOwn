# Local CI lint (changed files)

Run linting locally before calling a change done, scoped to what changed —
not a whole-tree pass that reports unrelated pre-existing issues.

## When to run

| You touched                     | Run before done / PR              |
|----------------------------------|-------------------------------------|
| `ui/src/**` (React/JS)           | `npm --prefix ui run lint`          |
| `api/**`, `services/**`, `repositories/**` | no linter configured yet — see below |
| Anything under `scripts/`, `*.sh`, `*.cmd` | `scripts/ci/check-shell-patterns.sh` |

## Commands

```bash
# Frontend — ESLint + Prettier check, same config CI runs
npm --prefix ui run lint

# Auto-fix what's fixable
npm --prefix ui run lint:fix

# Security/shell-pattern scan (fast, whole repo)
scripts/ci/check-shell-patterns.sh

# Optional git hooks (trailing whitespace, detect-private-key, shell-pattern scan on commit)
pip install pre-commit && pre-commit install --install-hooks
```

## Backend (`api/`, `services/`, `repositories/`) has no linter yet

These are plain Node/Vanilla JS Netlify functions with no `package.json` of
their own. When this grows past a handful of files, add a root
`package.json` + ESLint config scoped to those directories rather than
reaching for a whole-monorepo tool — keep the lint gate matched to what
actually changed, the same principle as the frontend gate.

## If checks fail

1. Run `npm --prefix ui run lint:fix`, then `npm --prefix ui run lint` again.
2. Re-run `scripts/ci/check-shell-patterns.sh` if you touched any `.sh`/`.cmd` file.
3. Re-run until exit 0.
