import { createBrowserRouter, type RouteObject } from 'react-router';

import { DesignPage } from '@/pages/design/DesignPage';
import { CollectionPage, NotFoundPage, SearchPage, SessionPage } from '@/pages/placeholders';

import { AppLayout } from './layout/AppLayout';
import { RootError, ScreenError } from './layout/RouteError';

// Une route PARENTE (AppLayout : en-tête, bandeau démo) et ses enfants,
// affichés à la place de <Outlet />. Deux limites d'erreur (ErrorBoundary) :
// ScreenError pour un écran qui plante (la mise en page reste visible),
// RootError si la mise en page elle-même plante.
// Exporté séparément pour les tests (routeur en mémoire).
export const routes: RouteObject[] = [
  {
    Component: AppLayout,
    ErrorBoundary: RootError,
    children: [
      {
        // Route « sans chemin » : elle ne sert qu'à poser une limite d'erreur
        // à l'intérieur de la mise en page.
        ErrorBoundary: ScreenError,
        children: [
          { index: true, Component: CollectionPage },
          { path: 'recherche', Component: SearchPage },
          { path: 'session', Component: SessionPage },
          { path: 'design', Component: DesignPage },
          { path: '*', Component: NotFoundPage },
        ],
      },
    ],
  },
];

export const router = createBrowserRouter(routes);
