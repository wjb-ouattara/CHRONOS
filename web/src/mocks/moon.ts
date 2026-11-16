// Phase de lune calculée à partir de la date (approximation astronomique
// simple, précise à quelques heures près : largement suffisant ici).

/** Durée moyenne d'un cycle lunaire (mois synodique), en jours. */
export const SYNODIC_MONTH_DAYS = 29.530588853;

/** Nouvelle lune de référence : 6 janvier 2000, 18 h 14 UTC. */
const REFERENCE_NEW_MOON_MS = Date.UTC(2000, 0, 6, 18, 14);

const DAY_MS = 86_400_000;

/**
 * Phase de 0 à 1 (0 = nouvelle lune, 0,5 = pleine lune) pour une date-heure
 * locale "AAAA-MM-JJTHH:MM:SS". On la traite comme de l'UTC : l'erreur
 * (quelques heures au plus) est négligeable devant un cycle de 29,5 jours.
 */
export function moonPhaseAt(localDateTime: string): number {
  const ms = Date.parse(`${localDateTime}Z`);
  const days = (ms - REFERENCE_NEW_MOON_MS) / DAY_MS;
  const cycles = days / SYNODIC_MONTH_DAYS;
  return cycles - Math.floor(cycles); // partie fractionnaire, toujours dans [0, 1)
}
