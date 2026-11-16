import { useId, useMemo } from 'react';

import { cn } from '@/lib/cn';

import { buildScene, H, W } from './scene';

interface ProceduralThumbnailProps {
  seed: number;
  /** Nuit : vert-gris infrarouge. Jour : tons ambrés. */
  isNight: boolean;
  className?: string;
}

/**
 * Vignette générée procéduralement, placeholder élégant d'une image de
 * caméra piège. Décorative (`aria-hidden`) : la carte porte l'information.
 */
export function ProceduralThumbnail({ seed, isNight, className }: ProceduralThumbnailProps) {
  // useMemo : la scène n'est recalculée que si la graine change.
  const scene = useMemo(() => buildScene(seed), [seed]);
  // Identifiants uniques par vignette (dégradés et filtres SVG sont référencés
  // par id ; deux vignettes avec le même id se voleraient leurs filtres).
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const tone = (step: 1 | 2 | 3 | 4 | 5) =>
    `var(--image-${isNight ? 'night' : 'day'}-${String(step)})`;

  return (
    <svg
      viewBox={`0 0 ${String(W)} ${String(H)}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      data-seed={seed}
      className={cn('block aspect-[720/404] w-full', className)}
    >
      <defs>
        <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: tone(2) }} />
          <stop offset="1" style={{ stopColor: tone(1) }} />
        </linearGradient>
        <radialGradient id={`${uid}-glow`}>
          <stop offset="0" style={{ stopColor: tone(4), stopOpacity: isNight ? 0.55 : 0.45 }} />
          <stop offset="1" style={{ stopColor: tone(4), stopOpacity: 0 }} />
        </radialGradient>
        <radialGradient id={`${uid}-vignette`} r="0.75">
          <stop offset="0.55" style={{ stopColor: tone(1), stopOpacity: 0 }} />
          <stop offset="1" style={{ stopColor: tone(1), stopOpacity: 0.85 }} />
        </radialGradient>
        <filter id={`${uid}-blur`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
        {/* Grain : bruit fractal, désaturé, utilisé comme texture de capteur. */}
        <filter id={`${uid}-grain`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={seed % 997} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </defs>

      <rect width={W} height={H} fill={`url(#${uid}-sky)`} />
      <circle cx={scene.glow.cx} cy={scene.glow.cy} r={scene.glow.r} fill={`url(#${uid}-glow)`} />

      <g filter={`url(#${uid}-blur)`}>
        {scene.trunks.map((t, i) => (
          <rect
            key={i}
            x={t.x}
            y={-20}
            width={t.width}
            height={H + 40}
            transform={`rotate(${t.lean.toFixed(1)} ${t.x.toFixed(0)} ${String(H)})`}
            style={{ fill: tone(t.tone) }}
            opacity={0.8}
          />
        ))}
        <path d={scene.ground} style={{ fill: tone(2) }} />
        {scene.leaves.map((l, i) => (
          <ellipse
            key={i}
            cx={l.cx}
            cy={l.cy}
            rx={l.rx}
            ry={l.ry}
            transform={`rotate(${l.rotate.toFixed(1)} ${l.cx.toFixed(0)} ${l.cy.toFixed(0)})`}
            style={{ fill: tone(l.tone) }}
            opacity={l.opacity}
          />
        ))}
      </g>

      <rect width={W} height={H} fill={`url(#${uid}-vignette)`} />
      <rect
        width={W}
        height={H}
        filter={`url(#${uid}-grain)`}
        opacity={isNight ? 0.22 : 0.14}
        style={{ mixBlendMode: 'overlay' }}
      />
    </svg>
  );
}
