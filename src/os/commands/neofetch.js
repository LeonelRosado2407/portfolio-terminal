import { bannerBlock } from '../boot/banner'

export default {
  name: 'neofetch',
  summary: (t) => t('term.cmd.neofetch'),
  run: (ctx) => [bannerBlock(ctx.t)],
}
