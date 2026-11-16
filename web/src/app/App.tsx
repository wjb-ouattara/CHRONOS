import { useState } from 'react';
import { RouterProvider } from 'react-router';

import { ApiProvider } from '@/api/ApiProvider';
import { createAppApi } from '@/api/default-api';
import { createQueryClient } from '@/api/query-client';

import { router } from './router';
import { ThemeProvider } from './theme/ThemeProvider';

/** Composant racine : les fournisseurs globaux, puis le routeur. */
export function App() {
  // Créés une seule fois (fonction d'initialisation de useState), pas à chaque rendu.
  const [api] = useState(createAppApi);
  const [queryClient] = useState(createQueryClient);

  return (
    <ThemeProvider>
      <ApiProvider api={api} queryClient={queryClient}>
        <RouterProvider router={router} />
      </ApiProvider>
    </ThemeProvider>
  );
}
