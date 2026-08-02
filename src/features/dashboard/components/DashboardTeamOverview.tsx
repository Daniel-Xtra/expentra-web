import { Link } from 'react-router-dom';
import {
  ClockIcon,
  HourglassMediumIcon,
  TrendUpIcon,
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { DepartmentSpendTrendChart } from '@/features/departments/components/DepartmentSpendTrendChart';
import { DataCard } from '@/shared/components/DataCard';
import { EmptyState } from '@/shared/components/EmptyState';
import { StatCard } from '@/shared/components/StatCard';
import { formatNgn } from '@/shared/utils/money';
import type { TeamDashboard } from '@/types/api';

type DashboardTeamOverviewProps = {
  team: TeamDashboard;
  highlightPeriod?: number;
};

export function DashboardTeamOverview({ team, highlightPeriod }: DashboardTeamOverviewProps) {
  const hasSpendOverTime = team.spendOverTime.some((row) => row.totalAmount > 0);
  const description =
    team.spendOverTimeGranularity === 'week'
      ? 'Weekly spend by category for the selected month'
      : 'Monthly spend by category for the selected year';
  const projectedUtil = team.projectedUtilizationPercent;
  const hasPending = team.pendingApprovals > 0;
  const hasAging = team.agingApprovals > 0;

  return (
    <div className="space-y-4">
      <section
        aria-label="Team approval and budget health"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <StatCard
          label="Team spend"
          value={formatNgn(team.teamSpendAmount)}
          hint={`${team.teamExpenseCount} claim${team.teamExpenseCount === 1 ? '' : 's'} in period`}
          tone="primary"
          icon={<TrendUpIcon className="size-4" weight="duotone" />}
        />
        <StatCard
          label="Pending approvals"
          value={team.pendingApprovals}
          hint="Submitted or under review in this department"
          tone={hasPending ? 'warning' : 'default'}
          icon={<HourglassMediumIcon className="size-4" weight="duotone" />}
        />
        <StatCard
          label="Aging approvals"
          value={team.agingApprovals}
          hint="Waiting more than 3 days for a decision"
          tone={hasAging ? 'warning' : 'default'}
          icon={<ClockIcon className="size-4" weight="duotone" />}
        />
        <StatCard
          label="Projected util"
          value={projectedUtil != null ? `${projectedUtil.toFixed(1)}%` : '—'}
          hint={
            team.budgetLimit != null
              ? `${formatNgn(team.committedAmount ?? 0)} of ${formatNgn(team.budgetLimit)} committed`
              : 'No active department budget'
          }
          tone={projectedUtil != null && projectedUtil >= 100 ? 'warning' : 'default'}
          icon={<TrendUpIcon className="size-4" weight="duotone" />}
        />
      </section>

      {(hasPending || hasAging) && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5">
          <p className="text-xs text-muted-foreground">
            {hasAging
              ? `${team.agingApprovals} aging claim${team.agingApprovals === 1 ? '' : 's'} need attention.`
              : `${team.pendingApprovals} claim${team.pendingApprovals === 1 ? '' : 's'} awaiting your approval.`}
          </p>
          <Button variant="outline" size="sm" asChild>
            <Link to="/approvals">Open approvals</Link>
          </Button>
        </div>
      )}

      <DataCard
        className="w-full"
        title="Spend trend"
        description={description}
        contentClassName="p-0"
      >
        {hasSpendOverTime ? (
          <DepartmentSpendTrendChart
            rows={team.spendOverTime}
            highlightPeriod={highlightPeriod}
          />
        ) : (
          <div className="flex min-h-[280px] items-center justify-center p-6">
            <EmptyState
              compact
              title="No spend recorded"
              description="Trends appear once expenses are submitted in this period."
            />
          </div>
        )}
      </DataCard>
    </div>
  );
}
