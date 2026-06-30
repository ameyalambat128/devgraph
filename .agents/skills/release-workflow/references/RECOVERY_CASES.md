# Recovery Cases

Use this file when the normal release policy cannot be followed.

## Missing changesets on `main`

Default behavior:

- stop
- report the missing release intent
- ask the user whether they want explicit recovery handling

Do not silently infer and create missing changesets during an ordinary release pass.

## Off-`main` invocation

Default behavior:

- do not execute release operations
- provide dry-run guidance only

If the user asks for planning, you may inspect the current branch and explain what would block or change on `main`.

## Release doc drift without release execution

If the user only wants release docs synchronized:

- update `internal-docs/RELEASING.md`
- update release and changeset sections in `CONTRIBUTING.md`
- do not publish, tag, or version

## Existing stale branch guidance

If branch-side changeset guidance in `CONTRIBUTING.md` conflicts with current package scripts or policy, update it here only if the change is release-policy related. Product docs remain owned by `sync-doc-surfaces`.
