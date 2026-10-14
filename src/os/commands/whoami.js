import * as b from '../blocks'

export default {
  name: 'whoami',
  summary: (t) => t('term.cmd.whoami'),
  run: (ctx) => [b.text(ctx.t('term.whoami'))],
}
