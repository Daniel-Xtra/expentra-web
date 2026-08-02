import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import axios from 'axios';
import type { ReactNode } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/features/auth/components/auth-provider';
import { IdleSessionGuard } from '@/features/auth/components/IdleSessionGuard';
import { PageMetadataProvider } from '@/shared/context/page-metadata-context';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (failureCount, error) => {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          return false;
        }
        return failureCount < 1;
      },
    },
  },
});

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <IdleSessionGuard />
        <PageMetadataProvider>
          {children}
          <Toaster />
        </PageMetadataProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
