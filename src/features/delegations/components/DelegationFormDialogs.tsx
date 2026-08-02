import type { UseFormReturn } from 'react-hook-form';
import { DelegationFormFields } from '@/features/delegations/components/DelegationFormFields';
import type { DelegationFormValues } from '@/features/delegations/schemas';
import { AppFormDialog } from '@/shared/reusable/AppFormDialog';
import type { UserResponse } from '@/types/api';

type CreateDelegationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<DelegationFormValues>;
  users: UserResponse[];
  catalogLoading?: boolean;
  loading: boolean;
  onSubmit: () => void;
};

export function CreateDelegationDialog({
  open,
  onOpenChange,
  form,
  users,
  catalogLoading = false,
  loading,
  onSubmit,
}: CreateDelegationDialogProps) {
  return (
    <AppFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="New delegation"
      description="Choose a colleague and the period they can approve on your behalf."
      submitLabel="Create delegation"
      loading={loading}
      onSubmit={onSubmit}
    >
      <DelegationFormFields form={form} users={users} catalogLoading={catalogLoading} />
    </AppFormDialog>
  );
}
