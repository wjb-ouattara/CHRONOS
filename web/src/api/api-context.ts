import { createContext, useContext } from 'react';

import type { ChronosApi } from './types';

/**
 * L'API utilisée par les écrans, fournie par <ApiProvider>. Les écrans ne
 * savent pas s'il s'agit de l'API fictive ou (plus tard) de l'API HTTP.
 */
export const ApiContext = createContext<ChronosApi | null>(null);

export function useApi(): ChronosApi {
  const api = useContext(ApiContext);
  if (!api) throw new Error('useApi() doit être appelé à l’intérieur de <ApiProvider>.');
  return api;
}
