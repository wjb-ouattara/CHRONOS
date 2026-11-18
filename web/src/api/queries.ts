// Crochets de données : les écrans passent par eux, jamais directement par l'API.
// TanStack Query gère le cache, le chargement, les erreurs et les nouvelles tentatives.

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { SearchResponse, Validation } from '@/domain/types';

import { useApi } from './api-context';
import type { SearchInput, ValidationInput } from './types';

/**
 * Fabrique des clés de cache. Les centraliser évite les fautes de frappe et
 * permet d'invalider proprement (ex. toutes les données d'une recherche).
 */
export const queryKeys = {
  behaviours: ['behaviours'] as const,
  clips: ['clips'] as const,
  search: (queryId: string) => ['search', queryId] as const,
  validations: (queryId: string) => ['validations', queryId] as const,
  queries: ['queries'] as const,
  exportCsv: (queryId: string) => ['export', queryId] as const,
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
      void queryClient.invalidateQueries({ queryKey: queryKeys.queries });
    },
  });
}

/**
 * Enregistre un verdict avec une mise à jour OPTIMISTE : le cache est
 * modifié avant la réponse de l'API, le badge change donc immédiatement.
 * En cas d'échec, on restaure l'état précédent (retour en arrière).
 */
export function useSaveValidation(queryId: string | null) {
  const api = useApi();
  const queryClient = useQueryClient();
  const key = queryKeys.validations(queryId ?? '');
  const mutationKey = ['saveValidation', queryId ?? ''] as const;

  return useMutation({
    mutationKey,
    mutationFn: (input: ValidationInput) => api.saveValidation(input),

    onMutate: async (input) => {
      // 1. On annule un éventuel chargement en cours, qui écraserait notre mise à jour.
      await queryClient.cancelQueries({ queryKey: key });
      // 2. On garde une copie de l'état actuel, pour pouvoir revenir en arrière.
      const previous = queryClient.getQueryData<Validation[]>(key);
      // 3. On applique le résultat attendu : la nouvelle validation remplace l'ancienne.
      const optimistic: Validation = {
        ...input,
        validatedAt: new Date().toISOString(),
      };
      queryClient.setQueryData<Validation[]>(key, (current = []) => [
        ...current.filter((v) => v.clipId !== input.clipId),
        optimistic,
      ]);
      return { previous };
    },

    onError: (_error, _input, context) => {
      queryClient.setQueryData(key, context?.previous);
    },

    // Succès ou échec : on resynchronise avec la source de vérité (l'API)…
    // mais seulement quand c'est le DERNIER enregistrement en cours. Avec la
    // validation au clavier, plusieurs enregistrements se chevauchent : une
    // relecture trop tôt effacerait brièvement les badges des suivants.
    onSettled: () => {
      // Le CSV dépend des validations : il est à recalculer dans tous les cas.
      void queryClient.invalidateQueries({ queryKey: queryKeys.exportCsv(queryId ?? '') });
      return queryClient.isMutating({ mutationKey }) === 1
        ? queryClient.invalidateQueries({ queryKey: key })
        : undefined;
    },
  });
}

/** Reclasse une recherche à partir de ses validations (itération + 1). */
export function useRerank() {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (queryId: string) => api.rerank(queryId),
    onSuccess: (response: SearchResponse) => {
      queryClient.setQueryData(queryKeys.search(response.query.id), response);
    },
  });
}

/** Recherches passées (la plus récente d'abord). */
export function useQueryList() {
  const api = useApi();
  return useQuery({ queryKey: queryKeys.queries, queryFn: () => api.listQueries() });
}

/** Contenu du CSV d'une recherche. Invalidé à chaque nouvelle validation. */
export function useExportCsv(queryId: string | null) {
  const api = useApi();
  return useQuery({
    queryKey: queryKeys.exportCsv(queryId ?? ''),
    queryFn: () => api.exportCsv(queryId ?? ''),
    enabled: queryId !== null,
  });
}
