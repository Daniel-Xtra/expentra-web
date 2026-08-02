import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function PolicySeverityBadge({
  severity,
  className,
}: {
  severity: string;
  className?: string;
}) {
  const isBlock = severity === 'BLOCK';

  return (
    <Badge
      variant="outline"
      className={cn(
        'font-medium',
        isBlock
          ? 'border-destructive/40 bg-destructive/10 text-destructive'
          : 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400',
        className,
      )}
    >
      {isBlock ? 'Block' : 'Warning'}
    </Badge>
  );
}
