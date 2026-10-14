import { describe, it, expect } from 'vitest'
import { BOOT_LOG, bootMode, bootPlan } from './script'

describe('bootMode', () => {
  it('plays the full boot on the first visit', () => {
    expect(bootMode({ seen: false, reducedMotion: false })).toBe('full')
  })

  it('shortens it for returning visitors', () => {
    expect(bootMode({ seen: true, reducedMotion: false })).toBe('short')
  })

  it('skips it entirely with reduced motion', () => {
    expect(bootMode({ seen: false, reducedMotion: true })).toBe('none')
  })
})

describe('bootPlan', () => {
  it('schedules every log line in order, in under 3 seconds', () => {
    const plan = bootPlan('full')
    expect(plan.map((step) => step.text)).toEqual(BOOT_LOG)
    plan.forEach((step, i) => i && expect(step.at).toBeGreaterThan(plan[i - 1].at))
    expect(plan.at(-1).at).toBeLessThan(3000)
  })

  it('keeps the short boot under half a second', () => {
    const plan = bootPlan('short')
    expect(plan).toHaveLength(3)
    expect(plan.at(-1).at).toBeLessThan(500)
  })

  it('has nothing to play for none', () => {
    expect(bootPlan('none')).toEqual([])
  })
})
