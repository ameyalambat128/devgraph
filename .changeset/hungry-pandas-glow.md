---
"@devgraph/core": minor
"devgraph": minor
---

Add new `devgraph agents` command for generating rich AGENTS.md files.

- New standalone command with `--service`, `--best-effort`, `--json`, `--out-dir` flags
- Inference from package.json scripts (dev, build, test, start, lint)
- Filesystem landmark detection (src, app, lib, components, etc.)
- Enhanced template with APIs consumed/exposed sections and search terms
- Package manager detection from lockfiles
