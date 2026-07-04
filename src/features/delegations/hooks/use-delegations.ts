import { useQuery } from '@tanstack/react-query';
import { listUsers } from '@/features/users/api';
import {
  listDelegationsToMe,
  listMyDelegations,
} from '@/features/delegations/api';
import { queryKeys } from '@/shared/api/query-keys';

export function useDelegations() {
  const mineQuery = useQuery({
    queryKey: queryKeys.delegations.mine(),
    queryFn: listMyDelegations,
  });

  const toMeQuery = useQuery({
    queryKey: queryKeys.delegations.toMe(),
    queryFn: listDelegationsToMe,
  });

  const usersQuery = useQuery({
    queryKey: queryKeys.users.list({ page: 1, limit: 100 }),
    queryFn: () => listUsers({ page: 1, limit: 100 }),
  });

  return {
    mineQuery,
    toMeQuery,
    usersQuery,
    myDelegations: mineQuery.data ?? [],
    delegationsToMe: toMeQuery.data ?? [],
    users: usersQuery.data?.items ?? [],
  };
}
