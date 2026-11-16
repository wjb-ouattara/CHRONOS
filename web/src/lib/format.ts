// Mise en forme des données pour l'affichage. Fonctions pures, testées.
import { strings } from '@/content/strings';

const MISSING = '--';

/**
 * Découpe une date-heure locale "2025-03-04T05:12:08" pour la bande caméra.
 *
 * On lit la chaîne directement, SANS passer par `new Date()` : Date
 * interpréterait l'heure dans le fuseau du navigateur, et un chercheur à
 * Paris verrait des heures décalées par rapport à la caméra au Gabon.
 */
export function splitLocalDateTime(recordedAt: string | null): { date: string; time: string } {
  const match = recordedAt ? /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2})/.exec(recordedAt) : null;
  if (!match?.[1] || !match[2]) return { date: '----------', time: '--:--:--' };
  return { date: match[1], time: match[2] };
}

/** Style caméra-piège : « 18°C », « −3°C », « --°C » si absent. */
export function formatTemperature(celsius: number | null): string {
  if (celsius === null || !Number.isFinite(celsius)) return `${MISSING}°C`;
  const rounded = Math.round(celsius);
  // Vrai signe moins (U+2212), plus lisible que le tiret en monospace.
  return `${rounded < 0 ? '−' : ''}${String(Math.abs(rounded))}°C`;
}

/** Nom de la phase de lune (8 phases), 0 = nouvelle lune, 0,5 = pleine lune. */
export function moonPhaseName(phase: number | null): string {
  if (phase === null || !Number.isFinite(phase)) return strings.moon.unknown;
  const index = Math.round((((phase % 1) + 1) % 1) * 8) % 8;
  return strings.moon.phases[index] ?? strings.moon.unknown;
}

/** Score 0..1 affiché à la française : « 0,82 ». */
export function formatScore(score: number): string {
  return score.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
