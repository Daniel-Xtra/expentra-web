import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatNgn } from '@/shared/utils/money';
import type { MonthlySpendingRow } from '@/types/api';

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

function formatNgnAxis(kobo: number) {
  const naira = kobo / 100;
  if (naira >= 1_000_000) {
    return `₦${(naira / 1_000_000).toFixed(1)}M`;
  }
  if (naira >= 1_000) {
    return `₦${(naira / 1_000).toFixed(0)}K`;
  }
  return formatNgn(kobo);
}

type ChartPoint = MonthlySpendingRow & {
  label: string;
};

type MonthlyTooltipProps = {
  active?: boolean;
  payload?: Array<{ payload?: ChartPoint }>;
};

function MonthlyTooltip({ active, payload }: MonthlyTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const point = payload[0]?.payload as ChartPoint | undefined;
  if (!point) {
    return null;
  }

  return (
    <div className="rounded-md border border-border/60 bg-popover px-3 py-2 text-sm shadow-md">
      <p className="font-medium text-foreground">{MONTH_LABELS[point.month - 1]}</p>
      <p className="tabular-nums text-muted-foreground">{formatNgn(point.totalAmount)}</p>
      <p className="text-xs text-muted-foreground">
        {point.expenseCount} {point.expenseCount === 1 ? 'expense' : 'expenses'}
      </p>
    </div>
  );
}

type MonthlySpendingChartProps = {
  months: MonthlySpendingRow[];
  highlightMonth?: number;
};

export function MonthlySpendingChart({ months, highlightMonth }: MonthlySpendingChartProps) {
  const chartData: ChartPoint[] = months.map((row) => ({
    ...row,
    label: MONTH_LABELS[row.month - 1],
  }));

  return (
    <div className="p-5 pt-2">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
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
          <Tooltip content={<MonthlyTooltip />} cursor={{ fill: 'var(--muted)', opacity: 0.35 }} />
          <Bar dataKey="totalAmount" radius={[4, 4, 0, 0]} maxBarSize={36}>
            {chartData.map((entry) => (
              <Cell
                key={entry.month}
                fill={
                  entry.month === highlightMonth
                    ? 'var(--primary)'
                    : entry.totalAmount > 0
                      ? '#6366f1'
                      : 'var(--muted)'
                }
                fillOpacity={entry.month === highlightMonth ? 1 : entry.totalAmount > 0 ? 0.85 : 0.45}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
