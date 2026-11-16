import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { colorTokens, contrastPairs } from '@/styles/tokens';
import { renderApp } from '@/test/render-app';

const renderAt = (path: string) => renderApp({ path });

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
