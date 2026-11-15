import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import { ThemeProvider } from '@/app/theme/ThemeProvider';
import { readString, storageKeys } from '@/lib/storage';

import { ThemeToggle } from './ThemeToggle';

const renderToggle = () =>
  render(
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>,
  );

describe('ThemeToggle', () => {
  afterEach(() => {
    window.localStorage.clear();
    delete document.documentElement.dataset.theme;
  });

  it('démarre en thème sombre par défaut', () => {
    renderToggle();
    expect(screen.getByRole('button', { name: 'Thème clair' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('bascule le thème, au clic comme au clavier, et le mémorise', async () => {
    const user = userEvent.setup();
    renderToggle();
    const button = screen.getByRole('button', { name: 'Thème clair' });

    await user.click(button);
    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(readString(storageKeys.theme)).toBe('light');

    // Au clavier : Tab pour atteindre le bouton (déjà focalisé ici), Entrée pour l'activer.
    await user.keyboard('{Enter}');
    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('reprend le thème enregistré au démarrage', () => {
    window.localStorage.setItem(storageKeys.theme, 'light');
    renderToggle();
    expect(screen.getByRole('button', { name: 'Thème clair' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('ignore une valeur enregistrée invalide', () => {
    window.localStorage.setItem(storageKeys.theme, 'violet');
    renderToggle();
    expect(document.documentElement.dataset.theme).toBe('dark');
  });
});
