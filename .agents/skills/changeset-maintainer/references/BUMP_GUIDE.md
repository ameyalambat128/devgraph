# Bump Guide

Use this file to choose skip, patch, minor, or major.

## Skip

Skip when:

- only unpublished surfaces changed
- published package files changed only in ways that are clearly non-releasable and the user agrees no release note is needed

When skipping, state the reason explicitly.

## Patch

Use patch for:

- bug fixes
- small behavior corrections
- small docs or metadata changes that affect a published package surface
- internal implementation changes with no meaningful new feature

## Minor

Use minor for:

- new commands
- new flags
- meaningful new capabilities
- user-visible enhancements to the published CLI or core package

## Major

Use major for:

- breaking CLI changes
- removed or renamed public commands or flags
- incompatible artifact or API shape changes for published consumers

## Writing the summary

- Keep it to one or two sentences.
- Describe the shipped change, not the implementation process.
- Use package names exactly as tracked by changesets.

## Existing changesets

Before creating a new file, inspect `.changeset/` for an existing branch changeset that already matches the diff. Reuse or amend mentally, but do not duplicate intent across multiple files unless the branch genuinely needs more than one entry.
