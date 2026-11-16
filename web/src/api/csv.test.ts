import { describe, expect, expectTypeOf, it } from 'vitest';

import type { ExportRow } from '@/domain/types';
import { parseCsv } from '@/test/parse-csv';

import { escapeCell, EXPORT_COLUMNS, toCsv } from './csv';

const row: ExportRow = {
  behaviour_code: 'TOOL',
  query_text: 'casse des noix, avec une "pierre"',
  clip_id: 'C0042',
  site_id: 'S03',
  camera_id: 'CAM-17',
  species: 'chimpanzee',
  recorded_at: '2025-03-04T05:12:08',
  best_moment_s: 7,
  verdict: 'yes',
  validated_at: '2026-11-16T10:00:00.000Z',
  note: 'ligne 1\nligne 2',
};

describe('EXPORT_COLUMNS', () => {
  it("contient exactement les clés d'ExportRow, sans doublon", () => {
    // Vérification au niveau du TYPE : une clé oubliée ferait échouer typecheck.
    expectTypeOf<(typeof EXPORT_COLUMNS)[number]>().toEqualTypeOf<keyof ExportRow>();
    expect(new Set(EXPORT_COLUMNS).size).toBe(EXPORT_COLUMNS.length);
    expect([...EXPORT_COLUMNS].sort()).toEqual(Object.keys(row).sort());
  });
});

describe('escapeCell', () => {
  it.each([
    ['simple', 'simple'],
    ['a,b', '"a,b"'],
    ['il a dit "oui"', '"il a dit ""oui"""'],
    ['deux\nlignes', '"deux\nlignes"'],
    [7, '7'],
    [null, 'NA'],
  ] as const)('%j → %s', (input, expected) => {
    expect(escapeCell(input)).toBe(expected);
  });
});

describe('toCsv', () => {
  it("commence par l'en-tête et termine par un saut de ligne CRLF", () => {
    const csv = toCsv([]);
    expect(csv).toBe(`${EXPORT_COLUMNS.join(',')}\r\n`);
  });

  it('aller-retour : relire le CSV redonne les valeurs exportées', () => {
    const [header, values] = parseCsv(toCsv([row, { ...row, note: null, behaviour_code: null }]));
    expect(header).toEqual([...EXPORT_COLUMNS]);
    expect(values).toEqual(EXPORT_COLUMNS.map((c) => String(row[c])));
  });

  it('écrit NA pour une valeur absente (lu comme NA par R)', () => {
    const lines = parseCsv(toCsv([{ ...row, note: null, behaviour_code: null }]));
    expect(lines[1]?.[0]).toBe('NA');
    expect(lines[1]?.at(-1)).toBe('NA');
  });

  it("n'ajoute pas de BOM (sinon R renomme la première colonne)", () => {
    expect(toCsv([row]).charCodeAt(0)).not.toBe(0xfeff);
  });
});
