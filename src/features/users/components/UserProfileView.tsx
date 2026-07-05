import { Link } from 'react-router-dom';
import {
  BriefcaseIcon,
  BuildingsIcon,
  ChartBarIcon,
} from '@phosphor-icons/react';
import shieldCheckIconUrl from '@/assets/icons/shield-check.png';
import { UserAvatar } from '@/shared/components/UserAvatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { DataCard } from '@/shared/components/DataCard';
import { AssetIcon } from '@/shared/components/AssetIcon';
import { useResourceAuditLogs } from '@/shared/hooks/use-resource-audit-logs';
import { ErrorState } from '@/shared/components/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState';
import { PageHeader } from '@/shared/components/PageHeader';
import { PageShell } from '@/shared/components/PageShell';
import { ReferenceCell } from '@/shared/components/ReferenceCell';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { StatusPill } from '@/shared/components/StatusPill';
import { canAccess } from '@/shared/lib/capabilities';
import { toastError, toastSuccess } from '@/shared/lib/toast';
import { formatDate, formatLabel, formatRoleName } from '@/shared/utils/format';
import { formatNgn } from '@/shared/utils/money';
import { formatUserName } from '@/shared/utils/user';
import { EmployeeAccountDetails } from '@/features/users/components/EmployeeAccountDetails';
import { OrgGrantsPanel } from '@/shared/components/OrgGrantsPanel';
import type { ExpenseStatus, UserDetailSummary } from '@/types/api';

type UserProfileViewProps = {
  summary: UserDetailSummary;
  backTo?: string;
  backLabel?: string;
  canManage?: boolean;
  onEdit?: () => void;
  onToggleActive?: () => void;
  togglePending?: boolean;
};

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    toastSuccess('Copied to clipboard');
  } catch {
    toastError(null, 'Failed to copy');
  }
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-card p-4">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums text-foreground">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function UserProfileView({
  summary,
  backTo,
  backLabel = 'Back to users',
  canManage = false,
  onEdit,
  onToggleActive,
  togglePending,
}: UserProfileViewProps) {
  const { authorization } = useAuth();
  const canReadAudit = canAccess(authorization?.capabilities, 'audit:read');
  const user = summary.user;
  const displayName = formatUserName(user);
  const stats = summary.expenseStats;

  const auditQuery = useResourceAuditLogs(user.reference, canReadAudit);

  return (
    <PageShell className="max-w-5xl space-y-4">
      <PageHeader
        backTo={backTo}
        backLabel={backLabel}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {canManage && onToggleActive ? (
              <Button
                variant={user.isActive ? "outline" : "default"}
               className="h-11 font-normal text-sm px-7"
                disabled={togglePending}
                onClick={onToggleActive}
              >
                {user.isActive ? "Deactivate Employee" : "Activate Employee"}
              </Button>
            ) : null}
         
            {canManage && onEdit ? (
              <Button className="h-11 font-normal text-sm px-7 bg-primary-500" onClick={onEdit}>
                Edit Employee
              </Button>
            ) : null}
          </div>
        }
      />

      <Card className="overflow-hidden border-border/60 bg-linear-to-br from-primary/5 via-card to-card">
        <CardContent className="space-y-5 p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <UserAvatar user={user} size="lg" />
              <div className="min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold text-foreground">
                    {displayName}
                  </h2>
                  <StatusPill active={user.isActive} />
                  {user.isEmailVerified ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                      <AssetIcon
                        src={shieldCheckIconUrl}
                        className="size-3.5"
                      />
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                      Email not verified
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 sm:justify-end">
              {user.role?.name ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground">
                  <BriefcaseIcon className="size-3.5" />
                  {formatRoleName(user.role.name)}
                </span>
              ) : null}
              {user.department?.name ? (
                <Link
                  to={`/admin/departments/${user.department.reference}`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground hover:bg-muted/80"
                >
                  <BuildingsIcon className="size-3.5" />
                  {formatLabel(user.department.name)}
                </Link>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                  No department
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <EmployeeAccountDetails
        user={user}
        onCopyReference={(reference) => void copyToClipboard(reference)}
      />

      {(summary.orgGrants?.length ?? 0) > 0 ||
      summary.managedDepartments.length > 0 ? (
        <Card className="border-border/60">
          <CardContent className="py-4">
            <OrgGrantsPanel
              orgGrants={summary.orgGrants}
              managedDepartments={summary.managedDepartments}
            />
          </CardContent>
        </Card>
      ) : null}

      <div>
        <div className="mb-3 flex items-center gap-2">
          <ChartBarIcon className="size-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">
            Expense activity — {stats.year}
          </h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total claims" value={stats.totalCount} />
          <StatCard label="YTD spend" value={formatNgn(stats.totalAmountYtd)} />
          <StatCard
            label="Pending reimbursement"
            value={formatNgn(stats.pendingReimbursementAmount)}
            hint={`${stats.approvedCount} approved`}
          />
          <StatCard
            label="In progress"
            value={stats.pendingCount + stats.draftCount}
            hint={`${stats.draftCount} draft · ${stats.rejectedCount} rejected`}
          />
        </div>
      </div>

      <DataCard
        title="Recent expenses"
        description="Latest claims submitted by this employee."
      >
        {summary.recentExpenses.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-muted-foreground">
            No expense claims yet.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summary.recentExpenses.map((expense) => (
                <TableRow key={expense.reference}>
                  <TableCell>
                    <ReferenceCell
                      value={expense.reference}
                      variant="compact"
                    />
                  </TableCell>
                  <TableCell>
                    <Link
                      to={`/expenses/${expense.reference}`}
                      className="font-medium text-foreground hover:text-primary hover:underline"
                    >
                      {expense.title}
                    </Link>
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {formatNgn(expense.amount)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={expense.status as ExpenseStatus} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(expense.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DataCard>

      {canReadAudit ? (
        <DataCard
          title="Audit trail"
          description="Administrative changes involving this user."
        >
          {auditQuery.isLoading ? (
            <LoadingState message="Loading audit trail…" />
          ) : auditQuery.isError ? (
            <ErrorState
              message={(auditQuery.error as Error).message}
              onRetry={() => void auditQuery.refetch()}
              retrying={auditQuery.isFetching}
            />
          ) : (auditQuery.data?.length ?? 0) === 0 ? (
            <p className="px-6 py-8 text-center text-sm text-muted-foreground">
              No audit events recorded for this user.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>When</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditQuery.data?.map((log) => (
                  <TableRow key={log.reference}>
                    <TableCell className="font-medium">
                      {formatLabel(log.action)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {log.actor ? formatUserName(log.actor) : "System"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(log.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DataCard>
      ) : null}
    </PageShell>
  );
}
