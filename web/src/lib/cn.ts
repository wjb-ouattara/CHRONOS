/**
 * Assemble des classes CSS en ignorant les valeurs vides :
 *   cn('a', isActive && 'b', undefined) → 'a b' ou 'a'
 * Remplace la petite dépendance `clsx`, inutile pour un besoin aussi simple.
 */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
