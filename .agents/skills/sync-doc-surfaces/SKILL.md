---
name: sync-doc-surfaces
description: Update DevGraph's owned docs surfaces after code changes.
disable-model-invocation: true
---

# sync-doc-surfaces

Update DevGraph's owned docs surfaces after code changes.

## Purpose

This skill keeps active docs aligned with current code and package truth.

It owns:

- `README.md`
- active docs app pages under `apps/docs/`
- `internal-docs/DEVELOPMENT.md`

It does not own:

- `internal-docs/RELEASING.md`
- release or changeset sections in `CONTRIBUTING.md`
- `.changeset/*`
- changelogs, tags, or GitHub release notes

## Steps

1. Read current truth from code first.
   Read:

   - `packages/devgraph-cli/src/index.ts`
   - `package.json`
   - `packages/devgraph-cli/package.json`
   - `packages/devgraph-core/package.json`
   - `packages/devgraph-core/src/index.ts`
   - `packages/devgraph-core/src/types.ts`
     Completion criterion: you can state the current command surface, artifact shape, and relevant build or check scripts without relying on existing prose.

2. Inspect the code diff before choosing docs to edit.
   Use the diff to classify what changed:

   - commands or flags
   - output artifacts
   - indexing or query behavior
   - build or check scripts
   - user-facing product narrative
     Completion criterion: every relevant code change is mapped to one or more owned surfaces, or explicitly marked as not requiring docs updates.

3. Update only the owned active surfaces.
   Use `references/SURFACES.md` to map code truth to docs files.
   Update the minimum owned set needed by the diff, which can include:

   - `README.md`
   - `apps/docs/docs.json`
   - `apps/docs/introduction.mdx`
   - `apps/docs/quickstart.mdx`
   - active CLI docs for shipped commands
   - `internal-docs/DEVELOPMENT.md`
     Completion criterion: every changed command, script, artifact, and owned workflow surface is updated or explicitly reported as unchanged.

4. Sweep for stale legacy references without editing them.
   Use `references/LEGACY_POLICY.md`.
   Scan for stale mentions of removed commands or old workflows outside owned surfaces.
   Completion criterion: stale legacy references are listed for the final report, and no non-owned historical surface is edited by default.

5. Verify the repo after edits.
   Run:
   - `pnpm check`
   - `pnpm format`
     Completion criterion: both commands have been run, and any failures or remaining drift are reported.

## Final report

Report:

- owned surfaces updated
- owned surfaces reviewed but unchanged
- stale legacy references found but not edited
- verification results
