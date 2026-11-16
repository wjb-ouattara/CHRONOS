import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { renderApp } from '@/test/render-app';

import { AppLayout } from './AppLayout';
import { RootError, ScreenError } from './RouteError';

describe('mise en page', () => {
  afterEach(() => {
    window.localStorage.clear();
  });

  it('affiche en permanence le bandeau « Données de démonstration »', () => {
    renderApp({ path: '/session' });
    expect(screen.getByText('Données de démonstration')).toBeInTheDocument();
    expect(screen.getByText(/Aucun résultat réel/)).toBeInTheDocument();
  });

  it('navigue entre les écrans et marque la page active (aria-current)', async () => {
    const user = userEvent.setup();
    renderApp({ path: '/' });
    const nav = screen.getByRole('navigation', { name: 'Navigation principale' });

    expect(within(nav).getByRole('link', { name: 'Collection' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await user.click(within(nav).getByRole('link', { name: 'Recherche' }));
    expect(screen.getByRole('heading', { level: 1, name: 'Recherche' })).toBeInTheDocument();
    expect(within(nav).getByRole('link', { name: 'Recherche' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(within(nav).getByRole('link', { name: 'Collection' })).not.toHaveAttribute(
      'aria-current',
    );
  });

  it('après un changement de page, place le focus sur le titre et met à jour l’onglet', async () => {
    const user = userEvent.setup();
    renderApp({ path: '/' });
    await user.click(screen.getByRole('link', { name: 'Session' }));

    expect(screen.getByRole('heading', { level: 1, name: 'Session & export' })).toHaveFocus();
    expect(document.title).toBe('Session & export · Chronos Ethogram');
  });

  it('se parcourt au clavier dans un ordre logique, en commençant par le lien d’évitement', async () => {
    const user = userEvent.setup();
    renderApp({ path: '/' });

    await user.tab();
    expect(screen.getByRole('link', { name: 'Aller au contenu' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('link', { name: 'Chronos Ethogram, accueil' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('link', { name: 'Collection' })).toHaveFocus();
  });

  it('le lien d’évitement envoie le focus au contenu principal', async () => {
    const user = userEvent.setup();
    renderApp({ path: '/' });
    await user.tab();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('main')).toHaveFocus();
  });

  it('affiche une page 404 pour une adresse inconnue', () => {
    renderApp({ path: '/nimporte-quoi' });
    expect(screen.getByRole('heading', { level: 1, name: 'Page introuvable' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Retour à la collection' })).toBeInTheDocument();
  });

  it('remplace un écran qui plante par un message d’erreur (pas une page blanche)', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const Broken = () => {
      throw new Error('boum');
    };
    renderApp({
      path: '/',
      routeList: [
        {
          Component: AppLayout,
          ErrorBoundary: RootError,
          children: [
            { ErrorBoundary: ScreenError, children: [{ index: true, Component: Broken }] },
          ],
        },
      ],
    });
    expect(screen.getByRole('alert')).toHaveTextContent('Cet écran a rencontré un problème');
    expect(screen.getByRole('button', { name: 'Recharger la page' })).toBeInTheDocument();
    // La mise en page reste visible : bandeau démo et navigation.
    expect(screen.getByText('Données de démonstration')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Navigation principale' })).toBeInTheDocument();
  });
});

describe('aide des raccourcis', () => {
  it('« ? » ouvre l’aide, Échap la ferme', async () => {
    const user = userEvent.setup();
    renderApp({ path: '/' });

    await user.keyboard('?');
    const dialog = screen.getByRole('dialog', { name: 'Raccourcis clavier' });
    expect(dialog).toHaveAttribute('open');
    expect(within(dialog).getByText('Valider « oui »')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(dialog).not.toHaveAttribute('open');
  });

  it('le bouton « Raccourcis » ouvre aussi l’aide, et le bouton Fermer la ferme', async () => {
    const user = userEvent.setup();
    renderApp({ path: '/' });
    await user.click(screen.getByRole('button', { name: 'Raccourcis' }));
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('open');
    await user.click(within(dialog).getByRole('button', { name: 'Fermer' }));
    expect(dialog).not.toHaveAttribute('open');
  });

  it('« ? » tapé dans un champ de saisie n’ouvre rien', async () => {
    const user = userEvent.setup();
    renderApp({ path: '/design' }); // la page design contient des champs
    await user.type(screen.getAllByRole('searchbox')[0] ?? document.body, '?');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('ignore les combinaisons avec Ctrl (raccourcis du navigateur)', async () => {
    const user = userEvent.setup();
    renderApp({ path: '/' });
    await user.keyboard('{Control>}?{/Control}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
