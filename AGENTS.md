# AGENTS.md

## Overview

DevGraph is a Turborepo monorepo (pnpm-first) with a Next.js app and a shared TypeScript CLI/lib that scans Markdown for `devgraph-*` fenced blocks, builds a project graph, and generates outputs like `graph.json`, `summary.md`, `AGENTS.md`, and `system.mmd/png` inside `.devgraph/`.

## Immediate Plan (v0.1)

- Define block specs for `devgraph-service`, `devgraph-api`, and `devgraph-env` (YAML inside fenced Markdown).
- Build parser to scan `.md` files, extract and validate blocks.
- Assemble unified `graph.json` from parsed blocks (services, apis, env, dependencies).
- Generators: `summary.md`, per-service `AGENTS.md`, `system.mmd` (Mermaid) → `system.png`.
- CLI commands: `devgraph build` (end-to-end) and `devgraph validate` (schema checks only).
- Diff engine: compare two `graph.json` files to emit `integration_notes.md`.
- Docs/release: README, examples, badge, simple landing page, npm packaging.

## Stack (pnpm + Turborepo + Next.js)

- Package manager: pnpm (root `packageManager` set, lockfile committed).
- Build system: Turborepo (`turbo` scripts at root).
- Apps: Next.js app (in `apps/web`) for landing/docs/demo.
- Shared code: TypeScript packages for CLI/core logic.
- Markdown parsing: `remark`/`unified` or `markdown-it`.
- YAML parsing: `yaml` npm package.
- CLI: `tsx` + `commander` or lean runner.
- Mermaid rendering: `@mermaid-js/mermaid-cli` for `system.png`.

## Proposed Directory Layout

```
apps/
  web/                # Next.js app (landing/docs/demo)
packages/
  devgraph-core/      # parsers, graph builder, generators, diff
  devgraph-cli/       # CLI entrypoint wrapping core
  config/             # shared eslint/prettier/turbo config
  tsconfig/           # shared TS configs
.devgraph/            # generated artifacts (graph.json, summary.md, system.mmd/png, AGENTS)
turbo.json
pnpm-workspace.yaml
pnpm-lock.yaml
package.json          # root scripts: turbo run build/dev/lint, packageManager=pnpm@x
```

## Turborepo/Pnpm Defaults (from docs)

- `pnpm-workspace.yaml` globs: `apps/*`, `packages/*`.
- Root scripts: `"build": "turbo run build"`, `"dev": "turbo run dev"`, `"lint": "turbo run lint"`.
- DevDependency: `"turbo": "latest"`.
- `packageManager`: pin pnpm version (e.g., `pnpm@9.x`).

## Dev Workflow (once scaffolded)

- Install deps: `pnpm install`.
- Run build pipeline: `pnpm devgraph build` (or `pnpm devgraph validate`) via CLI package; for overall repo use `pnpm dev`/`pnpm build` (Turbo).
- Outputs land in `.devgraph/` (`graph.json`, `summary.md`, `system.mmd`, `system.png`, generated `AGENTS.md` files). Keep repo root clean by treating `.devgraph/` as the canonical output folder.

## Notes for Agents

- Repo is currently empty; next step is to scaffold the TypeScript project per layout above.
- Start by codifying schemas/interfaces for block types and `graph.json`.
- Ensure parsers and generators are deterministic for CLI use.
- Keep outputs Markdown/JSON-only; avoid network calls in core logic.
- Enforce pnpm usage and Turborepo task graph in CI and scripts.
- Docs approach: use Next.js built-in MDX (no Contentlayer). Add `@next/mdx`, configure `pageExtensions` for md/mdx, and keep docs in `apps/web/app/docs/*.mdx` with a shared layout.
- Additional considerations: pin TS/ESLint/Prettier configs in `packages/config`, add `tsconfig` base in `packages/tsconfig`, set up CI to run `pnpm lint && pnpm test && pnpm build`, and leverage Turbo caching locally/CI.
- Use Context7 MCP docs for Turborepo/Next/pnpm/MDX references; follow doc-recommended defaults and scaffold with Turborepo CLI patterns (pnpm-first).
- Git workflow: conventional commits (`feat|fix|docs|ci|build|refactor|perf|style|test|chore`), concise messages; keep `.devgraph/` generated outputs ignored.
- Local docs: `apps/web/app/docs` (MDX) for public-facing docs; `docs/DEVLOG.md` to summarize ongoing changes/status for contributors.
- README maintenance: keep `README.md` concise and current whenever features land (what it is, how to install, how to run CLI, outputs in `.devgraph/`, links to docs).
- Formatting/linting: Prettier via `pnpm format`, ESLint via root config (TS + Next override).
- Formatting/linting: use Biome (`@biomejs/biome`), primary formatter/linter. Root scripts `pnpm fmt` (biome check --write) and `pnpm lint:biome`. Package-level `lint` uses Biome. Keep config in `biome.json`.
