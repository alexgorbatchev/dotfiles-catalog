import { defineTool } from "@alexgorbatchev/dotfiles";

export default defineTool((install, ctx) => {
  const initFile = `${ctx.currentDir}/fzf-zsh-init`;

  return install("github-release", {
    repo: "junegunn/fzf",
  })
    .hook("after-install", async ({ $ }) => {
      await $`fzf --zsh > ${initFile}`;
    })
    .bin("fzf")
    .zsh((shell) =>
      shell
        .env({
          FZF_DEFAULT_OPTS: "--color=fg+:cyan,bg+:black,hl+:yellow,pointer:blue",
        })
        .sourceFile(initFile)
        .functions({
          // Function to CD into any directory in the CWD and down using ctrl-]
          "fzf-jump-to-dir": /* zsh */ `
            local dir
            dir=$(
              rg --files --null |
                xargs -0 dirname |
                sort -u |
                fzf --preview 'eza -la --color=always {}' \\
                  --preview-window=up \\
                  --bind 'esc:abort'
            )

            if [[ -z "$dir" ]]; then
              zle redisplay
              return 0
            fi

            zle kill-whole-line
            BUFFER="builtin cd -- $dir"
            region_highlight=("P0 100 bold")
            zle accept-line
            local ret=$?
            zle redisplay
            zle reset-prompt
            return $ret
          `,
        }).always(/* zsh */ `
          # Create a ZLE widget from the function
          zle -N fzf-jump-to-dir

          # Need to eval the widget to get the keybindings working with jeffreytse/zsh-vi-mode
          zvm_after_init_commands+=("bindkey '^]' fzf-jump-to-dir")
        `),
    );
});
