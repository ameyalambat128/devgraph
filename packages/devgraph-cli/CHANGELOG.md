# devgraph

## 0.5.0

### Minor Changes

- fbc4177: Enhanced validate command with consistency checks and architecture rules engine.

  - Add graph consistency validation: missing dependencies, duplicate services, orphan blocks, dependency cycles
  - Add architecture rules support via `.devgraph/config.yaml` with `denyDependency` rule type
  - Add `--json`, `--config`, and `--report` flags to CLI validate command
  - Add line numbers to parse errors for better debugging
  - Implement proper exit codes (0=pass, 1=errors, 2=tooling error) for CI integration

- 1ea6f99: Add new `devgraph agents` command for generating rich AGENTS.md files.

  - New standalone command with `--service`, `--best-effort`, `--json`, `--out-dir` flags
  - Inference from package.json scripts (dev, build, test, start, lint)
  - Filesystem landmark detection (src, app, lib, components, etc.)
  - Enhanced template with APIs consumed/exposed sections and search terms
  - Package manager detection from lockfiles

### Patch Changes

- Updated dependencies [fbc4177]
- Updated dependencies [1ea6f99]
  - @devgraph/core@0.5.0

## 0.4.0

### Minor Changes

- 97200e7: Add coordinate command for cross-service coordination planning
- 1b70a15: Add impact command for blast radius analysis

### Patch Changes

- Updated dependencies [97200e7]
- Updated dependencies [1b70a15]
  - @devgraph/core@0.4.0

## 0.3.0

### Minor Changes

- 50ae414: Add `devgraph run <service>` command for dependency-aware service startup plans

### Patch Changes

- Updated dependencies [50ae414]
  - @devgraph/core@0.3.0

## 0.2.0

### Minor Changes

- 3114b4d: Add DevGraph Studio - interactive graph visualization with node details, search, and type filtering

### Patch Changes

- Updated dependencies [3114b4d]
  - @devgraph/core@0.2.0

## 0.1.1

### Patch Changes

- Add CLI welcome banner on help and better empty state message when no blocks found
