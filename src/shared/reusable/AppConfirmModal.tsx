import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { AppModal } from '@/shared/reusable/AppModal';

type AppConfirmModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
  destructive?: boolean;
};

export function AppConfirmModal({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  loading = false,
  destructive = false,
}: AppConfirmModalProps) {
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
        description={destructive ? 'This action cannot be undone.' : 'Confirm to continue.'}
        className="sm:max-w-lg"
        content={
          <div className="rounded-lg border border-border/60 bg-muted/20 p-4 text-sm text-foreground">
            {description ?? 'Please confirm to continue.'}
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
              {cancelLabel}
            </Button>
            <Button
              type="button"
              variant={destructive ? 'destructive' : 'default'}
              className="h-14 w-full rounded-sm p-5 font-sans text-sm/[19.6px] font-semibold"
              disabled={loading}
              onClick={() => void onConfirm()}
            >
              {loading ? 'Please wait…' : confirmLabel}
            </Button>
          </>
        }
      />
    </Dialog>
  );
}
