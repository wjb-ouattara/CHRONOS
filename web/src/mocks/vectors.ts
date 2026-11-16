// Petites opérations sur des vecteurs de nombres (caractéristiques fictives).
// Dans la vraie application, ce rôle sera tenu par les embeddings d'un modèle.

import type { Random } from '@/lib/random';

export type Vector = readonly number[];

export const DIMENSIONS = 16;

export const zeros = (n = DIMENSIONS): number[] => Array.from({ length: n }, () => 0);

export const add = (a: Vector, b: Vector): number[] => a.map((x, i) => x + (b[i] ?? 0));

export const scale = (a: Vector, k: number): number[] => a.map((x) => x * k);

export const dot = (a: Vector, b: Vector): number =>
  a.reduce((sum, x, i) => sum + x * (b[i] ?? 0), 0);

export const norm = (a: Vector): number => Math.sqrt(dot(a, a));

/** Ramène le vecteur à une longueur de 1 (direction seule). */
export const normalize = (a: Vector): number[] => {
  const n = norm(a);
  return n === 0 ? [...a] : scale(a, 1 / n);
};

/** Similarité cosinus : 1 = même direction, 0 = sans rapport, −1 = opposés. */
export const cosine = (a: Vector, b: Vector): number => {
  const n = norm(a) * norm(b);
  return n === 0 ? 0 : dot(a, b) / n;
};

export const mean = (vectors: readonly Vector[]): number[] =>
  vectors.length === 0
    ? zeros()
    : scale(
        vectors.reduce<number[]>((acc, v) => add(acc, v), zeros()),
        1 / vectors.length,
      );

/** Vecteur aléatoire de composantes ~ N(0, 1) (méthode de Box-Muller). */
export function gaussianVector(random: Random, n = DIMENSIONS): number[] {
  return Array.from({ length: n }, () => {
    const u = 1 - random(); // évite log(0)
    const v = random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  });
}
