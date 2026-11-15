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
  },
  home: {
    designLink: 'Voir le système de design',
  },
} as const;
