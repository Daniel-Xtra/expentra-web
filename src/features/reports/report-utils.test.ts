import { describe, expect, it } from 'vitest'
import {
  buildDepartmentVarianceRows,
  formatPeriodLabel,
  pluralize,
  spendModeCopy,
} from '@/features/reports/report-utils'
import { getApiErrorMessage, isServerUnavailableError } from '@/shared/api/api-errors'
import axios from 'axios'

describe('report-utils', () => {
  it('pluralizes claim counts', () => {
    expect(pluralize(1, 'claim')).toBe('claim')
    expect(pluralize(2, 'claim')).toBe('claims')
  })

  it('formats period labels', () => {
    expect(formatPeriodLabel('month', 2026, 7, 3)).toMatch(/July/)
    expect(formatPeriodLabel('month', 2026, 7, 3)).toMatch(/2026/)
    expect(formatPeriodLabel('quarter', 2026, 7, 3)).toMatch(/Q3/)
    expect(formatPeriodLabel('year', 2026, 7, 3)).toBe('Full year 2026')
  })

  it('returns mode-specific spend copy', () => {
    expect(spendModeCopy('settled').spendLabel).toBe('Settled spend')
    expect(spendModeCopy('pipeline').spendLabel).toBe('In-progress spend')
    expect(spendModeCopy('approved_unpaid').spendLabel).toBe('Unpaid approved')
  })

  it('merges department spend and budget rows', () => {
    const rows = buildDepartmentVarianceRows(
      [
        {
          departmentReference: 'dept-1',
          departmentName: 'Engineering',
          departmentCode: 'ENG',
          totalAmount: 5000,
          count: 2,
        },
      ],
      [
        {
          departmentReference: 'dept-1',
          departmentName: 'Engineering',
          departmentCode: 'ENG',
          amountLimit: 10000,
          committedAmount: 6000,
          utilizationPercent: 60,
          isOverBudget: false,
        },
      ],
    )

    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({
      departmentReference: 'dept-1',
      periodSpend: 5000,
      claimCount: 2,
      amountLimit: 10000,
      remainingAmount: 4000,
      utilizationPercent: 60,
    })
  })
})

describe('api-errors', () => {
  it('maps axios status codes to friendly messages', () => {
    const error = new axios.AxiosError('Request failed')
    error.response = {
      status: 403,
      data: {},
      statusText: 'Forbidden',
      headers: {},
      config: {} as never,
    }
    expect(getApiErrorMessage(error)).toMatch(/permission/i)
  })

  it('prefers non-technical API messages', () => {
    const error = new axios.AxiosError('Request failed')
    error.response = {
      status: 400,
      data: { message: 'Title is required' },
      statusText: 'Bad Request',
      headers: {},
      config: {} as never,
    }
    expect(getApiErrorMessage(error)).toBe('Title is required')
  })

  it('detects server unavailable errors', () => {
    const error = new axios.AxiosError('fail')
    error.response = {
      status: 503,
      data: {},
      statusText: 'Service Unavailable',
      headers: {},
      config: {} as never,
    }
    expect(isServerUnavailableError(error)).toBe(true)
  })
})
