# Skill Gap Review (find new skills worth authoring)

A change can ship clean and still leave a knowledge gap: a footgun that will
recur, a multi-file coupling someone will forget, a procedure done by hand
that a checklist would make repeatable, or a convention re-explained in
three PRs. Use this after landing a nontrivial feature, or periodically, to
mine recent work for a skill worth writing down.

## When to use

- The user asks "what skills should we add" / "find skill gaps".
- After finishing a track/feature that involved a multi-step procedure
  (e.g. "add a new service to the API gateway" touched 4 files in a fixed
  order) that isn't yet captured anywhere.
- You notice yourself re-deriving the same steps you already did last week.

## How

1. Look at the diff (or recent commits) since the last review.
2. For each nontrivial change, ask: if someone else (or future-you) did this
   again next month, what would they need to know that isn't obvious from
   the code alone?
3. Check `.claude/skills/` first — extend an existing skill rather than
   creating a near-duplicate.
4. Propose new skills as: name, one-line trigger description (when to use
   it), and the procedure itself (steps, files touched, gotchas).
5. Keep skills flat markdown in `.claude/skills/<name>.md` — title, a short
   "when to use / when not to" section, then the steps. No frontmatter
   required at this repo's current size; add YAML frontmatter (`name`,
   `description`) only once you outgrow a single agent tool and need the
   same skill mirrored elsewhere.

## Signal worth a new skill

- A procedure spans more than 2 files in a fixed order (e.g. adding a
  service touches `services/`, `repositories/`, `api/league-handler.js`,
  and the UI).
- A gotcha cost real debugging time once (a Netlify Functions quirk, a
  webpack config trap, a mock-data shape assumption).
- Something is enforced by convention only, with no lint/test catching a
  violation.

## Not worth a skill

- One-off code, a typo fix, anything covered by an existing lint rule.
