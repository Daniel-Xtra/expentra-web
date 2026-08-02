import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatNgn } from '@/shared/utils/money';
import { formatRelativeTime } from '@/shared/utils/format';
import { cn } from '@/lib/utils';

export type PayoutLiabilityMetrics = {
  currency: string;
  count: number;
  totalAmount: number;
  oldestApprovedAt?: string | null;
};

type PayoutLiabilitySummaryProps = {
  metrics: PayoutLiabilityMetrics;
  showOpenPayouts?: boolean;
  className?: string;
};

function liabilityLine(metrics: PayoutLiabilityMetrics) {
  const oldestLabel = metrics.oldestApprovedAt
    ? formatRelativeTime(metrics.oldestApprovedAt)
    : null;

  if (metrics.count <= 0) {
    return 'No approved claims waiting to be paid';
  }

  return (
    <>
      {metrics.count} claims · {formatNgn(metrics.totalAmount)} waiting to be paid
      {oldestLabel ? ` · Oldest ${oldestLabel}` : ''}
    </>
  );
}

/** Reports unpaid handoff callout. Hidden when there is no liability. */
export function PayoutLiabilitySummary({
  metrics,
  showOpenPayouts = false,
  className,
}: PayoutLiabilitySummaryProps) {
  if (metrics.count <= 0) {
    return null;
  }

  return (
    <Card
      className={cn('border-border/60', className)}
      aria-label="Unpaid approved liability"
    >
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <p className="text-sm font-medium text-foreground">Unpaid approved</p>
            <p className="text-sm text-muted-foreground">{liabilityLine(metrics)}</p>
            <p className="text-xs text-muted-foreground">
              Current unpaid total — open Payouts to export and mark paid.
            </p>
          </div>
          {showOpenPayouts ? (
            <Button variant="outline" size="sm" asChild>
              <Link to="/payouts">Open Payouts</Link>
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
