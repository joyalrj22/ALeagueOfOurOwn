# Project Overview
The end goal is to create a full stack application that can be used to manage a league of any kind. Users should be able to create their own leagues (manaing their league with admin privileges), whilst also retaining the ability to join leagues created by other users. The league roster, scoring system and all other attributes of the league can be defined flexibly by the admin. Leagues can be made either publicly or privately accessible. If you have access to a league, you will be able to view the current and previous league standings as well as projected performances + additional analytics. 

# Tech Stack
- Frontend: React, Tailwind CSS, Lucide-react (icons).
- Backend: Netlify Functions (Node.js/Vanilla JS).
- Database: MySQL
- Auth: JWT-based mock authentication.

## Core Data Models
- **League**: { id, name, inviteCode, type }
- **Season**: {id, name, leagueId}
- **Member**: {userId, leagueId}
- **Game**: {id, date, seasonId}
- **GameResult**: {id, gameId, userId, score}

# Architecture: Service-Oriented (SOA)
The backend is structured as a series of microservices accessible through a **Public API Gateway**. This allows for modular development and independent scaling of league features.

### Services & Responsibilities
- **Public API Gateway**: Acts as the single entry point for all frontend requests. Handles routing, global validation, and request orchestration.
- **Auth Service**: Manages user identity, JWT-based mock authentication, and session handling.
- **League Creator Service**: Manages the lifecycle of a league, including initial setup, metadata updates, and configuration of scoring rules.
- **Registration Service**: Handles user enrollment into leagues, invite code generation, and validation.
- **Competition Service**: Manages the active list of members (roster) and is responsible for recording/updating game results and participation data.
- **Scheduler Service**: Responsible for organizing seasons and generating game schedules/match timings.
- **Standings Service**: Calculates real-time league tables, user rankings, and overall performance metrics based on game results.
- **Analytics Service**: Provides advanced insights, historical trend analysis, and performance projections for players and leagues.

# Technical Constraints
- **Optimistic UI**: Implement basic state-cloning to show score updates immediately.
- **RESTful**
- **Mock Persistence**: Create a `mockData.js` file that acts as a singleton for the session.

# Agent Workflow

## Skill References

Repeatable, non-obvious procedures live as flat markdown in `.claude/skills/`.
Read the relevant one before doing the matching kind of work; add a new one
when a multi-step procedure recurs (see the `skill-gap-review` skill).

| Skill | Covers |
|---|---|
| `stay-on-current-branch` | Never create/switch/rename a branch unless explicitly asked — this repo's `staging`→`main` merge-order CI check depends on it. |
| `local-ci-lint` | Which lint command to run for what you touched, before calling a change done. |
| `skill-gap-review` | How to mine recent work for a new skill worth writing down. |
| `linear-issues` | Linking work to Linear (`ALE-XXX`): default status on create, when to comment/update, the Conductor pointer contract. |

## Conductor — tracking work against Linear

**Linear workspace:** team **ALE** — https://linear.app/aleagueofourown/team/ALE/all

Every non-trivial feature is a **Conductor track**: a Linear issue (the spec —
requirements, acceptance criteria, out-of-scope live in its description) plus
a local execution artifact at `conductor/tracks/<slug>_<date>/`
(`index.md` pointer, `metadata.json` pointer, `plan.md` checklist). See
`conductor/METHODOLOGY.md` for the full model and `conductor/workflow.md` for
the task lifecycle, including the **Phase Completion Verification and
Checkpointing Protocol** (a human-gated pause at each phase boundary).

Engine commands (`.claude/commands/conductor/*.md`):

| Command | Does |
|---|---|
| `/conductor:newTrack` | Create/link a Linear issue + draft `plan.md`. |
| `/conductor:implement` | Work a track's `plan.md` task-by-task. |
| `/conductor:status` | Read-only status overview from Linear + local plans. |
| `/conductor:review` | Review a track's diff against the issue's acceptance criteria. |
| `/conductor:revert` | Revert a track/phase/task's git commits and resync `plan.md`. |
| `/conductor:loop` | Toggle the autonomous continuation loop on/off mid-run. |

**Autonomous loop (opt-in, off by default).** `/conductor:implement` can run
task-by-task **without** the manual phase-gate pause — a `Stop` hook
(`.claude/hooks/conductor-loop.sh`) re-engages the session until the plan is
complete or a safety guard trips (60-iteration cap; 3-strike stall
detection). The project default is `manual` (`conductor/conductor.config.json`);
opt in per-run with `/conductor:implement <track> --loop` or mid-run with
`/conductor:loop on`. Test the hook with
`bash .claude/hooks/tests/conductor-loop.test.sh`.

**The Linear connector must be enabled for this chat** for any of the above
to actually talk to Linear — see `linear-issues` skill.

Not every change needs a track — a one-file fix doesn't. Use one when a
change touches multiple services/files in a fixed order, spans more than one
session, or is worth a Linear issue on its own merits.

## Security

See `SECURITY.md`. Before committing anything under `scripts/`, `api/`,
`services/`, or `repositories/`, `scripts/ci/check-shell-patterns.sh` should
pass clean (CI enforces this too). Never read or commit `.env`, `*.pem`,
`*.key`, or service-account JSON — both `.claude/settings.json` and
`.cursorignore` already deny agent access to these paths.
