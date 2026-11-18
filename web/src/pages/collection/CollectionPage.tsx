import { History, Search } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Link } from 'react-router';

import {
  useBehaviours,
  useClipList,
  useQueryList,
  useSites,
  useValidationsOf,
} from '@/api/queries';
import { PageTitle } from '@/components/ui/PageTitle';
import { EmptyState, ErrorState, LoadingRegion, Skeleton } from '@/components/ui/states';
import { strings } from '@/content/strings';
import type { Behaviour, SearchQuery } from '@/domain/types';
import { cn } from '@/lib/cn';

import { Actogram } from './Actogram';
import {
  buildActogram,
  collectionStats,
  formatDuration,
  formatMonth,
  siteSummaries,
} from './collection-data';

const t = strings.pages.collection;

/** Nombre de recherches récentes affichées. */
export const RECENT_LIMIT = 5;

const percent = (part: number, total: number) =>
  `${String(total === 0 ? 0 : Math.round((part / total) * 100))} %`;

/** Vue d'ensemble de la collection : chiffres clés, frise, sites, recherches récentes. */
export function CollectionPage() {
  const clips = useClipList();
  const sites = useSites();

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <PageTitle>{t.title}</PageTitle>
          <p className="mt-3 max-w-prose text-lg text-ink-muted">{strings.app.tagline}</p>
        </div>
        <Link
          to="/recherche"
          className="inline-flex h-10 items-center gap-2 rounded-md bg-accent px-4 font-medium text-on-accent transition-colors duration-150 hover:bg-accent/85"
        >
          <Search aria-hidden="true" className="size-4" />
          {t.newSearch}
        </Link>
      </div>

      {clips.error || sites.error ? (
        <ErrorState
          className="mt-10"
          title={t.errorTitle}
          message={(clips.error ?? sites.error)?.message}
          onRetry={() => {
            void clips.refetch();
            void sites.refetch();
          }}
        />
      ) : !clips.data || !sites.data ? (
        <LoadingRegion className="mt-10 grid gap-6">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-72" />
        </LoadingRegion>
      ) : (
        <Overview clips={clips.data} sites={sites.data} />
      )}

      <RecentSearches />
    </>
  );
}

function Overview({
  clips,
  sites,
}: {
  clips: Parameters<typeof collectionStats>[0];
  sites: Parameters<typeof collectionStats>[1];
}) {
  const [highlight, setHighlight] = useState<string | null>(null);
  const stats = collectionStats(clips, sites);
  const actogram = buildActogram(clips);
  const summaries = siteSummaries(clips, sites);
  const s = t.stats;

  return (
    <>
      {/* Chiffres clés : tous CALCULÉS à partir des données, jamais écrits en dur. */}
      <section aria-label={s.label} className="mt-10">
        <dl className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          <Tile label={s.clips} value={String(stats.clipCount)} />
          <Tile
            label={s.duration}
            value={formatDuration(stats.totalSeconds)}
            detail={s.durationDetail(stats.clipCount, clips[0]?.durationS ?? 0)}
          />
          <Tile
            label={s.sites}
            value={`${String(stats.siteCount)} · ${String(stats.cameraCount)}`}
          />
          <Tile
            label={s.period}
            value={stats.firstDay ? formatMonth(stats.firstDay) : '—'}
            detail={stats.lastDay ? `→ ${formatMonth(stats.lastDay)}` : undefined}
          />
          <Tile
            label={s.dayNight}
            value={`${percent(stats.dayCount, stats.clipCount)} / ${percent(stats.nightCount, stats.clipCount)}`}
            detail={s.dayNightDetail(stats.dayCount, stats.nightCount)}
          >
            {/* Barre proportionnelle : la même information, en un coup d'œil. */}
            <span aria-hidden="true" className="mt-2 flex h-1.5 overflow-hidden rounded-full">
              <span className="bg-chart-day" style={{ flexGrow: stats.dayCount }} />
              <span className="ml-0.5 bg-chart-night" style={{ flexGrow: stats.nightCount }} />
            </span>
          </Tile>
          <Tile label={s.missing} value={String(stats.missingTimestamp)} detail={s.missingDetail} />
        </dl>
      </section>

      <section aria-labelledby="frise-title" className="mt-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="frise-title" className="font-display text-2xl">
              {t.friseTitle}
            </h2>
            <p className="mt-1 max-w-prose text-sm text-ink-muted">{t.friseIntro}</p>
          </div>
          <div role="group" aria-label={t.filterLabel} className="flex gap-1.5">
            {[null, ...sites.map((site) => site.id)].map((id) => (
              <button
                key={id ?? 'all'}
                type="button"
                aria-pressed={highlight === id}
                onClick={() => {
                  setHighlight(id);
                }}
                className={cn(
                  'h-8 rounded-md border px-3 font-mono text-xs transition-colors duration-150',
                  highlight === id
                    ? 'border-accent bg-surface-raised text-ink'
                    : 'border-line text-ink-muted hover:text-ink',
                )}
              >
                {id ?? t.filterAll}
              </button>
            ))}
          </div>
        </div>
        <Actogram
          className="mt-4"
          data={actogram}
          highlightSite={highlight}
          label={t.friseLabel(
            actogram.points.length,
            stats.firstDay ? formatMonth(stats.firstDay) : '—',
            stats.lastDay ? formatMonth(stats.lastDay) : '—',
            percent(stats.nightCount, stats.clipCount),
          )}
        />
      </section>

      <section aria-labelledby="sites-title" className="mt-12">
        <h2 id="sites-title" className="font-display text-2xl">
          {t.sitesTitle}
        </h2>
        <ul className="mt-4 grid gap-4 md:grid-cols-3">
          {summaries.map(({ site, clipCount, nightCount, cameras }) => {
            const max = Math.max(1, ...cameras.map((c) => c.clipCount));
            return (
              <li
                key={site.id}
                aria-label={site.label}
                className="grid gap-3 rounded-lg border border-line bg-surface p-4"
              >
                <div className="flex items-baseline justify-between">
                  <p className="font-display text-xl">{site.label}</p>
                  <p className="font-mono text-xs tracking-stamp text-stamp uppercase">
                    {t.habitat[site.habitat]}
                  </p>
                </div>
                <p className="font-mono text-xs">{t.siteLine(cameras.length, clipCount)}</p>
                <p className="text-xs text-ink-muted">
                  {t.nightShare(percent(nightCount, clipCount))}
                </p>
                {/* Mini-histogramme : clips par caméra (le détail est dans le titre de chaque barre). */}
                <div>
                  <p className="mb-1 text-2xs text-ink-muted">{t.perCamera}</p>
                  <ul className="flex h-12 items-end gap-0.5" aria-hidden="true">
                    {cameras.map((camera) => (
                      <li
                        key={camera.cameraId}
                        title={`${camera.cameraId} : ${String(camera.clipCount)}`}
                        className="flex-1 rounded-t-xs bg-line-strong"
                        style={{ height: `${String((camera.clipCount / max) * 100)}%` }}
                      />
                    ))}
                  </ul>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}

function Tile({
  label,
  value,
  detail,
  children,
}: {
  label: string;
  value: string;
  detail?: string | undefined;
  children?: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-line bg-surface p-4">
      <dt className="text-xs text-ink-muted">{label}</dt>
      <dd className="mt-1 font-display text-2xl">{value}</dd>
      {detail && <dd className="mt-0.5 font-mono text-2xs text-ink-muted">{detail}</dd>}
      {children && <dd>{children}</dd>}
    </div>
  );
}

const queryTitle = (query: SearchQuery, behaviours: readonly Behaviour[] | undefined) =>
  query.behaviourCode
    ? `${query.behaviourCode} · ${behaviours?.find((b) => b.code === query.behaviourCode)?.label ?? ''}`
    : `« ${query.text} »`;

/** Les dernières recherches, avec l'état de leur revue et un accès direct. */
function RecentSearches() {
  const queries = useQueryList();
  const behaviours = useBehaviours();
  const recent = (queries.data ?? []).slice(0, RECENT_LIMIT);
  const validations = useValidationsOf(recent.map((q) => q.id));

  return (
    <section aria-labelledby="recent-title" className="mt-12">
      <h2 id="recent-title" className="font-display text-2xl">
        {t.recentTitle}
      </h2>
      <div className="mt-4">
        {queries.error ? (
          <ErrorState
            title={t.errorTitle}
            onRetry={() => void queries.refetch()}
            className="py-6"
          />
        ) : queries.isPending ? (
          <LoadingRegion className="grid gap-2">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </LoadingRegion>
        ) : recent.length === 0 ? (
          <EmptyState
            icon={History}
            title={t.recentEmptyTitle}
            action={
              <Link to="/recherche" className="text-accent underline underline-offset-4">
                {t.firstSearch}
              </Link>
            }
          >
            {t.recentEmptyBody}
          </EmptyState>
        ) : (
          <ol className="divide-y divide-line rounded-lg border border-line">
            {recent.map((query, i) => {
              const list = validations[i]?.data ?? [];
              const count = (v: 'yes' | 'no' | 'unsure') =>
                list.filter((x) => x.verdict === v).length;
              const title = queryTitle(query, behaviours.data);
              const q = encodeURIComponent(query.id);
              return (
                <li
                  key={query.id}
                  className="flex flex-wrap items-center justify-between gap-3 p-4"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{title}</p>
                    <p className="mt-0.5 font-mono text-xs text-ink-muted">
                      {new Date(query.createdAt).toLocaleString('fr-FR', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}{' '}
                      · {t.recentCounts(list.length, count('yes'), count('no'), count('unsure'))}
                    </p>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <Link
                      to={`/recherche?q=${q}`}
                      aria-label={t.resumeLabel(title)}
                      className="text-accent underline underline-offset-4"
                    >
                      {t.resume}
                    </Link>
                    <Link
                      to={`/session?q=${q}`}
                      aria-label={t.sessionLabel(title)}
                      className="text-accent underline underline-offset-4"
                    >
                      {t.session}
                    </Link>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </section>
  );
}
