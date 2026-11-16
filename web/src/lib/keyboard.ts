// Règles communes à tous les raccourcis clavier.

/**
 * Vrai si l'utilisateur est en train de SAISIR du texte : un raccourci ne
 * doit alors jamais se déclencher (taper « non » dans un champ ne doit pas
 * valider un clip).
 */
export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  if (tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (tag === 'INPUT') {
    // Une case à cocher ou un bouton radio ne reçoit pas de texte.
    const type = (target as HTMLInputElement).type;
    return !['checkbox', 'radio', 'button', 'submit', 'reset', 'range', 'color'].includes(type);
  }
  return false;
}

/**
 * Vrai si l'événement correspond à la touche `key`, sans Ctrl, Alt ni Cmd
 * (on ne vole pas les raccourcis du navigateur, comme Ctrl+R).
 * Majuscule acceptée : « ? » s'obtient souvent avec Maj.
 */
export function matchesShortcut(event: KeyboardEvent, key: string): boolean {
  if (event.ctrlKey || event.altKey || event.metaKey) return false;
  return event.key.toLowerCase() === key.toLowerCase();
}
