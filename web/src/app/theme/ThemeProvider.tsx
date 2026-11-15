import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

import { applyTheme, persistTheme, readStoredTheme, type Theme } from './theme';
import { ThemeContext, type ThemeContextValue } from './theme-context';

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Fonction d'initialisation : lue une seule fois, au premier rendu.
  const [theme, setTheme] = useState<Theme>(readStoredTheme);

  // Synchronise le DOM et le stockage à chaque changement. Le script inline
  // de index.html a déjà appliqué le bon thème avant React : ceci ne fait
  // donc rien de visible au premier rendu (pas de flash).
  useEffect(() => {
    applyTheme(theme);
    persistTheme(theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
  }, []);

  // useMemo : les composants abonnés ne se re-rendent que si le thème change.
  const value = useMemo<ThemeContextValue>(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, toggleTheme],
  );

  return <ThemeContext value={value}>{children}</ThemeContext>;
}
