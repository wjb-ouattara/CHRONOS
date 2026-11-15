import { describe, expect, it } from 'vitest';

import { contrastRatio, parseColor } from './contrast';

describe('contrastRatio', () => {
  it('donne 21:1 entre le noir et le blanc', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5);
  });

  it('donne 1:1 entre deux couleurs identiques', () => {
    expect(contrastRatio('#c6f36b', '#c6f36b')).toBe(1);
  });

  it("ne dépend pas de l'ordre des couleurs", () => {
    expect(contrastRatio('#1c2a21', '#f3efe4')).toBe(contrastRatio('#f3efe4', '#1c2a21'));
  });

  it('retrouve une valeur de référence connue (#767676 sur blanc ≈ 4,54)', () => {
    expect(contrastRatio('#767676', '#ffffff')).toBeCloseTo(4.54, 2);
  });
});

describe('parseColor', () => {
  it('lit les formes hexadécimale et rgb()', () => {
    expect(parseColor('#0B100D')).toEqual([11, 16, 13]);
    expect(parseColor('rgb(11, 16, 13)')).toEqual([11, 16, 13]);
  });

  it('refuse une couleur inconnue', () => {
    expect(() => parseColor('vert')).toThrow();
  });
});
