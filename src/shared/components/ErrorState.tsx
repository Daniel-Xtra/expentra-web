import { WarningCircleIcon } from '@phosphor-icons/react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/shared/components/EmptyState';
import { cn } from '@/lib/utils';

function isUnavailableMessage(message: string): boolean {
  const normalized = message.trim().toLowerCase();
  return (
    /^request failed with status code 5\d\d$/i.test(message.trim()) ||
    normalized === 'network error' ||
    normalized === 'err_network' ||
    normalized === 'failed to fetch' ||
    /^timeout of \d+ms exceeded$/i.test(message.trim()) ||
    normalized.includes('unable to reach the server') ||
    normalized.includes('server is temporarily unavailable') ||
    normalized.includes('service is temporarily unavailable') ||
    normalized.includes('server took too long to respond')
  );
}

export function ErrorState({
  message,
  className,
  onRetry,
  retrying = false,
}: {
  message: string;
  className?: string;
  onRetry?: () => void;
  retrying?: boolean;
}) {
  if (isUnavailableMessage(message)) {
    return (
      <EmptyState
        title="No data to show"
        description="We could not reach the server. Try again when the connection is available."
        className={className}
        action={
          onRetry ? (
            <Button variant="outline" disabled={retrying} onClick={onRetry}>
              {retrying ? 'Retrying...' : 'Retry'}
            </Button>
          ) : undefined
        }
      />
    );
  }

  return (
    <Alert variant="destructive" className={cn('max-w-xl', className)}>
      <WarningCircleIcon />
      <AlertTitle>Something went wrong</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
