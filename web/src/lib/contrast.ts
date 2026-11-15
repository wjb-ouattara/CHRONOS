// Calcul du contraste selon WCAG 2.x.
// Référence : https://www.w3.org/TR/WCAG22/#dfn-contrast-ratio

/** Seuils AA : 4,5:1 pour le texte courant, 3:1 pour les éléments d'interface. */
export const AA_TEXT = 4.5;
export const AA_NON_TEXT = 3;

type Rgb = readonly [number, number, number];

/** Lit une couleur `#rrggbb` ou `rgb(r, g, b)` (forme renvoyée par le navigateur). */
export function parseColor(input: string): Rgb {
  const value = input.trim().toLowerCase();

  const hex = /^#([0-9a-f]{6})$/.exec(value);
  if (hex?.[1]) {
    const n = Number.parseInt(hex[1], 16);
    return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
  }

  const rgb = /^rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/.exec(value);
  if (rgb) return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];

  throw new Error(`Couleur non reconnue : « ${input} »`);
}

/** Luminance relative : 0 pour le noir, 1 pour le blanc. */
export function relativeLuminance([r, g, b]: Rgb): number {
  // Chaque canal est « linéarisé » : l'œil ne perçoit pas la lumière de façon linéaire.
  const linear = (channel: number) => {
    const c = channel / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}

/** Rapport de contraste entre deux couleurs, de 1 (identiques) à 21 (noir/blanc). */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(parseColor(a));
  const lb = relativeLuminance(parseColor(b));
  const [light, dark] = la > lb ? [la, lb] : [lb, la];
  return (light + 0.05) / (dark + 0.05);
}
