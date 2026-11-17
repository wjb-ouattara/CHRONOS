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
  /** Carte ouverte dans la loupe. */
  selected?: boolean;
  /** Absent : carte non cliquable (ex. vitrine /design). */
  onOpen?: (clipId: string) => void;
  /**
   * Déplacement depuis le dernier reclassement : places gagnées (> 0),
   * perdues (< 0), `'new'` (entré dans les résultats affichés) ou absent.
   */
  rankChange?: number | 'new';
  className?: string;
}

/** Carte d'un résultat : vignette, bande caméra, rang, score, frise et verdict. */
export function ClipCard({
  clip,
  result,
  verdict,
  selected = false,
  onOpen,
  rankChange,
  className,
}: ClipCardProps) {
  return (
    <article
      aria-label={t.label(result.rank, clip.id)}
      data-clip-id={clip.id}
      className={cn(
        // `relative` : le bouton « étiré » du titre couvre toute la carte.
        'relative overflow-hidden rounded-md border border-line bg-surface-raised',
        'transition-[outline-color,border-color] duration-150 ease-field',
        // Focus clavier sur le bouton → contour sur TOUTE la carte.
        'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent',
        // Carte ouverte dans la loupe : anneau phosphore (forme + couleur).
        selected && 'outline-2 outline-offset-2 outline-accent',
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
          <h3 className="font-mono text-sm">
            {onOpen ? (
              // « Bouton étiré » : un vrai bouton dans le titre, dont la zone de
              // clic (::after) recouvre toute la carte. Un seul élément focalisable
              // par carte, avec un nom clair, plutôt qu'un <article> cliquable.
              <button
                type="button"
                aria-current={selected || undefined}
                onClick={() => {
                  onOpen(clip.id);
                }}
                className="flex items-baseline gap-2 after:absolute after:inset-0 after:cursor-pointer after:content-[''] focus-visible:outline-none"
              >
                <CardLabel rank={result.rank} clipId={clip.id} />
                <span className="sr-only">{t.open(result.rank, clip.id)}</span>
              </button>
            ) : (
              <span className="flex items-baseline gap-2">
                <CardLabel rank={result.rank} clipId={clip.id} />
                <span className="sr-only">{t.label(result.rank, clip.id)}</span>
              </span>
            )}
          </h3>
          <span className="flex items-center gap-2">
            {rankChange !== undefined && rankChange !== 0 && <RankChange change={rankChange} />}
            <VerdictBadge verdict={verdict} size="sm" />
          </span>
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

/**
 * Indicateur de déplacement après reclassement : flèche + nombre (jamais la
 * couleur seule), phrase complète pour les lecteurs d'écran.
 */
function RankChange({ change }: { change: number | 'new' }) {
  const label =
    change === 'new' ? t.rankNewLong : change > 0 ? t.rankUp(change) : t.rankDown(-change);
  const visual =
    change === 'new' ? t.rankNew : `${change > 0 ? '↑' : '↓'}${String(Math.abs(change))}`;
  return (
    <span
      data-rank-change={change}
      className={cn(
        'font-mono text-2xs',
        change === 'new' || change > 0 ? 'text-accent' : 'text-ink-muted',
      )}
    >
      <span aria-hidden="true">{visual}</span>
      <span className="sr-only">{label}</span>
    </span>
  );
}

/** Rang et identifiant, visuels (le nom accessible est fourni à part). */
function CardLabel({ rank, clipId }: { rank: number; clipId: string }) {
  return (
    <>
      <span aria-hidden="true">{t.rank(rank)}</span>
      <span className="text-xs text-ink-muted" aria-hidden="true">
        {clipId}
      </span>
    </>
  );
}
