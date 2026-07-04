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

const toneStyles = {
  default: 'from-muted/80 to-card',
  primary: 'from-primary/12 to-card',
  success: 'from-emerald-500/10 to-card',
  warning: 'from-amber-500/10 to-card',
};

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
        'relative overflow-hidden border-border/60 bg-gradient-to-br',
        toneStyles[tone],
        className,
      )}
    >
      <CardContent className="space-y-2 pt-4">
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          {icon && (
            <div
              className={cn(
                'flex size-7 shrink-0 items-center justify-center rounded-md',
                iconToneStyles[tone],
              )}
            >
              {icon}
            </div>
          )}
        </div>
        <p className="text-xl font-semibold tracking-tight text-foreground">{value}</p>
        {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
      </CardContent>
    </Card>
  );
}
