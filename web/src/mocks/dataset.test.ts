import { describe, expect, it } from 'vitest';

import { behaviours } from './behaviours';
import { CLIP_COUNT, generateDataset, isNightHour } from './dataset';
import { moonPhaseAt } from './moon';
import { cameras, sites } from './sites';

const dataset = generateDataset();

describe('generateDataset', () => {
  it('même graine → exactement les mêmes données', () => {
    const again = generateDataset();
    expect(again.clips).toEqual(dataset.clips);
    expect([...again.hidden]).toEqual([...dataset.hidden]);
  });

  it('graine différente → données différentes', () => {
    expect(generateDataset(1).clips).not.toEqual(dataset.clips);
  });

  it('produit 400 clips de 15 s aux identifiants uniques', () => {
    expect(dataset.clips).toHaveLength(CLIP_COUNT);
    expect(new Set(dataset.clips.map((c) => c.id)).size).toBe(CLIP_COUNT);
    expect(dataset.clips.every((c) => c.durationS === 15)).toBe(true);
  });

  it('3 sites, 24 caméras, chaque caméra rattachée au bon site', () => {
    expect(sites.map((s) => s.id)).toEqual(['S01', 'S02', 'S03']);
    expect(cameras).toHaveLength(24);
    for (const clip of dataset.clips) {
      expect(cameras.find((c) => c.id === clip.cameraId)?.siteId).toBe(clip.siteId);
    }
  });

  it("n'expose aucune coordonnée géographique", () => {
    const keys = new Set([...sites, ...dataset.clips].flatMap((o) => Object.keys(o)));
    for (const forbidden of ['lat', 'lon', 'latitude', 'longitude', 'coordinates']) {
      expect(keys.has(forbidden)).toBe(false);
    }
  });

  it('isNight est cohérent avec l’heure enregistrée', () => {
    for (const clip of dataset.clips) {
      if (clip.recordedAt === null) continue;
      const hour = Number(clip.recordedAt.slice(11, 13));
      expect(clip.isNight).toBe(isNightHour(hour));
    }
  });

  it('a plus de clips de jour que de nuit, mais quelques clips de nuit', () => {
    const night = dataset.clips.filter((c) => c.isNight).length;
    expect(night).toBeGreaterThan(CLIP_COUNT * 0.05);
    expect(night).toBeLessThan(CLIP_COUNT * 0.3);
  });

  it('la phase de lune correspond à la date', () => {
    for (const clip of dataset.clips) {
      if (clip.recordedAt === null) {
        expect(clip.moonPhase).toBeNull();
        continue;
      }
      expect(clip.moonPhase).toBeCloseTo(moonPhaseAt(clip.recordedAt), 2);
    }
  });

  it('contient quelques valeurs manquantes, comme les vraies données', () => {
    expect(dataset.clips.some((c) => c.recordedAt === null)).toBe(true);
    expect(dataset.clips.some((c) => c.temperatureC === null)).toBe(true);
    expect(dataset.clips.some((c) => c.species === null)).toBe(true);
  });

  it('températures plausibles', () => {
    for (const clip of dataset.clips) {
      if (clip.temperatureC === null) continue;
      expect(clip.temperatureC).toBeGreaterThan(14);
      expect(clip.temperatureC).toBeLessThan(38);
    }
  });

  it('chaque clip a 1 à 3 comportements connus, « NONE » toujours seul', () => {
    const codes = new Set(behaviours.map((b) => b.code));
    for (const { labels } of dataset.hidden.values()) {
      expect(labels.length).toBeGreaterThanOrEqual(1);
      expect(labels.length).toBeLessThanOrEqual(3);
      expect(labels.every((l) => codes.has(l))).toBe(true);
      if (labels.includes('NONE')) expect(labels).toEqual(['NONE']);
    }
  });
});

describe('éthogramme', () => {
  it('contient les 14 comportements confirmés, codes uniques', () => {
    expect(behaviours).toHaveLength(14);
    expect(new Set(behaviours.map((b) => b.code)).size).toBe(14);
  });
});

describe('moonPhaseAt', () => {
  it('reconnaît des phases connues', () => {
    // Nouvelle lune le 11 janvier 2024, pleine lune le 25 janvier 2024.
    const newMoon = moonPhaseAt('2024-01-11T12:00:00');
    expect(Math.min(newMoon, 1 - newMoon)).toBeLessThan(0.02);
    expect(moonPhaseAt('2024-01-25T18:00:00')).toBeCloseTo(0.5, 1);
  });
});
