import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { isAgingByDays } from '@/shared/utils/aging'

describe('isAgingByDays', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-11T12:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns false for nullish dates', () => {
    expect(isAgingByDays(undefined, 3)).toBe(false)
    expect(isAgingByDays(null, 3)).toBe(false)
  })

  it('returns false when the date is within the aging window', () => {
    expect(isAgingByDays('2026-07-10T12:00:00.000Z', 3)).toBe(false)
    expect(isAgingByDays('2026-07-11T11:00:00.000Z', 3)).toBe(false)
  })

  it('returns true when the date is older than the aging window', () => {
    expect(isAgingByDays('2026-07-08T11:59:59.000Z', 3)).toBe(true)
    expect(isAgingByDays('2026-06-01T00:00:00.000Z', 30)).toBe(true)
  })

  it('returns false when the date is exactly at the cutoff boundary', () => {
    // cutoff = now - 3 days = 2026-07-08T12:00:00.000Z; aging is strict <
    expect(isAgingByDays('2026-07-08T12:00:00.000Z', 3)).toBe(false)
  })
})
