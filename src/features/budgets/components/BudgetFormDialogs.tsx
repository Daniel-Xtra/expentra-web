import type { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { FormDialog } from '@/shared/components/FormDialog';
import { FormField } from '@/shared/components/FormField';
import { RhfSelectField } from '@/shared/components/RhfSelectField';
import type { BudgetFormValues, EditBudgetFormValues } from '@/features/budgets/schemas';
import type { DepartmentResponse } from '@/types/api';

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
  const { register, control, formState: { errors } } = form;

  return (
    <FormDialog
      title="Add budget"
      open={open}
      onOpenChange={onOpenChange}
      submitLabel="Create budget"
      loading={loading}
      onSubmit={onSubmit}
    >
      <div className="grid grid-cols-2 gap-4">
        <RhfSelectField
          control={control}
          name="departmentReference"
          label="Department"
          placeholder="Select department"
          error={errors.departmentReference?.message}
          className="col-span-2"
          options={departments.map((dept) => ({
            value: dept.reference,
            label: dept.name,
          }))}
        />
        <FormField label="Year" htmlFor="budget-year" error={errors.year?.message} className="col-span-1">
          <Input
            id="budget-year"
            type="number"
            aria-invalid={errors.year ? true : undefined}
            {...register('year', { valueAsNumber: true })}
          />
        </FormField>
        <FormField
          label="Limit (₦)"
          htmlFor="budget-amount"
          error={errors.amountNaira?.message}
          className="col-span-1"
        >
          <Input
            id="budget-amount"
            inputMode="decimal"
            aria-invalid={errors.amountNaira ? true : undefined}
            {...register('amountNaira')}
          />
        </FormField>
      </div>
    </FormDialog>
  );
}

type EditBudgetDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<EditBudgetFormValues>;
  loading: boolean;
  onSubmit: () => void;
};

export function EditBudgetDialog({
  open,
  onOpenChange,
  form,
  loading,
  onSubmit,
}: EditBudgetDialogProps) {
  return (
    <FormDialog
      title="Edit budget"
      open={open}
      onOpenChange={onOpenChange}
      submitLabel="Save changes"
      loading={loading}
      onSubmit={onSubmit}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          label="Limit (₦)"
          htmlFor="edit-budget-amount"
          error={form.formState.errors.amountNaira?.message}
          className="sm:col-span-2"
        >
          <Input
            id="edit-budget-amount"
            inputMode="decimal"
            {...form.register('amountNaira')}
          />
        </FormField>
        <RhfSelectField
          control={form.control}
          name="isActive"
          label="Status"
          options={[
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
          ]}
          error={form.formState.errors.isActive?.message}
          className="sm:col-span-2"
        />
      </div>
    </FormDialog>
  );
}
