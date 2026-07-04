import { useEffect, useRef, useState } from 'react';
import {
  DownloadSimpleIcon,
  EyeIcon,
  FileIcon,
  FilePdfIcon,
  PaperclipIcon,
  UploadSimpleIcon,
  XIcon,
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { toastError } from '@/shared/lib/toast';
import type { ReceiptResponse } from '@/types/api';
import { downloadReceipt, fetchReceiptBlob } from '../api';
import { ReceiptPreviewDialog } from './ReceiptPreviewDialog';

type ReceiptAction = 'view' | 'download';

type ExpenseReceiptsPanelProps = {
  expenseReference: string;
  receipts: ReceiptResponse[];
  canUpload: boolean;
  canRemove?: boolean;
  isUploading: boolean;
  onUpload: (file: File) => void | Promise<void>;
  onRemove: (receiptReference: string) => void | Promise<void>;
  className?: string;
};

function ReceiptChip({
  receipt,
  canRemove,
  busyAction,
  onView,
  onDownload,
  onRemove,
}: {
  receipt: ReceiptResponse;
  canRemove: boolean;
  busyAction: ReceiptAction | null;
  onView: () => void;
  onDownload: () => void;
  onRemove: () => void;
}) {
  const isPdf = receipt.fileName.toLowerCase().endsWith('.pdf');
  const Icon = isPdf ? FilePdfIcon : FileIcon;

  return (
    <div className="inline-flex max-w-full items-center gap-2 rounded-lg border border-border/60 bg-muted/25 py-1.5 pr-1.5 pl-2.5">
      <Icon className="size-4 shrink-0 text-muted-foreground" weight="duotone" />
      <span
        className="min-w-0 truncate text-sm font-medium text-foreground"
        title={receipt.fileName}
      >
        {receipt.fileName}
      </span>
      <span className="shrink-0 text-[11px] text-muted-foreground">
        {(receipt.sizeBytes / 1024).toFixed(0)} KB
      </span>
      <div className="flex shrink-0 items-center gap-0.5">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="size-7 text-muted-foreground"
          aria-label={`View ${receipt.fileName}`}
          disabled={busyAction !== null}
          onClick={onView}
        >
          <EyeIcon className="size-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="size-7 text-muted-foreground"
          aria-label={`Download ${receipt.fileName}`}
          disabled={busyAction !== null}
          onClick={onDownload}
        >
          <DownloadSimpleIcon className="size-3.5" />
        </Button>
        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="size-7 text-muted-foreground hover:text-destructive"
            aria-label={`Remove ${receipt.fileName}`}
            disabled={busyAction !== null}
            onClick={onRemove}
          >
            <XIcon className="size-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}

export function ExpenseReceiptsPanel({
  expenseReference,
  receipts,
  canUpload,
  canRemove = canUpload,
  isUploading,
  onUpload,
  onRemove,
  className,
}: ExpenseReceiptsPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [busyReceipt, setBusyReceipt] = useState<{
    reference: string;
    action: ReceiptAction;
  } | null>(null);
  const [previewReceipt, setPreviewReceipt] = useState<ReceiptResponse | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const clearPreview = () => {
    setPreviewReceipt(null);
    setPreviewUrl((current) => {
      if (current) {
        URL.revokeObjectURL(current);
      }
      return null;
    });
    setPreviewLoading(false);
  };

  const openPreview = async (receipt: ReceiptResponse) => {
    setPreviewReceipt(receipt);
    setPreviewLoading(true);
    setPreviewUrl((current) => {
      if (current) {
        URL.revokeObjectURL(current);
      }
      return null;
    });

    try {
      const blob = await fetchReceiptBlob(expenseReference, receipt.reference);
      setPreviewUrl(URL.createObjectURL(blob));
    } catch (err) {
      clearPreview();
      toastError(err, 'Failed to load receipt preview');
    } finally {
      setPreviewLoading(false);
    }
  };

  const runDownload = async (receipt: ReceiptResponse) => {
    setBusyReceipt({ reference: receipt.reference, action: 'download' });
    try {
      await downloadReceipt(expenseReference, receipt.reference, receipt.fileName);
    } catch (err) {
      toastError(err, 'Failed to download receipt');
    } finally {
      setBusyReceipt(null);
    }
  };

  return (
    <>
      <Card className={cn('overflow-hidden border-border/60', className)}>
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <PaperclipIcon className="size-4 shrink-0 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">Receipts</span>
            <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              {receipts.length}
            </span>
          </div>

          {canUpload && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                hidden
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    void onUpload(file);
                  }
                  event.target.value = '';
                }}
              />
              <Button
                variant="outline"
                size="sm"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
              >
                <UploadSimpleIcon className="size-4" />
                {isUploading ? 'Uploading…' : 'Upload'}
              </Button>
            </>
          )}
        </div>

        {receipts.length > 0 ? (
          <div className="flex flex-wrap gap-2 border-t border-border/50 px-4 py-3">
            {receipts.map((receipt) => (
              <ReceiptChip
                key={receipt.reference}
                receipt={receipt}
                canRemove={canRemove}
                busyAction={
                  busyReceipt?.reference === receipt.reference ? busyReceipt.action : null
                }
                onView={() => void openPreview(receipt)}
                onDownload={() => void runDownload(receipt)}
                onRemove={() => void onRemove(receipt.reference)}
              />
            ))}
          </div>
        ) : (
          <p className="border-t border-border/50 px-4 py-2.5 text-sm text-muted-foreground">
            No receipts attached.
            {canUpload && (
              <>
                {' '}
                <button
                  type="button"
                  className="font-medium text-primary hover:underline"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Upload one
                </button>
              </>
            )}
          </p>
        )}
      </Card>

      <ReceiptPreviewDialog
        open={Boolean(previewReceipt)}
        fileName={previewReceipt?.fileName ?? ''}
        mimeType={previewReceipt?.mimeType ?? ''}
        previewUrl={previewUrl}
        loading={previewLoading}
        downloading={busyReceipt?.action === 'download'}
        onOpenChange={(open) => !open && clearPreview()}
        onDownload={() => previewReceipt && void runDownload(previewReceipt)}
      />
    </>
  );
}
