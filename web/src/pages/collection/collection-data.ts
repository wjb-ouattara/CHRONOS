// Logique PURE de l'écran Collection (aucun React) : testée séparément.

import type { Clip, Site } from '@/domain/types';

const DAY_MS = 86_400_000;

/** Jour (UTC à minuit) et heure décimale lus dans la chaîne locale, sans conversion de fuseau. */
function parseLocal(recordedAt: string): { dayMs: number; hour: number } {
  const [y, mo, d] = [recordedAt.slice(0, 4), recordedAt.slice(5, 7), recordedAt.slice(8, 10)].map(
    Number,
  );
  const [h, mi, s] = [
    recordedAt.slice(11, 13),
    recordedAt.slice(14, 16),
    recordedAt.slice(17, 19),
  ].map(Number);
  return {
    dayMs: Date.UTC(y ?? 0, (mo ?? 1) - 1, d ?? 1),
    hour: (h ?? 0) + (mi ?? 0) / 60 + (s ?? 0) / 3600,
  };
}

// ---------------------------------------------------------------------------
// Chiffres clés

export interface CollectionStats {
  clipCount: number;
  totalSeconds: number;
  siteCount: number;
  cameraCount: number;
  /** "AAAA-MM-JJ" du premier et du dernier clip horodaté, ou null. */
  firstDay: string | null;
  lastDay: string | null;
  nightCount: number;
  dayCount: number;
  missingTimestamp: number;
}

export function collectionStats(clips: readonly Clip[], sites: readonly Site[]): CollectionStats {
  const days = clips
    .map((c) => c.recordedAt?.slice(0, 10))
    .filter((d): d is string => d !== undefined)
    .sort();
  const nightCount = clips.filter((c) => c.isNight).length;
  return {
    clipCount: clips.length,
    totalSeconds: clips.reduce((sum, c) => sum + c.durationS, 0),
    siteCount: sites.length,
    cameraCount: new Set(clips.map((c) => c.cameraId)).size,
    firstDay: days[0] ?? null,
    lastDay: days.at(-1) ?? null,
    nightCount,
    dayCount: clips.length - nightCount,
    missingTimestamp: clips.filter((c) => c.recordedAt === null).length,
  };
}

/** 6 000 s → « 1 h 40 min ». */
export function formatDuration(totalSeconds: number): string {
  const minutes = Math.round(totalSeconds / 60);
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h === 0 ? `${String(m)} min` : `${String(h)} h ${String(m).padStart(2, '0')} min`;
}

/** "2024-01" ou "2024-01-15" → « janv. 2024 » (calcul en UTC : pas de décalage de fuseau). */
export function formatMonth(isoDay: string): string {
  const date = new Date(Date.UTC(Number(isoDay.slice(0, 4)), Number(isoDay.slice(5, 7)) - 1, 1));
  return date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric', timeZone: 'UTC' });
}

// ---------------------------------------------------------------------------
// Frise (actogramme)

export interface ActogramPoint {
  clipId: string;
  siteId: string;
  cameraId: string;
  recordedAt: string;
  /** Jours écoulés depuis le premier clip. */
  dayIndex: number;
  /** Heure locale décimale, 0 ≤ hour < 24. */
  hour: number;
  isNight: boolean;
}

export interface Actogram {
  points: ActogramPoint[];
  /** Nombre de jours couverts (largeur de l'axe). */
  spanDays: number;
  firstDayMs: number;
  /** Clips sans horodatage, exclus (et signalés). */
  excluded: number;
}

export function buildActogram(clips: readonly Clip[]): Actogram {
  const dated = clips.flatMap((clip) =>
    clip.recordedAt === null ? [] : [{ clip, ...parseLocal(clip.recordedAt) }],
  );
  const firstDayMs = Math.min(...dated.map((d) => d.dayMs));
  const lastDayMs = Math.max(...dated.map((d) => d.dayMs));
  return {
    points: dated.map(({ clip, dayMs, hour }) => ({
      clipId: clip.id,
      siteId: clip.siteId,
      cameraId: clip.cameraId,
      recordedAt: clip.recordedAt ?? '',
      dayIndex: Math.round((dayMs - firstDayMs) / DAY_MS),
      hour,
      isNight: clip.isNight,
    })),
    spanDays: dated.length === 0 ? 0 : Math.round((lastDayMs - firstDayMs) / DAY_MS) + 1,
    firstDayMs: dated.length === 0 ? 0 : firstDayMs,
    excluded: clips.length - dated.length,
  };
}

/** Début de chaque mois couvert, en jours depuis le premier clip (graduations de l'axe). */
export function monthTicks(
  firstDayMs: number,
  spanDays: number,
): { dayIndex: number; month: string }[] {
  const ticks: { dayIndex: number; month: string }[] = [];
  const first = new Date(firstDayMs);
  let cursor = Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 1);
  const end = firstDayMs + spanDays * DAY_MS;
  while (cursor < end) {
    const d = new Date(cursor);
    ticks.push({
      dayIndex: Math.round((cursor - firstDayMs) / DAY_MS),
      month: `${String(d.getUTCFullYear())}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`,
    });
    cursor = Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1);
  }
  return ticks;
}

/** Vue tableau de la frise : clips de jour et de nuit par mois. */
export function monthlyTable(
  points: readonly ActogramPoint[],
): { month: string; day: number; night: number; total: number }[] {
  const byMonth = new Map<string, { day: number; night: number }>();
  for (const p of points) {
    const month = p.recordedAt.slice(0, 7);
    const row = byMonth.get(month) ?? { day: 0, night: 0 };
    if (p.isNight) row.night++;
    else row.day++;
    byMonth.set(month, row);
  }
  return [...byMonth.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, { day, night }]) => ({ month, day, night, total: day + night }));
}

// ---------------------------------------------------------------------------
// Sites

export interface SiteSummary {
  site: Site;
  clipCount: number;
  nightCount: number;
  cameras: { cameraId: string; clipCount: number }[];
}

export function siteSummaries(clips: readonly Clip[], sites: readonly Site[]): SiteSummary[] {
  return sites.map((site) => {
    const own = clips.filter((c) => c.siteId === site.id);
    const perCamera = new Map<string, number>();
    for (const c of own) perCamera.set(c.cameraId, (perCamera.get(c.cameraId) ?? 0) + 1);
    return {
      site,
      clipCount: own.length,
      nightCount: own.filter((c) => c.isNight).length,
      cameras: [...perCamera.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([cameraId, clipCount]) => ({ cameraId, clipCount })),
    };
  });
}
