import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DialogActions } from '@/shared/components/DialogActions';
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cannot submit expense</DialogTitle>
          <DialogDescription>
            This claim does not meet company policy requirements. Fix the issues below before
            submitting.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-3">
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
        </DialogBody>
        <DialogActions
          cancelLabel="Close"
          confirmLabel="Got it"
          onCancel={() => onOpenChange(false)}
          onConfirm={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
