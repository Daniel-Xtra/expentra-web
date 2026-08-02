import { cn } from '@/lib/utils';
import { formatNgn } from '@/shared/utils/money';
import type { ChartSegment } from '@/features/reports/chart-colors';

function polarToCartesian(cx: number, cy: number, radius: number, angleDegrees: number) {
  const radians = ((angleDegrees - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(radians),
    y: cy + radius * Math.sin(radians),
  };
}

function describeDonutSlice(
  cx: number,
  cy: number,
  innerRadius: number,
  outerRadius: number,
  startAngle: number,
  endAngle: number,
) {
  const startOuter = polarToCartesian(cx, cy, outerRadius, startAngle);
  const endOuter = polarToCartesian(cx, cy, outerRadius, endAngle);
  const startInner = polarToCartesian(cx, cy, innerRadius, endAngle);
  const endInner = polarToCartesian(cx, cy, innerRadius, startAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;

  return [
    `M ${startOuter.x} ${startOuter.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${endOuter.x} ${endOuter.y}`,
    `L ${startInner.x} ${startInner.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${endInner.x} ${endInner.y}`,
    'Z',
  ].join(' ');
}

type DonutChartProps = {
  segments: ChartSegment[];
  centerLabel?: string;
  centerValue?: string;
  className?: string;
  size?: number;
};

export function DonutChart({
  segments,
  centerLabel,
  centerValue,
  className,
  size = 208,
}: DonutChartProps) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  if (total <= 0) {
    return null;
  }

  const cx = size / 2;
  const cy = size / 2;
  const outerRadius = size / 2 - 6;
  const innerRadius = outerRadius * 0.62;

  let angle = 0;
  const slices = segments.map((segment) => {
    const sweep = (segment.value / total) * 360;
    const path =
      sweep >= 359.99
        ? describeDonutSlice(cx, cy, innerRadius, outerRadius, 0, 359.99)
        : describeDonutSlice(cx, cy, innerRadius, outerRadius, angle, angle + sweep);
    angle += sweep;
    return { ...segment, path };
  });

  return (
    <div className={cn('flex flex-col gap-5 p-5 lg:flex-row lg:items-center', className)}>
      <div className="relative mx-auto shrink-0">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-hidden>
          {slices.map((slice) => (
            <path key={slice.key} d={slice.path} fill={slice.color} />
          ))}
        </svg>
        {(centerLabel || centerValue) && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            {centerValue && (
              <p className="text-sm font-semibold tracking-tight text-foreground">{centerValue}</p>
            )}
            {centerLabel && (
              <p className="text-[11px] text-muted-foreground">{centerLabel}</p>
            )}
          </div>
        )}
      </div>

      <ul className="min-w-0 flex-1 space-y-2.5">
        {slices.map((slice) => (
          <li key={slice.key} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-2">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: slice.color }}
              />
              <span className="min-w-0">
                <span className="block truncate">{slice.label}</span>
                {slice.detail ? (
                  <span className="block truncate text-[11px] text-muted-foreground">
                    {slice.detail}
                  </span>
                ) : null}
              </span>
            </span>
            <span className="shrink-0 text-right tabular-nums text-muted-foreground">
              <span className="block text-foreground">{formatNgn(slice.value)}</span>
              <span className="text-[11px]">{Math.round((slice.value / total) * 100)}%</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
