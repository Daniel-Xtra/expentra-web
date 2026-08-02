import { useMemo } from 'react';
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { CATEGORY_CHART_COLORS } from '@/features/reports/chart-colors';
import {
  formatNgnAxis,
  getActiveChartCategories,
  normalizeCategoryAmounts,
} from '@/features/reports/spending-chart-utils';
import { formatLabel } from '@/shared/utils/format';
import { formatNgn } from '@/shared/utils/money';
import type { ExpenseCategory, MonthlySpendingRow } from '@/types/api';

const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

type ChartPoint = {
  month: number;
  label: string;
  totalAmount: number;
  expenseCount: number;
} & Partial<Record<ExpenseCategory, number>>;

type MonthlyTooltipProps = {
  active?: boolean;
  payload?: Array<{
    dataKey?: string | number;
    value?: number;
    payload?: ChartPoint;
  }>;
};

function MonthlyTooltip({ active, payload }: MonthlyTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const point = payload[0]?.payload as ChartPoint | undefined;
  if (!point) {
    return null;
  }

  const categoryEntries = payload.filter(
    (entry) =>
      entry.dataKey &&
      entry.dataKey !== 'totalAmount' &&
      Number(entry.value) > 0,
  );

  return (
    <div className="rounded-md border border-border/60 bg-popover px-3 py-2 text-sm shadow-md">
      <p className="font-medium text-foreground">{MONTH_LABELS[point.month - 1]}</p>
      <p className="tabular-nums text-muted-foreground">{formatNgn(point.totalAmount)}</p>
      <p className="text-xs text-muted-foreground">
        {point.expenseCount} {point.expenseCount === 1 ? 'expense' : 'expenses'}
      </p>
      {categoryEntries.length > 0 ? (
        <ul className="mt-2 space-y-1 border-t border-border/50 pt-2">
          {categoryEntries.map((entry) => (
            <li
              key={String(entry.dataKey)}
              className="flex items-center justify-between gap-4"
            >
              <span className="text-muted-foreground">
                {formatLabel(String(entry.dataKey))}
              </span>
              <span className="font-medium tabular-nums">
                {formatNgn(Number(entry.value))}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

type MonthlySpendingChartProps = {
  months: MonthlySpendingRow[];
  highlightMonth?: number;
  highlightMonths?: number[];
};

export function MonthlySpendingChart({
  months,
  highlightMonth,
  highlightMonths,
}: MonthlySpendingChartProps) {
  const highlighted = useMemo(() => {
    if (highlightMonths && highlightMonths.length > 0) {
      return new Set(highlightMonths);
    }
    if (highlightMonth != null) {
      return new Set([highlightMonth]);
    }
    return null;
  }, [highlightMonth, highlightMonths]);
  const normalizedMonths = useMemo(
    () =>
      months.map((row) => ({
        ...row,
        categoryAmounts: normalizeCategoryAmounts(row.categoryAmounts),
      })),
    [months],
  );

  const activeCategories = useMemo(
    () => getActiveChartCategories(normalizedMonths),
    [normalizedMonths],
  );

  const chartData = useMemo<ChartPoint[]>(
    () =>
      normalizedMonths.map((row) => ({
        month: row.month,
        label: MONTH_LABELS[row.month - 1],
        totalAmount: row.totalAmount,
        expenseCount: row.expenseCount,
        ...Object.fromEntries(
          activeCategories.map((category) => [
            category,
            row.categoryAmounts?.[category] ?? 0,
          ]),
        ),
      })),
    [activeCategories, normalizedMonths],
  );

  return (
    <div className="p-5 pt-2">
      <ResponsiveContainer width="100%" height={activeCategories.length > 0 ? 320 : 280}>
        <ComposedChart data={chartData} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            className="stroke-border/50"
          />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatNgnAxis}
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            axisLine={false}
            tickLine={false}
            width={56}
          />
          <Tooltip
            content={<MonthlyTooltip />}
            cursor={{ fill: 'var(--muted)', opacity: 0.35 }}
          />
          {activeCategories.length > 0 ? (
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) =>
                value === 'totalAmount' ? 'Total' : formatLabel(String(value))
              }
              iconType="plainline"
              wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
            />
          ) : null}
          <Bar
            dataKey="totalAmount"
            name="totalAmount"
            radius={[4, 4, 0, 0]}
            maxBarSize={36}
            legendType="none"
          >
            {chartData.map((entry) => {
              const isHighlighted = highlighted?.has(entry.month) ?? false;
              return (
                <Cell
                  key={entry.month}
                  fill={
                    isHighlighted
                      ? 'var(--primary)'
                      : entry.totalAmount > 0
                        ? '#6366f1'
                        : 'var(--muted)'
                  }
                  fillOpacity={
                    isHighlighted ? 1 : entry.totalAmount > 0 ? 0.85 : 0.45
                  }
                />
              );
            })}
          </Bar>
          {activeCategories.map((category) => (
            <Line
              key={category}
              type="monotone"
              dataKey={category}
              name={category}
              stroke={CATEGORY_CHART_COLORS[category]}
              strokeWidth={2.5}
              dot={{ r: 3, strokeWidth: 0, fill: CATEGORY_CHART_COLORS[category] }}
              activeDot={{
                r: 5,
                strokeWidth: 0,
                fill: CATEGORY_CHART_COLORS[category],
              }}
              isAnimationActive={false}
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
