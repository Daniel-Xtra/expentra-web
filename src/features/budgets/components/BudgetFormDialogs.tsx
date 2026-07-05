import type { ReactNode } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import {
  CreateBudgetFormFields,
  EditBudgetFormFields,
} from '@/features/budgets/components/BudgetFormFields';
import type { BudgetFormValues, EditBudgetFormValues } from '@/features/budgets/schemas';
import { AppModal } from '@/shared/reusable/AppModal';
import { formatLabel } from '@/shared/utils/format';
import type { BudgetResponse, DepartmentResponse } from '@/types/api';

type BudgetDialogShellProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  submitLabel: string;
  loading: boolean;
  onSubmit: () => void;
  children: ReactNode;
};

function BudgetDialogShell({
  open,
  onOpenChange,
  title,
  description,
  submitLabel,
  loading,
  onSubmit,
  children,
}: BudgetDialogShellProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <AppModal
        title={title}
        description={description}
        className="sm:max-w-lg"
        primaryFn={() => {}}
        content={children}
        actions={
          <>
            <Button
              type="button"
              variant="ghost"
              className="h-14 w-full rounded-sm p-5 font-sans text-sm/[19.6px] font-semibold text-neutral-950 hover:bg-transparent"
              disabled={loading}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="h-14 w-full rounded-sm p-5 font-sans text-sm/[19.6px] font-semibold"
              disabled={loading}
              onClick={onSubmit}
            >
              {loading ? 'Saving…' : submitLabel}
            </Button>
          </>
        }
      />
    </Dialog>
  );
}

type CreateBudgetDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<BudgetFormValues>;
  loading: boolean;
  onSubmit: () => void;
  departments: DepartmentResponse[];
};

export function CreateBudgetDialog({
  open,
  onOpenChange,
  form,
  loading,
  onSubmit,
  departments,
}: CreateBudgetDialogProps) {
  return (
    <BudgetDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title="Add budget"
      description="Set a spending limit for a department and year."
      submitLabel="Create budget"
      loading={loading}
      onSubmit={onSubmit}
    >
      <CreateBudgetFormFields form={form} departments={departments} />
    </BudgetDialogShell>
  );
}

type EditBudgetDialogProps = {
  budget: BudgetResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<EditBudgetFormValues>;
  loading: boolean;
  onSubmit: () => void;
};

export function EditBudgetDialog({
  budget,
  open,
  onOpenChange,
  form,
  loading,
  onSubmit,
}: EditBudgetDialogProps) {
  const departmentLabel = budget?.department?.name
    ? formatLabel(budget.department.name)
    : 'this department';

  return (
    <BudgetDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title="Edit budget"
      description={
        budget
          ? `Update the limit and status for ${departmentLabel} (${budget.year}).`
          : 'Update the budget limit and status.'
      }
      submitLabel="Save changes"
      loading={loading}
      onSubmit={onSubmit}
    >
      {budget ? <EditBudgetFormFields form={form} /> : null}
    </BudgetDialogShell>
  );
}
