import { defineTool } from '@alexgorbatchev/dotfiles';

export default defineTool((install, ctx) =>
  install('github-release', {
    repo: 'jesseduffield/lazygit',
  })
    .bin('lazygit')
    .symlink('./config.yml', '~/.config/lazygit/config.yml')
    .shell(shell => shell.path(`${ctx.toolDir}/bin`))
    .zsh(shell =>
      shell.aliases({
        g: 'lazygit',
      })
    )
);
