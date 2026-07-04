import { useQuery } from '@tanstack/react-query';
import { listRoleTemplates } from '@/features/roles/api';
import { queryKeys } from '@/shared/api/query-keys';

export function useRoleTemplates(enabled = true) {
  return useQuery({
    queryKey: queryKeys.roles.templates,
    queryFn: listRoleTemplates,
    enabled,
    staleTime: 60_000,
  });
}
