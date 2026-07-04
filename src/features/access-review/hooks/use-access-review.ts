import { useMutation, useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { downloadAccessReviewExcel, fetchAccessReview } from '@/features/access-review/api';
import { matchesAccessReviewSearch } from '@/features/access-review/utils';
import { queryKeys } from '@/shared/api/query-keys';
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value';
import { toastError } from '@/shared/lib/toast';

export function useAccessReview() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);

  const reviewQuery = useQuery({
    queryKey: queryKeys.accessReview.all,
    queryFn: fetchAccessReview,
  });

  const exportMutation = useMutation({
    mutationFn: downloadAccessReviewExcel,
    onError: (err) => toastError(err, 'Failed to export access review'),
  });

  const filteredRows = useMemo(() => {
    const rows = reviewQuery.data ?? [];
    const query = debouncedSearch.trim().toLowerCase();
    if (!query) {
      return rows;
    }
    return rows.filter((row) => matchesAccessReviewSearch(row, query));
  }, [debouncedSearch, reviewQuery.data]);

  return {
    search,
    setSearch,
    reviewQuery,
    exportMutation,
    filteredRows,
    totalUsers: reviewQuery.data?.length ?? 0,
  };
}
