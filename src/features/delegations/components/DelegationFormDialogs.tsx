import type { UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { DelegationFormFields } from '@/features/delegations/components/DelegationFormFields';
import type { DelegationFormValues } from '@/features/delegations/schemas';
import { AppModal } from '@/shared/reusable/AppModal';
import type { UserResponse } from '@/types/api';

type CreateDelegationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<DelegationFormValues>;
  users: UserResponse[];
  loading: boolean;
  onSubmit: () => void;
};

export function CreateDelegationDialog({
  open,
  onOpenChange,
  form,
  users,
  loading,
  onSubmit,
}: CreateDelegationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <AppModal
        title="New delegation"
        description="Choose a colleague and the period they can approve on your behalf."
        className="sm:max-w-lg"
        primaryFn={() => {}}
        content={<DelegationFormFields form={form} users={users} />}
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
              {loading ? 'Saving…' : 'Create delegation'}
            </Button>
          </>
        }
      />
    </Dialog>
  );
}
