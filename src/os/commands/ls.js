import * as b from '../blocks'
import { byName, displayPath, joinPath, resolve } from '../fs/path'
import { isImageDir } from '../fs/gallery'
import { splitFlags } from '../shell/parse'

// What clicking an entry runs. Absolute (~) paths so old output keeps working after a cd.
export function entryCommand(node, path) {
  const target = displayPath(path)
  if (isImageDir(node)) return `open ${target}`
  if (node.type === 'dir') return `cd ${target} && ls`
  if (node.type === 'exec') return target
  if (node.type === 'link') return `open ${target}`
  return `cat ${target}`
}

const entry = (node, path) => ({
  label: node.type === 'dir' ? `${node.name}/` : node.name,
  kind: node.type,
  cmd: entryCommand(node, path),
})

export default {
  name: 'ls',
  paths: true,
  summary: (t) => t('term.cmd.ls'),
  run(ctx, args) {
    const { flags, operands } = splitFlags(args)
    const target = operands[0] ?? '.'
    const { node, path, error } = resolve(ctx.fs, ctx.cwd, target)
    if (error) return [b.error(ctx.t('term.err.not_found', { cmd: 'ls', path: target }))]
    if (node.type !== 'dir') return [b.list([entry(node, path)])]
    const items = node.children
      .filter((child) => flags.has('a') || !child.name.startsWith('.'))
      .sort(byName)
      .map((child) => entry(child, joinPath(path, child.name)))
    return items.length ? [b.list(items)] : []
  },
}
