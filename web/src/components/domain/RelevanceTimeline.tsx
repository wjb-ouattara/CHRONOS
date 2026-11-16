import { useState } from 'react';

import { strings } from '@/content/strings';
import { cn } from '@/lib/cn';
import { formatScore } from '@/lib/format';

interface RelevanceTimelineProps {
  /** Un score 0..1 par seconde (`SearchResult.secondScores`). */
  scores: readonly number[];
  /** Indice de la seconde la plus pertinente. */
  bestMomentS: number;
  /** `compact` : sous une carte. `large` : dans la loupe, avec axe et survol. */
  variant?: 'compact' | 'large';
  /** Position du curseur de lecture en secondes (loupe), ou `null`. */
  currentS?: number | null;
  className?: string;
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, Number.isFinite(n) ? n : 0));

/**
 * La frise de pertinence : « le temps rendu visible ».
 *
 * Encodage (une seule teinte, échelle séquentielle) :
 *  - compact : l'intensité de l'accent suit le score de chaque seconde ;
 *  - large : la HAUTEUR des barres suit le score (plus précis à lire que
 *    l'intensité), la seconde clé est la seule en couleur d'accent.
 * Dans les deux cas, l'instant clé porte un repère de FORME (triangle),
 * pas seulement une couleur.
 */
export function RelevanceTimeline({
  scores,
  bestMomentS,
  variant = 'compact',
  currentS = null,
  className,
}: RelevanceTimelineProps) {
  const summary = strings.timeline.summary(
    bestMomentS,
    formatScore(clamp01(scores[bestMomentS] ?? 0)),
  );

  return variant === 'compact' ? (
    <CompactTimeline
      scores={scores}
      bestMomentS={bestMomentS}
      summary={summary}
      className={className}
    />
  ) : (
    <LargeTimeline
      scores={scores}
      bestMomentS={bestMomentS}
      currentS={currentS}
      summary={summary}
      className={className}
    />
  );
}

interface PartProps {
  scores: readonly number[];
  bestMomentS: number;
  summary: string;
  className?: string | undefined;
}

function CompactTimeline({ scores, bestMomentS, summary, className }: PartProps) {
  return (
    // role="img" + aria-label : l'ensemble est lu comme UNE image résumée,
    // au lieu de 15 éléments vides annoncés un par un.
    <div role="img" aria-label={summary} className={cn('grid gap-0.5', className)}>
      <div className="flex gap-0.5" aria-hidden="true">
        {scores.map((_, s) => (
          <span key={s} className="flex flex-1 justify-center">
            {s === bestMomentS && <Marker />}
          </span>
        ))}
      </div>
      <div className="flex h-1.5 gap-0.5" aria-hidden="true">
        {scores.map((score, s) => (
          <span
            key={s}
            data-second={s}
            className="flex-1 rounded-xs"
            // Mélange accent / fond selon le score (8 % minimum pour que chaque
            // seconde reste visible). Tokens uniquement, aucune couleur en dur.
            style={{
              backgroundColor: `color-mix(in oklab, var(--theme-accent) ${String(Math.round(8 + clamp01(score) * 92))}%, var(--theme-surface-raised))`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function LargeTimeline({
  scores,
  bestMomentS,
  currentS,
  summary,
  className,
}: PartProps & { currentS: number | null }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const n = scores.length;

  return (
    <figure className={cn('grid gap-1', className)}>
      <div role="img" aria-label={summary} className="relative">
        {/* Repères de l'instant clé (triangle) */}
        <div className="flex gap-0.5" aria-hidden="true">
          {scores.map((_, s) => (
            <span key={s} className="flex h-2.5 flex-1 justify-center">
              {s === bestMomentS && <Marker />}
            </span>
          ))}
        </div>

        {/* Barres : hauteur = score, ancrées en bas */}
        <div
          className="relative flex h-16 items-end gap-0.5 border-b border-line"
          aria-hidden="true"
          onMouseLeave={() => {
            setHovered(null);
          }}
        >
          {scores.map((score, s) => (
            // La zone de survol occupe toute la hauteur : plus facile à viser que la barre.
            <span
              key={s}
              data-second={s}
              className="relative flex h-full flex-1 items-end"
              onMouseEnter={() => {
                setHovered(s);
              }}
            >
              <span
                className={cn(
                  'w-full rounded-t-xs transition-colors duration-150',
                  s === bestMomentS ? 'bg-accent' : 'bg-line-strong',
                  hovered === s && s !== bestMomentS && 'bg-ink-muted',
                )}
                style={{ height: `${String(Math.max(4, clamp01(score) * 100))}%` }}
              />
            </span>
          ))}

          {/* Curseur de lecture */}
          {currentS !== null && n > 0 && (
            <span
              className="pointer-events-none absolute inset-y-0 w-px bg-ink"
              style={{ left: `${String((Math.min(Math.max(currentS, 0), n) / n) * 100)}%` }}
            />
          )}

          {/* Infobulle de survol */}
          {hovered !== null && (
            <span
              className="pointer-events-none absolute -top-7 -translate-x-1/2 rounded-sm border border-line bg-surface-raised px-1.5 py-0.5 font-mono text-2xs whitespace-nowrap text-ink"
              style={{ left: `${String(((hovered + 0.5) / n) * 100)}%` }}
            >
              {strings.timeline.second(hovered, formatScore(clamp01(scores[hovered] ?? 0)))}
            </span>
          )}
        </div>
      </div>

      {/* Axe discret : début, instant clé, fin */}
      <figcaption
        aria-hidden="true"
        className="relative flex h-4 justify-between font-mono text-2xs text-ink-muted"
      >
        <span>0 s</span>
        <span
          className="absolute -translate-x-1/2 text-ink"
          style={{ left: `${String(((bestMomentS + 0.5) / n) * 100)}%` }}
        >
          {bestMomentS} s
        </span>
        <span>{strings.timeline.axisEnd(n)}</span>
      </figcaption>
    </figure>
  );
}

/** Petit triangle pointant vers le bas : repère de l'instant clé. */
function Marker() {
  return (
    <svg viewBox="0 0 8 5" className="h-1.5 w-2.5 text-accent" aria-hidden="true" data-marker>
      <path d="M0 0 H8 L4 5 Z" fill="currentColor" />
    </svg>
  );
}
