import { useSyncExternalStore } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Vrai si l'utilisateur a demandé moins d'animations dans son système.
 * useSyncExternalStore s'abonne au changement de la préférence : si elle
 * change pendant l'utilisation, l'interface suit immédiatement.
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const media = window.matchMedia(QUERY);
      media.addEventListener('change', onChange);
      return () => {
        media.removeEventListener('change', onChange);
      };
    },
    () => window.matchMedia(QUERY).matches,
    () => false, // rendu côté serveur : sans objet ici
  );
}
