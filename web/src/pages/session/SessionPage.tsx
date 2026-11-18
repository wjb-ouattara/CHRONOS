import { Download, FileSpreadsheet, Search } from 'lucide-react';
import { useId, useState } from 'react';
import { Link, useSearchParams } from 'react-router';

import {
  useBehaviours,
  useClipsById,
  useExportCsv,
  useQueryList,
  useSearchResults,
  useValidations,
} from '@/api/queries';
import { ActivityClock } from '@/components/domain/ActivityClock';
import { Button } from '@/components/ui/Button';
import { PageTitle } from '@/components/ui/PageTitle';
import { EmptyState, ErrorState, LoadingRegion, Skeleton } from '@/components/ui/states';
import { strings } from '@/content/strings';
import type { Behaviour, SearchQuery } from '@/domain/types';
import { downloadText } from '@/lib/download';

import { buildRows, exportFileName, hourlyActivity } from './session-data';
import { ValidationsTable } from './ValidationsTable';

const t = strings.pages.session;

/** Lignes de données montrées dans l'aperçu (en plus de l'en-tête). */
export const PREVIEW_ROWS = 5;

const queryTitle = (query: SearchQuery, behaviours: readonly Behaviour[] | undefined) =>
  query.behaviourCode
    ? `${query.behaviourCode} · ${behaviours?.find((b) => b.code === query.behaviourCode)?.label ?? ''}`
    : `« ${query.text} »`;

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });

/**
 * Écran Session & export : les validations d'une recherche (`?q=`), leur
 * export CSV et l'horloge d'activité 24 h. Sans `?q=`, la recherche la plus
 * récente est affichée (valeur dérivée : aucun effet nécessaire).
 */
export function SessionPage() {
  const [params, setParams] = useSearchParams();
  const queries = useQueryList();
  const behaviours = useBehaviours();
  const selectId = useId();

  const queryId = params.get('q') ?? queries.data?.[0]?.id ?? null;
  const search = useSearchResults(queryId);
  const validations = useValidations(queryId);
  const clips = useClipsById();
  const csv = useExportCsv(queryId);

  const header = <PageTitle className="mb-6">{t.title}</PageTitle>;

  if (queries.isPending) {
    return (
      <>
        {header}
        <LoadingRegion className="grid gap-3">
          <Skeleton className="h-10 w-80" />
          <Skeleton className="h-64 w-full" />
        </LoadingRegion>
      </>
    );
  }

  if (queries.error) {
    return (
      <>
        {header}
        <ErrorState
          title={t.errorTitle}
          message={queries.error.message}
          onRetry={() => void queries.refetch()}
        />
      </>
    );
  }

  if (queries.data.length === 0 || queryId === null) {
    return (
      <>
        {header}
        <EmptyState
          icon={Search}
          title={t.noQueriesTitle}
          action={
            <Link to="/recherche" className="text-accent underline underline-offset-4">
              {t.goSearch}
            </Link>
          }
        >
          {t.noQueriesBody}
        </EmptyState>
      </>
    );
  }

  const error = search.error ?? validations.error ?? clips.error;
  const loading = !search.data || !validations.data || !clips.data;
  const query = search.data?.query;

  return (
    <>
      {header}

      {/* Choix de la recherche : un <select> natif, accessible et familier. */}
      <div className="mb-8 flex flex-wrap items-end gap-x-6 gap-y-2">
        <div className="grid gap-1.5">
          <label htmlFor={selectId} className="text-sm font-medium">
            {t.chooseLabel}
          </label>
          <select
            id={selectId}
            value={queryId}
            onChange={(event) => {
              setParams({ q: event.target.value });
            }}
            className="h-10 min-w-80 rounded-md border border-line-strong bg-surface px-3 text-sm text-ink"
          >
            {queries.data.map((q) => (
              <option key={q.id} value={q.id}>
                {queryTitle(q, behaviours.data)} — {formatDate(q.createdAt)}
              </option>
            ))}
          </select>
        </div>
        {query && search.data && (
          <p className="pb-2 font-mono text-xs text-ink-muted">
            {t.iteration(search.data.iteration)} · {t.createdAt(formatDate(query.createdAt))}
          </p>
        )}
      </div>

      {error ? (
        <ErrorState
          title={t.errorTitle}
          message={error.message}
          onRetry={() => {
            void search.refetch();
            void validations.refetch();
            void clips.refetch();
          }}
        />
      ) : loading ? (
        <LoadingRegion className="grid gap-3">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-72 w-full" />
        </LoadingRegion>
      ) : validations.data.length === 0 ? (
        <EmptyState
          icon={FileSpreadsheet}
          title={t.noValidationsTitle}
          action={
            <Link
              to={`/recherche?q=${encodeURIComponent(queryId)}`}
              className="text-accent underline underline-offset-4"
            >
              {t.reviewInSearch}
            </Link>
          }
        >
          {t.noValidationsBody}
        </EmptyState>
      ) : (
        <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_20rem]">
          <section aria-labelledby="validations-title" className="grid min-w-0 content-start gap-8">
            <div className="grid gap-3">
              <h2 id="validations-title" className="font-display text-2xl">
                {t.tableTitle}
              </h2>
              <ValidationsTable
                rows={buildRows(validations.data, clips.data, search.data.results)}
                queryId={queryId}
              />
            </div>

            <ExportPanel csv={csv} query={search.data.query} />
          </section>

          <section aria-labelledby="clock-title" className="grid content-start gap-2">
            <h2 id="clock-title" className="font-display text-2xl">
              {t.clockTitle}
            </h2>
            <p className="text-sm text-ink-muted">{t.clockIntro}</p>
            <ActivityClock {...clockData(validations.data, clips.data)} className="mt-4" />
          </section>
        </div>
      )}
    </>
  );
}

function clockData(...args: Parameters<typeof hourlyActivity>) {
  const { counts, excluded } = hourlyActivity(...args);
  return { counts, excluded };
}

interface ExportPanelProps {
  csv: ReturnType<typeof useExportCsv>;
  query: SearchQuery;
}

/** Aperçu des premières lignes du CSV et téléchargement réel du fichier. */
function ExportPanel({ csv, query }: ExportPanelProps) {
  const [downloaded, setDownloaded] = useState('');
  const lines = csv.data?.split('\r\n').filter(Boolean) ?? [];

  return (
    <section aria-labelledby="export-title" className="grid gap-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="export-title" className="font-display text-2xl">
            {t.exportTitle}
          </h2>
          <p className="mt-1 max-w-prose text-sm text-ink-muted">{t.exportIntro}</p>
        </div>
        <Button
          variant="primary"
          icon={Download}
          disabled={!csv.data}
          onClick={() => {
            if (!csv.data) return;
            const name = exportFileName(query, new Date());
            downloadText(name, csv.data, 'text/csv;charset=utf-8');
            setDownloaded(t.downloadDone(name));
          }}
        >
          {t.download}
        </Button>
      </div>

      {csv.error ? (
        <ErrorState title={t.errorTitle} onRetry={() => void csv.refetch()} className="py-6" />
      ) : (
        <figure className="grid gap-1">
          <figcaption className="font-mono text-2xs tracking-stamp text-ink-muted uppercase">
            {t.previewLabel(Math.min(PREVIEW_ROWS, Math.max(0, lines.length - 1)))}
          </figcaption>
          {/* Une zone qui défile horizontalement doit être atteignable au clavier
              (sinon impossible de la faire défiler sans souris) : tabIndex={0}
              est voulu ici, d'où l'exception ciblée à la règle jsx-a11y. */}
          <pre
            aria-label={t.previewLabel(Math.min(PREVIEW_ROWS, Math.max(0, lines.length - 1)))}
            // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
            tabIndex={0}
            data-testid="csv-preview"
            className="overflow-x-auto rounded-md border border-line bg-surface p-3 font-mono text-xs leading-5 text-ink"
          >
            {lines.slice(0, PREVIEW_ROWS + 1).join('\n')}
          </pre>
        </figure>
      )}
      <p aria-live="polite" className="sr-only">
        {downloaded}
      </p>
    </section>
  );
}
