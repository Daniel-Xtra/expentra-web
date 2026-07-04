import { cn } from '@/lib/utils';

type StatusPillProps = {
  active: boolean;
  className?: string;
};

export function StatusPill({ active, className }: StatusPillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        active ? 'bg-emerald-50 text-emerald-700' : 'bg-muted text-muted-foreground',
        className,
      )}
    >
      <span
        className={cn(
          'size-1.5 shrink-0 rounded-full',
          active ? 'bg-emerald-500' : 'bg-muted-foreground',
        )}
      />
      {active ? 'Active' : 'Inactive'}
    </span>
  );
}
