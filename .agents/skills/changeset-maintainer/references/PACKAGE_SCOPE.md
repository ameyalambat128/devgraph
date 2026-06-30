# Package Scope

Use this file to decide whether the current branch touches published packages.

## Published packages

- `packages/devgraph-cli/**` -> `devgraph`
- `packages/devgraph-core/**` -> `@devgraph/core`

## Unpublished or non-release surfaces

- `apps/web/**`
- `apps/studio/**`
- `apps/docs/**`
- most `internal-docs/**`
- repo-local assistant config under `.agents/**` or `.claude/**`

## Shared root files

Treat these as potentially release-relevant because they affect package behavior or contributor workflow:

- `package.json`
- `pnpm-lock.yaml`
- `.changeset/config.json`
- `CONTRIBUTING.md`

For root files, inspect the actual diff before deciding package scope.

## Decision rules

- Only unpublished surfaces changed -> no changeset by default
- Published package files changed -> likely changeset needed
- Mixed diff -> scope the changeset only to published packages with releasable changes
