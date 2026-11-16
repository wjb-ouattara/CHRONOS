import { createBrowserRouter, type RouteObject } from 'react-router';

import { DesignPage } from '@/pages/design/DesignPage';
import { HomePage } from '@/pages/HomePage';

// Routage minimal pour l'étape 2. La mise en page commune (en-tête,
// navigation, bandeau démo) sera ajoutée à l'étape 5 sous forme de route parente.
// Exporté séparément pour que les tests puissent créer un routeur en mémoire.
export const routes: RouteObject[] = [
  { path: '/', Component: HomePage },
  { path: '/design', Component: DesignPage },
];

export const router = createBrowserRouter(routes);
