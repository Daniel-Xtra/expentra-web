import { CategorySpendOverTimeChart } from '@/features/dashboard/components/CategorySpendOverTimeChart';
import type { DashboardSpendPeriodRow } from '@/types/api';

type DepartmentSpendTrendChartProps = {
  rows: DashboardSpendPeriodRow[];
  highlightPeriod?: number;
};

export function DepartmentSpendTrendChart({
  rows,
  highlightPeriod,
}: DepartmentSpendTrendChartProps) {
  return <CategorySpendOverTimeChart rows={rows} highlightPeriod={highlightPeriod} />;
}
