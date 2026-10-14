import { coreStack } from '../../data/profile'

// Plain ASCII on purpose: box-drawing glyphs aren't in the web font subset and fall back misaligned
export const LOGO = [' _     ____  ', '| |   |  _ \\ ', '| |   | |_) |', '| |___|  _ < ', '|_____|_| \\_\\'].join('\n')

// neofetch-style welcome card
export function bannerBlock(t) {
  return {
    type: 'banner',
    art: LOGO,
    title: 'Leonel Rosado',
    subtitle: 'root@leonel-os',
    rows: [
      { label: 'OS', value: 'leonel-os 2.0 (Vue 3 kernel)' },
      { label: t('term.banner.role_label'), value: t('term.banner.role') },
      { label: t('term.banner.location_label'), value: t('term.banner.location') },
      { label: t('term.banner.experience_label'), value: t('term.banner.experience') },
      { label: t('term.banner.stack_label'), value: coreStack.join(', ') },
      { label: t('term.banner.status_label'), value: t('term.banner.status') },
    ],
  }
}
