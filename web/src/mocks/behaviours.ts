import type { Behaviour, BehaviourCode } from '@/domain/types';

// Éthogramme de démonstration : les 14 comportements CONFIRMÉS dans
// l'article PanAf20K (libellés traduits en français).
//
// TODO(audit-données) : PanAf20K compte 18 classes. Les 4 manquantes seront
// fixées après l'audit du jeu de données. NE PAS les inventer ici.
//
// ATTENTION : la classe `frequency` (head / middle / tail) est une
// ESTIMATION faite pour la démonstration, pas une valeur publiée. À
// remplacer par les fréquences réelles mesurées lors de l'audit.

export const behaviours: readonly Behaviour[] = [
  {
    code: 'FEED',
    label: 'Alimentation',
    description: 'Ingère ou manipule de la nourriture (fruits, feuilles, insectes…).',
    frequency: 'head',
  },
  {
    code: 'TRAV',
    label: 'Déplacement',
    description: 'Se déplace au sol de façon orientée, à quatre pattes.',
    frequency: 'head',
  },
  {
    code: 'NONE',
    label: 'Aucun comportement',
    description: 'Individu visible sans comportement codable (repos, immobilité).',
    frequency: 'head',
  },
  {
    code: 'CAMR',
    label: 'Réaction à la caméra',
    description: 'Regarde, approche, touche ou évite ostensiblement la caméra.',
    frequency: 'middle',
  },
  {
    code: 'SOC',
    label: 'Interaction sociale',
    description: 'Contact ou échange orienté vers un congénère (épouillage, jeu…).',
    frequency: 'middle',
  },
  {
    code: 'CARR',
    label: 'Portage',
    description: 'Un individu en porte un autre (ventral ou dorsal).',
    frequency: 'middle',
  },
  {
    code: 'CLMB',
    label: 'Escalade',
    description: 'Grimpe ou descend un support vertical (tronc, liane).',
    frequency: 'middle',
  },
  {
    code: 'TOOL',
    label: "Usage d'outil",
    description: 'Utilise un objet pour atteindre un but (pierre, bâton, sonde).',
    frequency: 'tail',
  },
  {
    code: 'DISP',
    label: 'Parade',
    description: 'Démonstration de force : course, branches traînées, tambourinage.',
    frequency: 'tail',
  },
  {
    code: 'AGGR',
    label: 'Agression',
    description: 'Poursuite, coup ou morsure dirigés vers un congénère.',
    frequency: 'tail',
  },
  {
    code: 'SEX',
    label: 'Comportement sexuel',
    description: 'Accouplement ou sollicitation sexuelle.',
    frequency: 'tail',
  },
  {
    code: 'BIPE',
    label: 'Bipédie',
    description: 'Se tient ou se déplace debout sur les membres postérieurs.',
    frequency: 'tail',
  },
  {
    code: 'XSPC',
    label: 'Interaction interspécifique',
    description: "Interaction avec un animal d'une autre espèce.",
    frequency: 'tail',
  },
  {
    code: 'PILO',
    label: 'Piloérection',
    description: 'Poils hérissés, signe d’excitation ou de tension.',
    frequency: 'tail',
  },
];

/**
 * Mots-clés reconnus dans une recherche en texte libre (simulation très
 * simple : la vraie recherche s'appuiera sur un modèle vidéo-texte).
 * Comparaison sans accents et en minuscules ; ce sont des débuts de mots.
 */
export const behaviourKeywords: Readonly<Record<BehaviourCode, readonly string[]>> = {
  FEED: ['mang', 'nourr', 'aliment', 'fruit', 'feuille', 'feed', 'eat'],
  TRAV: ['deplac', 'march', 'travers', 'passe', 'travel', 'walk'],
  NONE: ['repos', 'immobile', 'assis', 'rest'],
  CAMR: ['camera', 'regard', 'objectif', 'curieu'],
  SOC: ['social', 'epouill', 'jeu', 'jou', 'groom', 'play'],
  CARR: ['port', 'bebe', 'petit', 'dos', 'carry', 'infant'],
  CLMB: ['grimp', 'escalad', 'arbre', 'tronc', 'climb'],
  TOOL: ['outil', 'pierre', 'baton', 'casse', 'noix', 'sonde', 'tool', 'stone', 'stick'],
  DISP: ['parade', 'tambour', 'demonstr', 'display'],
  AGGR: ['agress', 'attaqu', 'poursui', 'combat', 'fight'],
  SEX: ['sexu', 'accoupl', 'mating'],
  BIPE: ['bipede', 'bipedie', 'debout', 'bipedal'],
  XSPC: ['espece', 'autre animal', 'interspecif', 'species'],
  PILO: ['piloerect', 'herisse', 'poils'],
};

/** Poids de tirage selon la classe de fréquence (estimation de démonstration). */
export const frequencyWeight: Record<Behaviour['frequency'], number> = {
  head: 10,
  middle: 3,
  tail: 1,
};
