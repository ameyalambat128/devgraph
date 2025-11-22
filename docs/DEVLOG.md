# DevLog

## Current MVP status

- Turborepo + pnpm workspace scaffolded (Next.js app + core/cli packages).
- Next.js docs/landing lives in `apps/web` with MDX enabled via `@next/mdx`.
- Core package parses Markdown for `devgraph-*` fenced blocks (service/api/env), validates YAML, builds a graph, and generates summary/agents/mermaid text.
- CLI builds `.devgraph/` outputs: `graph.json`, `summary.md`, per-service agents, `system.mmd`, and attempts `system.png` via `@mermaid-js/mermaid-cli`.
- Tooling: root Prettier (`pnpm format`), ESLint config (TS + Next override) with package lint scripts using workspace-root eslint; Biome scripts remain if preferred.

## Next up

- Harden validation (schemas, better errors) and support more block fields.
- Expand generators: richer AGENTS, integration diff, and tests.
- Flesh out docs in `apps/web/app/docs` for usage and examples.
