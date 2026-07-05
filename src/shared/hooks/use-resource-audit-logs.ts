import { useQuery } from '@tanstack/react-query';
import { listAuditLogsForResource } from '@/features/audit-logs/api';
import { queryKeys } from '@/shared/api/query-keys';

export function useResourceAuditLogs(resourceReference: string | undefined, enabled = true) {
  return useQuery({
    queryKey: queryKeys.audit.resource(resourceReference ?? ''),
    queryFn: () => listAuditLogsForResource(resourceReference!),
    enabled: Boolean(resourceReference) && enabled,
  });
}
