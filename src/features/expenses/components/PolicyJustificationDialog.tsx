import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { AppModal } from '@/shared/reusable/AppModal';
import AppFormLabel from '@/shared/reusable/AppFormLabel';
import { formatLabel } from '@/shared/utils/format';
import type { PolicyViolation } from '@/types/api';

type PolicyJustificationDialogProps = {
  open: boolean;
  violations: PolicyViolation[];
  loading?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (justifications: Record<string, string>) => void | Promise<void>;
};

function PolicyJustificationForm({
  violations,
  loading,
  onOpenChange,
  onConfirm,
}: Omit<PolicyJustificationDialogProps, 'open'>) {
  const [justifications, setJustifications] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    <AppModal
      title="Policy justification required"
      description="This expense triggers company policy warnings. Explain why it should still be submitted."
      className="sm:max-w-lg"
      content={
        <div className="space-y-4">
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
              <div className="space-y-1.5">
                <AppFormLabel htmlFor={`policy-justification-${violation.policyReference}`}>
                  Justification
                </AppFormLabel>
                <Textarea
                  id={`policy-justification-${violation.policyReference}`}
                  rows={3}
                  value={justifications[violation.policyReference] ?? ''}
                  disabled={loading}
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
                {errors[violation.policyReference] ? (
                  <p className="text-xs text-destructive">{errors[violation.policyReference]}</p>
                ) : null}
              </div>
            </div>
          ))}
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
            onClick={() => void handleConfirm()}
          >
            {loading ? 'Please wait…' : 'Submit with justification'}
          </Button>
        </>
      }
    />
  );
}

export function PolicyJustificationDialog({
  open,
  violations,
  loading = false,
  onOpenChange,
  onConfirm,
}: PolicyJustificationDialogProps) {
  const formKey = violations.map((violation) => violation.policyReference).join('|');

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && loading) {
          return;
        }
        onOpenChange(next);
      }}
    >
      {open ? (
        <PolicyJustificationForm
          key={formKey}
          violations={violations}
          loading={loading}
          onOpenChange={onOpenChange}
          onConfirm={onConfirm}
        />
      ) : null}
    </Dialog>
  );
}
