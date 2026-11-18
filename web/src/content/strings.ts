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
      session: (total: number, yes: number, no: number, unsure: number) =>
        `${String(total)} validés · ${String(yes)} oui · ${String(no)} non · ${String(unsure)} incertains`,
      announce: (clipId: string, verdict: string) => `${clipId} : ${verdict}`,
      rerank: 'Apprendre de mes validations',
      sessionLink: 'Session & export',
      rerankHint: 'Validez au moins un clip (oui ou non) pour reclasser.',
      rerankError: 'Reclassement impossible.',
      rerankAnnounce: (iteration: number, up: number, entered: number) =>
        `Résultats reclassés (itération ${String(iteration)}) : ${String(up)} clips remontés, ${String(entered)} nouveaux dans les premiers résultats.`,
    },
    loupe: {
      label: (clipId: string) => `Loupe, clip ${clipId}`,
      close: 'Fermer la loupe',
      simulated: 'Lecture simulée : aucune vidéo réelle',
      play: 'Lecture',
      pause: 'Pause',
      seek: 'Position dans le clip',
      seekValue: (s: string, total: number) => `${s} s sur ${String(total)} s`,
      keyMoment: 'Aller à l’instant clé',
      verdictTitle: 'Votre verdict',
      note: 'Note',
      noteHint: 'Facultative. Enregistrée avec le verdict, exportée dans le CSV.',
      saveError: 'Validation non enregistrée.',
      metadata: 'Métadonnées',
      fields: {
        clip: 'Clip',
        site: 'Site · caméra',
        recordedAt: 'Date et heure locales',
        temperature: 'Température',
        moon: 'Lune',
        period: 'Période',
        species: 'Espèce',
        rank: 'Rang',
        score: 'Score démo',
      },
      day: 'Jour',
      night: 'Nuit (infrarouge)',
      unknown: 'Inconnue',
      species: { chimpanzee: 'Chimpanzé', gorilla: 'Gorille' },
    },
    card: {
      rank: (rank: number) => `#${String(rank).padStart(2, '0')}`,
      scoreLabel: 'score démo',
      scoreTitle: 'Score simulé à partir de données fictives : ce n’est pas un résultat réel.',
      label: (rank: number, clipId: string) => `Rang ${String(rank)}, clip ${clipId}`,
      open: (rank: number, clipId: string) => `Ouvrir le clip ${clipId} (rang ${String(rank)})`,
      rankNew: 'nouveau',
      rankNewLong: 'nouveau dans les premiers résultats',
      rankUp: (n: number) => `monté de ${String(n)} place${n > 1 ? 's' : ''}`,
      rankDown: (n: number) => `descendu de ${String(n)} place${n > 1 ? 's' : ''}`,
    },
    session: {
      title: 'Session & export',
      chooseLabel: 'Recherche',
      iteration: (n: number) => `itération ${String(n)}`,
      createdAt: (date: string) => `lancée le ${date}`,
      noQueriesTitle: 'Aucune session pour l’instant',
      noQueriesBody: 'Lancez une recherche et validez quelques clips : la session apparaîtra ici.',
      goSearch: 'Aller à la recherche',
      noValidationsTitle: 'Aucun clip validé dans cette recherche',
      noValidationsBody: 'Ouvrez la recherche et validez des clips avec Y, N ou U.',
      reviewInSearch: 'Ouvrir la recherche',
      errorTitle: 'Impossible de charger la session',
      tableTitle: 'Clips validés',
      tableCaption: (shown: number, total: number) =>
        `Clips validés : ${String(shown)} affichés sur ${String(total)}`,
      filterLabel: 'Filtrer par verdict',
      filterAll: 'Tous',
      columns: {
        clip: 'Clip',
        verdict: 'Verdict',
        place: 'Site · caméra',
        recordedAt: 'Date et heure locales',
        bestMoment: 'Instant clé',
        note: 'Note',
        validatedAt: 'Validé le',
        actions: 'Actions',
      },
      sortBy: (column: string) => `Trier par ${column}`,
      review: 'Revoir',
      reviewLabel: (clipId: string) => `Revoir le clip ${clipId} dans la loupe`,
      noTimestamp: 'sans horodatage',
      emptyFilter: 'Aucun clip pour ce verdict.',
      exportTitle: 'Export CSV',
      exportIntro:
        'Une ligne par validation, colonnes prêtes pour R : read.csv("fichier.csv"). Valeurs absentes : NA.',
      previewLabel: (n: number) => `Aperçu : en-tête et ${String(n)} premières lignes`,
      download: 'Télécharger le CSV',
      downloadDone: (name: string) => `Fichier ${name} téléchargé.`,
      clockTitle: 'Horloge d’activité 24 h',
      clockIntro: 'Heure locale des clips validés « oui ».',
    },
    clock: {
      label: (summary: string) => `Horloge d’activité sur 24 heures. ${summary}`,
      summary: (start: number, count: number) =>
        `Pic d’activité entre ${String(start)} h et ${String((start + 1) % 24)} h (${String(count)} clip${count > 1 ? 's' : ''}).`,
      total: (n: number) => `clip${n > 1 ? 's' : ''} oui`,
      hover: (hour: number, n: number) =>
        `${String(hour).padStart(2, '0')} h : ${String(n)} clip${n > 1 ? 's' : ''}`,
      excluded: (n: number) =>
        `${String(n)} clip${n > 1 ? 's' : ''} sans horodatage exclu${n > 1 ? 's' : ''}.`,
      empty: 'Aucun clip validé « oui » : l’horloge se remplira au fil des validations.',
      showData: 'Voir les données',
      hideData: 'Masquer les données',
      dataCaption: 'Clips validés « oui » par heure locale',
      hourColumn: 'Heure',
      countColumn: 'Clips oui',
      hourRange: (h: number) =>
        `${String(h).padStart(2, '0')} h – ${String((h + 1) % 24).padStart(2, '0')} h`,
      night: 'nuit',
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
