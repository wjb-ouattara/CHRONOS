// Lit themes.css et en extrait les valeurs de chaque thème.
// Utilisé par la page /design (affichage) et par tokens.test.ts (contrastes) :
// les deux lisent donc EXACTEMENT la même source, le fichier CSS.

import type { Theme } from '@/app/theme/theme';

export type ThemeValues = Record<string, string>;

export interface ParsedThemes {
  palette: ThemeValues;
  themes: Record<Theme, ThemeValues>;
}

/** Extrait les propriétés `--nom: valeur;` d'un bloc CSS. */
function readDeclarations(body: string): ThemeValues {
  const values: ThemeValues = {};
  for (const match of body.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) {
    const [, name, value] = match;
    if (name && value) values[name] = value.trim();
  }
  return values;
}

export function parseThemes(css: string): ParsedThemes {
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
  // Un bloc = un sélecteur suivi de `{ … }` (pas d'accolades imbriquées dans ce fichier).
  const blocks = [...withoutComments.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(
    ([, selector, body]) => ({
      selector: (selector ?? '').trim(),
      values: readDeclarations(body ?? ''),
    }),
  );

  const find = (test: (selector: string) => boolean): ThemeValues => {
    const block = blocks.find((b) => test(b.selector));
    if (!block) throw new Error('Bloc introuvable dans themes.css');
    return block.values;
  };

  const palette = find((s) => s === ':root');

  // Remplace `var(--palette-x)` par la valeur brute ; retire le préfixe `theme-`.
  const resolve = (raw: ThemeValues): ThemeValues => {
    const resolved: ThemeValues = {};
    for (const [name, value] of Object.entries(raw)) {
      if (!name.startsWith('theme-')) continue;
      const ref = /^var\(--([\w-]+)\)$/.exec(value)?.[1];
      const final = ref ? palette[ref] : value;
      if (!final) throw new Error(`Référence inconnue dans themes.css : ${value}`);
      resolved[name.slice('theme-'.length)] = final;
    }
    return resolved;
  };

  return {
    palette,
    themes: {
      dark: resolve(find((s) => s.includes("[data-theme='dark']"))),
      light: resolve(find((s) => s === "[data-theme='light']")),
    },
  };
}
