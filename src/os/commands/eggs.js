import * as b from '../blocks'

// Hidden commands: not listed in help, not suggested, not autocompleted
const egg = (name, key, { aliases = [], next = [] } = {}) => ({
  name,
  aliases,
  hidden: true,
  run(ctx, _args, invokedAs) {
    const blocks = [b.text(ctx.t(`term.egg.${key}`, { name: invokedAs }))]
    return next.length ? [...blocks, b.actions(ctx.t('term.try'), next)] : blocks
  },
})

export default [
  egg('sudo', 'sudo'),
  egg('rm', 'rm'),
  egg('vim', 'editor', { aliases: ['vi', 'nano', 'emacs'] }),
  egg('hack', 'hack', { next: ['contact'] }),
  egg('coffee', 'coffee'),
  {
    name: 'matrix',
    hidden: true,
    run(ctx) {
      ctx.matrix()
      return [b.text(ctx.t('term.egg.matrix'), 'ok')]
    },
  },
]
