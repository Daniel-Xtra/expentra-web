import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import type { BudgetSubmitCheckResult } from '@/features/expenses/types';
import { AppModal } from '@/shared/reusable/AppModal';
import { formatNgn } from '@/shared/utils/money';

type BudgetOverspendDialogProps = {
  open: boolean;
  budget: BudgetSubmitCheckResult | null;
  loading?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
};

export function BudgetOverspendDialog({
  open,
  budget,
  loading = false,
  onOpenChange,
  onConfirm,
}: BudgetOverspendDialogProps) {
  if (!budget?.summary) {
    return null;
  }

  const { summary } = budget;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <AppModal
        title="Department budget exceeded"
        description="Submitting this expense will put your department over its annual budget. You can still proceed, but finance will be notified."
        className="sm:max-w-lg"
        content={
          <div className="space-y-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Annual limit</span>
              <span className="font-medium">{formatNgn(summary.amountLimit)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Projected committed</span>
              <span className="font-medium text-amber-800">
                {formatNgn(budget.projectedCommittedAmount)}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Department</span>
              <span className="font-medium">{summary.department?.name ?? '—'}</span>
            </div>
          </div>
        }
        actions={
          <>
            <Button
              type="button"
              variant="ghost"
              className="h-14 w-full rounded-sm p-5 font-sans text-sm/[19.6px] font-semibold text-neutral-950 hover:bg-transparent"
              disabled={loading}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="h-14 w-full rounded-sm p-5 font-sans text-sm/[19.6px] font-semibold"
              disabled={loading}
              onClick={() => void onConfirm()}
            >
              {loading ? 'Please wait…' : 'Proceed anyway'}
            </Button>
          </>
        }
      />
    </Dialog>
  );
}
