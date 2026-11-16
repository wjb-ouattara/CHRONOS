import { describe, expect, it } from 'vitest';

import { formatScore, formatTemperature, moonPhaseName, splitLocalDateTime } from './format';

describe('splitLocalDateTime', () => {
  it("garde l'heure de la caméra telle quelle, sans conversion de fuseau", () => {
    expect(splitLocalDateTime('2025-03-04T05:12:08')).toEqual({
      date: '2025-03-04',
      time: '05:12:08',
    });
  });

  it('affiche des tirets si la date manque ou est illisible', () => {
    expect(splitLocalDateTime(null)).toEqual({ date: '----------', time: '--:--:--' });
    expect(splitLocalDateTime('hier')).toEqual({ date: '----------', time: '--:--:--' });
  });
});

describe('formatTemperature', () => {
  it('arrondit et utilise un vrai signe moins', () => {
    expect(formatTemperature(18.4)).toBe('18°C');
    expect(formatTemperature(-2.6)).toBe('−3°C');
  });

  it('affiche des tirets si la température manque', () => {
    expect(formatTemperature(null)).toBe('--°C');
  });
});

describe('moonPhaseName', () => {
  it.each([
    [0, 'Nouvelle lune'],
    [0.25, 'Premier quartier'],
    [0.5, 'Pleine lune'],
    [0.75, 'Dernier quartier'],
    [0.99, 'Nouvelle lune'],
    [null, 'Phase inconnue'],
  ])('%s → %s', (phase, name) => {
    expect(moonPhaseName(phase)).toBe(name);
  });
});

describe('formatScore', () => {
  it('utilise la virgule décimale', () => {
    expect(formatScore(0.8234)).toBe('0,82');
  });
});
