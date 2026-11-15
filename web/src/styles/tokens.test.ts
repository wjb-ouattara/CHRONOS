import { describe, expect, it } from 'vitest';

import { contrastRatio } from '@/lib/contrast';

import { parseThemes } from './parse-themes';
import themesCss from './themes.css?raw';
import { colorTokens, contrastPairs } from './tokens';

const { themes } = parseThemes(themesCss);

describe('tokens de couleur', () => {
  it.each(['dark', 'light'] as const)(
    'le thème %s définit exactement les rôles du catalogue',
    (theme) => {
      // Si quelqu'un ajoute un token dans le CSS sans l'ajouter au catalogue
      // (ou l'inverse), la page /design serait incomplète : on le détecte ici.
      expect(Object.keys(themes[theme]).sort()).toEqual(colorTokens.map((t) => t.name).sort());
    },
  );

  // Un test par thème et par paire : en cas d'échec, le message dit lequel.
  describe.each(['dark', 'light'] as const)('contrastes WCAG AA, thème %s', (theme) => {
    it.each(contrastPairs)('$fg sur $bg ≥ $min:1', ({ fg, bg, min }) => {
      const ratio = contrastRatio(themes[theme][fg] ?? '', themes[theme][bg] ?? '');
      expect(ratio).toBeGreaterThanOrEqual(min);
    });
  });
});
