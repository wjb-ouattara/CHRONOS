import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';

import { ClipCard } from '@/components/domain/ClipCard';
import { Button } from '@/components/ui/Button';
import { LoadingRegion, Skeleton } from '@/components/ui/states';
import { strings } from '@/content/strings';
import type { Clip, SearchResult, Verdict } from '@/domain/types';
import { cn } from '@/lib/cn';
import { DURATION, EASE_FIELD } from '@/lib/motion';
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
  /** Déplacements depuis le dernier reclassement (indicateurs ↑ ↓ nouveau). */
  rankChanges?: ReadonlyMap<string, number | 'new'>;
  /** Change à chaque reclassement réussi : rejoue le balayage phosphore. */
  sweepKey?: number | null;
}

/**
 * Grille des résultats, affichés par lots de PAGE_SIZE. Liste ORDONNÉE
 * (<ol>) : l'ordre des résultats a un sens (le rang).
 * Le parent change la `key` du composant à chaque nouvelle RECHERCHE (pas à
 * chaque reclassement !) : les cartes sont conservées d'une itération à
 * l'autre, ce qui permet à Motion de les faire glisser vers leur nouveau rang.
 */
export function ResultsGrid({
  results,
  clipsById,
  verdicts,
  selectedId = null,
  onOpen,
  compact = false,
  rankChanges,
  sweepKey = null,
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
      <div className="relative">
        <ol aria-label={t.resultsLabel} className={cn(gridClasses, !compact && 'xl:grid-cols-3')}>
          {/* initial={false} : pas d'animation d'entrée au premier affichage,
              seulement quand des cartes entrent ou sortent après un reclassement.
              « popLayout » : une carte qui sort quitte la mise en page tout de
              suite, les autres glissent sans attendre la fin de son fondu. */}
          <AnimatePresence initial={false} mode="popLayout">
            {shown.map((result) => {
              const clip = clipsById.get(result.clipId);
              if (!clip) return null; // incohérence improbable : on n'affiche pas une carte vide
              return (
                // `layout` : Motion mesure la position avant/après un changement
                // d'ordre et anime le déplacement (technique « FLIP »).
                <motion.li
                  key={result.clipId}
                  layout="position"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    layout: { duration: DURATION.reorder, ease: EASE_FIELD },
                    opacity: { duration: DURATION.fade, ease: EASE_FIELD },
                  }}
                >
                  <ClipCard
                    clip={clip}
                    result={result}
                    verdict={verdicts.get(result.clipId) ?? null}
                    selected={result.clipId === selectedId}
                    onOpen={onOpen}
                    rankChange={rankChanges?.get(result.clipId)}
                  />
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ol>
        {sweepKey !== null && !reducedMotion && <PhosphorSweep key={sweepKey} />}
      </div>

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

/**
 * Balayage phosphore : une bande lumineuse traverse la grille une seule fois
 * après un reclassement. Purement décoratif (aria-hidden, aucun clic capté) ;
 * jamais affiché en mouvement réduit. La `key` change à chaque reclassement,
 * ce qui recrée le composant et rejoue l'animation.
 */
function PhosphorSweep() {
  return (
    // Couloir de la hauteur VISIBLE (au plus un écran) : sur une liste de
    // plusieurs milliers de pixels, la bande passerait sinon trop vite pour être vue.
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 h-[min(100%,100dvh)] overflow-hidden"
    >
      <motion.div
        data-testid="phosphor-sweep"
        className="absolute inset-x-0 h-40 bg-linear-to-b from-transparent via-accent/25 to-transparent"
        initial={{ top: '-10rem', opacity: 1 }}
        animate={{ top: '100%', opacity: 0 }}
        transition={{
          duration: DURATION.sweep,
          ease: EASE_FIELD,
          // La bande s'efface sur la fin de sa course.
          opacity: { duration: DURATION.sweep * 0.3, delay: DURATION.sweep * 0.7 },
        }}
      />
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
