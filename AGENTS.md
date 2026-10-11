# dotfiles-catalog

Git-hosted tool definitions and companion files for `dotfiles catalog fetch`.

## Content contract

- Store each tool at `tools/<first-character>/<second-character>/<id>/tool.ts`; use `_` as the second character for a one-character ID.
- Include required configuration, helpers and assets beneath that tool directory. Fetch renames only `tool.ts` to `<id>.tool.ts` at the destination.
- Keep each tool directory free of additional `*.tool.ts` files, symlinks, submodules and unsafe or case-colliding names. Store dependency tools as separate catalog IDs.
- Use the maintained dotfiles skill and verified installer API when editing definitions. Preserve source configurations unless a change is necessary to make the imported tool self-contained.
- Keep this repository limited to Git source content. Publishing automation is maintained separately; do not add a website or search service.

## Validation and boundaries

- Fetch committed tools into an isolated project, run generation and typechecking there, and inspect imported file bytes and generated shell integration. Never install tools or apply configuration to the maintainer's real home during validation.
- Use project-local `.tmp/` for validation artifacts and `.workspaces/` for worktrees; never use heredocs.
- Read applicable skills before changes. Record new standing instructions here. Preserve other worktrees and unowned changes.
- Commit only owned files. Push only when publishing the specific source changes is authorized. Never publish releases, packages or deployments without explicit authorization.
