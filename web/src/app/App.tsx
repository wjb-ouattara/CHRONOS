import { RouterProvider } from 'react-router';

import { router } from './router';
import { ThemeProvider } from './theme/ThemeProvider';

/** Composant racine : les fournisseurs globaux, puis le routeur. */
export function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
