---
name: release-workflow
description: Guide or execute the main-branch release workflow.
disable-model-invocation: true
---

# release-workflow

Guide or execute the main-branch release workflow.

## Purpose

This skill owns release-facing docs and the `main` branch release path.

It owns:

- `internal-docs/RELEASING.md`
- release and changeset sections in `CONTRIBUTING.md`
- release note procedure and publish checklist docs

It does not own:

- product docs
- `README.md`
- docs app pages
- branch-side changeset authoring except explicit recovery mode

## Steps

1. Verify branch context.
   Read the current branch.
   On `main`, continue normally.
   Off `main`, default to dry-run planning or refusal unless the user explicitly asks for release planning only.
   Completion criterion: branch context is classified as executable release flow, dry-run guidance, or refusal.

2. Read the release source of truth.
   Read:

   - `package.json`
   - `packages/devgraph-cli/package.json`
   - `packages/devgraph-core/package.json`
   - `.changeset/config.json`
   - `internal-docs/RELEASING.md`
   - release and changeset sections in `CONTRIBUTING.md`
     Use `references/RELEASE_CHECKLIST.md`.
     Completion criterion: current versioning, publish scripts, and documentation steps are reconciled against code truth.

3. Inspect pending release inputs.
   Check:

   - pending `.changeset/*.md` files
   - whether release-facing docs drift from current scripts or package policy
   - whether versioning inputs are missing
     Completion criterion: you can state whether the repo is ready to version, blocked, or in recovery mode.

4. Handle the release path according to user intent.

   - If asked to sync release docs, update owned docs only.
   - If asked to execute release work on `main`, follow the checklist.
   - If changesets are missing, stop and report unless the user explicitly asks for recovery mode.
     Use `references/RECOVERY_CASES.md` for exceptions.
     Completion criterion: the release path is either completed or blocked with a concrete reason.

5. Report outcome.
   Report:
   - branch classification
   - pending changesets found
   - docs updated or left unchanged
   - executed or blocked release steps
   - any recovery-mode assumptions
