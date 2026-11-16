// Générateur pseudo-aléatoire À GRAINE : la même graine donne toujours la
// même suite de nombres. Indispensable pour des données fictives et des
// vignettes reproductibles (contrairement à Math.random()).
//
// Algorithme : mulberry32, simple, rapide et de qualité suffisante pour
// du visuel et des données de démonstration (pas pour de la cryptographie).

export type Random = () => number; // renvoie un nombre dans [0, 1)

export function createRandom(seed: number): Random {
  let state = seed >>> 0; // force un entier 32 bits non signé
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Nombre décimal dans [min, max). */
export const between = (random: Random, min: number, max: number) => min + random() * (max - min);

/** Entier dans [min, max] (bornes incluses). */
export const integerBetween = (random: Random, min: number, max: number) =>
  Math.floor(between(random, min, max + 1));

/**
 * Transforme un texte en graine entière stable (algorithme FNV-1a 32 bits).
 * Permet par ex. de dériver une graine propre à chaque couple (requête, clip).
 */
export function hashString(text: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** Tire un élément selon des poids (plus le poids est grand, plus il sort souvent). */
export function weightedPick<T>(
  random: Random,
  items: readonly T[],
  weight: (item: T) => number,
): T {
  const total = items.reduce((sum, item) => sum + weight(item), 0);
  let threshold = random() * total;
  for (const item of items) {
    threshold -= weight(item);
    if (threshold < 0) return item;
  }
  const last = items.at(-1);
  if (last === undefined) throw new Error('weightedPick : liste vide');
  return last;
}
