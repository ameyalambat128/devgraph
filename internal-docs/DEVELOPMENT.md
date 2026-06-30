# Development Guide (Internal)

## Prerequisites

- Node.js 18+
- pnpm 10+

## Quick Start

```bash
pnpm install
```

## Common Commands

### Development

```bash
pnpm dev                  # Run all apps in dev mode
pnpm dev:web              # Run landing page only
pnpm dev:studio           # Run Studio only (port 3000)
```

### Building

```bash
pnpm build                # Build everything
pnpm build:core           # Build @devgraph/core
pnpm build:cli            # Build CLI (no Studio)
pnpm build:cli-full       # Build CLI with embedded Studio
pnpm build:studio         # Build Studio static export
```

### Testing

```bash
pnpm test                 # Run all tests
pnpm test:core            # Run core package tests
```

### CLI (Local)

```bash
pnpm devgraph build .                                # Build or refresh .devgraph/
pnpm devgraph status                                 # Inspect graph freshness
pnpm devgraph query "where is syncProject defined"   # Query the graph
pnpm devgraph watch .                                # Keep it fresh while you work
```

## Studio App Development

### Dev Mode (Hot Reload)

```bash
pnpm dev:studio           # http://localhost:3000
```

Note: In dev mode, Studio fetches from `/api/graph` which reads `.devgraph/graph.json`.

### Production Build

```bash
pnpm build:cli-full
```

This:
1. Builds Studio as static export → `apps/studio/out/`
2. Copies to CLI → `packages/devgraph-cli/dist/studio-web/`
3. Preserves the embedded Studio assets in the published CLI package

## Package Dependencies

```
devgraph (CLI)
  └── @devgraph/core (discovery, extraction, sync, query)

apps/studio (standalone, not a dependency)
  └── embedded in CLI at build time
```

## Key Files

| File | Purpose |
|------|---------|
| `packages/devgraph-cli/src/index.ts` | CLI entry point for `build`, `watch`, `query`, and `status` |
| `packages/devgraph-core/src/sync.ts` | Incremental sync loop and `.devgraph/` writes |
| `packages/devgraph-core/src/watch.ts` | File watching wrapper around sync |
| `packages/devgraph-core/src/retrieval.ts` | Query ranking and bounded output |
| `packages/devgraph-core/src/types.ts` | Graph, manifest, and query result types |

## Environment

No `.env` required for local development. DevGraph writes local state into `.devgraph/`.

## Troubleshooting

### Graph file not found or incompatible

Run `pnpm devgraph build .` first to generate `.devgraph/graph.json`.

### Status shows stale files

Run `pnpm devgraph build .` again, or keep `pnpm devgraph watch .` running during active work.

### CLI changes not reflecting

Rebuild with `pnpm build:cli`. Use `pnpm build:cli-full` only when you need the embedded Studio assets refreshed too.
