import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';

import { VerdictBadge } from '@/components/ui/VerdictBadge';
import { strings } from '@/content/strings';
import type { Verdict } from '@/domain/types';
import { cn } from '@/lib/cn';
import { splitLocalDateTime } from '@/lib/format';

import { sortRows, type SessionRow, type SortDirection, type SortKey } from './session-data';

const t = strings.pages.session;
const c = t.columns;

const columns: readonly { key: SortKey; label: string; numeric?: boolean }[] = [
  { key: 'clipId', label: c.clip },
  { key: 'verdict', label: c.verdict },
  { key: 'place', label: c.place },
  { key: 'recordedAt', label: c.recordedAt },
  { key: 'bestMomentS', label: c.bestMoment, numeric: true },
  { key: 'note', label: c.note },
  { key: 'validatedAt', label: c.validatedAt },
];

const filters: readonly (Verdict | 'all')[] = ['all', 'yes', 'no', 'unsure'];

/** « 17/11/2026 10:05 » : heure de la MACHINE de l'utilisateur (pas de la caméra). */
const formatValidatedAt = (iso: string) =>
  new Date(iso).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });

interface ValidationsTableProps {
  rows: readonly SessionRow[];
  queryId: string;
}

/** Tableau des clips validés : tri par colonne et filtre par verdict. */
export function ValidationsTable({ rows, queryId }: ValidationsTableProps) {
  const [sort, setSort] = useState<{ key: SortKey; direction: SortDirection }>({
    key: 'validatedAt',
    direction: 'descending',
  });
  const [filter, setFilter] = useState<Verdict | 'all'>('all');

  const counts = { all: rows.length, yes: 0, no: 0, unsure: 0 };
  for (const row of rows) counts[row.verdict]++;

  const visible = sortRows(
    filter === 'all' ? rows : rows.filter((r) => r.verdict === filter),
    sort.key,
    sort.direction,
  );

  const toggleSort = (key: SortKey) => {
    setSort((current) =>
      current.key === key
        ? { key, direction: current.direction === 'ascending' ? 'descending' : 'ascending' }
        : { key, direction: 'ascending' },
    );
  };

  return (
    <div className="grid gap-3">
      {/* Filtre : groupe de boutons à bascule, avec le nombre de clips concernés. */}
      <div role="group" aria-label={t.filterLabel} className="flex flex-wrap gap-1.5">
        {filters.map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={filter === value}
            onClick={() => {
              setFilter(value);
            }}
            className={cn(
              'h-8 rounded-md border px-3 text-sm transition-colors duration-150',
              filter === value
                ? 'border-accent bg-surface-raised text-ink'
                : 'border-line text-ink-muted hover:text-ink',
            )}
          >
            {value === 'all' ? t.filterAll : strings.verdict[value]}
            <span className="ml-1.5 font-mono text-xs text-ink-muted">{counts[value]}</span>
          </button>
        ))}
      </div>

      {/* Défilement horizontal si l'écran est étroit, plutôt qu'un tableau tronqué. */}
      <div className="overflow-x-auto rounded-md border border-line">
        <table className="w-full min-w-[52rem] text-sm">
          <caption className="sr-only">{t.tableCaption(visible.length, rows.length)}</caption>
          <thead className="bg-surface text-left text-xs text-ink-muted">
            <tr>
              {columns.map((column) => {
                const active = sort.key === column.key;
                const Icon = !active
                  ? ArrowUpDown
                  : sort.direction === 'ascending'
                    ? ArrowUp
                    : ArrowDown;
                return (
                  <th
                    key={column.key}
                    scope="col"
                    // aria-sort : annonce la colonne triée et le sens du tri.
                    aria-sort={active ? sort.direction : undefined}
                    className={cn('px-3 py-2 font-normal', column.numeric && 'text-right')}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        toggleSort(column.key);
                      }}
                      className={cn(
                        'inline-flex items-center gap-1 rounded-sm hover:text-ink',
                        active && 'text-ink',
                      )}
                    >
                      {column.label}
                      <Icon aria-hidden="true" className="size-3" />
                    </button>
                  </th>
                );
              })}
              <th scope="col" className="px-3 py-2 font-normal">
                <span className="sr-only">{c.actions}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => {
              const { date, time } = splitLocalDateTime(row.recordedAt);
              return (
                <tr key={row.clipId} className="border-t border-line hover:bg-surface">
                  <th scope="row" className="px-3 py-2 text-left font-mono text-xs font-normal">
                    {row.clipId}
                  </th>
                  <td className="px-3 py-2">
                    <VerdictBadge verdict={row.verdict} size="sm" />
                  </td>
                  <td className="px-3 py-2 font-mono text-xs">
                    {row.siteId} · {row.cameraId}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs">
                    {row.recordedAt ? (
                      `${date} ${time}`
                    ) : (
                      <span className="text-ink-muted">{t.noTimestamp}</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-xs">
                    {row.bestMomentS === null ? '—' : `${String(row.bestMomentS)} s`}
                  </td>
                  <td className="max-w-48 truncate px-3 py-2 text-ink-muted" title={row.note}>
                    {row.note || '—'}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs whitespace-nowrap text-ink-muted">
                    {formatValidatedAt(row.validatedAt)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <Link
                      to={`/recherche?q=${encodeURIComponent(queryId)}&clip=${row.clipId}`}
                      aria-label={t.reviewLabel(row.clipId)}
                      className="text-xs text-accent underline underline-offset-4"
                    >
                      {t.review}
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {visible.length === 0 && (
          <p className="px-3 py-6 text-center text-sm text-ink-muted">{t.emptyFilter}</p>
        )}
      </div>
    </div>
  );
}
