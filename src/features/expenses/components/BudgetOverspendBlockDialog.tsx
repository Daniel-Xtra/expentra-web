import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import type { BudgetSubmitCheckResult } from '@/features/expenses/types';
import { AppModal } from '@/shared/reusable/AppModal';
import { formatNgn } from '@/shared/utils/money';

type BudgetOverspendBlockDialogProps = {
  open: boolean;
  budget: BudgetSubmitCheckResult | null;
  onOpenChange: (open: boolean) => void;
};

export function BudgetOverspendBlockDialog({
  open,
  budget,
  onOpenChange,
}: BudgetOverspendBlockDialogProps) {
  if (!budget?.summary) {
    return null;
  }

  const { summary } = budget;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <AppModal
        title="Cannot submit expense"
        description="This claim would exceed your department annual budget. Reduce the amount or contact finance before submitting."
        className="sm:max-w-lg"
        content={
          <div className="space-y-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Annual limit</span>
              <span className="font-medium">{formatNgn(summary.amountLimit)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Projected committed</span>
              <span className="font-medium text-destructive">
                {formatNgn(budget.projectedCommittedAmount)}
              </span>
            </div>
          </div>
        }
        actions={
          <Button
            type="button"
            className="h-14 w-full rounded-sm p-5 font-sans text-sm/[19.6px] font-semibold"
            onClick={() => onOpenChange(false)}
          >
            Got it
          </Button>
        }
      />
    </Dialog>
  );
}
