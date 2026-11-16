import { createMockApi } from './mock-api';
import type { ChronosApi } from './types';

/**
 * Taux de panne simulé, lu dans l'adresse : `?fail=0.5` fait échouer la
 * moitié des appels, pour vérifier les états d'erreur à la main.
 * UNIQUEMENT en développement : `import.meta.env.DEV` vaut `false` dans le
 * build de production, et Vite y supprime ce code.
 */
function devFailureRate(): number {
  if (!import.meta.env.DEV) return 0;
  const value = Number(new URLSearchParams(window.location.search).get('fail'));
  return Number.isFinite(value) ? Math.min(Math.max(value, 0), 1) : 0;
}

/**
 * L'API de l'application. Phase 4 : remplacer cette ligne par l'API HTTP ;
 * aucun écran n'aura à changer.
 */
export function createAppApi(): ChronosApi {
  return createMockApi({ failureRate: devFailureRate() });
}
