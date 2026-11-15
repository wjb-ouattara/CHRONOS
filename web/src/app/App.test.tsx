import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { App } from './App';

// Test de fumée : l'application complète (fournisseurs + routeur) démarre sur l'accueil.
describe('App', () => {
  it('affiche le nom du produit', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: 'Chronos Ethogram' })).toBeInTheDocument();
  });

  it('affiche la mention « Données de démonstration »', () => {
    render(<App />);
    expect(screen.getByText('Données de démonstration')).toBeInTheDocument();
  });
});
