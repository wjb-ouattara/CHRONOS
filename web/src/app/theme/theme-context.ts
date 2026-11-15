import { createContext, useContext } from 'react';

import type { Theme } from './theme';

export interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

// `null` par défaut : utiliser useTheme() hors du fournisseur est une erreur
// de programmation, qu'on signale clairement plutôt que de la masquer.
export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme(): ThemeContextValue {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useTheme() doit être appelé à l’intérieur de <ThemeProvider>.');
  return value;
}
