// Simulation de la recherche et du reclassement. Tout est déterministe :
// mêmes entrées → mêmes résultats.

import type { BehaviourCode, Clip, SearchResult, Verdict } from '@/domain/types';
import { createRandom, hashString } from '@/lib/random';

import { behaviourKeywords } from './behaviours';
import type { MockDataset } from './dataset';
import { add, cosine, gaussianVector, mean, normalize, scale, type Vector } from './vectors';

/** Nombre de résultats renvoyés (hors clips déjà validés, toujours inclus). */
export const RESULT_LIMIT = 120;

// Coefficients de Rocchio (valeurs classiques de la littérature).
const ROCCHIO_BETA = 0.75; // poids des exemples « oui »
const ROCCHIO_GAMMA = 0.25; // poids des exemples « non »

/** Minuscules, sans accents : « Bâton » → « baton ». */
export function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

/** Comportements évoqués par un texte libre (recherche par mots-clés, simulation). */
export function matchBehaviours(text: string): BehaviourCode[] {
  const normalized = normalizeText(text);
  return Object.entries(behaviourKeywords)
    .filter(([, keywords]) => keywords.some((k) => normalized.includes(k)))
    .map(([code]) => code);
}

/**
 * Vecteur de la requête.
 *  - Code d'éthogramme : le prototype de ce comportement.
 *  - Texte libre reconnu : moyenne des prototypes des comportements évoqués.
 *  - Texte non reconnu : direction pseudo-aléatoire dérivée du texte → un
 *    classement volontairement peu fiable, comme un modèle perdu.
 */
export function queryVector(
  dataset: MockDataset,
  text: string,
  behaviourCode: BehaviourCode | null,
): number[] {
  const codes = behaviourCode ? [behaviourCode] : matchBehaviours(text);
  const prototypes = codes
    .map((code) => dataset.prototypes.get(code))
    .filter((v): v is number[] => v !== undefined);
  if (prototypes.length > 0) return normalize(mean(prototypes));
  return normalize(gaussianVector(createRandom(hashString(normalizeText(text)))));
}

/** Requête corrigée par les validations (méthode de Rocchio). « Incertain » est ignoré. */
export function rocchio(
  query: Vector,
  feedback: readonly { features: Vector; verdict: Verdict }[],
): number[] {
  const yes = feedback.filter((f) => f.verdict === 'yes').map((f) => f.features);
  const no = feedback.filter((f) => f.verdict === 'no').map((f) => f.features);
  let next = [...query];
  if (yes.length > 0) next = add(next, scale(normalize(mean(yes)), ROCCHIO_BETA));
  if (no.length > 0) next = add(next, scale(normalize(mean(no)), -ROCCHIO_GAMMA));
  return normalize(next);
}

/** Similarité cosinus (−1..1) → score 0..1 par une courbe en S (sigmoïde). */
export const similarityToScore = (similarity: number) =>
  1 / (1 + Math.exp(-(similarity - 0.35) * 9));

const round3 = (n: number) => Math.round(n * 1000) / 1000;

/** Forme de la courbe d'un couple (requête, clip) : ne dépend PAS du score. */
function curveShape(queryKey: string, clip: Clip) {
  const random = createRandom(hashString(`${queryKey}|${clip.id}`));
  const peak = 1 + random() * (clip.durationS - 2);
  const width = 1.2 + random() * 1.6;
  const noise = Array.from({ length: clip.durationS }, () => ({
    factor: 0.9 + random() * 0.1,
    floor: random() * 0.03,
  }));
  return { bestMomentS: Math.round(peak), peak, width, noise };
}

/**
 * Instant clé d'un clip pour une requête. Ne dépend que du couple (requête,
 * clip) : il reste le même d'un reclassement à l'autre, et l'export CSV
 * donne exactement la seconde affichée à l'écran.
 */
export const bestMomentFor = (queryKey: string, clip: Clip) =>
  curveShape(queryKey, clip).bestMomentS;

/**
 * Score de chaque seconde : une « cloche » centrée sur l'instant où le
 * comportement se produit, plus un peu de bruit. Seule la HAUTEUR suit le
 * score du clip. L'instant clé vaut exactement le score du clip, et toutes
 * les autres secondes restent en dessous : c'est bien le maximum (testé).
 */
export function secondScoresFor(
  queryKey: string,
  clip: Clip,
  score: number,
): { secondScores: number[]; bestMomentS: number } {
  const { bestMomentS, peak, width, noise } = curveShape(queryKey, clip);
  const secondScores = noise.map(({ factor, floor }, s) => {
    if (s === bestMomentS) return round3(score);
    const bell = Math.exp(-((s - peak) ** 2) / (2 * width ** 2));
    return round3(Math.min(score * 0.97, score * bell * factor + floor));
  });
  return { secondScores, bestMomentS };
}

/**
 * Classe tous les clips pour un vecteur de requête. Renvoie les
 * RESULT_LIMIT meilleurs, plus les clips déjà validés (qui ne doivent
 * jamais disparaître de l'écran de l'utilisateur), rangs 1..n sans trou.
 */
export function rankClips(
  dataset: MockDataset,
  query: Vector,
  queryKey: string,
  alwaysInclude: ReadonlySet<string> = new Set(),
): SearchResult[] {
  const scored = dataset.clips
    .map((clip) => {
      const features = dataset.hidden.get(clip.id)?.features ?? [];
      return { clip, score: round3(similarityToScore(cosine(query, features))) };
    })
    // Tri par score décroissant ; à égalité, par identifiant (ordre stable).
    .sort((a, b) => b.score - a.score || a.clip.id.localeCompare(b.clip.id));

  return scored
    .filter((item, index) => index < RESULT_LIMIT || alwaysInclude.has(item.clip.id))
    .map(({ clip, score }, index) => ({
      clipId: clip.id,
      rank: index + 1,
      score,
      ...secondScoresFor(queryKey, clip, score),
    }));
}
