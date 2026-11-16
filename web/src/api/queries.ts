// Crochets de données : les écrans passent par eux, jamais directement par l'API.
// TanStack Query gère le cache, le chargement, les erreurs et les nouvelles tentatives.

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { SearchResponse } from '@/domain/types';

import { useApi } from './api-context';
import type { SearchInput } from './types';

/**
 * Fabrique des clés de cache. Les centraliser évite les fautes de frappe et
 * permet d'invalider proprement (ex. toutes les données d'une recherche).
 */
export const queryKeys = {
  behaviours: ['behaviours'] as const,
  clips: ['clips'] as const,
  search: (queryId: string) => ['search', queryId] as const,
  validations: (queryId: string) => ['validations', queryId] as const,
};

export function useBehaviours() {
  const api = useApi();
  return useQuery({ queryKey: queryKeys.behaviours, queryFn: () => api.listBehaviours() });
}

/** Tous les clips, indexés par identifiant (les résultats ne portent que `clipId`). */
export function useClipsById() {
  const api = useApi();
  return useQuery({
    queryKey: queryKeys.clips,
    queryFn: () => api.listClips(),
    // `select` transforme la donnée en cache sans la recopier à chaque rendu.
    select: (clips) => new Map(clips.map((clip) => [clip.id, clip])),
  });
}

/** Résultats d'une recherche existante. Inactif tant qu'il n'y a pas de recherche. */
export function useSearchResults(queryId: string | null) {
  const api = useApi();
  return useQuery({
    queryKey: queryKeys.search(queryId ?? ''),
    queryFn: () => api.getSearch(queryId ?? ''),
    enabled: queryId !== null,
  });
}

export function useValidations(queryId: string | null) {
  const api = useApi();
  return useQuery({
    queryKey: queryKeys.validations(queryId ?? ''),
    queryFn: () => api.listValidations(queryId ?? ''),
    enabled: queryId !== null,
  });
}

/**
 * Lance une nouvelle recherche. En cas de succès, la réponse est placée
 * directement dans le cache : l'écran n'a pas à la recharger.
 */
export function useRunSearch() {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SearchInput) => api.search(input),
    onSuccess: (response: SearchResponse) => {
      queryClient.setQueryData(queryKeys.search(response.query.id), response);
      queryClient.setQueryData(queryKeys.validations(response.query.id), []);
    },
  });
}
