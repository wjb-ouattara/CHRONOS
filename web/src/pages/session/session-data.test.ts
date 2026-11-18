import { describe, expect, it } from 'vitest';

import type { Clip, SearchQuery, Validation } from '@/domain/types';

import { buildRows, exportFileName, hourlyActivity, peakHour, sortRows } from './session-data';

const clip = (id: string, recordedAt: string | null): Clip => ({
  id,
  siteId: 'S01',
  cameraId: `CAM-0${id.slice(-1)}`,
  recordedAt,
  durationS: 15,
  isNight: false,
  temperatureC: 20,
  moonPhase: 0.5,
  species: 'chimpanzee',
  thumbnailSeed: 1,
});

const validation = (clipId: string, verdict: Validation['verdict'], note?: string): Validation => ({
  queryId: 'q1',
  clipId,
  verdict,
  validatedAt: `2026-11-17T10:00:0${clipId.slice(-1)}.000Z`,
  ...(note ? { note } : {}),
});

const clips = new Map(
  [
    clip('C1', '2025-03-04T05:12:08'),
    clip('C2', '2025-03-04T05:59:00'),
    clip('C3', '2025-03-04T17:00:00'),
    clip('C4', null),
  ].map((c) => [c.id, c]),
);

describe('hourlyActivity', () => {
  it('compte les « oui » par heure locale de la caméra, exclut les clips sans heure', () => {
    const activity = hourlyActivity(
      [
        validation('C1', 'yes'),
        validation('C2', 'yes'),
        validation('C3', 'no'), // « non » : ignoré
        validation('C4', 'yes'), // sans horodatage : exclu
      ],
      clips,
    );
    expect(activity.counts).toHaveLength(24);
    expect(activity.counts[5]).toBe(2);
    expect(activity.counts[17]).toBe(0);
    expect(activity.total).toBe(2);
    expect(activity.excluded).toBe(1);
  });

  it('peakHour : heure la plus active, ou null si aucune donnée', () => {
    const counts = Array.from({ length: 24 }, (_, h) => (h === 8 ? 3 : h === 16 ? 2 : 0));
    expect(peakHour(counts)).toBe(8);
    expect(peakHour(Array.from({ length: 24 }, () => 0))).toBeNull();
  });
});

describe('tableau', () => {
  const rows = buildRows(
    [validation('C1', 'no', 'flou'), validation('C2', 'yes'), validation('C4', 'unsure')],
    clips,
    [
      { clipId: 'C1', rank: 1, score: 0.9, bestMomentS: 9, secondScores: [] },
      { clipId: 'C2', rank: 2, score: 0.8, bestMomentS: 3, secondScores: [] },
    ],
  );

  it('joint validation, clip et instant clé', () => {
    expect(rows.find((r) => r.clipId === 'C1')).toMatchObject({
      verdict: 'no',
      note: 'flou',
      bestMomentS: 9,
      cameraId: 'CAM-01',
    });
    expect(rows.find((r) => r.clipId === 'C4')?.bestMomentS).toBeNull();
  });

  it('trie dans les deux sens, valeurs absentes toujours à la fin', () => {
    const asc = sortRows(rows, 'bestMomentS', 'ascending').map((r) => r.clipId);
    const desc = sortRows(rows, 'bestMomentS', 'descending').map((r) => r.clipId);
    expect(asc).toEqual(['C2', 'C1', 'C4']);
    expect(desc).toEqual(['C1', 'C2', 'C4']);
  });

  it('trie les verdicts dans un ordre lisible (oui, incertain, non)', () => {
    expect(sortRows(rows, 'verdict', 'ascending').map((r) => r.verdict)).toEqual([
      'yes',
      'unsure',
      'no',
    ]);
  });

  it('ne modifie pas le tableau d’origine', () => {
    const before = rows.map((r) => r.clipId);
    sortRows(rows, 'clipId', 'descending');
    expect(rows.map((r) => r.clipId)).toEqual(before);
  });
});

describe('exportFileName', () => {
  const query: SearchQuery = { id: 'q1', text: '', behaviourCode: 'TOOL', createdAt: '' };
  it('utilise le code du comportement et la date locale', () => {
    expect(exportFileName(query, new Date(2026, 10, 17, 9, 30))).toBe(
      'chronos_TOOL_2026-11-17.csv',
    );
  });
  it('recherche libre : nom générique', () => {
    expect(
      exportFileName({ ...query, behaviourCode: null, text: 'outil' }, new Date(2026, 0, 5)),
    ).toBe('chronos_recherche-libre_2026-01-05.csv');
  });
});
