// SEUL module autorisé à accéder à `localStorage` (règle du projet).
//
// Pourquoi tout passe par ici : `localStorage` peut lever une exception
// (navigation privée, quota dépassé, stockage désactivé). Chaque accès est
// donc protégé, et l'application continue de fonctionner sans stockage.

/** Toutes les clés utilisées, préfixées pour éviter les collisions. */
export const storageKeys = {
  // Attention : cette clé est aussi lue par le script inline de index.html
  // (voir storage.test.ts, qui vérifie que les deux restent identiques).
  theme: 'chronos:theme',
  // État de l'API fictive (requêtes + validations). Le suffixe de version
  // permet de changer de format plus tard sans relire d'anciennes données.
  mockApiState: 'chronos:mock-api:v1',
} as const;

export type StorageKey = (typeof storageKeys)[keyof typeof storageKeys];

export function readString(key: StorageKey): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

/** Renvoie `false` si l'écriture a échoué : à l'appelant de décider s'il prévient l'utilisateur. */
export function writeString(key: StorageKey, value: string): boolean {
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function removeItem(key: StorageKey): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Rien à faire : l'élément est de toute façon inaccessible.
  }
}

/**
 * Lit une valeur JSON et VÉRIFIE sa forme avant de la renvoyer.
 *
 * Le stockage est une donnée non fiable : il peut avoir été modifié à la
 * main, ou écrit par une ancienne version de l'application. `isValid` est
 * une « garde de type » : si elle répond non, on renvoie `null` plutôt
 * qu'un objet de forme inattendue qui planterait plus loin.
 */
export function readJson<T>(key: StorageKey, isValid: (value: unknown) => value is T): T | null {
  const raw = readString(key);
  if (raw === null) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return isValid(parsed) ? parsed : null;
  } catch {
    return null; // JSON illisible
  }
}

export function writeJson(key: StorageKey, value: unknown): boolean {
  return writeString(key, JSON.stringify(value));
}
