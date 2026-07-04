import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createDelegation, revokeDelegation } from '@/features/delegations/api';
import type { DelegationFormValues } from '@/features/delegations/schemas';
import { invalidateDelegations } from '@/shared/api/query-keys';
import { toastError, toastSuccess } from '@/shared/lib/toast';

export function useDelegationMutations(options?: {
  onCreateSuccess?: () => void;
  onRevokeSuccess?: () => void;
}) {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (values: DelegationFormValues) =>
      createDelegation({
        delegateReference: values.delegateReference,
        startsAt: new Date(values.startsAt).toISOString(),
        endsAt: new Date(values.endsAt).toISOString(),
      }),
    onSuccess: async () => {
      toastSuccess('Delegation created');
      options?.onCreateSuccess?.();
      await invalidateDelegations(queryClient);
    },
    onError: (err) => toastError(err, 'Failed to create delegation'),
  });

  const revokeMutation = useMutation({
    mutationFn: (reference: string) => revokeDelegation(reference),
    onSuccess: async () => {
      toastSuccess('Delegation revoked');
      options?.onRevokeSuccess?.();
      await invalidateDelegations(queryClient);
    },
    onError: (err) => toastError(err, 'Failed to revoke delegation'),
  });

  return { createMutation, revokeMutation };
}
