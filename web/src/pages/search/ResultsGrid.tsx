import { useEffect, useState } from 'react';

import { ClipCard } from '@/components/domain/ClipCard';
import { Button } from '@/components/ui/Button';
import { LoadingRegion, Skeleton } from '@/components/ui/states';
import { strings } from '@/content/strings';
import type { Clip, SearchResult, Verdict } from '@/domain/types';
import { cn } from '@/lib/cn';
import { useReducedMotion } from '@/lib/useReducedMotion';

const t = strings.pages.search;

/** Taille d'un lot : assez pour avancer, assez peu pour rester rapide. */
export const PAGE_SIZE = 24;

const gridClasses = 'grid grid-cols-2 gap-4';

interface ResultsGridProps {
  results: readonly SearchResult[];
  clipsById: ReadonlyMap<string, Clip>;
  verdicts: ReadonlyMap<string, Verdict>;
  selectedId?: string | null;
  onOpen?: (clipId: string) => void;
  /** Loupe ouverte à côté : on reste à 2 colonnes. */
  compact?: boolean;
}

/**
 * Grille des résultats, affichés par lots de PAGE_SIZE. Liste ORDONNÉE
 * (<ol>) : l'ordre des résultats a un sens (le rang).
 * Le parent change la `key` du composant à chaque nouvelle recherche, ce qui
 * remet `visible` à sa valeur initiale.
 */
export function ResultsGrid({
  results,
  clipsById,
  verdicts,
  selectedId = null,
  onOpen,
  compact = false,
}: ResultsGridProps) {
  const [visible, setVisible] = useState(PAGE_SIZE);
  const reducedMotion = useReducedMotion();
  // Si J dépasse le lot affiché, on affiche jusqu'au lot qui contient le clip
  // sélectionné. Valeur DÉRIVÉE : aucun état à synchroniser.
  const selectedIndex = results.findIndex((r) => r.clipId === selectedId);
  const needed = selectedIndex < 0 ? 0 : Math.ceil((selectedIndex + 1) / PAGE_SIZE) * PAGE_SIZE;
  const shown = results.slice(0, Math.max(visible, needed));

  // Fait défiler la grille jusqu'à la carte sélectionnée (« nearest » : seulement si besoin).
  useEffect(() => {
    if (!selectedId) return;
    document
      .querySelector(`[data-clip-id="${selectedId}"]`)
      ?.scrollIntoView({ block: 'nearest', behavior: reducedMotion ? 'auto' : 'smooth' });
  }, [selectedId, reducedMotion]);
  const remaining = results.length - shown.length;

  return (
    <div className="grid gap-6">
      <ol aria-label={t.resultsLabel} className={cn(gridClasses, !compact && 'xl:grid-cols-3')}>
        {shown.map((result) => {
          const clip = clipsById.get(result.clipId);
          if (!clip) return null; // incohérence improbable : on n'affiche pas une carte vide
          return (
            <li key={result.clipId}>
              <ClipCard
                clip={clip}
                result={result}
                verdict={verdicts.get(result.clipId) ?? null}
                selected={result.clipId === selectedId}
                onOpen={onOpen}
              />
            </li>
          );
        })}
      </ol>

      <div className="flex items-center justify-center gap-4">
        <span className="font-mono text-xs text-ink-muted">
          {t.shown(shown.length, results.length)}
        </span>
        {remaining > 0 && (
          <Button
            onClick={() => {
              setVisible(shown.length + PAGE_SIZE);
            }}
          >
            {t.showMore(Math.min(PAGE_SIZE, remaining))}
          </Button>
        )}
      </div>
    </div>
  );
}

/** Squelette de la grille pendant le chargement. */
export function ResultsSkeleton() {
  return (
    <LoadingRegion className={cn(gridClasses, 'xl:grid-cols-3')}>
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="overflow-hidden rounded-md border border-line">
          <Skeleton className="aspect-[720/404] w-full rounded-none" />
          <div className="grid gap-2 p-3">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </LoadingRegion>
  );
}
