import { describe, expect, it } from 'vitest';

import { moonLitPath } from './moon-geometry';

/** Extrait [rx, sweepExterieur, sweepTerminateur] du chemin SVG. */
function parse(path: string) {
  const arcs = [...path.matchAll(/A ([\d.]+) [\d.]+ 0 0 (\d)/g)];
  return {
    outerSweep: Number(arcs[0]?.[2]),
    terminatorRx: Number(arcs[1]?.[1]),
    innerSweep: Number(arcs[1]?.[2]),
  };
}

describe('moonLitPath', () => {
  it('nouvelle lune : les deux arcs se superposent (surface nulle)', () => {
    const { outerSweep, innerSweep, terminatorRx } = parse(moonLitPath(0, 8, 8, 6));
    expect(terminatorRx).toBeCloseTo(6);
    expect(outerSweep).toBe(1);
    expect(innerSweep).toBe(0); // repart par le même côté
  });

  it('quarts de lune : le terminateur est une ligne droite', () => {
    expect(parse(moonLitPath(0.25, 8, 8, 6)).terminatorRx).toBeCloseTo(0);
    expect(parse(moonLitPath(0.75, 8, 8, 6)).terminatorRx).toBeCloseTo(0);
  });

  it('pleine lune : les deux arcs forment un disque complet', () => {
    const { outerSweep, innerSweep, terminatorRx } = parse(moonLitPath(0.5, 8, 8, 6));
    expect(terminatorRx).toBeCloseTo(6);
    expect(outerSweep).toBe(0);
    expect(innerSweep).toBe(0); // revient par le côté opposé
  });

  it('lune croissante éclairée à droite, décroissante à gauche', () => {
    expect(parse(moonLitPath(0.1, 8, 8, 6)).outerSweep).toBe(1);
    expect(parse(moonLitPath(0.9, 8, 8, 6)).outerSweep).toBe(0);
  });
});
