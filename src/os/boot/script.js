// Fake Linux boot log. Kept in English on purpose: that's what real boot logs look like.
export const BOOT_LOG = [
  'leonel-os 2.0.0 (tty1)',
  '[    0.000000] Booting Linux on physical CPU 0x0',
  '[    0.084213] Memory: 16384K/16384K available (coffee-powered)',
  '[  OK  ] Mounted /root/projects',
  '[  OK  ] Mounted /root/experience',
  '[  OK  ] Started skills.service',
  '[  OK  ] Started vue-kernel.service - Vue 3 runtime',
  '[  OK  ] Started i18n.service - es_MX / en_US',
  '[  OK  ] Reached target network (web3forms.target)',
  '[  OK  ] Started portfolio.service',
  '[  OK  ] Reached target Graphical Interface',
  'Starting terminal…',
]

export function bootMode({ seen, reducedMotion }) {
  if (reducedMotion) return 'none'
  return seen ? 'short' : 'full'
}

// When each line appears, in ms from mount
export function bootPlan(mode) {
  if (mode === 'none') return []
  const lines = mode === 'short' ? [BOOT_LOG[0], BOOT_LOG.at(-2), BOOT_LOG.at(-1)] : BOOT_LOG
  const step = mode === 'short' ? 120 : 190
  return lines.map((text, i) => ({ text, at: i * step }))
}
