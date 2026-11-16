import { strings } from '@/content/strings';
import { cn } from '@/lib/cn';
import { formatTemperature, moonPhaseName, splitLocalDateTime } from '@/lib/format';

import { MoonIcon } from './MoonIcon';

export interface CameraStripProps {
  siteId: string;
  cameraId: string;
  recordedAt: string | null;
  temperatureC: number | null;
  moonPhase: number | null;
  isNight: boolean;
  /**
   * Version resserrée pour les cartes étroites : heure sans les secondes et
   * sans espacement des lettres. L'identifiant site · caméra n'est JAMAIS
   * tronqué : c'est l'information principale de la bande.
   */
  compact?: boolean;
  className?: string;
}

/**
 * La bande d'informations incrustée par les caméras pièges en bas de l'image.
 * Toujours noire à texte ambre, quel que soit le thème (`data-theme="dark"`
 * forcé), comme une vraie incrustation de caméra.
 */
export function CameraStrip({
  siteId,
  cameraId,
  recordedAt,
  temperatureC,
  moonPhase,
  isNight,
  compact = false,
  className,
}: CameraStripProps) {
  const { date, time } = splitLocalDateTime(recordedAt);
  const temp = formatTemperature(temperatureC);
  const moon = moonPhaseName(moonPhase);

  return (
    <div
      data-theme="dark"
      className={cn(
        'flex h-5 items-center bg-canvas px-2 font-mono text-2xs text-stamp uppercase',
        compact ? 'gap-2' : 'gap-3 tracking-stamp',
        className,
      )}
    >
      {/* Version compacte, visuelle : masquée aux lecteurs d'écran… */}
      <span
        aria-hidden="true"
        className={cn('flex min-w-0 flex-1 items-center', compact ? 'gap-2' : 'gap-3')}
      >
        <span className="shrink-0 whitespace-nowrap">
          {siteId} · {cameraId}
        </span>
        {/* Si la place manque vraiment, c'est la date qui se tronque, pas la caméra. */}
        <span className="ml-auto min-w-0 truncate">
          {date} {compact ? time.slice(0, 5) : time}
        </span>
        <span className="whitespace-nowrap">{temp}</span>
        {isNight && <span className="text-ink-muted">IR</span>}
        <MoonIcon phase={moonPhase} />
      </span>
      {/* …qui lisent à la place une phrase complète. */}
      <span className="sr-only">
        {strings.strip.describe({
          site: siteId,
          camera: cameraId,
          when: recordedAt === null ? strings.strip.unknownDate : strings.strip.when(date, time),
          temp: temperatureC === null ? strings.strip.unknownTemperature : temp,
          moon,
          period: isNight ? strings.strip.night : strings.strip.day,
        })}
      </span>
    </div>
  );
}
