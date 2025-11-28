# <img src="https://github.com/ameyalambat128/devgraph/blob/main/.github/public/logo.png?raw=true" width="60" align="center" /> DevGraph

DevGraph is a CLI that scans Markdown for `devgraph-*` fenced blocks (service/api/env), builds a unified project graph, and emits human/agent-friendly outputs (`graph.json`, `summary.md`, per-service `AGENTS.md`, Mermaid diagrams, and a codemap) into `.devgraph/`.

## Quick start

- Install: `pnpm install`
- Validate: `pnpm devgraph validate examples/*.md`
- Build outputs: `pnpm devgraph build examples/*.md`
- Optional diff: `pnpm devgraph build examples/*.md --compare .devgraph/graph.json`
- Outputs land in `.devgraph/` (`graph.json`, `summary.md`, `agents/*.md`, `system.mmd`, optional `system.png`, `codemap.mmd/png`, `integration_notes.md` when using `--compare`).
- `.devgraph/` is git-ignored because it contains generated artifacts.
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
- Tests (core): `pnpm --filter @devgraph/core test`

## Notes

- Uses Next.js App Router with MDX (`@next/mdx`).
- Mermaid PNG generation is best-effort via `@mermaid-js/mermaid-cli`.
- Conventional commits: `feat|fix|docs|ci|build|refactor|perf|style|test|chore`.
- Linting uses root ESLint config (TS + Next override); Turbo orchestrates lint/build/test per package.
