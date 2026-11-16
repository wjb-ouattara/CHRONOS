import { render, screen, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it } from 'vitest';

import { routes } from '@/app/router';
import { ThemeProvider } from '@/app/theme/ThemeProvider';
import { colorTokens, contrastPairs } from '@/styles/tokens';

// Routeur « en mémoire » : pas besoin d'un vrai navigateur pour aller sur /design.
const renderAt = (path: string) =>
  render(
    <ThemeProvider>
      <RouterProvider router={createMemoryRouter(routes, { initialEntries: [path] })} />
    </ThemeProvider>,
  );

describe('page /design', () => {
  it('affiche le titre et la bascule de thème', () => {
    renderAt('/design');
    expect(
      screen.getByRole('heading', { level: 1, name: 'Système de design' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Thème clair' })).toBeInTheDocument();
  });

  it('montre chaque token de couleur dans les deux thèmes', () => {
    renderAt('/design');
    for (const token of colorTokens) {
      // Deux fois (sombre + clair) dans la section couleurs.
      expect(screen.getAllByText(token.name, { exact: true })).toHaveLength(2);
    }
  });

  it('montre une ligne par paire de contraste, toutes conformes', () => {
    renderAt('/design');
    const tables = screen.getAllByRole('table');
    expect(tables).toHaveLength(2);
    for (const table of tables) {
      // +1 pour la ligne d'en-tête.
      expect(within(table).getAllByRole('row')).toHaveLength(contrastPairs.length + 1);
      expect(within(table).queryByText('Échec')).not.toBeInTheDocument();
    }
  });
});
