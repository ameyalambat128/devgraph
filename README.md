# DevGraph

DevGraph is a pnpm-first Turborepo with a Next.js docs app and a CLI to parse `devgraph-*` fenced Markdown blocks (service/api/env), build a project graph, and emit docs/diagrams into `.devgraph/`.

## Quick start

- Install: `pnpm install`
- Validate: `pnpm --filter devgraph-cli devgraph validate examples/*.md`
- Build outputs: `pnpm --filter devgraph-cli devgraph build examples/*.md`
- Outputs land in `.devgraph/` (`graph.json`, `summary.md`, `agents/*.md`, `system.mmd`, optional `system.png`).
- Format: `pnpm format` (Prettier). Check-only: `pnpm format:check`.

## Structure

- `apps/web`: Next.js app with MDX docs (`/app/docs`).
- `packages/devgraph-core`: parsers, graph builder, generators.
- `packages/devgraph-cli`: CLI wiring to core (`devgraph build|validate`).
- `.devgraph/`: generated artifacts (ignored in git).
- `docs/DEVLOG.md`: contributor-facing change log/notes.

## Development

- Dev server (docs): `pnpm dev --filter web`
- Build web: `pnpm build --filter web`
- Lint web: `pnpm lint --filter web`
- Lint core/cli: `pnpm --filter @devgraph/core lint`, `pnpm --filter devgraph-cli lint`
- Core/CLI builds: `pnpm --filter @devgraph/core build`, `pnpm --filter devgraph-cli build`

## Notes

- Uses Next.js App Router with MDX (`@next/mdx`).
- Mermaid PNG generation is best-effort via `@mermaid-js/mermaid-cli`.
- Conventional commits: `feat|fix|docs|ci|build|refactor|perf|style|test|chore`.
- Linting uses root ESLint config (TS + Next override); Turbo orchestrates lint/build/test per package.
