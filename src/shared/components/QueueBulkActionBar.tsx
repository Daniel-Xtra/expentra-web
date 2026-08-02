import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatNgn } from '@/shared/utils/money';

type QueueBulkActionBarProps = {
  selectedCount: number;
  selectedAmount: number;
  busy?: boolean;
  onClear: () => void;
  children: ReactNode;
  className?: string;
};

export function QueueBulkActionBar({
  selectedCount,
  selectedAmount,
  busy = false,
  onClear,
  children,
  className,
}: QueueBulkActionBarProps) {
  return (
    <div
      className={cn(
        'sticky bottom-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/60',
        'bg-background/95 px-4 py-3 shadow-sm backdrop-blur supports-backdrop-filter:bg-background/80',
        className,
      )}
    >
      <p className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{selectedCount}</span> selected
        <span className="mx-1.5 text-border">·</span>
        <span className="font-medium tabular-nums text-foreground">
          {formatNgn(selectedAmount)}
        </span>
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="ghost"  className="h-11 font-normal text-sm px-7 bg-transparent" disabled={busy} onClick={onClear}>
          Clear selection
        </Button>
        {children}
      </div>
    </div>
  );
}
