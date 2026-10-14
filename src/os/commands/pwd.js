import * as b from '../blocks'

export default {
  name: 'pwd',
  summary: (t) => t('term.cmd.pwd'),
  run: (ctx) => [b.text(ctx.cwd)],
}
