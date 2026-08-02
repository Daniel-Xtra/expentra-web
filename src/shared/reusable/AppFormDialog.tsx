import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { AppModal } from '@/shared/reusable/AppModal';

export type AppFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: ReactNode;
  submitLabel: string;
  loading?: boolean;
  /** Disables Cancel and Submit in addition to `loading`. */
  actionsDisabled?: boolean;
  /** Disables Submit in addition to `loading` / `actionsDisabled`. */
  submitDisabled?: boolean;
  cancelLabel?: string;
  loadingLabel?: string;
  className?: string;
  onSubmit: () => void | Promise<void>;
  children: ReactNode;
};

export function AppFormDialog({
  open,
  onOpenChange,
  title,
  description,
  submitLabel,
  loading = false,
  actionsDisabled = false,
  submitDisabled = false,
  cancelLabel = 'Cancel',
  loadingLabel = 'Saving…',
  className = 'sm:max-w-lg',
  onSubmit,
  children,
}: AppFormDialogProps) {
  const cancelLocked = loading || actionsDisabled;
  const submitLocked = cancelLocked || submitDisabled;

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
        description={description}
        className={className}
        primaryFn={() => {}}
        content={children}
        actions={
          <>
            <Button
              type="button"
              variant="ghost"
              className="h-14 w-full rounded-sm p-5 font-sans text-sm/[19.6px] font-semibold text-neutral-950 hover:bg-transparent"
              disabled={cancelLocked}
              onClick={() => onOpenChange(false)}
            >
              {cancelLabel}
            </Button>
            <Button
              type="button"
              className="h-14 w-full rounded-sm p-5 font-sans text-sm/[19.6px] font-semibold"
              disabled={submitLocked}
              onClick={() => void onSubmit()}
            >
              {loading ? loadingLabel : submitLabel}
            </Button>
          </>
        }
      />
    </Dialog>
  );
}
