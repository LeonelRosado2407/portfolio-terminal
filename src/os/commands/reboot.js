import * as b from '../blocks'

export default {
  name: 'reboot',
  aliases: ['exit', 'logout'],
  summary: (t) => t('term.cmd.reboot'),
  run(ctx) {
    ctx.reboot()
    return [b.text(ctx.t('term.reboot'), 'dim')]
  },
}
