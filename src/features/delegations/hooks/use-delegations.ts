import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { listUsers } from '@/features/users/api';
import {
  listDelegationsToMe,
  listMyDelegations,
} from '@/features/delegations/api';
import { queryKeys } from '@/shared/api/query-keys';
import { DEFAULT_PAGE_SIZE, resolvePaginationMeta } from '@/shared/lib/pagination';

type UseDelegationsOptions = {
  grantedPage?: number;
  receivedPage?: number;
  pageSize?: number;
};

export function useDelegations(options: UseDelegationsOptions = {}) {
  const grantedPage = options.grantedPage ?? 1;
  const receivedPage = options.receivedPage ?? 1;
  const pageSize = options.pageSize ?? DEFAULT_PAGE_SIZE;

  const mineQuery = useQuery({
    queryKey: queryKeys.delegations.mine({ page: grantedPage, limit: pageSize }),
    queryFn: () => listMyDelegations({ page: grantedPage, limit: pageSize }),
    placeholderData: keepPreviousData,
  });

  const toMeQuery = useQuery({
    queryKey: queryKeys.delegations.toMe({ page: receivedPage, limit: pageSize }),
    queryFn: () => listDelegationsToMe({ page: receivedPage, limit: pageSize }),
    placeholderData: keepPreviousData,
  });

  const usersQuery = useQuery({
    queryKey: queryKeys.users.list({ page: 1, limit: 100 }),
    queryFn: () => listUsers({ page: 1, limit: 100 }),
  });

  const myDelegations = mineQuery.data?.items ?? [];
  const delegationsToMe = toMeQuery.data?.items ?? [];
  const grantedMeta = resolvePaginationMeta(
    mineQuery.data?.meta,
    myDelegations.length,
    grantedPage,
    pageSize,
  );
  const receivedMeta = resolvePaginationMeta(
    toMeQuery.data?.meta,
    delegationsToMe.length,
    receivedPage,
    pageSize,
  );

  return {
    mineQuery,
    toMeQuery,
    usersQuery,
    myDelegations,
    delegationsToMe,
    grantedMeta,
    receivedMeta,
    users: usersQuery.data?.items ?? [],
  };
}
