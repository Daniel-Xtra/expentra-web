import { describe, expect, it } from 'vitest'
import {
  CHART_EXPENSE_CATEGORIES,
  formatNgnAxis,
  getActiveChartCategories,
  normalizeCategoryAmounts,
} from '@/features/reports/spending-chart-utils'

describe('formatNgnAxis', () => {
  it('formats millions, thousands, and small amounts', () => {
    expect(formatNgnAxis(4_500_000_000)).toBe('₦45.0M')
    expect(formatNgnAxis(1_500_000)).toBe('₦15K')
    expect(formatNgnAxis(25_000)).toMatch(/₦250\.00/)
  })
})

describe('normalizeCategoryAmounts', () => {
  it('returns empty object for missing input', () => {
    expect(normalizeCategoryAmounts()).toEqual({})
    expect(normalizeCategoryAmounts(undefined)).toEqual({})
  })

  it('normalizes mixed-case keys and ignores unknowns', () => {
    expect(
      normalizeCategoryAmounts({
        travel: 100,
        Meals: 50,
        UNKNOWN: 999,
        OTHERS: 0,
      }),
    ).toEqual({ TRAVEL: 100, MEALS: 50 })
  })

  it('sums duplicate category keys', () => {
    expect(
      normalizeCategoryAmounts({
        TRAVEL: 100,
        travel: 25,
      }),
    ).toEqual({ TRAVEL: 125 })
  })
})

describe('getActiveChartCategories', () => {
  it('returns categories with positive totals in catalog order', () => {
    expect(
      getActiveChartCategories([
        { categoryAmounts: { OTHERS: 10, MEALS: 5 } },
        { categoryAmounts: { TRAVEL: 1 } },
      ]),
    ).toEqual(['TRAVEL', 'MEALS', 'OTHERS'])
  })

  it('returns empty when no positive amounts', () => {
    expect(getActiveChartCategories([{ categoryAmounts: {} }])).toEqual([])
    expect(CHART_EXPENSE_CATEGORIES).toHaveLength(4)
  })
})
