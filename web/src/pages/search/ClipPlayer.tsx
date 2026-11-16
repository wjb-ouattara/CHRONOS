import { Crosshair, Pause, Play } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { useShortcut } from '@/app/useShortcut';
import { CameraStrip } from '@/components/domain/CameraStrip';
import { ProceduralThumbnail } from '@/components/domain/ProceduralThumbnail';
import { RelevanceTimeline } from '@/components/domain/RelevanceTimeline';
import { Button } from '@/components/ui/Button';
import { strings } from '@/content/strings';
import type { Clip, SearchResult } from '@/domain/types';
import { useReducedMotion } from '@/lib/useReducedMotion';

const t = strings.pages.loupe;

const formatTime = (s: number) =>
  `00:${Math.floor(s).toString().padStart(2, '0')}.${String(Math.floor((s % 1) * 10))}`;

interface ClipPlayerProps {
  clip: Clip;
  result: SearchResult;
}

/**
 * Lecteur SIMULÉ : aucune vidéo, seulement la vignette procédurale avec un
 * lent travelling et un curseur de lecture sur les 15 s. Démarre à
 * l'instant clé. Le parent change la `key` à chaque clip : l'état repart à zéro.
 */
export function ClipPlayer({ clip, result }: ClipPlayerProps) {
  const duration = clip.durationS;
  const [currentS, setCurrentS] = useState<number>(result.bestMomentS);
  const [playing, setPlaying] = useState(false);
  const reducedMotion = useReducedMotion();

  // Valeur courante lue par la boucle d'animation sans la réinstaller à chaque
  // image. Mise à jour dans un effet : on n'écrit pas une ref pendant le rendu.
  const currentRef = useRef(currentS);
  useEffect(() => {
    currentRef.current = currentS;
  });

  // Boucle de lecture : requestAnimationFrame appelle `tick` à chaque image
  // (~60 fois par seconde) ; on avance du temps réellement écoulé.
  useEffect(() => {
    if (!playing) return;
    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const next = currentRef.current + (now - last) / 1000;
      currentRef.current = next;
      last = now;
      if (next >= duration) {
        setCurrentS(duration);
        setPlaying(false); // fin du clip : on s'arrête
        return;
      }
      setCurrentS(next);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
    };
  }, [playing, duration]);

  const togglePlay = () => {
    // Relancer depuis la fin repart du début.
    if (!playing && currentRef.current >= duration) setCurrentS(0);
    setPlaying((p) => !p);
  };
  useShortcut('playPause', togglePlay);

  // Travelling lent, proportionnel à la position (désactivé si mouvement réduit).
  const progress = currentS / duration;
  const transform = reducedMotion
    ? undefined
    : `scale(${String(1.04 + 0.08 * progress)}) translateX(${String(-2 + 4 * progress)}%)`;

  return (
    <div className="grid gap-3">
      <figure className="overflow-hidden rounded-md border border-line">
        <div className="overflow-hidden">
          <div style={{ transform, transformOrigin: '50% 60%' }}>
            <ProceduralThumbnail seed={clip.thumbnailSeed} isNight={clip.isNight} />
          </div>
        </div>
        <CameraStrip
          siteId={clip.siteId}
          cameraId={clip.cameraId}
          recordedAt={clip.recordedAt}
          temperatureC={clip.temperatureC}
          moonPhase={clip.moonPhase}
          isNight={clip.isNight}
        />
        <figcaption className="sr-only">{t.simulated}</figcaption>
      </figure>

      <p className="font-mono text-2xs tracking-stamp text-ink-muted uppercase" aria-hidden="true">
        {t.simulated}
      </p>

      <RelevanceTimeline
        scores={result.secondScores}
        bestMomentS={result.bestMomentS}
        variant="large"
        currentS={currentS}
        className="mt-4"
      />

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="secondary"
          icon={playing ? Pause : Play}
          aria-keyshortcuts="p"
          onClick={togglePlay}
        >
          {playing ? t.pause : t.play}
        </Button>
        <input
          type="range"
          min={0}
          max={duration}
          step={0.1}
          value={currentS}
          aria-label={t.seek}
          aria-valuetext={t.seekValue(currentS.toFixed(1).replace('.', ','), duration)}
          onChange={(event) => {
            setPlaying(false);
            setCurrentS(Number(event.target.value));
          }}
          className="h-1 min-w-0 flex-1 cursor-pointer accent-accent"
        />
        <span className="w-14 text-right font-mono text-xs text-ink-muted">
          {formatTime(currentS)}
        </span>
      </div>

      <Button
        size="sm"
        variant="ghost"
        icon={Crosshair}
        className="justify-self-start"
        onClick={() => {
          setPlaying(false);
          setCurrentS(result.bestMomentS);
        }}
      >
        {t.keyMoment}
      </Button>
    </div>
  );
}
