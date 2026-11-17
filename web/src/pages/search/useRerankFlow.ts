import { useState } from 'react';

import { useRerank } from '@/api/queries';
import { useShortcut } from '@/app/useShortcut';
import { strings } from '@/content/strings';
import type { SearchResponse, Validation } from '@/domain/types';
import { useReducedMotion } from '@/lib/useReducedMotion';

import { PAGE_SIZE } from './ResultsGrid';

export type RankChange = number | 'new';

/**
 * Compare deux classements. Pour chaque clip du nouveau : places gagnées
 * (> 0) ou perdues (< 0), ou `'new'` s'il entre dans les PAGE_SIZE premiers
 * alors qu'il n'y était pas. Fonction pure, testée.
 */
export function computeRankChanges(
  before: SearchResponse['results'],
  after: SearchResponse['results'],
): Map<string, RankChange> {
  const previous = new Map(before.map((r) => [r.clipId, r.rank]));
  return new Map(
    after.map((r): [string, RankChange] => {
      const old = previous.get(r.clipId);
      const entered = r.rank <= PAGE_SIZE && (old === undefined || old > PAGE_SIZE);
      return [r.clipId, entered ? 'new' : (old ?? r.rank) - r.rank];
    }),
  );
}

/**
 * Le reclassement côté écran : bouton et touche R, comparaison avant/après
 * (indicateurs ↑ ↓ nouveau), balayage, annonce pour les lecteurs d'écran.
 */
export function useRerankFlow(
  queryId: string | null,
  response: SearchResponse | undefined,
  validations: readonly Validation[] | undefined,
) {
  const rerank = useRerank();
  const reducedMotion = useReducedMotion();
  const [last, setLast] = useState<{
    iteration: number;
    changes: Map<string, RankChange>;
  } | null>(null);
  const [announcement, setAnnouncement] = useState('');

  // Seuls « oui » et « non » informent le reclassement (« incertain » est ignoré).
  const canRerank = (validations ?? []).some((v) => v.verdict !== 'unsure');

  const run = () => {
    if (!queryId || !response || !canRerank || rerank.isPending) return;
    const before = response.results;
    rerank.mutate(queryId, {
      onSuccess: (next) => {
        const changes = computeRankChanges(before, next.results);
        setLast({ iteration: next.iteration, changes });
        const values = [...changes.values()];
        setAnnouncement(
          strings.pages.search.rerankAnnounce(
            next.iteration,
            values.filter((c) => c !== 'new' && c > 0).length,
            values.filter((c) => c === 'new').length,
          ),
        );
        // On remonte en haut : le nouveau classement commence là.
        window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
      },
    });
  };

  useShortcut('rerank', run, { enabled: canRerank });

  // Les indicateurs ne valent que pour l'itération qu'ils décrivent.
  const current = last !== null && last.iteration === response?.iteration ? last : null;

  return {
    run,
    canRerank,
    pending: rerank.isPending,
    failed: rerank.isError,
    rankChanges: current?.changes,
    sweepKey: current?.iteration ?? null,
    announcement,
  };
}
