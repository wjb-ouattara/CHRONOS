import { between, createRandom, integerBetween } from '@/lib/random';

// Format des clips PanAf20K : 720 × 404.
export const W = 720;
export const H = 404;

interface Leaf {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  rotate: number;
  tone: 3 | 4 | 5;
  opacity: number;
}

interface Trunk {
  x: number;
  width: number;
  tone: 2 | 3;
  lean: number;
}

interface Scene {
  trunks: Trunk[];
  leaves: Leaf[];
  ground: string; // chemin SVG du sol
  glow: { cx: number; cy: number; r: number };
}

/**
 * Décrit une scène de sous-bois à partir d'une graine. Fonction pure :
 * même graine → même scène (testé). Aucune image réelle n'est utilisée.
 */
export function buildScene(seed: number): Scene {
  const random = createRandom(seed);

  const trunks = Array.from({ length: integerBetween(random, 2, 4) }, (): Trunk => ({
    x: between(random, 0, W),
    width: between(random, 18, 60),
    tone: random() < 0.5 ? 2 : 3,
    lean: between(random, -6, 6),
  }));

  // Feuillage concentré en haut et sur les bords, comme vu depuis un tronc.
  const leaves = Array.from({ length: integerBetween(random, 14, 22) }, (): Leaf => {
    const edge = random() < 0.5;
    return {
      cx: edge
        ? random() < 0.5
          ? between(random, -40, 160)
          : between(random, 560, 760)
        : between(random, 0, W),
      cy: edge ? between(random, 0, H) : between(random, -30, 140),
      rx: between(random, 30, 110),
      ry: between(random, 10, 34),
      rotate: between(random, -70, 70),
      tone: ([3, 4, 5] as const)[integerBetween(random, 0, 2)] ?? 3,
      opacity: between(random, 0.25, 0.7),
    };
  });

  // Sol ondulé sur le dernier quart de l'image.
  const base = between(random, 300, 340);
  const points = Array.from({ length: 7 }, (_, i) => {
    const x = (i / 6) * W;
    return `${x.toFixed(0)} ${(base + between(random, -18, 18)).toFixed(0)}`;
  });
  const ground = `M0 ${String(H)} L${points.join(' L')} L${String(W)} ${String(H)} Z`;

  // Zone éclairée : le flash infrarouge la nuit, une trouée de lumière le jour.
  const glow = {
    cx: between(random, 220, 500),
    cy: between(random, 140, 260),
    r: between(random, 160, 260),
  };

  return { trunks, leaves, ground, glow };
}
