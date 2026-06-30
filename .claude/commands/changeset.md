Create or skip a changeset for the current branch.

Use `.agents/skills/changeset-maintainer/SKILL.md` as the authoritative procedure.

## Policy

- create or skip changesets on feature or PR branches
- consume and publish changesets from `main`
- if invoked on `main`, redirect to `.agents/skills/release-workflow/SKILL.md` unless the user explicitly asks for recovery mode

## Current package scope

Published packages:

- `packages/devgraph-cli/**` -> `devgraph`
- `packages/devgraph-core/**` -> `@devgraph/core`

Common unpublished surfaces:

- `apps/web/**`
- `apps/studio/**`
- `apps/docs/**`
- most `internal-docs/**`

## Reminder

- no published package changes -> explicit no-changeset-needed decision
- published package changes -> create or validate a `.changeset/*.md` entry
