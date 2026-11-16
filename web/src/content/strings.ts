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
    detail: 'Vidéos et chiffres fictifs. Aucun résultat réel.',
  },
  layout: {
    skipLink: 'Aller au contenu',
    brand: 'Chronos',
    brandLabel: 'Chronos Ethogram, accueil',
    navLabel: 'Navigation principale',
    shortcuts: 'Raccourcis',
    internal: 'interne',
    titleSuffix: 'Chronos Ethogram',
  },
  nav: {
    collection: 'Collection',
    search: 'Recherche',
    session: 'Session',
    design: 'Design',
  },
  pages: {
    collection: {
      title: 'Collection',
      emptyTitle: 'Vue d’ensemble à venir',
      emptyBody: 'La mosaïque de la collection et les recherches récentes arrivent à l’étape 10.',
    },
    search: {
      title: 'Recherche',
      fieldLabel: 'Décrire un comportement',
      placeholder: 'ex. chimpanzé cassant des noix avec une pierre',
      submit: 'Chercher',
      ethogram: 'Éthogramme',
      ethogramHint: 'Cliquez un comportement pour le rechercher.',
      frequency: { head: 'fréquent', middle: 'moyen', tail: 'rare' },
      ethogramError: 'Éthogramme indisponible',
      startTitle: 'Que cherchez-vous ?',
      startBody:
        'Décrivez un comportement en quelques mots, ou choisissez-le dans l’éthogramme. Quelques exemples :',
      examples: [
        { text: 'chimpanzé cassant des noix avec une pierre', behaviourCode: null },
        { text: '', behaviourCode: 'TOOL' },
        { text: 'jeune porté sur le dos', behaviourCode: null },
      ],
      freeText: 'Texte libre',
      summary: (count: number, iteration: number) =>
        `${String(count)} clips · itération ${String(iteration)}`,
      resultsLabel: 'Résultats classés par pertinence',
      showMore: (n: number) => `Afficher ${String(n)} de plus`,
      shown: (shown: number, total: number) => `${String(shown)} sur ${String(total)}`,
      errorTitle: 'La recherche a échoué',
      notFoundTitle: 'Recherche introuvable',
      notFoundBody: 'Cette recherche n’existe pas ou plus sur cet appareil.',
      newSearch: 'Nouvelle recherche',
      noResults: 'Aucun clip pour cette recherche.',
    },
    card: {
      rank: (rank: number) => `#${String(rank).padStart(2, '0')}`,
      scoreLabel: 'score démo',
      scoreTitle: 'Score simulé à partir de données fictives : ce n’est pas un résultat réel.',
      label: (rank: number, clipId: string) => `Rang ${String(rank)}, clip ${clipId}`,
    },
    session: {
      title: 'Session & export',
      emptyTitle: 'Session à venir',
      emptyBody: 'Le tableau des validations, l’export CSV et l’horloge 24 h arrivent à l’étape 9.',
    },
    notFound: {
      title: 'Page introuvable',
      body: 'Cette adresse ne correspond à aucun écran de Chronos.',
      action: 'Retour à la collection',
    },
    routeError: {
      title: 'Cet écran a rencontré un problème',
      body: 'Une erreur inattendue s’est produite. Rechargez la page pour réessayer.',
      action: 'Recharger la page',
    },
  },
  states: {
    retry: 'Réessayer',
    loading: 'Chargement en cours',
  },
  shortcuts: {
    title: 'Raccourcis clavier',
    intro: 'Les raccourcis sont désactivés pendant la saisie dans un champ.',
    close: 'Fermer',
    soon: 'bientôt',
    groups: {
      global: 'Partout',
      search: 'Recherche et loupe',
    },
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
    states: 'États vide, chargement, erreur',
    statesIntro: 'Chaque écran a ces trois états.',
    pass: 'AA',
    fail: 'Échec',
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
      emptyTitle: 'Aucun clip validé',
      emptyBody: 'Validez des clips depuis la recherche : ils apparaîtront ici.',
      errorTitle: 'Impossible de charger les résultats',
      errorBody: 'Le service ne répond pas. Réessayez dans un instant.',
    },
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
  api: {
    errors: {
      unavailable: 'Le service ne répond pas. Réessayez dans un instant.',
      queryNotFound: 'Cette recherche est introuvable.',
      clipNotFound: 'Ce clip est introuvable.',
      emptyQuery: 'Décrivez un comportement ou choisissez-en un dans l’éthogramme.',
      unknownBehaviour: 'Ce comportement ne fait pas partie de l’éthogramme.',
    },
  },
} as const;
