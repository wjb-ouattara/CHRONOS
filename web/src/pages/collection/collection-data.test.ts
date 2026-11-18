import { describe, expect, it } from 'vitest';

import type { Clip, Site } from '@/domain/types';

import {
  buildActogram,
  collectionStats,
  formatDuration,
  formatMonth,
  monthlyTable,
  monthTicks,
  siteSummaries,
} from './collection-data';

const sites: Site[] = [
  { id: 'S01', label: 'Site 01', habitat: 'forest' },
  { id: 'S02', label: 'Site 02', habitat: 'savanna' },
];

const clip = (
  id: string,
  siteId: string,
  cameraId: string,
  recordedAt: string | null,
  isNight: boolean,
): Clip => ({
  id,
  siteId,
  cameraId,
  recordedAt,
  durationS: 15,
  isNight,
  temperatureC: 20,
  moonPhase: null,
  species: null,
  thumbnailSeed: 1,
});

const clips = [
  clip('C1', 'S01', 'CAM-01', '2024-01-10T08:30:00', false),
  clip('C2', 'S01', 'CAM-02', '2024-01-11T21:15:00', true),
  clip('C3', 'S02', 'CAM-09', '2024-03-02T14:00:00', false),
  clip('C4', 'S02', 'CAM-09', null, false),
];

describe('collectionStats', () => {
  it('résume la collection', () => {
    expect(collectionStats(clips, sites)).toEqual({
      clipCount: 4,
      totalSeconds: 60,
      siteCount: 2,
      cameraCount: 3,
      firstDay: '2024-01-10',
      lastDay: '2024-03-02',
      nightCount: 1,
      dayCount: 3,
      missingTimestamp: 1,
    });
  });
});

describe('formatDuration / formatMonth', () => {
  it('formate une durée en heures et minutes', () => {
    expect(formatDuration(6000)).toBe('1 h 40 min');
    expect(formatDuration(600)).toBe('10 min');
  });
  it('formate un mois en français, sans décalage de fuseau', () => {
    expect(formatMonth('2024-01-31')).toBe('janv. 2024');
    expect(formatMonth('2025-06')).toBe('juin 2025');
  });
});

describe('buildActogram', () => {
  const actogram = buildActogram(clips);

  it('un point par clip horodaté, les autres exclus et comptés', () => {
    expect(actogram.points).toHaveLength(3);
    expect(actogram.excluded).toBe(1);
  });

  it('place chaque clip au bon jour et à la bonne heure', () => {
    const c2 = actogram.points.find((p) => p.clipId === 'C2');
    expect(c2?.dayIndex).toBe(1);
    expect(c2?.hour).toBeCloseTo(21.25);
    expect(actogram.spanDays).toBe(53); // du 10 janvier au 2 mars 2024 inclus
  });

  it('graduations mensuelles et tableau par mois cohérents', () => {
    expect(monthTicks(actogram.firstDayMs, actogram.spanDays).map((t) => t.month)).toEqual([
      '2024-02',
      '2024-03',
    ]);
    const table = monthlyTable(actogram.points);
    expect(table).toEqual([
      { month: '2024-01', day: 1, night: 1, total: 2 },
      { month: '2024-03', day: 1, night: 0, total: 1 },
    ]);
  });
});

describe('siteSummaries', () => {
  it('compte clips, nuits et clips par caméra pour chaque site', () => {
    const [s1, s2] = siteSummaries(clips, sites);
    expect(s1).toMatchObject({ clipCount: 2, nightCount: 1 });
    expect(s1?.cameras).toEqual([
      { cameraId: 'CAM-01', clipCount: 1 },
      { cameraId: 'CAM-02', clipCount: 1 },
    ]);
    expect(s2?.cameras).toEqual([{ cameraId: 'CAM-09', clipCount: 2 }]);
  });
});
