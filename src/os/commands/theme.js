import * as b from '../blocks'

export default {
  name: 'theme',
  args: (ctx) => ctx.themes,
  summary: (t) => t('term.cmd.theme'),
  run(ctx, args) {
    const name = args[0]?.toLowerCase()
    const choices = b.actions(null, ctx.themes.map((theme) => `theme ${theme}`))
    if (!name) return [b.text(ctx.t('term.theme.list', { current: ctx.theme }), 'dim'), choices]
    if (!ctx.themes.includes(name)) return [b.error(ctx.t('term.theme.unknown', { name })), choices]
    ctx.setTheme(name)
    return [b.text(ctx.t('term.theme.set', { name }), 'ok')]
  },
}
