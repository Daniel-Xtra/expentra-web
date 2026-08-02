import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { AppFormDialog } from '@/shared/reusable/AppFormDialog'

describe('AppFormDialog', () => {
  it('renders title, description, and submit label', () => {
    render(
      <AppFormDialog
        open
        onOpenChange={() => {}}
        title="Add department"
        description="Create a new department."
        submitLabel="Create department"
        onSubmit={() => {}}
      >
        <p>Form fields</p>
      </AppFormDialog>,
    )

    expect(screen.getByText('Add department')).toBeInTheDocument()
    expect(screen.getByText('Create a new department.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create department' })).toBeInTheDocument()
    expect(screen.getByText('Form fields')).toBeInTheDocument()
  })

  it('shows loading label and calls onSubmit', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    const { rerender } = render(
      <AppFormDialog
        open
        onOpenChange={() => {}}
        title="Edit"
        submitLabel="Save changes"
        onSubmit={onSubmit}
      >
        <p>Fields</p>
      </AppFormDialog>,
    )

    await user.click(screen.getByRole('button', { name: 'Save changes' }))
    expect(onSubmit).toHaveBeenCalledOnce()

    rerender(
      <AppFormDialog
        open
        onOpenChange={() => {}}
        title="Edit"
        submitLabel="Save changes"
        loading
        onSubmit={onSubmit}
      >
        <p>Fields</p>
      </AppFormDialog>,
    )

    expect(screen.getByRole('button', { name: 'Saving…' })).toBeDisabled()
  })

  it('disables submit via submitDisabled without showing loading label', () => {
    render(
      <AppFormDialog
        open
        onOpenChange={() => {}}
        title="Edit permissions"
        submitLabel="Save permissions"
        submitDisabled
        onSubmit={() => {}}
      >
        <p>Fields</p>
      </AppFormDialog>,
    )

    expect(screen.getByRole('button', { name: 'Save permissions' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cancel' })).not.toBeDisabled()
  })

  it('disables both actions when actionsDisabled', () => {
    render(
      <AppFormDialog
        open
        onOpenChange={() => {}}
        title="Edit permissions"
        submitLabel="Save permissions"
        actionsDisabled
        onSubmit={() => {}}
      >
        <p>Fields</p>
      </AppFormDialog>,
    )

    expect(screen.getByRole('button', { name: 'Save permissions' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
  })
})
