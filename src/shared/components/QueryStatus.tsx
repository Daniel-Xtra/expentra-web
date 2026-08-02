import type { ReactNode } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { getApiErrorMessage } from '@/shared/api/client';
import { ErrorState } from '@/shared/components/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState';

type QueryStatusProps<TData, TError = Error> = {
  query: UseQueryResult<TData, TError>;
  loadingMessage: string;
  loadingLayout?: 'page' | 'dashboard' | 'detail' | 'auth';
  /** Override the default ErrorState when the initial fetch fails. */
  renderError?: (
    error: TError,
    ctx: { refetch: () => void; isFetching: boolean },
  ) => ReactNode;
  children: ReactNode;
};

/** Renders loading / error for the initial fetch; otherwise renders children. */
export function QueryStatus<TData, TError = Error>({
  query,
  loadingMessage,
  loadingLayout = 'page',
  renderError,
  children,
}: QueryStatusProps<TData, TError>) {
  if (query.isLoading && !query.data) {
    return <LoadingState message={loadingMessage} layout={loadingLayout} />;
  }

  if (query.isError) {
    if (renderError) {
      return renderError(query.error, {
        refetch: () => {
          void query.refetch();
        },
        isFetching: query.isFetching,
      });
    }

    return (
      <ErrorState
        message={getApiErrorMessage(query.error)}
        onRetry={() => void query.refetch()}
        retrying={query.isFetching}
      />
    );
  }

  return children;
}
