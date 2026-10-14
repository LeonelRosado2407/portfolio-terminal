import * as b from '../blocks'
import { displayPath, resolve } from '../fs/path'

export default {
  name: 'cd',
  paths: 'dir',
  summary: (t) => t('term.cmd.cd'),
  run(ctx, args) {
    const target = args[0] ?? '~'
    const back = target === '-'
    const { node, path, error } = resolve(ctx.fs, ctx.cwd, back ? ctx.prevCwd : target)
    if (error === 'ENOENT') return [b.error(ctx.t('term.err.not_found', { cmd: 'cd', path: target }))]
    if (error || node.type !== 'dir') return [b.error(ctx.t('term.err.not_dir', { cmd: 'cd', path: target }))]
    ctx.setCwd(path)
    return back ? [b.text(displayPath(path))] : []
  },
}
