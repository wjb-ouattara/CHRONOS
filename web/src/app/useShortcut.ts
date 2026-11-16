import { useEffect, useRef } from 'react';

import { getShortcut, type ShortcutId } from '@/content/shortcuts';
import { isTypingTarget, matchesShortcut } from '@/lib/keyboard';

/**
 * Branche une action sur un raccourci du registre.
 *
 *   useShortcut('help', () => setOpen((o) => !o));
 *
 * `enabled: false` met le raccourci en pause (ex. quand l'écran n'est pas actif).
 */
export function useShortcut(id: ShortcutId, action: () => void, { enabled = true } = {}) {
  // On garde la DERNIÈRE version de l'action dans une ref : l'écouteur n'a
  // pas besoin d'être réinstallé à chaque rendu, et il n'appelle jamais une
  // ancienne version (qui verrait un état périmé).
  const actionRef = useRef(action);
  useEffect(() => {
    actionRef.current = action;
  });

  useEffect(() => {
    if (!enabled) return;
    const { key } = getShortcut(id);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.repeat) return; // touche maintenue : une seule fois
      if (isTypingTarget(event.target) || !matchesShortcut(event, key)) return;
      // Une fenêtre modale est ouverte : seuls ses propres contrôles agissent
      // (sauf « ? », qui ferme l'aide). Sinon Échap fermerait aussi la loupe derrière.
      if (id !== 'help' && document.querySelector('dialog[open]')) return;
      event.preventDefault();
      actionRef.current();
    };

    document.addEventListener('keydown', onKeyDown);
    // Nettoyage : l'écouteur est retiré quand le composant disparaît.
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [id, enabled]);
}
