// Export CSV, pensé pour R (`read.csv()` ou `readr::read_csv()`).
//
// Choix :
//  - séparateur virgule et point décimal : défauts de R ;
//  - valeur absente → NA : reconnu nativement par R (`na.strings = "NA"`) ;
//  - UTF-8 SANS BOM : un BOM ferait apparaître « ï..behaviour_code » comme
//    nom de la première colonne dans read.csv() ;
//  - fins de ligne CRLF et échappement conformes à la norme RFC 4180.

import type { ExportRow } from '@/domain/types';

/**
 * Ordre des colonnes. `satisfies` + le test de csv.test.ts garantissent que
 * la liste contient exactement les clés d'ExportRow, ni plus ni moins.
 */
export const EXPORT_COLUMNS = [
  'behaviour_code',
  'query_text',
  'clip_id',
  'site_id',
  'camera_id',
  'species',
  'recorded_at',
  'best_moment_s',
  'verdict',
  'validated_at',
  'note',
] as const satisfies readonly (keyof ExportRow)[];

/** Une cellule : entourée de guillemets si elle contient , " ou un retour à la ligne. */
export function escapeCell(value: string | number | null): string {
  if (value === null) return 'NA';
  const text = String(value);
  // Les guillemets internes sont doublés : il a dit "oui" → "il a dit ""oui"""
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function toCsv(rows: readonly ExportRow[]): string {
  const lines = [
    EXPORT_COLUMNS.join(','),
    ...rows.map((row) => EXPORT_COLUMNS.map((column) => escapeCell(row[column])).join(',')),
  ];
  return `${lines.join('\r\n')}\r\n`;
}
