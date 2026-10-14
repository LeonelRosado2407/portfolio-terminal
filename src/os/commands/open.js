import * as b from '../blocks'
import { galleryOf, isImageDir } from '../fs/gallery'
import { displayPath, resolve } from '../fs/path'

function openUrl(ctx, url) {
  ctx.openUrl(url)
  return [b.text(ctx.t('term.open.opening', { target: url }), 'dim'), b.link(url, url)]
}

export default {
  name: 'open',
  paths: true,
  summary: (t) => t('term.cmd.open'),
  run(ctx, args) {
    const target = args[0]
    if (!target) return [b.error(ctx.t('term.err.missing_operand', { cmd: 'open' }))]
    if (/^https?:\/\//i.test(target)) return openUrl(ctx, target)

    const { node, path, error } = resolve(ctx.fs, ctx.cwd, target)
    if (error) return [b.error(ctx.t('term.err.not_found', { cmd: 'open', path: target }))]
    if (node.type === 'file') return node.content
    if (isImageDir(node)) return [galleryOf(node)]
    if (node.type === 'dir') {
      return [
        b.error(ctx.t('term.err.not_openable', { path: target })),
        b.actions(ctx.t('term.try'), [`cd ${displayPath(path)} && ls`]),
      ]
    }
    if (node.type === 'exec') return [b.actions(ctx.t('term.try'), [displayPath(path)])]
    if (node.action === 'download') {
      ctx.download(node.href, node.name)
      return [b.text(ctx.t('term.open.downloading', { target: node.name }), 'dim'), b.link(node.name, node.href, true)]
    }
    if (node.action === 'image') return [b.image(node.href, node.alt)]
    return openUrl(ctx, node.href)
  },
}
