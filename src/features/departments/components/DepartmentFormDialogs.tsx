import type { UseFormReturn } from 'react-hook-form';
import { DepartmentFormFields } from '@/features/departments/components/DepartmentFormFields';
import type { DepartmentFormValues } from '@/features/departments/department-form';
import { AppFormDialog } from '@/shared/reusable/AppFormDialog';
import { formatLabel } from '@/shared/utils/format';
import type { DepartmentResponse } from '@/types/api';

type CreateDepartmentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<DepartmentFormValues>;
  loading: boolean;
  onSubmit: () => void;
};

export function CreateDepartmentDialog({
  open,
  onOpenChange,
  form,
  loading,
  onSubmit,
}: CreateDepartmentDialogProps) {
  return (
    <AppFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add department"
      description="Create a new department with a name and code."
      submitLabel="Create department"
      loading={loading}
      onSubmit={onSubmit}
    >
      <DepartmentFormFields form={form} nameId="department-name" codeId="department-code" />
    </AppFormDialog>
  );
}

type EditDepartmentDialogProps = {
  department: DepartmentResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<DepartmentFormValues>;
  loading: boolean;
  onSubmit: () => void;
};

export function EditDepartmentDialog({
  department,
  open,
  onOpenChange,
  form,
  loading,
  onSubmit,
}: EditDepartmentDialogProps) {
  return (
    <AppFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit department"
      description={
        department
          ? `Update details for ${formatLabel(department.name)}.`
          : 'Update the department name, code, and manager.'
      }
      submitLabel="Save changes"
      loading={loading}
      onSubmit={onSubmit}
    >
      {department ? (
        <DepartmentFormFields
          form={form}
          nameId="edit-department-name"
          codeId="edit-department-code"
          departmentReference={department.reference}
          currentManager={department.manager}
          pendingApprovalCount={department.pendingApprovalCount}
        />
      ) : null}
    </AppFormDialog>
  );
}
