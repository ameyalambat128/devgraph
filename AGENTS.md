# AGENTS.md

## Overview

DevGraph is a Turborepo monorepo (pnpm-first) for persistent local code memory. It incrementally indexes source code, repo config, and root context files into inspectable artifacts inside `.devgraph/`.

## Brand Guidelines

/internal-docs/brand/README.md

## Package Structure

```
apps/
  web/                # Landing page (Next.js)
  studio/             # Graph visualization app (Next.js, React Flow)
                      # Built as static export, embedded in CLI
packages/
  devgraph-core/      # Discovery, extraction, sync, query
  devgraph-cli/       # CLI entrypoint
.devgraph/            # Local graph artifacts (gitignored)
```

## CLI Commands

```bash
devgraph build [paths...]      # Build or refresh the local graph
devgraph watch [paths...]      # Keep the local graph fresh
devgraph query "<question>"    # Query the local graph
devgraph status [paths...]     # Inspect graph freshness
```

## Local Artifacts

```text
.devgraph/
├── manifest.json
├── graph.json
└── cache/
    ├── <file-id>.json
    └── ...
```

- `manifest.json` tracks hashes, kinds, extraction version, and sync timestamps
- `graph.json` is the canonical local memory graph
- `cache/*.json` stores per-file extracted artifacts for incremental rebuilds

## Stack

- **Monorepo**: pnpm + Turborepo
- **Apps**: Next.js 16, React 19, Tailwind CSS 4
- **CLI**: Node.js, Commander
- **Studio**: React Flow, Dagre layout, Zustand state
- **UI**: shadcn/ui components

## Dev Workflow

See `/internal-docs/DEVELOPMENT.md` for full details.

```bash
pnpm install           # Install deps
pnpm dev               # Run all apps in dev mode
pnpm build             # Build all packages
pnpm build:cli-full    # Build CLI with embedded Studio
pnpm devgraph build .  # Generate .devgraph/ outputs
pnpm devgraph query "where is syncProject defined"
```

### Studio Dev Mode

To run Studio in dev mode with hot reload using existing `.devgraph/`:

```bash
pnpm devgraph build .  # Generate graph first
pnpm dev:studio        # http://localhost:3000
```

Studio dev reads from `.devgraph/graph.json` via `/api/graph` route.

## Releasing

See `/internal-docs/RELEASING.md` for full workflow.

```bash
pnpm changeset         # Create changeset for changes
pnpm version-packages  # Bump versions, update CHANGELOGs
pnpm release           # Build + publish to npm
git tag vX.X.X && git push origin vX.X.X  # Tag release
```

## Build Pipeline (Studio Embedding)

1. `pnpm build:studio` builds the Studio static export in `apps/studio/out/`
2. `pnpm build:cli-full` copies those assets to `packages/devgraph-cli/dist/studio-web/`
3. The CLI package can ship the embedded assets without making Studio part of the active CLI surface

## Code Style

- Component files: kebab-case (e.g., `service-node.tsx`)
- Use `export function` for components
- Prefer descriptive names over comments

## Key Files

| File                                         | Purpose                           |
| -------------------------------------------- | --------------------------------- |
| `packages/devgraph-cli/src/index.ts`         | CLI entry for `build`, `watch`, `query`, and `status` |
| `packages/devgraph-core/src/sync.ts`         | Incremental sync loop and `.devgraph/` writes |
| `packages/devgraph-core/src/retrieval.ts`    | Query ranking and bounded output |
| `packages/devgraph-core/src/types.ts`        | Graph, manifest, and query result types |
| `apps/studio/src/app/page.tsx`               | Studio app entry point |

## Notes for AI Agents

- Generated `.devgraph/` outputs are gitignored
- Studio remains an app surface, not an active CLI command
- Graph types defined in `apps/studio/src/types/`
- Use Context7 MCP for framework docs (Next.js, React Flow, etc.)
