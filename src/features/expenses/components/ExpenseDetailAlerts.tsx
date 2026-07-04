import { WarningCircleIcon } from '@phosphor-icons/react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import type { ExpenseResponse } from '@/types/api';

type ExpenseDetailAlertsProps = {
  expense: ExpenseResponse;
  onReopen?: () => void;
  reopenPending?: boolean;
};

export function ExpenseDetailAlerts({
  expense,
  onReopen,
  reopenPending = false,
}: ExpenseDetailAlertsProps) {
  if (expense.status !== 'REJECTED') {
    return null;
  }

  return (
    <Alert variant="destructive" className="border-destructive/30 bg-destructive/5">
      <WarningCircleIcon />
      <AlertTitle>Expense rejected</AlertTitle>
      <AlertDescription className="space-y-3">
        <p>
          {expense.rejectionReason ??
            'This expense was rejected. Reopen it as a draft to edit and resubmit.'}
        </p>
        {onReopen ? (
          <Button
            size="sm"
            variant="outline"
            className="border-destructive/30 bg-background"
            onClick={onReopen}
            disabled={reopenPending}
          >
            {reopenPending ? 'Reopening…' : 'Reopen and edit'}
          </Button>
        ) : null}
      </AlertDescription>
    </Alert>
  );
}
