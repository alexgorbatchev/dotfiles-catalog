# dotfiles-catalog

Git-hosted tool definitions and companion files for `dotfiles catalog fetch`.

## Commands

- Prepare validation dependencies and the canonical installer SDK: `just setup` (requires Git, Bun and Go).
- Prepare or reuse the pinned installer SDK: `just sdk`; an existing `.tmp/installer` must be clean and at the pinned revision.
- Validate catalog definitions during development: `just run`.
- Run all catalog checks: `bun check` or `just check`.
- Run the layout and definition typecheck only: `bun run validate`.
- Run validator regression tests with 90% line/function coverage: `bun run test`.
- Format all Oxfmt-supported catalog files: `bun run fmt` or `just fmt`.
- Check formatting without writing files: `bun run fmt:check` or `just fmt-check`. Keep this check in `bun check` so CI covers tool definitions and companion configuration as well as validator code.
- Fix validator lint issues and format catalog files: `bun run fix` or `just fix`.
- CI runs these checks on pushes and pull requests. The installer revision is pinned in `.github/workflows/ci.yml` and `justfile`; update both together when upgrading the authoring API.

## Content contract

- Store each tool at `tools/<first-character>/<second-character>/<id>/tool.ts`; use `_` as the second character for a one-character ID.
- Include required configuration, helpers and assets beneath that tool directory. Fetch renames only `tool.ts` to `<id>.tool.ts` at the destination.
- Keep each tool directory free of additional `*.tool.ts` files, symlinks, submodules and unsafe or case-colliding names. Store dependency tools as separate catalog IDs.
- Use the maintained dotfiles skill and verified installer API when editing definitions. Preserve source configurations unless a change is necessary to make the imported tool self-contained.
- Keep this repository limited to Git source content. Publishing automation is maintained separately; do not add a website or search service.
- Keep the root README independent of catalog size: link to `tools/` instead of listing available tools or maintaining per-tool requirements there.

## Validation and boundaries

- Fetch committed tools into an isolated project, run generation and typechecking there, and inspect imported file bytes and generated shell integration. Never install tools or apply configuration to the maintainer's real home during validation.
- Typecheck every catalog TypeScript file against the canonical installer SDK with its runtime globals. Keep Bun/Node globals confined to validator code; do not execute tool definitions during CI.
- Use project-local `.tmp/` for validation artifacts and `.workspaces/` for worktrees; never use heredocs.
- Read applicable skills before changes. Record new standing instructions here. Preserve other worktrees and unowned changes.
- Commit only owned files. Push only when publishing the specific source changes is authorized. Never publish releases, packages or deployments without explicit authorization.
- Never commit or push private internal hostnames to GitHub. Before committing or pushing, verify the destination and scan staged changes and outgoing commits for private hostnames, including generated content and commit messages.
