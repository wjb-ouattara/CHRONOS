// Réglages de mouvement partagés par les animations Motion (JavaScript).
// La courbe reprend exactement --ease-field (index.css) : un seul langage de mouvement.

/** cubic-bezier(0.2, 0, 0, 1) : départ franc, arrivée douce, aucun rebond. */
export const EASE_FIELD = [0.2, 0, 0, 1] as const;

/**
 * Durées en secondes. La règle générale reste 150-250 ms ; le reclassement
 * est l'unique exception (moment fort) : des cartes qui traversent la grille
 * sur plusieurs rangées doivent rester suivables à l'œil.
 */
export const DURATION = {
  fade: 0.2,
  reorder: 0.35,
  sweep: 0.6,
} as const;
