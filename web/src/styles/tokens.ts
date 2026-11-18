// Catalogue des tokens de design, lu par la page /design et par les tests.
// Les VALEURS restent dans les fichiers CSS ; ici on ne liste que les noms,
// leur usage et les paires de contraste à garantir.
// tokens.test.ts vérifie que ce catalogue et themes.css restent synchronisés.

import { AA_NON_TEXT, AA_TEXT } from '@/lib/contrast';

export interface ColorToken {
  /** Nom du rôle, sans préfixe : `surface` → `--theme-surface`, `bg-surface`. */
  name: string;
  usage: string;
}

export const colorTokens = [
  { name: 'canvas', usage: 'Fond de page' },
  { name: 'surface', usage: 'Panneaux' },
  { name: 'surface-raised', usage: 'Cartes, menus' },
  { name: 'line', usage: 'Séparateurs décoratifs' },
  { name: 'line-strong', usage: 'Bordures de contrôles' },
  { name: 'ink', usage: 'Texte principal' },
  { name: 'ink-muted', usage: 'Texte secondaire' },
  { name: 'accent', usage: 'Focus, sélection, instant clé' },
  { name: 'on-accent', usage: "Texte posé sur l'accent" },
  { name: 'stamp', usage: 'Bande caméra-piège, horodatages' },
  { name: 'verdict-yes', usage: 'Verdict « oui »' },
  { name: 'verdict-no', usage: 'Verdict « non »' },
  { name: 'verdict-unsure', usage: 'Verdict « incertain »' },
  { name: 'danger', usage: 'Erreurs' },
  { name: 'chart-day', usage: 'Graphiques : clips de jour' },
  { name: 'chart-night', usage: 'Graphiques : clips de nuit' },
] as const satisfies readonly ColorToken[];

export type ColorTokenName = (typeof colorTokens)[number]['name'];

export interface ContrastPair {
  fg: ColorTokenName;
  bg: ColorTokenName;
  /** Seuil minimal : AA_TEXT pour du texte, AA_NON_TEXT pour une bordure ou une icône. */
  min: number;
}

const textBackgrounds = ['canvas', 'surface', 'surface-raised'] as const;

/** Couleurs utilisées comme texte : doivent être lisibles sur tous les fonds. */
const textColors = [
  'ink',
  'ink-muted',
  'accent',
  'stamp',
  'verdict-yes',
  'verdict-no',
  'verdict-unsure',
  'danger',
] as const;

/** Toutes les combinaisons garanties AA, dans les deux thèmes. */
export const contrastPairs: readonly ContrastPair[] = [
  ...textColors.flatMap((fg) => textBackgrounds.map((bg) => ({ fg, bg, min: AA_TEXT }))),
  ...textBackgrounds.map((bg) => ({ fg: 'line-strong' as const, bg, min: AA_NON_TEXT })),
  // Marques de graphique (éléments non textuels) : 3:1 suffit.
  ...(['chart-day', 'chart-night'] as const).flatMap((fg) =>
    textBackgrounds.map((bg) => ({ fg, bg, min: AA_NON_TEXT })),
  ),
  { fg: 'on-accent', bg: 'accent', min: AA_TEXT },
];

export const fontTokens = [
  {
    name: 'display',
    className: 'font-display',
    family: 'Fraunces',
    usage: 'Titres',
    sample: 'Carnet de terrain, nuit 14',
  },
  {
    name: 'sans',
    className: 'font-sans',
    family: 'Instrument Sans',
    usage: 'Interface',
    sample: 'Valider les clips de la session',
  },
  {
    name: 'mono',
    className: 'font-mono',
    family: 'IBM Plex Mono',
    usage: 'Données, horodatages, codes',
    sample: 'S03 · CAM-17 · 2025-03-04 05:12:08 · 18 °C',
  },
] as const;

// Les classes sont écrites en entier (et non construites par `text-${size}`) :
// Tailwind repère les classes en lisant le code source, il ne peut pas
// deviner une classe fabriquée à l'exécution.
export const textSizes = [
  { name: '2xs', className: 'text-2xs' },
  { name: 'xs', className: 'text-xs' },
  { name: 'sm', className: 'text-sm' },
  { name: 'base', className: 'text-base' },
  { name: 'lg', className: 'text-lg' },
  { name: 'xl', className: 'text-xl' },
  { name: '2xl', className: 'text-2xl' },
  { name: '3xl', className: 'text-3xl' },
  { name: '4xl', className: 'text-4xl' },
] as const;

export const radiusTokens = [
  { name: 'xs', className: 'rounded-xs' },
  { name: 'sm', className: 'rounded-sm' },
  { name: 'md', className: 'rounded-md' },
  { name: 'lg', className: 'rounded-lg' },
  { name: 'full', className: 'rounded-full' },
] as const;
