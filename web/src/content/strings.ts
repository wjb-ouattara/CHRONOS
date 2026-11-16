// Tous les textes de l'interface sont regroupés ici : une future traduction
// ne touchera qu'à ce dossier. `as const` fige les valeurs (types littéraux).
export const strings = {
  app: {
    name: 'Chronos Ethogram',
    tagline:
      'Décrivez le comportement que vous cherchez. Chronos vous montre où il apparaît dans toutes vos vidéos.',
  },
  demo: {
    banner: 'Données de démonstration',
  },
  theme: {
    lightLabel: 'Thème clair',
  },
  design: {
    title: 'Système de design',
    intro:
      'Page de contrôle interne : chaque token et chaque composant de Chronos, dans tous ses états.',
    colors: 'Couleurs',
    colorsIntro:
      'Rôles de couleur dans les deux thèmes. Les valeurs affichées sont lues dans themes.css, la source unique.',
    contrast: 'Contrastes',
    contrastIntro:
      'Paires garanties WCAG AA : 4,5:1 pour le texte, 3:1 pour les bordures. Vérifiées aussi par les tests.',
    typography: 'Typographie',
    textScale: 'Échelle des tailles',
    radius: 'Rayons',
    spacing: 'Espacement',
    spacingIntro: 'Multiples de 4 px (règle Tailwind par défaut).',
    darkTheme: 'Sombre',
    lightTheme: 'Clair',
    pass: 'AA',
    fail: 'Échec',
    backHome: 'Retour à l’accueil',
    gallery: {
      buttonIntro:
        'Principal, secondaire, discret. États : normal, avec icône, icône seule, en cours, désactivé.',
      fieldIntro: 'Recherche (libellé masqué), avec aide, en erreur, désactivé.',
      verdictIntro: 'Icône + texte + couleur : jamais la couleur seule.',
      stripIntro:
        'Bande d’informations incrustée par la caméra. Toujours noire à texte ambre, dans les deux thèmes.',
      timelineIntro:
        'Score de chaque seconde. Compacte sous les cartes ; agrandie dans la loupe (survolez les barres).',
      thumbnailIntro:
        'Vignettes générées à partir d’une graine. Aucune photo réelle : ce sont des placeholders.',
      cardPreview: 'Assemblage (aperçu de carte)',
      imageColors: 'Couleurs d’image (identiques dans les deux thèmes)',
      validate: 'Valider',
      add: 'Ajouter',
      settings: 'Réglages',
      saving: 'Enregistrement',
      disabled: 'Désactivé',
      night: 'nuit',
      day: 'jour',
      missing: 'valeurs manquantes',
      moonPhases: 'phases de lune',
      lowScores: 'scores faibles',
      playhead: 'curseur à 4,5 s',
      searchLabel: 'Rechercher un comportement',
      searchPlaceholder: 'ex. chimpanzé utilisant une pierre',
      noteLabel: 'Note',
      noteHint: 'Facultatif. Exportée dans la colonne note du CSV.',
      notePlaceholder: 'ex. individu juvénile',
      noteError: 'La note ne peut pas contenir de point-virgule.',
    },
  },
  home: {
    designLink: 'Voir le système de design',
  },
  moon: {
    unknown: 'Phase inconnue',
    // Indice = phase × 8 arrondi (0 = nouvelle lune, 4 = pleine lune).
    phases: [
      'Nouvelle lune',
      'Premier croissant',
      'Premier quartier',
      'Lune gibbeuse croissante',
      'Pleine lune',
      'Lune gibbeuse décroissante',
      'Dernier quartier',
      'Dernier croissant',
    ],
  },
  verdict: {
    yes: 'Oui',
    no: 'Non',
    unsure: 'Incertain',
    none: 'Non validé',
  },
  strip: {
    /** Résumé lu par les lecteurs d'écran à la place du texte compact de la bande. */
    describe: (parts: {
      site: string;
      camera: string;
      when: string;
      temp: string;
      moon: string;
      period: string;
    }) =>
      `${parts.site}, caméra ${parts.camera}, ${parts.when}, ${parts.temp}, ${parts.moon}, ${parts.period}`,
    when: (date: string, time: string) => `${date} à ${time}`,
    unknownDate: 'date inconnue',
    unknownTemperature: 'température inconnue',
    night: 'nuit',
    day: 'jour',
  },
  timeline: {
    summary: (bestS: number, score: string) =>
      `Pertinence par seconde. Instant clé à ${String(bestS)} s (score ${score}).`,
    second: (s: number, score: string) => `${String(s)} s : ${score}`,
    axisEnd: (s: number) => `${String(s)} s`,
  },
  thumbnail: {
    label: 'Vignette générée, aucune image réelle',
  },
  field: {
    clear: 'Effacer',
  },
  button: {
    loading: 'Chargement…',
  },
} as const;
