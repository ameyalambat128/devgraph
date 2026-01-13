---
"@devgraph/core": minor
"devgraph": minor
---

Enhanced validate command with consistency checks and architecture rules engine.

- Add graph consistency validation: missing dependencies, duplicate services, orphan blocks, dependency cycles
- Add architecture rules support via `.devgraph/config.yaml` with `denyDependency` rule type
- Add `--json`, `--config`, and `--report` flags to CLI validate command
- Add line numbers to parse errors for better debugging
- Implement proper exit codes (0=pass, 1=errors, 2=tooling error) for CI integration
