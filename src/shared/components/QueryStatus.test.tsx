import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { UseQueryResult } from '@tanstack/react-query'
import { describe, expect, it, vi } from 'vitest'
import { QueryStatus } from '@/shared/components/QueryStatus'

function mockQuery<TData, TError = Error>(
  partial: Partial<UseQueryResult<TData, TError>>,
): UseQueryResult<TData, TError> {
  return {
    data: undefined,
    error: null,
    isError: false,
    isLoading: false,
    isFetching: false,
    refetch: vi.fn(),
    ...partial,
  } as UseQueryResult<TData, TError>
}

describe('QueryStatus', () => {
  it('shows loading state on initial fetch', () => {
    render(
      <QueryStatus
        query={mockQuery({ isLoading: true })}
        loadingMessage="Loading policies…"
      >
        <p>Content</p>
      </QueryStatus>,
    )

    expect(screen.getByRole('status', { name: 'Loading policies…' })).toBeInTheDocument()
    expect(screen.queryByText('Content')).not.toBeInTheDocument()
  })

  it('renders children when the query succeeds', () => {
    render(
      <QueryStatus query={mockQuery({ data: { ok: true } })} loadingMessage="Loading…">
        <p>Content</p>
      </QueryStatus>,
    )

    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('shows default error state with retry', async () => {
    const user = userEvent.setup()
    const refetch = vi.fn()

    render(
      <QueryStatus
        query={mockQuery({
          isError: true,
          error: new Error('Server blew up'),
          refetch,
        })}
        loadingMessage="Loading…"
      >
        <p>Content</p>
      </QueryStatus>,
    )

    expect(screen.getByText('Server blew up')).toBeInTheDocument()
    expect(screen.queryByText('Content')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /retry/i }))
    expect(refetch).toHaveBeenCalledOnce()
  })

  it('uses renderError when provided', () => {
    render(
      <QueryStatus
        query={mockQuery({
          isError: true,
          error: new Error('unavailable'),
        })}
        loadingMessage="Loading…"
        renderError={() => <p>Custom unavailable</p>}
      >
        <p>Content</p>
      </QueryStatus>,
    )

    expect(screen.getByText('Custom unavailable')).toBeInTheDocument()
    expect(screen.queryByText('Content')).not.toBeInTheDocument()
  })
})
