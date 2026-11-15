import { Moon, Sun } from 'lucide-react';

import { useTheme } from '@/app/theme/theme-context';
import { strings } from '@/content/strings';

/**
 * Bouton de bascule (« toggle ») : libellé fixe + `aria-pressed`.
 * Un lecteur d'écran annonce « Thème clair, bouton bascule, activé/désactivé ».
 * (Changer le libellé ET l'état à la fois serait ambigu.)
 */
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === 'light';
  const Icon = isLight ? Sun : Moon;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-pressed={isLight}
      className="inline-flex items-center gap-2 rounded-md border border-line-strong px-3 py-1.5 text-sm text-ink transition-colors duration-150 hover:bg-surface-raised"
    >
      {/* Icône décorative : le texte porte déjà le sens. */}
      <Icon aria-hidden="true" className="size-4" />
      {strings.theme.lightLabel}
    </button>
  );
}
