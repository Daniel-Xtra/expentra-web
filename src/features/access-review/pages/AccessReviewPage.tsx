import { AccessReviewFilters } from '@/features/access-review/components/AccessReviewFilters';
import { AccessReviewTable } from '@/features/access-review/components/AccessReviewTable';
import { useAccessReview } from '@/features/access-review/hooks/use-access-review';
import { DataCard } from '@/shared/components/DataCard';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState';
import { PageHeader } from '@/shared/components/PageHeader';
import { PageShell } from '@/shared/components/PageShell';

export function AccessReviewPage() {
  const review = useAccessReview();
  if (review.reviewQuery.isLoading && !review.reviewQuery.data) {
    return <LoadingState message="Loading access review…" />;
  }

  if (review.reviewQuery.isError) {
    return (
      <ErrorState
        message={(review.reviewQuery.error as Error).message}
        onRetry={() => void review.reviewQuery.refetch()}
        retrying={review.reviewQuery.isFetching}
      />
    );
  }

  return (
    <PageShell wide>
      <PageHeader
        title="Access review"
        description="Effective permissions and capabilities for every active user."
        meta={`${review.totalUsers} active ${review.totalUsers === 1 ? 'user' : 'users'}`}
        backTo="/admin/audit-logs"
        backLabel="Audit logs"
     
      />

      <AccessReviewFilters search={review.search} onSearchChange={review.setSearch} />

      <DataCard>
        {review.filteredRows.length === 0 ? (
          <EmptyState
            title={review.totalUsers === 0 ? 'No active users' : 'No matches'}
            description={
              review.totalUsers === 0
                ? 'Active users will appear here once accounts are provisioned.'
                : 'Try a different search term.'
            }
          />
        ) : (
          <AccessReviewTable rows={review.filteredRows} />
        )}
      </DataCard>
    </PageShell>
  );
}
