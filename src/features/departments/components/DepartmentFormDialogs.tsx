import type { ReactNode } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { DepartmentFormFields } from '@/features/departments/components/DepartmentFormFields';
import type { DepartmentFormValues } from '@/features/departments/department-form';
import { AppModal } from '@/shared/reusable/AppModal';
import { formatLabel } from '@/shared/utils/format';
import type { DepartmentResponse } from '@/types/api';

type DepartmentDialogShellProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  submitLabel: string;
  loading: boolean;
  onSubmit: () => void;
  children: ReactNode;
};

function DepartmentDialogShell({
  open,
  onOpenChange,
  title,
  description,
  submitLabel,
  loading,
  onSubmit,
  children,
}: DepartmentDialogShellProps) {
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
    <DepartmentDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title="Add department"
      description="Create a new department with a name and code."
      submitLabel="Create department"
      loading={loading}
      onSubmit={onSubmit}
    >
      <DepartmentFormFields form={form} nameId="department-name" codeId="department-code" />
    </DepartmentDialogShell>
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
    <DepartmentDialogShell
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
    </DepartmentDialogShell>
  );
}
