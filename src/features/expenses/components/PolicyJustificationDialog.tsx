import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { DialogActions } from '@/shared/components/DialogActions';
import { FormField } from '@/shared/components/FormField';
import { formatLabel } from '@/shared/utils/format';
import type { PolicyViolation } from '@/types/api';

type PolicyJustificationDialogProps = {
  open: boolean;
  violations: PolicyViolation[];
  loading?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (justifications: Record<string, string>) => void | Promise<void>;
};

export function PolicyJustificationDialog({
  open,
  violations,
  loading = false,
  onOpenChange,
  onConfirm,
}: PolicyJustificationDialogProps) {
  const [justifications, setJustifications] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setJustifications({});
      setErrors({});
    }
  }, [open, violations]);

  const handleConfirm = async () => {
    const nextErrors: Record<string, string> = {};
    for (const violation of violations) {
      if (!justifications[violation.policyReference]?.trim()) {
        nextErrors[violation.policyReference] = 'Justification is required';
      }
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    await onConfirm(
      Object.fromEntries(
        violations.map((violation) => [
          violation.policyReference,
          justifications[violation.policyReference].trim(),
        ]),
      ),
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Policy justification required</DialogTitle>
          <DialogDescription>
            This expense triggers company policy warnings. Explain why it should still be
            submitted.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-4">
          {violations.map((violation) => (
            <div
              key={violation.policyReference}
              className="space-y-2 rounded-lg border border-border/60 bg-muted/20 p-3"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">{violation.policyName}</p>
                  <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800">
                    Warning
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatLabel(violation.ruleType)}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-foreground/90">{violation.message}</p>
              </div>
              <FormField
                label="Justification"
                htmlFor={`policy-justification-${violation.policyReference}`}
                error={errors[violation.policyReference]}
              >
                <Textarea
                  id={`policy-justification-${violation.policyReference}`}
                  rows={3}
                  value={justifications[violation.policyReference] ?? ''}
                  aria-invalid={errors[violation.policyReference] ? true : undefined}
                  onChange={(event) => {
                    const value = event.target.value;
                    setJustifications((current) => ({
                      ...current,
                      [violation.policyReference]: value,
                    }));
                    if (errors[violation.policyReference] && value.trim()) {
                      setErrors((current) => {
                        const next = { ...current };
                        delete next[violation.policyReference];
                        return next;
                      });
                    }
                  }}
                />
              </FormField>
            </div>
          ))}
        </DialogBody>
        <DialogActions
          confirmLabel="Submit with justification"
          loading={loading}
          onCancel={() => onOpenChange(false)}
          onConfirm={() => void handleConfirm()}
        />
      </DialogContent>
    </Dialog>
  );
}
