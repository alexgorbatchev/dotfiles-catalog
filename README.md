`dotfiles-catalog` contains editable tool definitions and configuration files for the dotfiles CLI, seeded from Alex Gorbatchev's dotfiles.

# What It Does

- **Fetch tools**: Retrieve Yazi, fzf and Lazygit definitions from Git.
- **Include configurations**: Keep each tool's configuration and helper files together.
- **Provide Yazi's PDF dependency**: Fetch the separate Poppler definition when using Yazi.

# How It Works

1. Run `dotfiles catalog fetch <id>` in an existing dotfiles project.
2. Review the downloaded definition and accompanying files.
3. Run `dotfiles generate` to make the definition available to the normal tool workflow.
4. Install the tool when ready with `dotfiles install <id>`.

# How it Really Works

- Fetch reads committed files from this Git repository and writes a new directory beneath the project's primary configured tool directory. It refuses existing destinations.
- Fetch retrieves one tool at a time. It does not evaluate downloaded definitions or install software; generation evaluates the local definitions.
- These seeds include personal shell bindings and configuration. Review them before generation, especially Lazygit's configuration symlink and shell aliases.

# Prerequisites

- [Git](https://git-scm.com/) and a dotfiles build that includes `catalog fetch`. The fetch command is under development in the [installer project](https://github.com/alexgorbatchev/dotfiles).
- An existing `dotfiles.config.ts` project.
- The optional fzf directory-jump widget expects `rg`, `eza` and `zsh-vi-mode` in the local shell setup.
- Lazygit's bundled editor helper expects Bash and Neovim. The definition adds its helper directory to the generated shell path.
- Poppler uses Homebrew on macOS and `apt` with sudo on Linux; this seed does not supply a Windows Poppler installation.

# Quick Start

```bash
dotfiles catalog fetch fzf
dotfiles catalog fetch lazygit
dotfiles catalog fetch poppler
dotfiles catalog fetch yazi
dotfiles generate
```

Fetching Poppler before Yazi supplies the `pdftoppm` dependency declared by the Yazi definition. Configure another local provider instead if Poppler is already managed elsewhere.

# Tools

| ID | Upstream | Included files |
| --- | --- | --- |
| `fzf` | [junegunn/fzf](https://github.com/junegunn/fzf) | Definition with generated Zsh initialization, colors and directory-jump widget |
| `lazygit` | [jesseduffield/lazygit](https://github.com/jesseduffield/lazygit) | Definition, configuration and `lazygit-open` editor helper |
| `poppler` | [Poppler](https://poppler.freedesktop.org/) | Definition providing `pdftoppm` |
| `yazi` | [sxyazi/yazi](https://github.com/sxyazi/yazi) | Definition and the `config/` directory |

# Configuration

The repository defaults to `https://github.com/alexgorbatchev/dotfiles-catalog`. Set `DOTFILES_CATALOG_REPO` to choose another repository, or pass `--repo` to override it for one fetch. Use `--ref` to select a branch, tag or commit.

# License

No repository-wide license is declared. Tool binaries are downloaded from their upstream projects and retain their upstream licenses.
