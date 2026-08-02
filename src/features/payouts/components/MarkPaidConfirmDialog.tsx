import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { AppModal } from '@/shared/reusable/AppModal';
import { formatNgn } from '@/shared/utils/money';

export type MarkPaidConfirmTarget =
  | {
      kind: 'single';
      reference: string;
      title: string;
      amount: number;
    }
  | {
      kind: 'bulk';
      count: number;
      amount: number;
      references: string[];
    };

type MarkPaidConfirmDialogProps = {
  target: MarkPaidConfirmTarget | null;
  loading?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
};

export function MarkPaidConfirmDialog({
  target,
  loading = false,
  onOpenChange,
  onConfirm,
}: MarkPaidConfirmDialogProps) {
  const open = target != null;
  const isBulk = target?.kind === 'bulk';
  const claimCount = target?.kind === 'bulk' ? target.count : 1;
  const totalAmount = target?.amount ?? 0;

  const title =
    isBulk && claimCount > 1
      ? `Mark ${claimCount} claims paid?`
      : 'Mark this claim paid?';

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
      <AppModal
        title={title}
        description="Expentra will update the claim status only. It does not send money or post to your bank."
        className="sm:max-w-lg"
        content={
          <div className="space-y-3 rounded-lg border border-border/60 bg-muted/20 p-4 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Claims</span>
              <span className="font-medium tabular-nums">{claimCount}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Total</span>
              <span className="font-medium tabular-nums">
                {formatNgn(totalAmount)}
              </span>
            </div>
            {target?.kind === "single" ? (
              <>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Reference</span>
                  <span className="max-w-[60%] truncate font-mono text-xs font-medium">
                    {target.reference}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Title</span>
                  <span className="max-w-[60%] truncate font-medium">
                    {target.title}
                  </span>
                </div>
              </>
            ) : null}
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
              className="h-11 font-normal text-sm px-7 bg-primary-500"
              disabled={loading}
              onClick={() => void onConfirm()}
            >
              {loading ? "Marking…" : "Mark paid"}
            </Button>
          </>
        }
      />
    </Dialog>
  );
}
