export default {
  name: 'clear',
  summary: (t) => t('term.cmd.clear'),
  run(ctx) {
    ctx.clear()
    return []
  },
}
