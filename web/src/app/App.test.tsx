import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { App } from './App';

// Test de fumée : l'application complète (fournisseurs + routeur) démarre sur la collection.
describe('App', () => {
  it('démarre sur l’écran Collection, avec le bandeau de démonstration', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: 'Collection' })).toBeInTheDocument();
    expect(screen.getByText('Données de démonstration')).toBeInTheDocument();
  });
});
