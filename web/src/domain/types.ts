// Contrat de données de Chronos : SOURCE DE VÉRITÉ partagée avec la future API.
// Toute modification doit être signalée (règle du projet, voir CLAUDE.md).
//
// Convention : les noms en camelCase côté interface ; seul ExportRow est en
// snake_case, car il décrit les colonnes du CSV lu dans R.

export type BehaviourCode = string; // ex. "TOOL", "FEED"

export interface Behaviour {
  code: BehaviourCode;
  label: string; // libellé lisible, ex. « Usage d'outil »
  description: string; // définition courte, style éthogramme
  frequency: 'head' | 'middle' | 'tail'; // fréquent / moyen / rare
}

/** Site d'étude. Jamais de coordonnées géographiques, même fictives. */
export interface Site {
  id: string; // ex. "S03"
  label: string;
  habitat: 'forest' | 'savanna' | 'mosaic';
}

export type Species = 'chimpanzee' | 'gorilla';

export interface Clip {
  id: string;
  siteId: string;
  cameraId: string; // ex. "CAM-17"
  /**
   * Date-heure LOCALE de la caméra, sans fuseau : "2025-03-04T05:12:08".
   * Les caméras pièges n'enregistrent pas de fuseau ; en ajouter un serait
   * inventer une information (et fausserait l'horloge d'activité 24 h).
   * `null` si l'horodatage manque dans les données réelles.
   */
  recordedAt: string | null;
  /** Durée en secondes entières (15 pour PanAf20K). */
  durationS: number;
  isNight: boolean;
  temperatureC: number | null;
  /** Phase de lune de 0 à 1 : 0 = nouvelle lune, 0,5 = pleine lune, 1 = nouvelle lune. */
  moonPhase: number | null;
  /** `null` si l'espèce n'est pas annotée. */
  species: Species | null;
  /** Graine de la vignette procédurale (aucune image réelle n'est utilisée). */
  thumbnailSeed: number;
}

export interface SearchQuery {
  id: string;
  text: string;
  behaviourCode: BehaviourCode | null; // null = recherche en texte libre
  createdAt: string; // ISO 8601 avec fuseau (horodatage machine, pas caméra)
}

export interface SearchResult {
  clipId: string;
  rank: number; // 1 = le plus pertinent
  score: number; // 0..1, score du clip
  /** Indice entier de la seconde la plus pertinente, de 0 à durationS - 1. */
  bestMomentS: number;
  /** Un score 0..1 par seconde : `secondScores.length === durationS`. */
  secondScores: number[];
}

/**
 * Réponse de `search()` et de `rerank()`. Les résultats sont toujours
 * rattachés à leur requête ; `iteration` vaut 0 pour la recherche initiale
 * et augmente de 1 à chaque reclassement.
 */
export interface SearchResponse {
  query: SearchQuery;
  iteration: number;
  results: SearchResult[];
}

export type Verdict = 'yes' | 'no' | 'unsure';

/** Une seule validation par couple (queryId, clipId) : la dernière remplace la précédente. */
export interface Validation {
  queryId: string;
  clipId: string;
  verdict: Verdict;
  validatedAt: string; // ISO 8601 avec fuseau
  note?: string;
}

/** Une ligne du CSV exporté (colonnes en snake_case, prêtes pour R). */
export interface ExportRow {
  behaviour_code: string | null; // null si la recherche était en texte libre
  query_text: string;
  clip_id: string;
  site_id: string;
  camera_id: string;
  species: Species | null;
  recorded_at: string | null; // heure locale de la caméra
  best_moment_s: number;
  verdict: Verdict;
  validated_at: string;
  note: string | null;
}
