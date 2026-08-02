import type { UseFormReturn } from 'react-hook-form';
import { PolicyFormFields } from '@/features/policies/components/PolicyFormFields';
import type { EditPolicyFormValues, PolicyFormValues } from '@/features/policies/policy-config';
import { AppFormDialog } from '@/shared/reusable/AppFormDialog';
import type { PolicyCatalogResponse } from '@/types/api';

type CreatePolicyDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<PolicyFormValues>;
  catalog: PolicyCatalogResponse;
  loading: boolean;
  onSubmit: () => void;
};

export function CreatePolicyDialog({
  open,
  onOpenChange,
  form,
  catalog,
  loading,
  onSubmit,
}: CreatePolicyDialogProps) {
  return (
    <AppFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add policy"
      description="Define when the rule applies and how employees experience violations."
      submitLabel="Create policy"
      loading={loading}
      className="sm:max-w-3xl"
      onSubmit={onSubmit}
    >
      <PolicyFormFields
        form={form as UseFormReturn<PolicyFormValues | EditPolicyFormValues>}
        catalog={catalog}
      />
    </AppFormDialog>
  );
}

type EditPolicyDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<EditPolicyFormValues>;
  catalog: PolicyCatalogResponse;
  loading: boolean;
  onSubmit: () => void;
};

export function EditPolicyDialog({
  open,
  onOpenChange,
  form,
  catalog,
  loading,
  onSubmit,
}: EditPolicyDialogProps) {
  return (
    <AppFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit policy"
      description="Update rule conditions, severity, or employee messaging."
      submitLabel="Save changes"
      loading={loading}
      className="sm:max-w-3xl"
      onSubmit={onSubmit}
    >
      <PolicyFormFields
        form={form as UseFormReturn<PolicyFormValues | EditPolicyFormValues>}
        catalog={catalog}
        showTemplates={false}
        showStatus
      />
    </AppFormDialog>
  );
}
