// Utilitaires de TEST : rendre l'application avec ses fournisseurs, une API
// sans latence et un routeur en mémoire.
import { render } from '@testing-library/react';
import { createMemoryRouter, RouterProvider, type RouteObject } from 'react-router';

import { ApiProvider } from '@/api/ApiProvider';
import { createMockApi, type MockApiOptions } from '@/api/mock-api';
import { memoryPersistence } from '@/api/persistence';
import { createQueryClient } from '@/api/query-client';
import type { ChronosApi } from '@/api/types';
import { routes } from '@/app/router';
import { ThemeProvider } from '@/app/theme/ThemeProvider';

/** API fictive de test : aucune latence, horloge et identifiants prévisibles. */
export function createTestApi(options: MockApiOptions = {}): ChronosApi {
  let tick = 0;
  let id = 0;
  return createMockApi({
    latencyMs: [0, 0],
    now: () => new Date(Date.UTC(2026, 10, 16, 10, 0, tick++)),
    newId: () => `q${String(++id)}`,
    persistence: memoryPersistence(),
    ...options,
  });
}

interface RenderAppOptions {
  path?: string;
  api?: ChronosApi;
  routeList?: RouteObject[];
}

export function renderApp({
  path = '/',
  api = createTestApi(),
  routeList = routes,
}: RenderAppOptions = {}) {
  const router = createMemoryRouter(routeList, { initialEntries: [path] });
  const queryClient = createQueryClient();
  // Pas d'attente entre deux tentatives dans les tests.
  queryClient.setDefaultOptions({
    ...queryClient.getDefaultOptions(),
    queries: { ...queryClient.getDefaultOptions().queries, retryDelay: 0 },
  });
  const view = render(
    <ThemeProvider>
      <ApiProvider api={api} queryClient={queryClient}>
        <RouterProvider router={router} />
      </ApiProvider>
    </ThemeProvider>,
  );
  return { ...view, router, api, queryClient };
}
