import { QueryClient } from '@tanstack/react-query';

import { ApiError } from './errors';

/**
 * Cache des données serveur (TanStack Query).
 *  - Une seule nouvelle tentative, et seulement pour une panne passagère :
 *    réessayer « introuvable » ou « requête invalide » ne servirait à rien.
 *  - Pas de rechargement au retour sur l'onglet : inutile avec des données fictives.
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: (failureCount, error) =>
          failureCount < 1 && !(error instanceof ApiError && error.code !== 'unavailable'),
        refetchOnWindowFocus: false,
        staleTime: 60_000,
      },
    },
  });
}
