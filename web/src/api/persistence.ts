// Sauvegarde de l'état de l'API fictive (requêtes + validations).
// Une interface, deux implémentations : le navigateur (localStorage, via
// le module storage) et la mémoire (pour les tests).

import type { SearchQuery, Validation, Verdict } from '@/domain/types';
import { readJson, storageKeys, writeJson } from '@/lib/storage';

export interface StoredQuery {
  query: SearchQuery;
  iteration: number;
  /**
   * Validations utilisées lors du DERNIER reclassement. On les fige pour que
   * getSearch() redonne exactement les mêmes résultats après un rechargement,
   * même si l'utilisateur a validé d'autres clips depuis.
   */
  feedback: { clipId: string; verdict: Verdict }[];
}

export interface MockApiState {
  version: 1;
  queries: StoredQuery[];
  validations: Validation[];
}

export interface Persistence {
  load(): MockApiState | null;
  save(state: MockApiState): void;
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;
const isVerdict = (v: unknown): v is Verdict => v === 'yes' || v === 'no' || v === 'unsure';

/** Garde de type : vérifie la forme des données relues (voir readJson). */
export function isMockApiState(value: unknown): value is MockApiState {
  if (!isRecord(value) || value.version !== 1) return false;
  if (!Array.isArray(value.queries) || !Array.isArray(value.validations)) return false;

  const queriesOk = value.queries.every(
    (q: unknown) =>
      isRecord(q) &&
      typeof q.iteration === 'number' &&
      Array.isArray(q.feedback) &&
      isRecord(q.query) &&
      typeof q.query.id === 'string' &&
      typeof q.query.text === 'string',
  );
  const validationsOk = value.validations.every(
    (v: unknown) =>
      isRecord(v) &&
      typeof v.queryId === 'string' &&
      typeof v.clipId === 'string' &&
      isVerdict(v.verdict) &&
      typeof v.validatedAt === 'string',
  );
  return queriesOk && validationsOk;
}

export const localStoragePersistence: Persistence = {
  load: () => readJson(storageKeys.mockApiState, isMockApiState),
  save: (state) => {
    writeJson(storageKeys.mockApiState, state);
  },
};

/** Persistance en mémoire. Partager la même instance simule un rechargement de page. */
export function memoryPersistence(): Persistence {
  let saved: string | null = null;
  return {
    load: () => {
      if (saved === null) return null;
      const parsed: unknown = JSON.parse(saved);
      return isMockApiState(parsed) ? parsed : null;
    },
    save: (state) => {
      saved = JSON.stringify(state); // copie, comme un vrai stockage
    },
  };
}
