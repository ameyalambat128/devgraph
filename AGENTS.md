# AGENTS.md

## Overview

DevGraph is a Turborepo monorepo (pnpm-first) that scans Markdown for `devgraph-*` fenced blocks, builds a project graph, and generates outputs like `graph.json`, `summary.md`, agent markdown files, and Mermaid diagrams inside `.devgraph/`.

## Package Structure

```
apps/
  web/                # Landing page (Next.js)
  studio/             # Graph visualization app (Next.js, React Flow)
                      # Built as static export, embedded in CLI
packages/
  devgraph-core/      # Parsers, graph builder, generators, diff
  devgraph-cli/       # CLI entrypoint + embedded Studio server
.devgraph/            # Generated outputs (gitignored)
```

## CLI Commands

```bash
devgraph validate [paths...]   # Validate devgraph blocks
devgraph build [paths...]      # Build graph.json + outputs
devgraph studio                # Start local Studio server (port 9111)
```

### Studio Command

`devgraph studio` serves the embedded React app locally:
- Graph visualization with React Flow
- Click nodes to view service details
- Edit and export graph.json
- Static Next.js build bundled in CLI npm package

## Stack

- **Monorepo**: pnpm + Turborepo
- **Apps**: Next.js 16, React 19, Tailwind CSS 4
- **CLI**: Node.js, Commander
- **Studio**: React Flow, Dagre layout, Zustand state
- **UI**: shadcn/ui components

## Dev Workflow

```bash
pnpm install           # Install deps
pnpm dev               # Run all apps in dev mode
pnpm build             # Build all packages
pnpm build:cli-full    # Build CLI with embedded Studio
pnpm devgraph build    # Generate .devgraph/ outputs
pnpm devgraph studio   # Start Studio server
```

## Build Pipeline (Studio Embedding)

1. `pnpm build:studio` → Next.js static export to `apps/studio/out/`
2. `pnpm build:cli-full` → Copies static files to `packages/devgraph-cli/dist/studio-web/`
3. CLI serves embedded files at `http://localhost:9111`

## Code Style

- Component files: kebab-case (e.g., `service-node.tsx`)
- Use `export function` for components
- Prefer descriptive names over comments

## Key Files

| File | Purpose |
|------|---------|
| `packages/devgraph-cli/src/index.ts` | CLI entry, commands |
| `packages/devgraph-cli/src/studio/server.ts` | HTTP server for Studio |
| `packages/devgraph-core/src/index.ts` | Parser, graph builder, generators |
| `apps/studio/src/app/page.tsx` | Studio main page |
| `apps/studio/src/store/studio-store.ts` | Zustand state |

## Notes for AI Agents

- Generated `.devgraph/` outputs are gitignored
- Studio static assets bundled in CLI for offline use
- Graph types defined in `apps/studio/src/types/`
- Use Context7 MCP for framework docs (Next.js, React Flow, etc.)
