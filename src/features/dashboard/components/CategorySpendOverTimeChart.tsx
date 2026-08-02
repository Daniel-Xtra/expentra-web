import { useMemo } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { PeriodSpendingChart } from '@/features/dashboard/components/PeriodSpendingChart';
import { CATEGORY_CHART_COLORS } from '@/features/reports/chart-colors';
import {
  formatNgnAxis,
  getActiveChartCategories,
  normalizeCategoryAmounts,
} from '@/features/reports/spending-chart-utils';
import { formatLabel } from '@/shared/utils/format';
import { formatNgn } from '@/shared/utils/money';
import type { DashboardSpendPeriodRow, ExpenseCategory } from '@/types/api';

type ChartPoint = {
  label: string;
  period: number;
  totalAmount: number;
  expenseCount: number;
} & Partial<Record<ExpenseCategory, number>>;

type CategoryTooltipProps = {
  active?: boolean;
  payload?: Array<{
    dataKey?: string | number;
    value?: number;
    payload?: ChartPoint;
  }>;
};

function CategoryTooltip({ active, payload }: CategoryTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const point = payload[0]?.payload as ChartPoint | undefined;
  if (!point) {
    return null;
  }

  const categoryEntries = payload.filter(
    (entry) => entry.dataKey && entry.dataKey !== 'totalAmount' && Number(entry.value) > 0,
  );

  return (
    <div className="rounded-md border border-border/60 bg-popover px-3 py-2 text-sm shadow-md">
      <p className="font-medium text-foreground">{point.label}</p>
      <p className="text-xs text-muted-foreground">
        {formatNgn(point.totalAmount)} · {point.expenseCount}{' '}
        {point.expenseCount === 1 ? 'expense' : 'expenses'}
      </p>
      {categoryEntries.length > 0 ? (
        <ul className="mt-2 space-y-1 border-t border-border/50 pt-2">
          {categoryEntries.map((entry) => (
            <li key={String(entry.dataKey)} className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">{formatLabel(String(entry.dataKey))}</span>
              <span className="font-medium tabular-nums">{formatNgn(Number(entry.value))}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

type CategorySpendOverTimeChartProps = {
  rows: DashboardSpendPeriodRow[];
  highlightPeriod?: number;
};

export function CategorySpendOverTimeChart({
  rows,
  highlightPeriod,
}: CategorySpendOverTimeChartProps) {
  const normalizedRows = useMemo(
    () =>
      rows.map((row) => ({
        ...row,
        categoryAmounts: normalizeCategoryAmounts(row.categoryAmounts),
      })),
    [rows],
  );

  const activeCategories = useMemo(
    () => getActiveChartCategories(normalizedRows),
    [normalizedRows],
  );

  const chartData = useMemo<ChartPoint[]>(
    () =>
      normalizedRows.map((row) => ({
        label: row.label,
        period: row.period,
        totalAmount: row.totalAmount,
        expenseCount: row.expenseCount,
        ...Object.fromEntries(
          activeCategories.map((category) => [category, row.categoryAmounts?.[category] ?? 0]),
        ),
      })),
    [activeCategories, normalizedRows],
  );

  if (activeCategories.length === 0) {
    return <PeriodSpendingChart rows={rows} highlightPeriod={highlightPeriod} />;
  }

  return (
    <div className="w-full min-w-0 py-4">
      <ResponsiveContainer width="100%" height={380}>
        <LineChart data={chartData} margin={{ top: 8, right: 16, left: 4, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/50" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
            axisLine={false}
            tickLine={false}
            dy={8}
          />
          <YAxis
            tickFormatter={formatNgnAxis}
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            axisLine={false}
            tickLine={false}
            width={56}
          />
          <Tooltip content={<CategoryTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => formatLabel(String(value))}
            iconType="line"
            wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
          />
          {activeCategories.map((category) => (
            <Line
              key={category}
              type="monotone"
              dataKey={category}
              name={category}
              stroke={CATEGORY_CHART_COLORS[category]}
              strokeWidth={2.5}
              dot={{ r: 3, strokeWidth: 0, fill: CATEGORY_CHART_COLORS[category] }}
              activeDot={{ r: 5, strokeWidth: 0, fill: CATEGORY_CHART_COLORS[category] }}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
