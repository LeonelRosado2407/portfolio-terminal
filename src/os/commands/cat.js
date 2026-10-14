import * as b from '../blocks'
import { displayPath, resolve } from '../fs/path'

function catOne(ctx, arg) {
  const { node, path, error } = resolve(ctx.fs, ctx.cwd, arg)
  if (error) return [b.error(ctx.t('term.err.not_found', { cmd: 'cat', path: arg }))]
  if (node.type === 'dir') return [b.error(ctx.t('term.err.is_dir', { cmd: 'cat', path: arg }))]
  if (node.type === 'file') return node.content
  const target = displayPath(path)
  if (node.type === 'link' && node.action === 'open') {
    return [b.link(node.href, node.href), b.actions(ctx.t('term.next'), [`open ${target}`])]
  }
  return [
    b.error(ctx.t('term.err.binary', { path: arg })),
    b.actions(ctx.t('term.try'), [node.type === 'exec' ? target : `open ${target}`]),
  ]
}

export default {
  name: 'cat',
  paths: true,
  maxArgs: Infinity,
  summary: (t) => t('term.cmd.cat'),
  run(ctx, args) {
    if (!args.length) return [b.error(ctx.t('term.err.missing_operand', { cmd: 'cat' }))]
    return args.flatMap((arg) => catOne(ctx, arg))
  },
}
