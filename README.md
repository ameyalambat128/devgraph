# <img src="https://github.com/ameyalambat128/devgraph/blob/main/.github/public/icon.png" width="40" align="top" /> DevGraph

[![npm version](https://img.shields.io/npm/v/devgraph?style=flat&labelColor=000&color=8B5CF6)](https://www.npmjs.com/package/devgraph)
[![npm downloads](https://img.shields.io/npm/dm/devgraph?style=flat&labelColor=000&color=8B5CF6)](https://www.npmjs.com/package/devgraph)
[![GitHub stars](https://img.shields.io/github/stars/ameyalambat128/devgraph?style=flat&labelColor=000&color=8B5CF6)](https://github.com/ameyalambat128/devgraph/stargazers)

One graph. Every repo. Context for humans and AI.

DevGraph reads your repo, builds a hybrid project graph, and gives you back structure you can actually use. It maps services, files, dependencies, docs, and ownership into one graph so you can understand architecture faster, inspect change impact, and hand better context to coding agents.

Run it on a whole workspace or targeted paths. DevGraph scans directories, files, and globs by default, then uses `devgraph-service`, `devgraph-api`, and `devgraph-env` blocks as the authoritative service layer on top of the repo scan.

The result is a persistent graph plus analysis surfaces you can reuse across sessions:

```text
devgraph build .
.devgraph/
├── graph.json         machine-readable graph with services, apis, and knowledgeGraph
├── summary.md         service overview
├── GRAPH_REPORT.md    graph analysis, bridge nodes, surprising connections
├── agents/            per-service context for coding assistants
├── system.mmd         service relationship diagram
└── codemap.mmd        owned paths and file relationship diagram
```

## Quick Start

### Install

```bash
# run without installing
bunx devgraph@latest build .
# or
pnpm dlx devgraph@latest build .
# or install globally
pnpm add -g devgraph
bun add -g devgraph
```

### 1. Add optional service metadata blocks

DevGraph can build a graph from the repo alone, but `devgraph-service`, `devgraph-api`, and `devgraph-env` blocks let you define the service layer explicitly.

In any `.md` file such as `docs/architecture.md`:

````markdown
## API Service

```devgraph-service
name: api
type: node
paths:
  - apps/api
commands:
  dev: pnpm dev
  build: pnpm build
depends:
  - database
```

```devgraph-api
service: api
routes:
  GET /health: Health check
  GET /api/users: List users
  POST /api/users: Create user
```

```devgraph-env
service: api
vars:
  PORT: "3000"
  DATABASE_URL: postgresql://localhost:5432/mydb
```
````

### 2. Build the graph

```bash
devgraph build .
```

`build` accepts files, globs, and directories. With no arguments it scans the current workspace.

### 3. Check outputs

Outputs are generated in `.devgraph/`:

| File                   | Description                                                                                   |
| ---------------------- | --------------------------------------------------------------------------------------------- |
| `graph.json`           | Machine-readable output containing top-level `services`, `apis`, and `knowledgeGraph`         |
| `summary.md`           | Human-readable overview of the service layer plus hybrid graph counts                         |
| `GRAPH_REPORT.md`      | Hybrid graph analysis with god nodes, surprising connections, bridge nodes, and coverage gaps |
| `agents/*.md`          | Per-service context files for LLMs                                                            |
| `system.mmd`           | Mermaid diagram of service dependencies                                                       |
| `codemap.mmd`          | Mermaid diagram of hybrid graph relationships                                                 |
| `integration_notes.md` | Diff summary when using `--compare`                                                           |

At a high level, `graph.json` now includes:

- top-level `services`
- top-level `apis`
- `knowledgeGraph.nodes`
- `knowledgeGraph.edges`
- `knowledgeGraph.communities`
- `knowledgeGraph.analysis`

## Build Model

DevGraph builds a hybrid project graph from your repo:

- **Whole-repo scanning**: `devgraph build` walks files, directories, and globs by default
- **Authoritative service layer**: `devgraph-service` blocks define the service model, commands, APIs, env, and optional ownership paths
- **Hybrid graph layer**: `knowledgeGraph` adds service and file nodes with typed edges such as `owns`, `references`, `documents`, `defined_in`, and `depends_on`
- **Deterministic analysis**: `GRAPH_REPORT.md` and `devgraph query` operate on the built graph without requiring an external server

`.devgraphignore` lets you exclude noise such as `node_modules`, build outputs, vendored code, and other generated artifacts.

## Block Types

| Block              | Purpose           | Required Fields     |
| ------------------ | ----------------- | ------------------- |
| `devgraph-service` | Define a service  | `name`, `type`      |
| `devgraph-api`     | Define API routes | `service`, `routes` |
| `devgraph-env`     | Define env vars   | `service`, `vars`   |

### devgraph-service

```yaml
name: my-service
type: node
paths:
  - apps/my-service
commands:
  dev: pnpm dev
  build: pnpm build
depends:
  - other-service
```

### devgraph-api

```yaml
service: my-service
routes:
  GET /health: Health check
  POST /api/users: Create user
```

### devgraph-env

```yaml
service: my-service
vars:
  PORT: '3000'
  DATABASE_URL: postgresql://localhost:5432/db
```

## CLI Commands

```bash
# Build the hybrid project graph and outputs
devgraph build .

# Build with diff against a previous graph snapshot
devgraph build . --compare .devgraph/graph.json

# Query the built knowledge graph
devgraph query "where does api connect to db?"
devgraph query "which files document auth?" --budget 300 --dfs

# Validate service blocks and architecture rules
devgraph validate docs/**/*.md

# Generate a dependency-aware run plan
devgraph run api
devgraph run api --json
devgraph run api --runbook

# Analyze impact and coordination
devgraph impact api --json
devgraph coordinate api --json

# Generate Agent Skills for AI tools
devgraph agents --format skills

# Launch the visual graph viewer
devgraph studio
```

## Querying the Graph

Use `devgraph query` to retrieve a focused subgraph instead of searching raw files broadly:

```bash
devgraph query "which files belong to api?"
```

The result includes:

- matched node labels
- relations between nodes
- provenance such as `EXTRACTED`, `INFERRED`, or `AMBIGUOUS`
- source paths and source locations when available

`GRAPH_REPORT.md` and `devgraph query` are the primary analysis surfaces for the hybrid build.

## Agent Skills

DevGraph generates [Agent Skills](https://agentskills.io), the open standard supported by Claude Code, Cursor, Gemini CLI, VS Code, GitHub Copilot, and many other tools.

```bash
devgraph agents --format skills
```

This creates a `.skills/` directory with SKILL.md files that AI agents auto-discover at startup.

The overview skill now tells agents to:

- read `.devgraph/GRAPH_REPORT.md` before broad architecture searches
- use `devgraph query "<question>"` for focused retrieval
- use DevGraph CLI commands such as `impact`, `validate`, and `run` for service-aware workflows

DevGraph also generates an orchestration skill for handing context from one agent to another:

```text
.skills/
├── orchestrating-devgraph-context/
│   ├── SKILL.md
│   └── references/
│       └── HANDOFF_TEMPLATE.md
├── querying-architecture/
└── services/
```

The orchestration skill guides agents to:

- read `GRAPH_REPORT.md` first
- pick 3 to 6 graph questions from `knowledgeGraph.analysis`, coverage gaps, services, dependencies, and APIs
- run focused `devgraph query "<question>"` calls
- ask the user only for missing intent, constraints, and done criteria
- produce a Markdown handoff brief with goal, known context, graph evidence, decisions, open questions, and a suggested next agent task

## DevGraph Studio

Visualize your project graph in a local web app:

```bash
devgraph studio
```

Opens at `http://localhost:9111` with:

- interactive graph visualization for service and file nodes
- a detail panel with path, ownership, provenance, and evidence
- filters for node kind, community, provenance, and ownership
- export and edit flows for the loaded graph

## Examples

See [`examples/ecommerce.md`](examples/ecommerce.md) for a realistic multi-service example with explicit service metadata blocks.

## Development

```bash
# Install dependencies
pnpm install

# Run the hybrid build locally
pnpm devgraph build .

# Query the built graph
pnpm devgraph query "which files belong to studio?"

# Build packages
pnpm build:core && pnpm build:cli

# Run tests
pnpm test:core
```

## Structure

- `apps/web`: Landing page and Mintlify docs
- `apps/studio`: Visual graph viewer built on React Flow
- `packages/devgraph-core`: Hybrid graph build pipeline, analyzers, generators, and query logic
- `packages/devgraph-cli`: CLI entrypoint and embedded Studio server
- `.devgraph/`: Generated outputs (gitignored)

## License

[MIT](LICENSE) © [Ameya Lambat](https://ameyalambat.com)
