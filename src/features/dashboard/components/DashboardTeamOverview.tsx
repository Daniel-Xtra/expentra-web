import { DepartmentSpendTrendChart } from '@/features/departments/components/DepartmentSpendTrendChart';
import { DataCard } from '@/shared/components/DataCard';
import { EmptyState } from '@/shared/components/EmptyState';
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

  return (
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
  );
}
