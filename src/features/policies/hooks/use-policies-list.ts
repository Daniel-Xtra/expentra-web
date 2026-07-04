import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { getPolicyCatalog, listPolicies } from '@/features/policies/api';
import {
  EMPTY_POLICY_CATALOG,
  normalizePolicyCatalog,
} from '@/features/policies/policy-config';
import { queryKeys } from '@/shared/api/query-keys';

export function usePoliciesList() {
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState<'policies' | 'catalog'>('policies');

  const catalogQuery = useQuery({
    queryKey: queryKeys.policies.catalog(),
    queryFn: getPolicyCatalog,
    retry: false,
  });

  const policiesQuery = useQuery({
    queryKey: queryKeys.policies.all,
    queryFn: listPolicies,
    retry: false,
  });

  const catalog = useMemo(
    () => normalizePolicyCatalog(catalogQuery.data ?? EMPTY_POLICY_CATALOG),
    [catalogQuery.data],
  );

  const policies = useMemo(() => policiesQuery.data ?? [], [policiesQuery.data]);

  return {
    search,
    setSearch,
    severityFilter,
    setSeverityFilter,
    statusFilter,
    setStatusFilter,
    activeTab,
    setActiveTab,
    catalogQuery,
    policiesQuery,
    catalog,
    policies,
  };
}
