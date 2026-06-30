# Owned Surfaces

Use this file to map code truth to the docs surfaces that `sync-doc-surfaces` owns.

## Source of truth

Read these before editing docs:

- `packages/devgraph-cli/src/index.ts` for commands, flags, and output text
- `package.json` for root scripts like `check`, `build`, and `release`
- `packages/devgraph-cli/package.json` and `packages/devgraph-core/package.json` for package descriptions and publish behavior
- `packages/devgraph-core/src/index.ts` for exported surface
- `packages/devgraph-core/src/types.ts` for graph, manifest, and sync artifact shape

## Public product surface

Current shipped command surface:

- `build`
- `watch`
- `query`
- `status`

Treat older commands on disk as legacy docs unless the user explicitly asks to clean them up.

## Mapping

### Command or flag changes

Update:

- `README.md`
- `apps/docs/docs.json` if navigation changed
- matching files under `apps/docs/cli/`
- `apps/docs/quickstart.mdx` when example commands changed
- `apps/docs/introduction.mdx` when the command surface story changed

### Artifact or graph shape changes

Update:

- `README.md`
- `apps/docs/introduction.mdx`
- `apps/docs/quickstart.mdx`
- `apps/docs/cli/build.mdx`
- `apps/docs/cli/status.mdx` if status output meaning changed

### Build or check workflow changes

Update:

- `internal-docs/DEVELOPMENT.md`
- `README.md` if install or local workflow examples changed
- `apps/docs/quickstart.mdx` if user-facing setup changed

### Product positioning changes

Update:

- `README.md`
- `apps/docs/introduction.mdx`
- `apps/docs/quickstart.mdx` when the quickstart story needs re-framing

## Editing rules

- Prefer current code and scripts over existing prose when they disagree.
- Update the minimum owned set needed by the diff.
- If no owned surface needs changes, say so explicitly instead of making filler edits.
