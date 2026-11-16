import { describe, expect, it } from 'vitest';

import { createRandom, integerBetween } from './random';

const take = (seed: number, n: number) => {
  const random = createRandom(seed);
  return Array.from({ length: n }, random);
};

describe('createRandom', () => {
  it('même graine → même suite', () => {
    expect(take(42, 20)).toEqual(take(42, 20));
  });

  it('graines différentes → suites différentes', () => {
    expect(take(1, 5)).not.toEqual(take(2, 5));
  });

  it('reste dans [0, 1)', () => {
    for (const value of take(7, 10_000)) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it('integerBetween inclut les deux bornes', () => {
    const random = createRandom(3);
    const seen = new Set(Array.from({ length: 500 }, () => integerBetween(random, 1, 3)));
    expect([...seen].sort()).toEqual([1, 2, 3]);
  });
});
