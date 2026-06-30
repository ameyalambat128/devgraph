# Legacy Policy

`sync-doc-surfaces` updates active owned docs only.

## Flag but do not edit by default

- `internal-docs/marketing/**`
- `internal-docs/outreach/**`
- `internal-docs/feedback/**`
- historical specs and launch threads
- legacy command docs for removed or non-shipped commands

## Typical stale items to flag

- references to `validate`, `impact`, `coordinate`, `agents`, or `studio` as part of the active product surface
- old artifact names and report-generation workflows
- outdated examples that still describe the pre-v1 graph workflow

## Final-report format

When you find stale legacy references, report:

- file path
- stale command or workflow
- why it is stale relative to current code truth

Do not edit those files unless the user explicitly asks for a legacy cleanup pass.
