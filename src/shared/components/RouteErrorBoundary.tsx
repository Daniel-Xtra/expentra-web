import { isRouteErrorResponse, useNavigate, useRouteError } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/shared/components/PageHeader';
import { PageShell } from '@/shared/components/PageShell';
import { getApiErrorMessage } from '@/shared/api/client';

function resolveErrorMessage(error: unknown): string {
  if (isRouteErrorResponse(error)) {
    const dataMessage =
      typeof error.data === 'string'
        ? error.data
        : error.data &&
            typeof error.data === 'object' &&
            'message' in error.data &&
            typeof error.data.message === 'string'
          ? error.data.message
          : null;
    return dataMessage || error.statusText || `Request failed (${error.status})`;
  }

  return getApiErrorMessage(error, 'Something went wrong while loading this page.');
}

export function RouteErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();
  const message = resolveErrorMessage(error);

  return (
    <PageShell className="gap-6 py-8">
      <PageHeader
        title="Something went wrong"
        description="This page hit an unexpected error. You can retry or go back home."
      />
      <p className="max-w-xl text-sm text-muted-foreground">{message}</p>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={() => navigate(0)}>
          Try again
        </Button>
        <Button type="button" onClick={() => navigate('/', { replace: true })}>
          Go home
        </Button>
      </div>
    </PageShell>
  );
}
