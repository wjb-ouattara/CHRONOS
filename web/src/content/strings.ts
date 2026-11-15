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
} as const;
