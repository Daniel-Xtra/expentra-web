import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Fragment, useState } from 'react';
import { ClockCounterClockwiseIcon, UserCircleIcon } from '@phosphor-icons/react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  listDepartmentManagerHistory,
  listManagedDepartmentManagerHistory,
} from '@/features/departments/api';
import { queryKeys } from '@/shared/api/query-keys';
import { cn } from '@/lib/utils';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState';
import { TablePagination } from '@/shared/components/TablePagination';
import { DEFAULT_PAGE_SIZE, resolvePaginationMeta, shouldShowPagination } from '@/shared/lib/pagination';
import { formatDate } from '@/shared/utils/format';
import { formatUserName, getUserInitials } from '@/shared/utils/user';
import type { DepartmentManagerHistoryResponse } from '@/types/api';

type DepartmentManagerHistorySectionProps = {
  departmentReference: string;
  managed?: boolean;
};

function HistoryTimelineSkeleton() {
  return (
    <ul className="space-y-0 px-5 py-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <li key={index} className="flex gap-3.5 pb-6 last:pb-0">
          <Skeleton className="size-9 shrink-0 rounded-full" />
          <div className="flex flex-1 items-start justify-between gap-4 pt-0.5">
            <div className="space-y-2">
              <Skeleton className="h-4 w-52" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-8 w-20" />
          </div>
        </li>
      ))}
    </ul>
  );
}

function getEntryYear(entry: DepartmentManagerHistoryResponse) {
  const date = new Date(entry.startedAt);
  return Number.isFinite(date.getTime()) ? date.getFullYear() : null;
}

function HistoryTimelineEntry({
  entry,
  isLast,
}: {
  entry: DepartmentManagerHistoryResponse;
  isLast: boolean;
}) {
  const managerName = entry.manager ? formatUserName(entry.manager) : 'No lead';
  const assignedBy = entry.assignedBy ? formatUserName(entry.assignedBy) : 'System';

  return (
    <li className="relative flex gap-3.5 pb-6 last:pb-0">
      {!isLast ? (
        <span
          className="absolute top-9 left-[17px] h-[calc(100%-1.25rem)] w-px bg-border/80"
          aria-hidden
        />
      ) : null}

      {entry.manager ? (
        <Avatar
          className={cn(
            'relative z-10 size-9 shrink-0 ring-4 ring-card',
            entry.isCurrent && 'ring-primary/15',
          )}
        >
          <AvatarFallback
            className={cn(
              'text-xs font-semibold',
              entry.isCurrent
                ? 'bg-primary/10 text-primary'
                : 'bg-muted text-muted-foreground',
            )}
          >
            {getUserInitials(entry.manager)}
          </AvatarFallback>
        </Avatar>
      ) : (
        <div
          className={cn(
            'relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full ring-4 ring-card',
            'bg-muted text-muted-foreground',
          )}
        >
          <UserCircleIcon className="size-4" weight="duotone" />
        </div>
      )}

      <div className="min-w-0 flex-1 pt-0.5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-1">
            <p className="text-sm leading-snug text-foreground">
              <span className="font-semibold">{managerName}</span>
              {entry.manager
                ? entry.isCurrent
                  ? ' is leading the department'
                  : ' led the department'
                : entry.isCurrent
                  ? ' — no lead assigned'
                  : ' — leadership vacancy'}
            </p>
            <p className="text-xs text-muted-foreground">
              Appointed by {assignedBy}
              {entry.manager?.email ? (
                <>
                  <span className="mx-1.5 text-border">·</span>
                  <span className="truncate">{entry.manager.email}</span>
                </>
              ) : null}
            </p>
          </div>

          <div className="shrink-0 text-right">
            <time
              className="block text-[11px] font-medium text-foreground"
              dateTime={entry.startedAt}
            >
              {formatDate(entry.startedAt)}
            </time>
            {entry.isCurrent ? (
              <span className="mt-0.5 block text-[11px] font-medium text-primary">Present</span>
            ) : (
              <time
                className="mt-0.5 block text-[11px] text-muted-foreground"
                dateTime={entry.endedAt ?? undefined}
              >
                to {formatDate(entry.endedAt)}
              </time>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}

export function DepartmentManagerHistorySection({
  departmentReference,
  managed = false,
}: DepartmentManagerHistorySectionProps) {
  const [page, setPage] = useState(1);

  const historyQuery = useQuery({
    queryKey: queryKeys.departments.managerHistory(departmentReference, managed, { page }),
    queryFn: () => {
      const params = { page, limit: DEFAULT_PAGE_SIZE };
      return managed
        ? listManagedDepartmentManagerHistory(departmentReference, params)
        : listDepartmentManagerHistory(departmentReference, params);
    },
    enabled: Boolean(departmentReference),
    placeholderData: keepPreviousData,
  });

  const items = historyQuery.data?.items ?? [];
  const total = historyQuery.data?.meta?.total;
  const meta = resolvePaginationMeta(
    historyQuery.data?.meta,
    items.length,
    page,
    DEFAULT_PAGE_SIZE,
  );

  return (
    <Card className="overflow-hidden border-border/60">
      <div className="border-b border-border/50 px-4 py-4 sm:px-6">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <ClockCounterClockwiseIcon className="size-5" weight="duotone" />
          </div>
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-semibold text-foreground">Manager history</h2>
              {typeof total === 'number' && !historyQuery.isLoading && total > 0 ? (
                <span className="inline-flex rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                  {total}
                </span>
              ) : null}
            </div>
            <p className="text-sm text-muted-foreground">
              Chronological record of department leadership
            </p>
          </div>
        </div>
      </div>

      <CardContent className="p-0">
        {historyQuery.isLoading && !historyQuery.data ? (
          <HistoryTimelineSkeleton />
        ) : historyQuery.isError ? (
          <div className="p-6">
            <ErrorState
              message={(historyQuery.error as Error).message}
              onRetry={() => void historyQuery.refetch()}
              retrying={historyQuery.isFetching}
            />
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={<ClockCounterClockwiseIcon className="size-8 text-muted-foreground" />}
            title="No manager history yet"
            description="Leadership changes will be recorded here when a manager is assigned."
            className="py-12"
          />
        ) : (
          <ul className="px-5 py-4 sm:px-6">
            {items.map((entry, index) => {
              const year = getEntryYear(entry);
              const previousYear =
                index > 0 ? getEntryYear(items[index - 1]!) : null;
              const showYearDivider = year !== null && year !== previousYear;

              return (
                <Fragment key={entry.reference}>
                  {showYearDivider ? (
                    <li
                      className={cn(
                        'pb-3',
                        index > 0 && 'mt-1 border-t border-border/40 pt-5',
                      )}
                    >
                      <span className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                        {year}
                      </span>
                    </li>
                  ) : null}
                  <HistoryTimelineEntry
                    entry={entry}
                    isLast={index === items.length - 1}
                  />
                </Fragment>
              );
            })}
          </ul>
        )}
      </CardContent>

      {shouldShowPagination(meta) ? (
        <TablePagination meta={meta} onPageChange={setPage} />
      ) : null}
    </Card>
  );
}
