import { useQuery } from '@tanstack/react-query';
import { fetchPendingApprovalSummary } from '@/features/approvals/api';
import { queryKeys } from '@/shared/api/query-keys';
import { useActionCapabilities } from '@/shared/hooks/use-action-capabilities';

export function usePendingApprovalCount(enabled = true) {
  const caps = useActionCapabilities();
  const canApprove = caps.approval.approve || caps.approval.reject;

  const countQuery = useQuery({
    queryKey: queryKeys.approvals.summary(),
    queryFn: fetchPendingApprovalSummary,
    enabled: enabled && canApprove,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  const pendingCount = Number(countQuery.data?.awaitingApprovalCount) || 0;

  return {
    pendingCount,
    isLoading: countQuery.isLoading,
  };
}
