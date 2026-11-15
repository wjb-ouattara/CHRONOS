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
