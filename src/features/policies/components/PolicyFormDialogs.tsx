import type { ReactNode } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { PolicyFormFields } from '@/features/policies/components/PolicyFormFields';
import type { EditPolicyFormValues, PolicyFormValues } from '@/features/policies/policy-config';
import { AppModal } from '@/shared/reusable/AppModal';
import type { PolicyCatalogResponse } from '@/types/api';

type PolicyDialogShellProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  submitLabel: string;
  loading: boolean;
  onSubmit: () => void;
  children: ReactNode;
};

function PolicyDialogShell({
  open,
  onOpenChange,
  title,
  description,
  submitLabel,
  loading,
  onSubmit,
  children,
}: PolicyDialogShellProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <AppModal
        title={title}
        description={description}
        className="sm:max-w-3xl"
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
    <PolicyDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title="Add policy"
      description="Define when the rule applies and how employees experience violations."
      submitLabel="Create policy"
      loading={loading}
      onSubmit={onSubmit}
    >
      <PolicyFormFields form={form} catalog={catalog} />
    </PolicyDialogShell>
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
    <PolicyDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title="Edit policy"
      description="Update rule conditions, severity, or employee messaging."
      submitLabel="Save changes"
      loading={loading}
      onSubmit={onSubmit}
    >
      <PolicyFormFields form={form} catalog={catalog} showTemplates={false} showStatus />
    </PolicyDialogShell>
  );
}
