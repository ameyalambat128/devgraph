# Contributing to DevGraph

Thanks for your interest in contributing!

## Development Setup

```bash
# Clone and install
git clone https://github.com/ameyalambat128/devgraph.git
cd devgraph
pnpm install

# Run locally
pnpm devgraph build examples/*.md    # Build graph from examples
pnpm devgraph studio                  # Launch visual graph viewer

# Build packages
pnpm build:core                       # Build core library
pnpm build:cli-full                   # Build CLI with embedded Studio
```

## Project Structure

```
apps/
  web/                # Landing page (Next.js)
  studio/             # Visual graph viewer (React Flow)
packages/
  devgraph-core/      # Parser, graph builder, generators
  devgraph-cli/       # CLI + embedded Studio server
```

## Making Changes

1. Fork the repo and create a feature branch from `main`
2. Make your changes
3. Add a changeset: `pnpm changeset`
4. Open a PR to `main`

## Changesets

We use [changesets](https://github.com/changesets/changesets) for versioning. When you make a change that should be released:

```bash
pnpm changeset
```

Select the packages affected and describe your change. This creates a file in `.changeset/` that gets consumed during release.

## Code Style

- Use descriptive variable/function names over comments
- Component files: kebab-case (`service-node.tsx`)
- Prefer `export function` for components

## Questions?

Open an issue or reach out on [X/Twitter](https://x.com/lambatameya).
