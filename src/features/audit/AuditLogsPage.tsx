import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheckIcon } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DataCard } from '@/shared/components/DataCard';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState';
import { FilterCard } from '@/shared/components/FilterCard';
import { FormField } from '@/shared/components/FormField';
import { SearchField } from '@/shared/components/SearchField';
import { SearchInput } from '@/shared/components/SearchInput';
import { LoadingState } from '@/shared/components/LoadingState';
import { ReferenceCell } from '@/shared/components/ReferenceCell';
import { PageHeader } from '@/shared/components/PageHeader';
import { PageShell } from '@/shared/components/PageShell';
import { TablePagination } from '@/shared/components/TablePagination';
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value';
import { DEFAULT_PAGE_SIZE, formatTotalLabel, resolvePaginationMeta, shouldShowPagination } from '@/shared/lib/pagination';
import { formatLabel } from '@/shared/utils/format';
import { formatAuditAction } from './format-audit';
import { useAuth } from '@/features/auth/use-auth';
import { canAccess } from '@/shared/lib/capabilities';
import { formatUserName } from '@/shared/utils/user';
import { listAuditLogs } from './api';
import { queryKeys } from '@/shared/api/query-keys';

export function AuditLogsPage() {
  const { authorization } = useAuth();
  const canAccessReview = canAccess(authorization?.capabilities, 'audit:read');
  const [action, setAction] = useState('');
  const [resourceReference, setResourceReference] = useState('');
  const debouncedAction = useDebouncedValue(action);
  const debouncedResourceReference = useDebouncedValue(resourceReference);
  const [page, setPage] = useState(1);

  const logsQuery = useQuery({
    queryKey: queryKeys.audit.list({
      debouncedAction,
      debouncedResourceReference,
      page,
    }),
    queryFn: () =>
      listAuditLogs({
        page,
        limit: DEFAULT_PAGE_SIZE,
        action: debouncedAction || undefined,
        resourceReference: debouncedResourceReference || undefined,
      }),
    placeholderData: keepPreviousData,
  });

  if (logsQuery.isLoading && !logsQuery.data) {
    return <LoadingState message="Loading audit logs…" />;
  }

  if (logsQuery.isError) {
    return (
      <ErrorState
        message={(logsQuery.error as Error).message}
        onRetry={() => void logsQuery.refetch()}
        retrying={logsQuery.isFetching}
      />
    );
  }

  const logs = logsQuery.data?.items ?? [];
  const meta = resolvePaginationMeta(
    logsQuery.data?.meta,
    logsQuery.data?.items?.length ?? 0,
    page,
    DEFAULT_PAGE_SIZE,
  );

  return (
    <PageShell wide>
      <PageHeader
        title="Audit logs"
        meta={formatTotalLabel(meta.total, 'entry', 'entries')}
        actions={
          canAccessReview ? (
            <Button variant="outline" asChild>
              <Link to="/admin/access-review">
                <ShieldCheckIcon className="size-4" />
                Access review
              </Link>
            </Button>
          ) : undefined
        }
      />

      <FilterCard>
        <SearchField
       
          placeholder="Filter by action…"
          value={action}
          onValueChange={(value) => {
            setAction(value);
            setPage(1);
          }}
        />
        <FormField  className="min-w-[200px] flex-1">
          <SearchInput
            showIcon={false}
            placeholder="Resource reference…"
            value={resourceReference}
            onValueChange={(value) => {
              setResourceReference(value);
              setPage(1);
            }}
          />
        </FormField>
      </FilterCard>

      <DataCard
        footer={
          shouldShowPagination(meta) ? (
            <TablePagination meta={meta} onPageChange={setPage} />
          ) : undefined
        }
      >
        {logs.length === 0 ? (
          <EmptyState
            title="No audit logs found"
            description="Adjust your filters or check back later for activity."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>When</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Action</TableHead>
                {/* <TableHead>Details</TableHead> */}
                <TableHead>Resource</TableHead>
                <TableHead>Reference</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.reference}>
                  <TableCell className="text-muted-foreground">
                    {new Date(log.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>{formatUserName(log.actor)}</TableCell>
                  <TableCell>{formatAuditAction(log.action)}</TableCell>
                  {/* <TableCell className="text-muted-foreground">
                    {formatAuditMetadata(log.action, log.metadata) ?? '—'}
                  </TableCell> */}
                  <TableCell>{formatLabel(log.resourceType)}</TableCell>
                  <TableCell>
                    <ReferenceCell value={log.resourceReference} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DataCard>
    </PageShell>
  );
}
