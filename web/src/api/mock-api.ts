// Implémentation FICTIVE de ChronosApi : tout se passe dans le navigateur,
// sur le jeu de données généré. Respecte exactement l'interface que la
// future API HTTP implémentera.

import { strings } from '@/content/strings';
import type { Clip, ExportRow, SearchQuery, SearchResponse, Validation } from '@/domain/types';
import { behaviours } from '@/mocks/behaviours';
import { DEFAULT_SEED, generateDataset } from '@/mocks/dataset';
import {
  bestMomentFor,
  normalizeText,
  queryVector,
  rankClips,
  rocchio,
} from '@/mocks/search-engine';
import { sites } from '@/mocks/sites';

import { toCsv } from './csv';
import { ApiError } from './errors';
import {
  localStoragePersistence,
  type MockApiState,
  type Persistence,
  type StoredQuery,
} from './persistence';
import type { ChronosApi, ClipFilters, SearchInput, ValidationInput } from './types';

export interface MockApiOptions {
  seed?: number;
  /** Latence simulée [min, max] en ms. `[0, 0]` dans les tests. */
  latencyMs?: readonly [number, number];
  /** Probabilité (0..1) qu'un appel échoue : pour tester les états d'erreur. */
  failureRate?: number;
  /** Horloge et générateur d'identifiants injectables (tests reproductibles). */
  now?: () => Date;
  newId?: () => string;
  persistence?: Persistence;
}

const e = strings.api.errors;

/**
 * Clé qui fixe la forme des courbes par seconde (et donc l'instant clé).
 * Dérivée du CONTENU de la recherche, pas de son identifiant : deux
 * recherches identiques donnent les mêmes instants clés.
 */
const curveKey = (query: SearchQuery) =>
  `${query.behaviourCode ?? ''}|${normalizeText(query.text.trim())}`;

export function createMockApi(options: MockApiOptions = {}): ChronosApi {
  const {
    seed = DEFAULT_SEED,
    latencyMs = [150, 400],
    failureRate = 0,
    now = () => new Date(),
    newId = () => crypto.randomUUID(),
    persistence = localStoragePersistence,
  } = options;

  const dataset = generateDataset(seed);
  const clipsById = new Map(dataset.clips.map((c) => [c.id, c]));
  const emptyState: MockApiState = { version: 1, queries: [], validations: [] };
  let state: MockApiState = persistence.load() ?? emptyState;

  const commit = (next: MockApiState) => {
    state = next;
    persistence.save(state);
  };

  /**
   * Enveloppe de chaque appel : latence simulée, échec éventuel, puis copie
   * profonde du résultat (`structuredClone`) pour qu'un écran qui modifierait
   * l'objet reçu ne puisse pas corrompre l'état interne, comme avec du JSON réseau.
   */
  async function respond<T>(work: () => T): Promise<T> {
    const [min, max] = latencyMs;
    const delay = min + Math.random() * (max - min);
    if (delay > 0) await new Promise((resolve) => setTimeout(resolve, delay));
    if (Math.random() < failureRate) throw new ApiError('unavailable', e.unavailable);
    return structuredClone(work());
  }

  const findQuery = (queryId: string): StoredQuery => {
    const stored = state.queries.find((q) => q.query.id === queryId);
    if (!stored) throw new ApiError('not_found', e.queryNotFound);
    return stored;
  };

  const validationsOf = (queryId: string) => state.validations.filter((v) => v.queryId === queryId);

  /** Recalcule les résultats d'une requête à partir de son état enregistré. */
  const computeResponse = (stored: StoredQuery): SearchResponse => {
    const { query } = stored;
    const base = queryVector(dataset, query.text, query.behaviourCode);
    const vector =
      stored.feedback.length === 0
        ? base
        : rocchio(
            base,
            stored.feedback.map((f) => ({
              verdict: f.verdict,
              features: dataset.hidden.get(f.clipId)?.features ?? [],
            })),
          );
    const validated = new Set(validationsOf(query.id).map((v) => v.clipId));
    return {
      query,
      iteration: stored.iteration,
      results: rankClips(dataset, vector, curveKey(query), validated),
    };
  };

  const matchesFilters = (clip: Clip, f: ClipFilters) =>
    (f.siteId === undefined || clip.siteId === f.siteId) &&
    (f.cameraId === undefined || clip.cameraId === f.cameraId) &&
    (f.isNight === undefined || clip.isNight === f.isNight) &&
    (f.species === undefined || clip.species === f.species);

  return {
    listBehaviours: () => respond(() => [...behaviours]),

    listSites: () => respond(() => [...sites]),

    listClips: (filters = {}) =>
      respond(() => dataset.clips.filter((c) => matchesFilters(c, filters))),

    search: ({ text, behaviourCode }: SearchInput) =>
      respond(() => {
        const trimmed = text.trim();
        if (trimmed === '' && behaviourCode === null)
          throw new ApiError('invalid_input', e.emptyQuery);
        if (behaviourCode !== null && !behaviours.some((b) => b.code === behaviourCode)) {
          throw new ApiError('invalid_input', e.unknownBehaviour);
        }
        const query: SearchQuery = {
          id: newId(),
          text: trimmed,
          behaviourCode,
          createdAt: now().toISOString(),
        };
        const stored: StoredQuery = { query, iteration: 0, feedback: [] };
        commit({ ...state, queries: [...state.queries, stored] });
        return computeResponse(stored);
      }),

    getSearch: (queryId) => respond(() => computeResponse(findQuery(queryId))),

    rerank: (queryId) =>
      respond(() => {
        const current = findQuery(queryId);
        const updated: StoredQuery = {
          ...current,
          iteration: current.iteration + 1,
          // On fige les validations utilisées pour ce reclassement.
          feedback: validationsOf(queryId).map(({ clipId, verdict }) => ({ clipId, verdict })),
        };
        commit({
          ...state,
          queries: state.queries.map((q) => (q.query.id === queryId ? updated : q)),
        });
        return computeResponse(updated);
      }),

    listQueries: () =>
      respond(() =>
        state.queries.map((q) => q.query).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      ),

    saveValidation: (input: ValidationInput) =>
      respond(() => {
        findQuery(input.queryId);
        if (!clipsById.has(input.clipId)) throw new ApiError('not_found', e.clipNotFound);
        const validation: Validation = {
          queryId: input.queryId,
          clipId: input.clipId,
          verdict: input.verdict,
          validatedAt: now().toISOString(),
          ...(input.note ? { note: input.note } : {}),
        };
        // Une seule validation par couple (requête, clip) : la nouvelle remplace l'ancienne.
        const others = state.validations.filter(
          (v) => !(v.queryId === input.queryId && v.clipId === input.clipId),
        );
        commit({ ...state, validations: [...others, validation] });
        return validation;
      }),

    listValidations: (queryId) =>
      respond(() => {
        findQuery(queryId);
        return validationsOf(queryId);
      }),

    exportCsv: (queryId) =>
      respond(() => {
        const { query } = findQuery(queryId);
        const rows = validationsOf(queryId)
          .sort((a, b) => a.validatedAt.localeCompare(b.validatedAt))
          .map((v): ExportRow => {
            const clip = clipsById.get(v.clipId);
            if (!clip) throw new ApiError('not_found', e.clipNotFound);
            return {
              behaviour_code: query.behaviourCode,
              query_text: query.text,
              clip_id: clip.id,
              site_id: clip.siteId,
              camera_id: clip.cameraId,
              species: clip.species,
              recorded_at: clip.recordedAt,
              best_moment_s: bestMomentFor(curveKey(query), clip),
              verdict: v.verdict,
              validated_at: v.validatedAt,
              note: v.note ?? null,
            };
          });
        return toCsv(rows);
      }),
  };
}
