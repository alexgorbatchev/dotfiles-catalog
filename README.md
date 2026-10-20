`dotfiles-catalog` contains editable tool definitions and configuration files for the dotfiles CLI, seeded from Alex Gorbatchev's dotfiles.

# What It Does

- **Fetch tools**: Retrieve editable tool definitions from Git.
- **Include configurations**: Keep each tool's configuration and helper files together.
- **Browse definitions**: Explore the [tool directory](tools/) to choose a tool and review its requirements.

# How It Works

1. Run `dotfiles catalog fetch <id>` in an existing dotfiles project.
2. Review the downloaded definition and accompanying files.
3. Run `dotfiles generate` to make the definition available to the normal tool workflow.
4. Install the tool when ready with `dotfiles install <id>`.

# How it Really Works

- Fetch reads committed files from this Git repository and writes a new directory beneath the project's primary configured tool directory. It refuses existing destinations.
- Fetch retrieves one tool at a time. It does not evaluate downloaded definitions or install software; generation evaluates the local definitions.
- Definitions can include personal shell bindings and configuration. Review their symlinks, aliases and other integrations before generation.

# Prerequisites

- [Git](https://git-scm.com/) and a dotfiles build that includes `catalog fetch`. The fetch command is under development in the [installer project](https://github.com/alexgorbatchev/dotfiles).
- An existing `dotfiles.config.ts` project.
- Check the selected definition and bundled files for supported platforms, package managers and external commands.
- Fetch any required dependency providers separately before generation.

# Quick Start

```bash
dotfiles catalog fetch fzf
dotfiles generate
```

Replace `fzf` with the ID of the tool you choose from the [tool directory](tools/).

# Configuration

The repository defaults to `https://github.com/alexgorbatchev/dotfiles-catalog`. Set `DOTFILES_CATALOG_REPO` to choose another repository, or pass `--repo` to override it for one fetch. Use `--ref` to select a branch, tag or commit.

# Development

For catalog development, run `just setup` to install the locked validation dependencies and prepare the pinned installer SDK. Repeated setup reuses a clean SDK checkout at the pinned revision. Run `just run` to validate definitions and `just check` for all catalog checks.

# License

No repository-wide license is declared. Tool binaries are downloaded from their upstream projects and retain their upstream licenses.
