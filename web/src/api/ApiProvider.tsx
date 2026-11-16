import { QueryClientProvider, type QueryClient } from '@tanstack/react-query';
import type { ReactNode } from 'react';

import { ApiContext } from './api-context';
import type { ChronosApi } from './types';

interface ApiProviderProps {
  api: ChronosApi;
  queryClient: QueryClient;
  children: ReactNode;
}

/** Fournit l'API et le cache TanStack Query à toute l'application. */
export function ApiProvider({ api, queryClient, children }: ApiProviderProps) {
  return (
    <ApiContext value={api}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ApiContext>
  );
}
