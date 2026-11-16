import { cn } from '@/lib/cn';

import { moonLitPath } from './moon-geometry';

interface MoonIconProps {
  /** `null` : phase inconnue, on dessine seulement le contour. */
  phase: number | null;
  className?: string;
}

/** Pictogramme de lune, décoratif : le nom de la phase est porté par le texte voisin. */
export function MoonIcon({ phase, className }: MoonIconProps) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className={cn('size-3', className)}>
      <circle
        cx="8"
        cy="8"
        r="6.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.6"
      />
      {phase !== null && <path d={moonLitPath(phase, 8, 8, 6.5)} fill="currentColor" />}
    </svg>
  );
}
