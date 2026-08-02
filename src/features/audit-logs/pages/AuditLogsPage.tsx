import { Fragment, useState } from 'react';
import { Link } from 'react-router-dom';
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { CaretDownIcon, DownloadSimpleIcon } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AuditMetadataPanel } from '@/features/audit-logs/components/AuditMetadataPanel';
import { DataCard } from '@/shared/components/DataCard';
import { EmptyState } from '@/shared/components/EmptyState';
import { FilterCard } from '@/shared/components/FilterCard';
import { SearchInput } from '@/shared/components/SearchInput';
import { ReferenceCell } from '@/shared/components/ReferenceCell';
import AppFormLabel from '@/shared/reusable/AppFormLabel';
import { PageHeader } from '@/shared/components/PageHeader';
import { PageShell } from '@/shared/components/PageShell';
import { QueryStatus } from '@/shared/components/QueryStatus';
import { TablePagination } from '@/shared/components/TablePagination';
import { useActionCapabilities } from '@/shared/hooks/use-action-capabilities';
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value';
import { DEFAULT_PAGE_SIZE, resolvePaginationMeta, shouldShowPagination } from '@/shared/lib/pagination';
import { toastError, toastSuccess } from '@/shared/lib/toast';
import { formatLabel } from '@/shared/utils/format';
import { AUDIT_ACTION_OPTIONS, auditResourcePath, formatAuditAction } from '../format-audit';
import { formatUserName } from '@/shared/utils/user';
import { listAuditLogs } from '../api';
import { queryKeys } from '@/shared/api/query-keys';
import type { AuditLogResponse } from '@/types/api';
import { cn } from '@/lib/utils';

const ALL_ACTIONS = '__all__';

function downloadAuditCsv(logs: AuditLogResponse[]) {
  const headers = ['When', 'Actor', 'Action', 'Resource', 'Reference', 'Metadata'];
  const rows = logs.map((log) => [
    new Date(log.createdAt).toISOString(),
    formatUserName(log.actor),
    log.action,
    log.resourceType,
    log.resourceReference,
    JSON.stringify(log.metadata ?? {}),
  ]);
  const escape = (value: string) => `"${value.replaceAll('"', '""')}"`;
  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => escape(String(cell ?? ''))).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `expentra-audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function AuditLogsPage() {
  const caps = useActionCapabilities();
  const [action, setAction] = useState(ALL_ACTIONS);
  const [resourceReference, setResourceReference] = useState('');
  const [actorEmail, setActorEmail] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [expandedReference, setExpandedReference] = useState<string | null>(null);
  const debouncedResourceReference = useDebouncedValue(resourceReference);
  const debouncedActorEmail = useDebouncedValue(actorEmail);
  const [page, setPage] = useState(1);

  const filterParams = {
    action: action !== ALL_ACTIONS ? action : undefined,
    resourceReference: debouncedResourceReference || undefined,
    actorEmail: debouncedActorEmail || undefined,
    from: from || undefined,
    to: to || undefined,
  };

  const logsQuery = useQuery({
    queryKey: queryKeys.audit.list({
      ...filterParams,
      page,
    }),
    queryFn: () =>
      listAuditLogs({
        page,
        limit: DEFAULT_PAGE_SIZE,
        ...filterParams,
      }),
    placeholderData: keepPreviousData,
  });

  const exportMutation = useMutation({
    mutationFn: async () => {
      const result = await listAuditLogs({
        page: 1,
        limit: 500,
        ...filterParams,
      });
      if (result.items.length === 0) {
        throw new Error('No audit logs match the current filters');
      }
      downloadAuditCsv(result.items);
      return result.items.length;
    },
    onSuccess: (count) => toastSuccess(`Exported ${count} audit log${count === 1 ? '' : 's'}`),
    onError: (err) => toastError(err, 'Failed to export audit logs'),
  });

  const logs = logsQuery.data?.items ?? [];
  const meta = resolvePaginationMeta(
    logsQuery.data?.meta,
    logsQuery.data?.items?.length ?? 0,
    page,
    DEFAULT_PAGE_SIZE,
  );

  return (
    <QueryStatus query={logsQuery} loadingMessage="Loading audit logs…">
    <PageShell wide>
      <PageHeader
        title="Audit logs"
        description="Investigate system activity by date, actor, action, and resource."
        actions={
          caps.audit.export ? (
            <Button
              className="h-11 font-normal text-sm px-7 bg-primary-500"
              disabled={exportMutation.isPending || logs.length === 0}
              onClick={() => void exportMutation.mutateAsync()}
            >
              <DownloadSimpleIcon className="size-4" />
              {exportMutation.isPending ? 'Exporting…' : 'Export Audit Logs'}
            </Button>
          ) : undefined
        }
      />

      <FilterCard>
        <div className="w-full min-w-0 flex-1 space-y-1.5 sm:min-w-[180px]">
          <AppFormLabel>Action</AppFormLabel>
          <Select
            value={action}
            onValueChange={(value) => {
              setAction(value);
              setPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="All actions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_ACTIONS}>All actions</SelectItem>
              {AUDIT_ACTION_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {formatAuditAction(option)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-full min-w-0 flex-1 space-y-1.5 sm:min-w-[180px]">
          <AppFormLabel>Actor email</AppFormLabel>
          <SearchInput
            showIcon={false}
            placeholder="Filter by actor email…"
            value={actorEmail}
            onValueChange={(value) => {
              setActorEmail(value);
              setPage(1);
            }}
          />
        </div>
        <div className="w-full min-w-0 flex-1 space-y-1.5 sm:min-w-[180px]">
          <AppFormLabel>Resource reference</AppFormLabel>
          <SearchInput
            showIcon={false}
            placeholder="Resource reference…"
            value={resourceReference}
            onValueChange={(value) => {
              setResourceReference(value);
              setPage(1);
            }}
          />
        </div>
        <div className="w-full space-y-1.5 sm:w-[150px]">
          <AppFormLabel>From</AppFormLabel>
          <Input
            type="date"
            value={from}
            onChange={(event) => {
              setFrom(event.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="w-full space-y-1.5 sm:w-[150px]">
          <AppFormLabel>To</AppFormLabel>
          <Input
            type="date"
            value={to}
            onChange={(event) => {
              setTo(event.target.value);
              setPage(1);
            }}
          />
        </div>
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
                <TableHead className="w-10" />
                <TableHead>When</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>Reference</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => {
                const isExpanded = expandedReference === log.reference;
                const hasMetadata =
                  Boolean(log.metadata) && Object.keys(log.metadata ?? {}).length > 0;
                const resourcePath = auditResourcePath(log.resourceType, log.resourceReference);
                const actorPath = log.actor?.reference
                  ? `/admin/users/${log.actor.reference}`
                  : null;

                return (
                  <Fragment key={log.reference}>
                    <TableRow>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label={isExpanded ? 'Hide details' : 'Show details'}
                          disabled={!hasMetadata}
                          onClick={() =>
                            setExpandedReference(isExpanded ? null : log.reference)
                          }
                        >
                          <CaretDownIcon
                            className={cn(
                              'size-4 transition-transform',
                              isExpanded && 'rotate-180',
                            )}
                          />
                        </Button>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(log.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {actorPath ? (
                          <Link to={actorPath} className="text-primary hover:underline">
                            {formatUserName(log.actor)}
                          </Link>
                        ) : (
                          formatUserName(log.actor)
                        )}
                      </TableCell>
                      <TableCell>{formatAuditAction(log.action)}</TableCell>
                      <TableCell>{formatLabel(log.resourceType)}</TableCell>
                      <TableCell>
                        {resourcePath ? (
                          <Link
                            to={resourcePath}
                            className="font-mono text-sm text-primary hover:underline"
                          >
                            {log.resourceReference}
                          </Link>
                        ) : (
                          <ReferenceCell value={log.resourceReference} />
                        )}
                      </TableCell>
                    </TableRow>
                    {isExpanded ? (
                      <TableRow>
                        <TableCell colSpan={6} className="bg-muted/20 py-3">
                          <AuditMetadataPanel metadata={log.metadata} />
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </Fragment>
                );
              })}
            </TableBody>
          </Table>
        )}
      </DataCard>
    </PageShell>
    </QueryStatus>
  );
}
