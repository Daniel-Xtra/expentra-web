import type { UseFormReturn } from 'react-hook-form';
import {
  CreateBudgetFormFields,
  EditBudgetFormFields,
} from '@/features/budgets/components/BudgetFormFields';
import type { BudgetFormValues, EditBudgetFormValues } from '@/features/budgets/schemas';
import { AppFormDialog } from '@/shared/reusable/AppFormDialog';
import { formatLabel } from '@/shared/utils/format';
import type { BudgetResponse, DepartmentResponse } from '@/types/api';

type CreateBudgetDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<BudgetFormValues>;
  loading: boolean;
  catalogLoading?: boolean;
  onSubmit: () => void;
  departments: DepartmentResponse[];
  currentYear: number;
};

export function CreateBudgetDialog({
  open,
  onOpenChange,
  form,
  loading,
  catalogLoading = false,
  onSubmit,
  departments,
  currentYear,
}: CreateBudgetDialogProps) {
  return (
    <AppFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add budget"
      description="Set a spending limit for a department and year."
      submitLabel="Create budget"
      loading={loading}
      onSubmit={onSubmit}
    >
      <CreateBudgetFormFields
        form={form}
        departments={departments}
        currentYear={currentYear}
        catalogLoading={catalogLoading}
      />
    </AppFormDialog>
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
    <AppFormDialog
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
    </AppFormDialog>
  );
}
