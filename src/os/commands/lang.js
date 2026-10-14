import * as b from '../blocks'
import { LOCALES } from '../../i18n/locale'

export default {
  name: 'lang',
  args: () => LOCALES,
  summary: (t) => t('term.cmd.lang'),
  run(ctx, args) {
    const next = args[0]?.toLowerCase()
    if (!LOCALES.includes(next)) return [b.error(ctx.t('term.lang.usage'))]
    ctx.setLocale(next)
    // ctx.t already speaks the new language here
    return [b.text(ctx.t('term.lang.set'), 'ok')]
  },
}
