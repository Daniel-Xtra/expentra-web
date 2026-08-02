import { DownloadSimpleIcon } from '@phosphor-icons/react';
import { AccessReviewFilters } from '@/features/access-review/components/AccessReviewFilters';
import { AccessReviewTable } from '@/features/access-review/components/AccessReviewTable';
import { useAccessReview } from '@/features/access-review/hooks/use-access-review';
import { Button } from '@/components/ui/button';
import { DataCard } from '@/shared/components/DataCard';
import { EmptyState } from '@/shared/components/EmptyState';
import { useActionCapabilities } from '@/shared/hooks/use-action-capabilities';
import { PageHeader } from '@/shared/components/PageHeader';
import { PageShell } from '@/shared/components/PageShell';
import { QueryStatus } from '@/shared/components/QueryStatus';

export function AccessReviewPage() {
  const { accessReview } = useActionCapabilities();
  const review = useAccessReview();

  return (
    <QueryStatus query={review.reviewQuery} loadingMessage="Loading access review…">
    <PageShell wide>
      <PageHeader
        title="Access review"
        description="Read-only inventory of active users’ effective roles, permissions, and capabilities. Export for review; change access from Users or Roles."
        actions={
          accessReview.export ? (
            <Button
              className="h-11 font-normal text-sm px-7 bg-primary-500"
              disabled={review.exportMutation.isPending || review.totalUsers === 0}
            onClick={() => void review.exportMutation.mutateAsync()}
          >
            <DownloadSimpleIcon className="size-4" />
            {review.exportMutation.isPending ? "Exporting…" : "Export Access Review"}
          </Button>
        ) : null}
      />
      <AccessReviewFilters
        search={review.search}
        onSearchChange={review.setSearch}
        roleFilter={review.roleFilter}
        onRoleFilterChange={review.setRoleFilter}
        departmentFilter={review.departmentFilter}
        onDepartmentFilterChange={review.setDepartmentFilter}
        roleOptions={review.roleOptions}
        departmentOptions={review.departmentOptions}
      />

      <DataCard>
        {review.filteredRows.length === 0 ? (
          <EmptyState
            title={review.totalUsers === 0 ? 'No active users' : 'No matches'}
            description={
              review.totalUsers === 0
                ? 'Active users will appear here once accounts are provisioned.'
                : 'Try a different search or filter.'
            }
          />
        ) : (
          <AccessReviewTable rows={review.filteredRows} />
        )}
      </DataCard>
    </PageShell>
    </QueryStatus>
  );
}
