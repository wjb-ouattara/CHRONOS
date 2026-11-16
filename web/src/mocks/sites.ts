import type { Site } from '@/domain/types';

// Sites fictifs, libellés neutres. Jamais de coordonnées (règle du projet),
// même inventées : elles pourraient être prises pour de vrais emplacements.
export const sites: readonly Site[] = [
  { id: 'S01', label: 'Site 01', habitat: 'forest' },
  { id: 'S02', label: 'Site 02', habitat: 'mosaic' },
  { id: 'S03', label: 'Site 03', habitat: 'savanna' },
];

export const CAMERAS_PER_SITE = 8;

/** Caméras CAM-01 à CAM-24 : 8 par site, dans l'ordre des sites. */
export const cameras: readonly { id: string; siteId: string }[] = sites.flatMap((site, s) =>
  Array.from({ length: CAMERAS_PER_SITE }, (_, i) => ({
    id: `CAM-${String(s * CAMERAS_PER_SITE + i + 1).padStart(2, '0')}`,
    siteId: site.id,
  })),
);

/** Température moyenne de base par habitat (°C), pour des valeurs plausibles. */
export const habitatBaseTemperature: Record<Site['habitat'], number> = {
  forest: 24,
  mosaic: 26,
  savanna: 28,
};
