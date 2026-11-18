import { ArrowDownUp, Search, SearchX } from 'lucide-react';
import { Link, useSearchParams } from 'react-router';

import { ApiError } from '@/api/errors';
import {
  useBehaviours,
  useClipsById,
  useRunSearch,
  useSearchResults,
  useValidations,
} from '@/api/queries';
import type { SearchInput } from '@/api/types';
import { Button } from '@/components/ui/Button';
import { PageTitle } from '@/components/ui/PageTitle';
import { EmptyState, ErrorState } from '@/components/ui/states';
import { strings } from '@/content/strings';
import type { Verdict } from '@/domain/types';
import { cn } from '@/lib/cn';

import { EthogramIndex } from './EthogramIndex';
import { Loupe } from './Loupe';
import { ResultsGrid, ResultsSkeleton } from './ResultsGrid';
import { SearchBar } from './SearchBar';
import { type RankChange, useRerankFlow } from './useRerankFlow';
import { useReview } from './useReview';

const t = strings.pages.search;

/**
 * Écran Recherche. La recherche en cours vit dans l'adresse (`?q=<id>`) :
 * un rechargement ou les boutons précédent/suivant la retrouvent.
 */
export function SearchPage() {
  const [params, setParams] = useSearchParams();
  const queryId = params.get('q');

  const behaviours = useBehaviours();
  const clips = useClipsById();
  const search = useSearchResults(queryId);
  const validations = useValidations(queryId);
  const runSearch = useRunSearch();

  const start = (input: SearchInput) => {
    runSearch.mutate(input, {
      // Nouvelle entrée d'historique : « précédent » revient à la recherche d'avant.
      onSuccess: (response) => {
        setParams({ q: response.query.id });
      },
    });
  };

  const review = useReview(queryId, search.data?.results, validations.data);
  const rerank = useRerankFlow(queryId, search.data, validations.data);
  const selectedClip = review.selected && clips.data?.get(review.selected.clipId);
  const loupeOpen = review.selected !== undefined && selectedClip !== undefined;

  const current = search.data?.query;
  const verdicts = new Map<string, Verdict>(
    (validations.data ?? []).map((v) => [v.clipId, v.verdict]),
  );
  const counts = { yes: 0, no: 0, unsure: 0 };
  for (const verdict of verdicts.values()) counts[verdict]++;
  const behaviourLabel = behaviours.data?.find((b) => b.code === current?.behaviourCode)?.label;

  return (
    <>
      <PageTitle>{t.title}</PageTitle>

      <div
        className={cn(
          'mt-6 grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[15rem_minmax(0,1fr)]',
          // Loupe ouverte sur grand écran : l'éthogramme se replie, la loupe prend sa colonne.
          loupeOpen && 'xl:grid-cols-[minmax(0,1fr)_26rem]',
        )}
      >
        <div className={cn('lg:sticky lg:top-28 lg:self-start', loupeOpen && 'xl:hidden')}>
          <EthogramIndex
            behaviours={behaviours.data}
            isLoading={behaviours.isPending}
            isError={behaviours.isError}
            selected={runSearch.isPending ? null : (current?.behaviourCode ?? null)}
            disabled={runSearch.isPending}
            onSelect={(code) => {
              start({ text: '', behaviourCode: code });
            }}
          />
        </div>

        <div className="grid min-w-0 content-start gap-6">
          <SearchBar
            // Change de `key` quand la recherche change : le champ est réinitialisé.
            key={current?.id ?? 'none'}
            initialText={current?.text ?? ''}
            pending={runSearch.isPending}
            onSubmit={(text) => {
              start({ text, behaviourCode: null });
            }}
          />

          {current && !runSearch.isPending && (
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line pb-3">
              <p className="font-display text-xl">
                {current.behaviourCode ? (
                  <>
                    <span className="mr-2 font-mono text-sm text-stamp">
                      {current.behaviourCode}
                    </span>
                    {behaviourLabel ?? current.behaviourCode}
                  </>
                ) : (
                  <>« {current.text} »</>
                )}
              </p>
              <p className="font-mono text-xs text-ink-muted">
                {t.summary(search.data?.results.length ?? 0, search.data?.iteration ?? 0)}
              </p>
              {/* Compteur de session et reclassement : le cœur de la boucle de revue. */}
              <div className="flex w-full flex-wrap items-center justify-between gap-3 pt-1">
                <p className="font-mono text-xs text-ink">
                  {t.session(verdicts.size, counts.yes, counts.no, counts.unsure)}
                </p>
                <div className="grid justify-items-end gap-1">
                  <div className="flex items-center gap-3">
                    <Link
                      to={`/session?q=${encodeURIComponent(current.id)}`}
                      className="text-sm text-accent underline underline-offset-4"
                    >
                      {t.sessionLink}
                    </Link>
                    <Button
                      variant="primary"
                      size="sm"
                      icon={ArrowDownUp}
                      aria-keyshortcuts="r"
                      disabled={!rerank.canRerank}
                      loading={rerank.pending}
                      aria-describedby={rerank.canRerank ? undefined : 'rerank-hint'}
                      onClick={rerank.run}
                    >
                      {t.rerank}
                    </Button>
                  </div>
                  {!rerank.canRerank && (
                    <p id="rerank-hint" className="text-xs text-ink-muted">
                      {t.rerankHint}
                    </p>
                  )}
                </div>
              </div>
              {rerank.failed && (
                <ErrorState title={t.rerankError} onRetry={rerank.run} className="w-full py-4" />
              )}
            </div>
          )}

          <SearchBody
            queryId={queryId}
            isRunning={runSearch.isPending}
            runError={runSearch.error}
            onRetryRun={() => {
              if (runSearch.variables) start(runSearch.variables);
            }}
            onStart={start}
            search={search}
            clips={clips}
            verdicts={verdicts}
            selectedId={review.selected?.clipId ?? null}
            onOpen={(clipId) => {
              review.open(clipId);
            }}
            compact={loupeOpen}
            rankChanges={rerank.rankChanges}
            sweepKey={rerank.sweepKey}
            onReset={() => {
              setParams({});
            }}
          />
        </div>

        {review.selected && selectedClip && (
          // Grand écran : colonne collante à droite. Plus étroit : panneau
          // superposé à droite, sous l'en-tête.
          <div className="fixed top-[4.85rem] right-0 bottom-0 z-30 w-full max-w-md overflow-y-auto border-l border-line bg-surface p-5 xl:sticky xl:top-28 xl:bottom-auto xl:z-auto xl:max-h-[calc(100dvh-8rem)] xl:max-w-none xl:self-start xl:rounded-lg xl:border">
            <Loupe
              key={review.selected.clipId}
              clip={selectedClip}
              result={review.selected}
              validation={validations.data?.find((v) => v.clipId === selectedClip.id)}
              onVerdict={(verdict, note) => {
                review.validate(selectedClip.id, verdict, note);
              }}
              onNoteChange={(note) => {
                review.updateNote(selectedClip.id, note);
              }}
              onClose={review.close}
              saveFailed={review.saveFailed}
              onRetrySave={review.retrySave}
            />
          </div>
        )}
      </div>

      {/* Annonces discrètes pour les lecteurs d'écran (verdicts, reclassement). */}
      <p aria-live="polite" className="sr-only">
        {review.announcement}
      </p>
      <p aria-live="polite" className="sr-only">
        {rerank.announcement}
      </p>
    </>
  );
}

interface SearchBodyProps {
  queryId: string | null;
  isRunning: boolean;
  runError: Error | null;
  onRetryRun: () => void;
  onStart: (input: SearchInput) => void;
  onReset: () => void;
  search: ReturnType<typeof useSearchResults>;
  clips: ReturnType<typeof useClipsById>;
  verdicts: ReadonlyMap<string, Verdict>;
  selectedId: string | null;
  onOpen: (clipId: string) => void;
  compact: boolean;
  rankChanges: ReadonlyMap<string, RankChange> | undefined;
  sweepKey: number | null;
}

/** Choisit l'état à afficher : chargement, erreur, introuvable, départ ou résultats. */
function SearchBody({
  queryId,
  isRunning,
  runError,
  onRetryRun,
  onStart,
  onReset,
  search,
  clips,
  verdicts,
  selectedId,
  onOpen,
  compact,
  rankChanges,
  sweepKey,
}: SearchBodyProps) {
  if (isRunning) return <ResultsSkeleton />;

  if (runError) {
    return <ErrorState title={t.errorTitle} message={runError.message} onRetry={onRetryRun} />;
  }

  if (queryId === null) return <StartState onStart={onStart} />;

  if (search.error instanceof ApiError && search.error.code === 'not_found') {
    return (
      <EmptyState
        icon={SearchX}
        title={t.notFoundTitle}
        action={<Button onClick={onReset}>{t.newSearch}</Button>}
      >
        {t.notFoundBody}
      </EmptyState>
    );
  }

  const error = search.error ?? clips.error;
  if (error) {
    return (
      <ErrorState
        title={t.errorTitle}
        message={error.message}
        onRetry={() => {
          if (search.error) void search.refetch();
          if (clips.error) void clips.refetch();
        }}
      />
    );
  }

  if (!search.data || !clips.data) return <ResultsSkeleton />;

  if (search.data.results.length === 0) return <EmptyState icon={Search} title={t.noResults} />;

  return (
    <ResultsGrid
      // Nouvelle RECHERCHE seulement (pas l'itération) : les cartes sont conservées
      // au reclassement, pour pouvoir glisser vers leur nouveau rang.
      key={search.data.query.id}
      results={search.data.results}
      clipsById={clips.data}
      verdicts={verdicts}
      selectedId={selectedId}
      onOpen={onOpen}
      compact={compact}
      rankChanges={rankChanges}
      sweepKey={sweepKey}
    />
  );
}

/** État de départ : aucune recherche, avec des exemples cliquables. */
function StartState({ onStart }: { onStart: (input: SearchInput) => void }) {
  return (
    <EmptyState icon={Search} title={t.startTitle}>
      <p>{t.startBody}</p>
      <ul className="mt-4 flex flex-wrap justify-center gap-2">
        {t.examples.map((example) => (
          <li key={example.text || example.behaviourCode}>
            <Button
              size="sm"
              onClick={() => {
                onStart(example);
              }}
            >
              {example.behaviourCode ?? `« ${example.text} »`}
            </Button>
          </li>
        ))}
      </ul>
    </EmptyState>
  );
}
