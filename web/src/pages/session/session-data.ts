// Logique PURE de l'écran Session (aucun React) : facile à tester.

import type { Clip, SearchQuery, SearchResult, Validation, Verdict } from '@/domain/types';

// ---------------------------------------------------------------------------
// Horloge 24 h

export interface HourlyActivity {
  /** 24 cases : nombre de clips « oui » par heure locale (0 = minuit-1 h). */
  counts: number[];
  /** Clips « oui » sans horodatage, exclus de l'horloge (et signalés). */
  excluded: number;
  total: number;
}

export function hourlyActivity(
  validations: readonly Validation[],
  clipsById: ReadonlyMap<string, Clip>,
): HourlyActivity {
  const counts = Array.from({ length: 24 }, () => 0);
  let excluded = 0;
  for (const v of validations) {
    if (v.verdict !== 'yes') continue;
    const recordedAt = clipsById.get(v.clipId)?.recordedAt ?? null;
    // Heure lue directement dans la chaîne locale "AAAA-MM-JJTHH:…" (pas de fuseau).
    const hour = recordedAt === null ? Number.NaN : Number(recordedAt.slice(11, 13));
    if (Number.isInteger(hour) && hour >= 0 && hour < 24) counts[hour] = (counts[hour] ?? 0) + 1;
    else excluded++;
  }
  return { counts, excluded, total: counts.reduce((a, b) => a + b, 0) };
}

/** Heure la plus active (la première en cas d'égalité), ou null si tout est vide. */
export function peakHour(counts: readonly number[]): number | null {
  const max = Math.max(...counts);
  return max > 0 ? counts.indexOf(max) : null;
}

// ---------------------------------------------------------------------------
// Tableau des validations

export interface SessionRow {
  clipId: string;
  verdict: Verdict;
  siteId: string;
  cameraId: string;
  recordedAt: string | null;
  bestMomentS: number | null;
  note: string;
  validatedAt: string;
}

export function buildRows(
  validations: readonly Validation[],
  clipsById: ReadonlyMap<string, Clip>,
  results: readonly SearchResult[],
): SessionRow[] {
  const best = new Map(results.map((r) => [r.clipId, r.bestMomentS]));
  return validations.flatMap((v) => {
    const clip = clipsById.get(v.clipId);
    if (!clip) return [];
    return [
      {
        clipId: v.clipId,
        verdict: v.verdict,
        siteId: clip.siteId,
        cameraId: clip.cameraId,
        recordedAt: clip.recordedAt,
        bestMomentS: best.get(v.clipId) ?? null,
        note: v.note ?? '',
        validatedAt: v.validatedAt,
      },
    ];
  });
}

export type SortKey =
  'clipId' | 'verdict' | 'place' | 'recordedAt' | 'bestMomentS' | 'note' | 'validatedAt';
export type SortDirection = 'ascending' | 'descending';

const verdictOrder: Record<Verdict, number> = { yes: 0, unsure: 1, no: 2 };

function sortValue(row: SessionRow, key: SortKey): string | number | null {
  switch (key) {
    case 'place':
      return `${row.siteId} ${row.cameraId}`;
    case 'verdict':
      return verdictOrder[row.verdict];
    case 'note':
      return row.note === '' ? null : row.note;
    default:
      return row[key];
  }
}

/** Trie sans modifier l'original. Les valeurs absentes vont toujours à la fin. */
export function sortRows(
  rows: readonly SessionRow[],
  key: SortKey,
  direction: SortDirection,
): SessionRow[] {
  const sign = direction === 'ascending' ? 1 : -1;
  return [...rows].sort((a, b) => {
    const va = sortValue(a, key);
    const vb = sortValue(b, key);
    if (va === null && vb === null) return 0;
    if (va === null) return 1;
    if (vb === null) return -1;
    const order =
      typeof va === 'number' && typeof vb === 'number'
        ? va - vb
        : String(va).localeCompare(String(vb), 'fr');
    return order * sign || a.clipId.localeCompare(b.clipId); // égalité : ordre stable
  });
}

// ---------------------------------------------------------------------------
// Export

/** « chronos_TOOL_2026-11-17.csv » ou « chronos_recherche-libre_2026-11-17.csv ». */
export function exportFileName(query: SearchQuery, now: Date): string {
  // Date LOCALE de l'utilisateur (toISOString donnerait la date UTC, fausse vers minuit).
  const pad = (n: number) => String(n).padStart(2, '0');
  const day = `${String(now.getFullYear())}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  return `chronos_${query.behaviourCode ?? 'recherche-libre'}_${day}.csv`;
}
