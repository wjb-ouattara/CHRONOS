// Registre UNIQUE des raccourcis clavier. L'aide (touche « ? ») l'affiche ;
// chaque écran s'y réfère par `id` pour brancher son action. Ainsi l'aide
// et le comportement réel ne peuvent pas diverger.

export type ShortcutGroup = 'global' | 'search';

export interface Shortcut {
  id: string;
  /** Valeur de `KeyboardEvent.key` (une seule touche, sans modificateur). */
  key: string;
  /** Affichage dans l'aide. */
  label: string;
  description: string;
  group: ShortcutGroup;
  /** `false` tant que l'écran correspondant n'est pas construit. */
  available: boolean;
}

export const shortcuts = [
  {
    id: 'help',
    key: '?',
    label: '?',
    description: 'Afficher ou masquer cette aide',
    group: 'global',
    available: true,
  },
  {
    id: 'focusSearch',
    key: '/',
    label: '/',
    description: 'Aller à la barre de recherche',
    group: 'search',
    available: true,
  },
  {
    id: 'next',
    key: 'j',
    label: 'J',
    description: 'Clip suivant',
    group: 'search',
    available: false,
  },
  {
    id: 'previous',
    key: 'k',
    label: 'K',
    description: 'Clip précédent',
    group: 'search',
    available: false,
  },
  {
    id: 'yes',
    key: 'y',
    label: 'Y',
    description: 'Valider « oui »',
    group: 'search',
    available: false,
  },
  {
    id: 'no',
    key: 'n',
    label: 'N',
    description: 'Valider « non »',
    group: 'search',
    available: false,
  },
  {
    id: 'unsure',
    key: 'u',
    label: 'U',
    description: 'Valider « incertain »',
    group: 'search',
    available: false,
  },
  {
    id: 'rerank',
    key: 'r',
    label: 'R',
    description: 'Apprendre de mes validations (reclasser)',
    group: 'search',
    available: false,
  },
] as const satisfies readonly Shortcut[];

export type ShortcutId = (typeof shortcuts)[number]['id'];

export function getShortcut(id: ShortcutId): Shortcut {
  const found = shortcuts.find((s) => s.id === id);
  if (!found) throw new Error(`Raccourci inconnu : ${id}`);
  return found;
}
