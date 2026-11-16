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
  className,
}: CameraStripProps) {
  const { date, time } = splitLocalDateTime(recordedAt);
  const temp = formatTemperature(temperatureC);
  const moon = moonPhaseName(moonPhase);

  return (
    <div
      data-theme="dark"
      className={cn(
        'flex h-5 items-center gap-3 bg-canvas px-2 font-mono text-2xs tracking-stamp text-stamp uppercase',
        className,
      )}
    >
      {/* Version compacte, visuelle : masquée aux lecteurs d'écran… */}
      <span aria-hidden="true" className="flex min-w-0 flex-1 items-center gap-3">
        <span className="truncate">
          {siteId} · {cameraId}
        </span>
        <span className="ml-auto whitespace-nowrap">
          {date} {time}
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
