import { useId } from 'react';

import { VerdictBadge } from '@/components/ui/VerdictBadge';
import { strings } from '@/content/strings';
import type { Clip, SearchResult, Verdict } from '@/domain/types';
import { cn } from '@/lib/cn';
import { formatScore } from '@/lib/format';

import { CameraStrip } from './CameraStrip';
import { ProceduralThumbnail } from './ProceduralThumbnail';
import { RelevanceTimeline } from './RelevanceTimeline';

const t = strings.pages.card;

interface ClipCardProps {
  clip: Clip;
  result: SearchResult;
  /** `null` : pas encore validé. */
  verdict: Verdict | null;
  className?: string;
}

/** Carte d'un résultat : vignette, bande caméra, rang, score, frise et verdict. */
export function ClipCard({ clip, result, verdict, className }: ClipCardProps) {
  const titleId = useId();

  return (
    <article
      aria-labelledby={titleId}
      data-clip-id={clip.id}
      className={cn(
        'overflow-hidden rounded-md border border-line bg-surface-raised',
        // La verdict colore discrètement le bord : un repère de plus, jamais le seul.
        verdict === 'yes' && 'border-verdict-yes/60',
        verdict === 'no' && 'border-verdict-no/60',
        verdict === 'unsure' && 'border-verdict-unsure/60',
        className,
      )}
    >
      <ProceduralThumbnail seed={clip.thumbnailSeed} isNight={clip.isNight} />
      <CameraStrip
        siteId={clip.siteId}
        cameraId={clip.cameraId}
        recordedAt={clip.recordedAt}
        temperatureC={clip.temperatureC}
        moonPhase={clip.moonPhase}
        isNight={clip.isNight}
        compact
      />
      <div className="grid gap-2.5 p-3">
        <div className="flex items-center justify-between gap-2">
          <h3 id={titleId} className="flex items-baseline gap-2 font-mono text-sm">
            <span aria-hidden="true">{t.rank(result.rank)}</span>
            <span className="text-xs text-ink-muted" aria-hidden="true">
              {clip.id}
            </span>
            <span className="sr-only">{t.label(result.rank, clip.id)}</span>
          </h3>
          <VerdictBadge verdict={verdict} size="sm" />
        </div>
        <RelevanceTimeline scores={result.secondScores} bestMomentS={result.bestMomentS} />
        <p className="flex justify-between font-mono text-2xs text-ink-muted" title={t.scoreTitle}>
          <span>{t.scoreLabel}</span>
          <span className="text-ink">{formatScore(result.score)}</span>
        </p>
      </div>
    </article>
  );
}
