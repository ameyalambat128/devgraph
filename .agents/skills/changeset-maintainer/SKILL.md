---
name: changeset-maintainer
description: Create or skip a changeset for the current branch.
disable-model-invocation: true
---

# changeset-maintainer

Create or skip a changeset for the current branch.

## Purpose

This skill owns branch-level release intent before merge.

It owns:

- `.changeset/*.md`
- branch-side changeset guidance in `CONTRIBUTING.md`

It does not own:

- version bumps
- publishing
- tags
- GitHub releases
- `internal-docs/RELEASING.md`

## Steps

1. Verify branch context first.
   Read the current branch and compare it against `main`.
   If the current branch is `main`, refuse by default and redirect to `release-workflow`.
   Only continue on `main` if the user explicitly asks for recovery mode.
   Completion criterion: branch context is classified as branch flow, refusal, or explicit recovery.

2. Inspect package impact from the diff.
   Read:

   - `.changeset/config.json`
   - `package.json`
   - `packages/devgraph-cli/package.json`
   - `packages/devgraph-core/package.json`
   - `CONTRIBUTING.md`
   - the current diff against `main`
     Use `references/PACKAGE_SCOPE.md`.
     Completion criterion: every changed path is classified as published package, unpublished surface, or mixed.

3. Decide whether a changeset is needed.
   Use `references/BUMP_GUIDE.md`.
   Rules:

   - if only unpublished surfaces changed, explicitly skip the changeset
   - if `devgraph` or `@devgraph/core` changed in a releasable way, create a changeset
   - if the diff is mixed, include only published packages that actually changed
     Completion criterion: you have either a justified skip decision or a concrete bump plan.

4. Create or confirm the changeset.
   If a changeset is needed, create one with:

   - correct package names
   - correct bump type
   - concise release-facing summary
     If a suitable changeset already exists on the branch, confirm it instead of duplicating it.
     Completion criterion: the branch has either a validated existing changeset, a newly created changeset, or an explicit no-changeset-needed decision.

5. Report outcome and next steps.
   Report:
   - branch classification
   - affected published packages
   - created or reused changeset path, or skip reason
   - next step: commit branch changes and merge to `main`
