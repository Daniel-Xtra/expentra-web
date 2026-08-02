import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { AppModal } from '@/shared/reusable/AppModal';
import { formatLabel } from '@/shared/utils/format';
import type { PolicyViolation } from '@/types/api';

type PolicyBlockingDialogProps = {
  open: boolean;
  violations: PolicyViolation[];
  onOpenChange: (open: boolean) => void;
};

export function PolicyBlockingDialog({
  open,
  violations,
  onOpenChange,
}: PolicyBlockingDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <AppModal
        title="Cannot submit expense"
        description="This claim does not meet company policy requirements. Fix the issues below before submitting."
        className="sm:max-w-lg"
        content={
          <div className="space-y-3">
            {violations.map((violation) => (
              <div
                key={violation.policyReference}
                className="rounded-lg border border-destructive/30 bg-destructive/5 p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">{violation.policyName}</p>
                  <span className="shrink-0 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-destructive">
                    Blocked
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatLabel(violation.ruleType)}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-foreground/90">{violation.message}</p>
              </div>
            ))}
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
