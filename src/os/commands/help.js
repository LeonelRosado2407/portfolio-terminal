import * as b from '../blocks'

export default {
  name: 'help',
  summary: (t) => t('term.cmd.help'),
  run(ctx) {
    const rows = ctx.commands
      .filter((command) => !command.hidden)
      .map((command) => ({ label: command.name, value: command.summary(ctx.t), cmd: command.name }))
    return [b.text(ctx.t('term.help.title'), 'accent'), b.table(rows), b.text(ctx.t('term.help.tip'), 'dim')]
  },
}
