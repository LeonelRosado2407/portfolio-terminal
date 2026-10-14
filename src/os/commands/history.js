import * as b from '../blocks'

export default {
  name: 'history',
  summary: (t) => t('term.cmd.history'),
  run(ctx) {
    const lines = ctx.history.map((line, index) => `${String(index + 1).padStart(4)}  ${line}`)
    return lines.length ? [b.text(lines.join('\n'))] : []
  },
}
