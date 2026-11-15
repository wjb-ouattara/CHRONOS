import { readString, storageKeys, writeString } from '@/lib/storage';

export type Theme = 'dark' | 'light';

/** Thème sombre par défaut : c'est l'identité « station de terrain, de nuit ». */
export const DEFAULT_THEME: Theme = 'dark';

export function isTheme(value: unknown): value is Theme {
  return value === 'dark' || value === 'light';
}

/** Thème enregistré, ou le thème par défaut si rien d'exploitable n'est stocké. */
export function readStoredTheme(): Theme {
  const stored = readString(storageKeys.theme);
  return isTheme(stored) ? stored : DEFAULT_THEME;
}

/** Applique le thème au document : tous les tokens CSS en dépendent. */
export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
}

export function persistTheme(theme: Theme): void {
  writeString(storageKeys.theme, theme);
}
