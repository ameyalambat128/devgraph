# Release Checklist

Use this file for `main` branch release work and release-facing doc maintenance.

## Policy

- Changesets are created on feature or PR branches.
- Releases are consumed and published from `main`.
- Missing changesets block the flow unless the user explicitly requests recovery mode.

## Source of truth

Read these before updating release docs or executing release steps:

- `package.json`
- `packages/devgraph-cli/package.json`
- `packages/devgraph-core/package.json`
- `.changeset/config.json`
- `internal-docs/RELEASING.md`
- `CONTRIBUTING.md`

## Current scripted flow

From root scripts:

1. `pnpm version-packages`
2. `pnpm install`
3. review diff
4. commit version bump
5. `pnpm release`
6. push `main` and tags
7. create GitHub release

`pnpm release` currently runs:

- `pnpm build:core`
- `pnpm build:cli-full`
- `changeset publish`

When release-facing docs drift from these scripts, update the docs to match code.

## Safe defaults

- Do not publish unless the user explicitly asks.
- Do not create a retroactive changeset silently.
- Do not rewrite product docs from this skill.
