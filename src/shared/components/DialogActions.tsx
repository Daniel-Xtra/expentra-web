import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';

type DialogActionsProps = {
  cancelLabel?: string;
  confirmLabel?: string;
  onCancel?: () => void;
  onConfirm?: () => void;
  loading?: boolean;
  confirmDisabled?: boolean;
  confirmType?: 'button' | 'submit';
  destructive?: boolean;
  children?: ReactNode;
};

export function DialogActions({
  cancelLabel = 'Cancel',
  confirmLabel = 'Save',
  onCancel,
  onConfirm,
  loading = false,
  confirmDisabled = false,
  confirmType = 'button',
  destructive = false,
  children,
}: DialogActionsProps) {
  return (
    <DialogFooter>
      {children ?? (
        <>
          <Button
            type="button"
            variant="ghost"
            className="font-semibold"
            disabled={loading}
            onClick={onCancel}
          >
            {cancelLabel}
          </Button>
          <Button
            type={confirmType}
            variant={destructive ? 'destructive' : 'default'}
            disabled={loading || confirmDisabled}
            onClick={confirmType === 'button' ? onConfirm : undefined}
          >
            {loading ? 'Please wait…' : confirmLabel}
          </Button>
        </>
      )}
    </DialogFooter>
  );
}
