import { cn } from '@/lib/utils';

type ApprovalLevelChainStepCellProps = {
  step: number;
  isFirst: boolean;
  isLast: boolean;
  showConnector: boolean;
  isActive: boolean;
};

export function ApprovalLevelChainStepCell({
  step,
  isFirst,
  isLast,
  showConnector,
  isActive,
}: ApprovalLevelChainStepCellProps) {
  return (
    <div className="relative flex w-12 justify-center py-1">
      {!isFirst ? (
        <span
          aria-hidden
          className={cn(
            'absolute top-0 left-1/2 h-1/2 w-px -translate-x-1/2',
            showConnector || !isActive ? 'bg-border' : 'bg-border/40',
          )}
        />
      ) : null}

      <div
        className={cn(
          'relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold tabular-nums shadow-sm',
          isActive
            ? 'border-primary/20 bg-primary text-primary-foreground'
            : 'border-border bg-background text-muted-foreground',
        )}
      >
        {step}
      </div>

      {!isLast ? (
        <span
          aria-hidden
          className={cn(
            'absolute bottom-0 left-1/2 h-1/2 w-px -translate-x-1/2',
            showConnector ? 'bg-primary/25' : 'bg-border/40',
          )}
        />
      ) : null}
    </div>
  );
}
