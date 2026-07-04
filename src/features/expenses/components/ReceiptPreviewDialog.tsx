import { DownloadSimpleIcon } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { LoadingState } from '@/shared/components/LoadingState';

function isImageType(mimeType: string, fileName: string): boolean {
  if (mimeType.startsWith('image/')) {
    return true;
  }
  return /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(fileName);
}

function isPdfType(mimeType: string, fileName: string): boolean {
  if (mimeType === 'application/pdf') {
    return true;
  }
  return fileName.toLowerCase().endsWith('.pdf');
}

type ReceiptPreviewDialogProps = {
  open: boolean;
  fileName: string;
  mimeType: string;
  previewUrl: string | null;
  loading?: boolean;
  downloading?: boolean;
  onOpenChange: (open: boolean) => void;
  onDownload: () => void;
};

export function ReceiptPreviewDialog({
  open,
  fileName,
  mimeType,
  previewUrl,
  loading = false,
  downloading = false,
  onOpenChange,
  onDownload,
}: ReceiptPreviewDialogProps) {
  const canPreviewImage = previewUrl && isImageType(mimeType, fileName);
  const canPreviewPdf = previewUrl && isPdfType(mimeType, fileName);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-4xl flex-col gap-0 p-0 sm:max-w-4xl">
        <DialogHeader className="border-b border-border/50 px-6 py-4">
          <DialogTitle className="truncate pr-8">{fileName}</DialogTitle>
          <DialogDescription>Receipt preview</DialogDescription>
        </DialogHeader>

        <DialogBody className="min-h-[50vh] flex-1 overflow-hidden p-0">
          {loading ? (
            <LoadingState layout="auth" message="Loading preview…" />
          ) : canPreviewImage ? (
            <div className="flex h-full min-h-[50vh] items-center justify-center bg-muted/20 p-4">
              <img
                src={previewUrl}
                alt={fileName}
                className="max-h-[70vh] max-w-full object-contain"
              />
            </div>
          ) : canPreviewPdf ? (
            <iframe
              src={previewUrl}
              title={fileName}
              className="h-[70vh] w-full border-0 bg-muted/10"
            />
          ) : (
            <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 px-6 text-center">
              <p className="text-sm text-muted-foreground">
                Preview is not available for this file type.
              </p>
              <Button variant="outline" disabled={downloading} onClick={onDownload}>
                <DownloadSimpleIcon className="size-4" />
                {downloading ? 'Downloading…' : 'Download file'}
              </Button>
            </div>
          )}
        </DialogBody>

        {!loading && previewUrl && (canPreviewImage || canPreviewPdf) && (
          <div className="flex justify-end border-t border-border/50 px-6 py-3">
            <Button variant="outline" size="sm" disabled={downloading} onClick={onDownload}>
              <DownloadSimpleIcon className="size-4" />
              {downloading ? 'Downloading…' : 'Download'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
