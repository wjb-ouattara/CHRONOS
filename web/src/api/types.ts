// L'INTERFACE de l'API de Chronos. Les écrans ne dépendent que de ce
// fichier, jamais d'une implémentation :
//  - aujourd'hui : createMockApi() (données fictives, dans le navigateur) ;
//  - phase 4 : une implémentation HTTP qui appellera FastAPI.
// Remplacer l'une par l'autre ne demandera aucun changement dans les écrans.

import type {
  Behaviour,
  BehaviourCode,
  Clip,
  SearchQuery,
  SearchResponse,
  Site,
  Species,
  Validation,
  Verdict,
} from '@/domain/types';

export interface ClipFilters {
  siteId?: string;
  cameraId?: string;
  isNight?: boolean;
  species?: Species | null;
}

export interface SearchInput {
  text: string;
  behaviourCode: BehaviourCode | null;
}

/** Ce que le client envoie ; le serveur ajoute l'horodatage `validatedAt`. */
export interface ValidationInput {
  queryId: string;
  clipId: string;
  verdict: Verdict;
  note?: string;
}

export interface ChronosApi {
  listBehaviours(): Promise<Behaviour[]>;
  listSites(): Promise<Site[]>;
  listClips(filters?: ClipFilters): Promise<Clip[]>;

  /** Lance une nouvelle recherche (itération 0). */
  search(input: SearchInput): Promise<SearchResponse>;
  /** Résultats actuels d'une recherche existante, sans la modifier (ex. après rechargement). */
  getSearch(queryId: string): Promise<SearchResponse>;
  /** Reclasse à partir des validations : itération + 1. */
  rerank(queryId: string): Promise<SearchResponse>;
  /** Recherches passées, la plus récente d'abord. */
  listQueries(): Promise<SearchQuery[]>;

  /** Crée ou remplace la validation du couple (queryId, clipId). */
  saveValidation(input: ValidationInput): Promise<Validation>;
  listValidations(queryId: string): Promise<Validation[]>;

  /** Contenu du fichier CSV (une ligne par validation, colonnes d'ExportRow). */
  exportCsv(queryId: string): Promise<string>;
}
