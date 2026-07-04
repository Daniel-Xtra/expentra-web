import { Suspense, type ComponentType, type LazyExoticComponent } from 'react';
import { LoadingState } from '@/shared/components/LoadingState';

export function withLazyPage(
  Component: LazyExoticComponent<ComponentType>,
  message = 'Loading…',
) {
  return function LazyPage() {
    return (
      <Suspense fallback={<LoadingState message={message} />}>
        <Component />
      </Suspense>
    );
  };
}
