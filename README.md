# <img src="https://github.com/ameyalambat128/devgraph/blob/main/.github/public/icon.png" width="40" align="top" /> DevGraph

[![npm version](https://img.shields.io/npm/v/devgraph?style=flat&labelColor=000&color=8B5CF6)](https://www.npmjs.com/package/devgraph)
[![npm downloads](https://img.shields.io/npm/dm/devgraph?style=flat&labelColor=000&color=8B5CF6)](https://www.npmjs.com/package/devgraph)
[![GitHub stars](https://img.shields.io/github/stars/ameyalambat128/devgraph?style=flat&labelColor=000&color=8B5CF6)](https://github.com/ameyalambat128/devgraph/stargazers)

One graph. Every repo. Context for humans and AI.

DevGraph scans Markdown for `devgraph-*` fenced blocks and builds a unified project graph with human-readable and LLM-optimized outputs.

## Quick Start

### Install

```bash
npm install -g devgraph
# or use npx
npx devgraph build docs/*.md
```

### 1. Add blocks to your Markdown

In any `.md` file (e.g., `docs/architecture.md`):

```markdown
## API Service

\`\`\`devgraph-service
name: api
type: node
commands:
  dev: npm run dev
  build: npm run build
depends:
  - database
\`\`\`

\`\`\`devgraph-api
service: api
routes:
  GET /health: Health check
  GET /api/users: List users
  POST /api/users: Create user
\`\`\`

\`\`\`devgraph-env
service: api
vars:
  PORT: "3000"
  DATABASE_URL: postgresql://localhost:5432/mydb
\`\`\`
```

### 2. Build the graph

```bash
devgraph build docs/*.md
```

### 3. Check outputs

Outputs are generated in `.devgraph/`:

| File | Description |
|------|-------------|
| `graph.json` | Machine-readable project graph |
| `summary.md` | Human-readable overview with tables |
| `agents/*.md` | Per-service context files for LLMs |
| `system.mmd` | Mermaid diagram of service dependencies |
| `codemap.mmd` | Mermaid diagram of repo structure |

## Block Types

| Block | Purpose | Required Fields |
|-------|---------|-----------------|
| `devgraph-service` | Define a service | `name`, `type` |
| `devgraph-api` | Define API routes | `service`, `routes` |
| `devgraph-env` | Define env vars | `service`, `vars` |

### devgraph-service

```yaml
name: my-service          # Service name (required)
type: node                # Service type: node, nextjs, python, etc. (required)
commands:                 # Optional commands
  dev: npm run dev
  build: npm run build
depends:                  # Optional dependencies
  - other-service
```

### devgraph-api

```yaml
service: my-service       # Parent service name (required)
routes:                   # Route definitions (required)
  GET /health: Health check
  POST /api/users: Create user
```

### devgraph-env

```yaml
service: my-service       # Parent service name (required)
vars:                     # Environment variables (required)
  PORT: "3000"
  DATABASE_URL: postgresql://localhost:5432/db
```

## CLI Commands

```bash
# Validate blocks without generating outputs
devgraph validate docs/*.md

# Build graph and generate all outputs
devgraph build docs/*.md

# Build with diff against previous graph
devgraph build docs/*.md --compare .devgraph/graph.json
```

## Examples

See [`examples/ecommerce.md`](examples/ecommerce.md) for a realistic multi-service example.

## Development

```bash
# Install dependencies
pnpm install

# Run CLI locally
pnpm devgraph build examples/*.md

# Build packages
pnpm build:core && pnpm build:cli

# Run tests
pnpm test:core
```

## Structure

- `apps/web`: Landing page and docs
- `packages/devgraph-core`: Parser, graph builder, generators
- `packages/devgraph-cli`: CLI wrapper
- `.devgraph/`: Generated outputs (git-ignored)

## License

[MIT](LICENSE) © [Ameya Lambat](https://ameyalambat.com)
