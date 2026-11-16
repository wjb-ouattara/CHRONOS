/**
 * Calcule la partie éclairée de la lune pour une phase donnée.
 * Phase : 0 = nouvelle lune, 0,25 = premier quartier, 0,5 = pleine lune.
 *
 * La zone éclairée est délimitée par deux arcs :
 *  1. un demi-cercle sur le bord éclairé (droite quand la lune croît) ;
 *  2. le « terminateur » (limite jour/nuit), une demi-ellipse dont la
 *     largeur vaut r × |cos(2π × phase)| : nulle aux quartiers, maximale
 *     à la nouvelle et à la pleine lune.
 */
export function moonLitPath(phase: number, cx: number, cy: number, r: number): string {
  const p = ((phase % 1) + 1) % 1;
  const waxing = p < 0.5;
  const gibbous = Math.abs(p - 0.5) < 0.25; // plus qu'à moitié éclairée
  const rx = r * Math.abs(Math.cos(2 * Math.PI * p));

  // `sweep` = sens de parcours de l'arc en SVG (1 = sens horaire, l'axe y pointant vers le bas).
  const outerSweep = waxing ? 1 : 0;
  const innerSweep = waxing === gibbous ? 1 : 0;

  const top = `${String(cx)} ${String(cy - r)}`;
  const bottom = `${String(cx)} ${String(cy + r)}`;
  return `M ${top} A ${String(r)} ${String(r)} 0 0 ${String(outerSweep)} ${bottom} A ${rx.toFixed(3)} ${String(r)} 0 0 ${String(innerSweep)} ${top} Z`;
}
