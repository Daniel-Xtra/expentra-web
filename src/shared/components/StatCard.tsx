import type { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type StatCardProps = {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  tone?: 'default' | 'primary' | 'success' | 'warning';
  className?: string;
};

// const toneStyles = {
//   default: 'from-muted/80 to-card',
//   primary: 'from-primary/12 to-card',
//   success: 'from-emerald-500/10 to-card',
//   warning: 'from-amber-500/10 to-card',
// };

const iconToneStyles = {
  default: 'bg-muted text-muted-foreground',
  primary: 'bg-primary/10 text-primary',
  success: 'bg-emerald-500/10 text-emerald-600',
  warning: 'bg-amber-500/10 text-amber-600',
};

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = 'default',
  className,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden border-[0.5px] border-neutral-200 rounded-[8px] bg-white",
        className,
      )}
    >
      <CardContent className="space-y-2 pt-2 px-4">
        <div className="flex items-start justify-between gap-3">
          <p className="font-normal text-[11px]/[15.4px] md:text-sm/[19.6px] text-neutral-400">
            {label}
          </p>
          {icon && (
            <div
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-md",
                iconToneStyles[tone],
              )}
            >
              {icon}
            </div>
          )}
        </div>
        <p className="font-semibold text-base/[22.4px] md:text-xl/[33.6px] text-neutral-950">
          {value}
        </p>
        {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
      </CardContent>
    </Card>
  );
}
