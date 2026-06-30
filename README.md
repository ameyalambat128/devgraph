# <img src="https://github.com/ameyalambat128/devgraph/blob/main/.github/public/icon.png" width="40" align="top" /> DevGraph

[![npm version](https://img.shields.io/npm/v/devgraph?style=flat&labelColor=000&color=8B5CF6)](https://www.npmjs.com/package/devgraph)
[![npm downloads](https://img.shields.io/npm/dm/devgraph?style=flat&labelColor=000&color=8B5CF6)](https://www.npmjs.com/package/devgraph)
[![GitHub stars](https://img.shields.io/github/stars/ameyalambat128/devgraph?style=flat&labelColor=000&color=8B5CF6)](https://github.com/ameyalambat128/devgraph/stargazers)

Persistent local code memory for AI coding assistants.

DevGraph incrementally indexes your codebase into a queryable graph that lives in `.devgraph/`. It is on-device, file-based, and optimized for code understanding instead of report generation.

## What ships in v1

```bash
devgraph build [paths...]
devgraph watch [paths...]
devgraph query "<question>"
devgraph status
```

That is the product surface.

## How it works

`devgraph build` runs a small sync loop:

1. resolve candidate files
2. apply default ignores and `.devgraphignore`
3. hash files
4. compare against the manifest
5. re-extract only changed files
6. merge per-file artifacts into a canonical graph
7. write updated artifacts back to `.devgraph/`

`devgraph watch` reuses the same sync engine and keeps the graph fresh on local file changes.

## Output artifacts

DevGraph stores inspectable local artifacts:

```text
.devgraph/
├── manifest.json
├── graph.json
└── cache/
    ├── <file-id>.json
    └── ...
```

- `manifest.json` tracks relative paths, hashes, kinds, extraction version, and sync timestamps
- `graph.json` is the canonical queryable memory graph
- `cache/*.json` stores per-file extracted artifacts for incremental rebuilds

## Indexed by default

V1 indexes:

- source code
- repo config files that help navigation
- root context files such as `README.md`, `AGENTS.md`, and `CLAUDE.md`

V1 ignores common noise by default:

- examples
- internal planning or marketing docs
- docs app content
- generated assets and build output
- lockfiles and static exports

Add `.devgraphignore` for repo-specific exclusions.

## Install

```bash
# run without installing
bunx devgraph@latest build .

# or
pnpm dlx devgraph@latest build .

# or install globally
pnpm add -g devgraph
bun add -g devgraph
```

## Quickstart

Build the local graph:

```bash
devgraph build .
```

Inspect graph health:

```bash
devgraph status
```

Ask a focused code question:

```bash
devgraph query "where is devgraph build implemented"
```

Keep it fresh while you work:

```bash
devgraph watch .
```

## Query model

The graph is code-first.

V1 nodes:

- file
- symbol

V1 edges:

- `contains`
- `defines`
- `imports`
- `references`
- `mentions`

`devgraph query` ranks files and snippets using paths, symbol names, chunk text, and nearby graph edges. It returns bounded evidence instead of a huge repo dump.

## Current focus

DevGraph v1 is code understanding first.

Multi-source memory for docs, papers, and meetings is a later goal. The current architecture leaves room for that, but the shipped loop is intentionally narrow and deterministic.
