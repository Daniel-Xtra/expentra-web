import { useQuery } from '@tanstack/react-query';
import { fetchPayoutsQueueSummary } from '@/features/payouts/api';
import { queryKeys } from '@/shared/api/query-keys';
import { useActionCapabilities } from '@/shared/hooks/use-action-capabilities';

export function usePendingPayoutsCount(enabled = true) {
  const caps = useActionCapabilities();
  const canReimburse = caps.expense.reimburse;

  const summaryQuery = useQuery({
    queryKey: queryKeys.payouts.summary(),
    queryFn: fetchPayoutsQueueSummary,
    enabled: enabled && canReimburse,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  const pendingCount = Number(summaryQuery.data?.approvedCount) || 0;

  return {
    pendingCount,
    isLoading: summaryQuery.isLoading,
  };
}
