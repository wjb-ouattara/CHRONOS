import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { createTestApi, findResultsList, renderApp } from '@/test/render-app';

import { PAGE_SIZE } from './ResultsGrid';

/** Attend la grille de résultats et renvoie ses cartes. */
async function findCards() {
  const list = await findResultsList();
  return within(list).getAllByRole('article');
}

describe('écran Recherche', () => {
  it('propose des exemples tant qu’aucune recherche n’est lancée', async () => {
    renderApp({ path: '/recherche' });
    expect(screen.getByText('Que cherchez-vous ?')).toBeInTheDocument();
    expect(
      await screen.findByRole('button', { name: '« chimpanzé cassant des noix avec une pierre »' }),
    ).toBeInTheDocument();
  });

  it('une recherche libre affiche les cartes et inscrit la recherche dans l’adresse', async () => {
    const user = userEvent.setup();
    const { router } = renderApp({ path: '/recherche' });

    await user.type(screen.getByRole('searchbox', { name: 'Décrire un comportement' }), 'outil');
    await user.click(screen.getByRole('button', { name: 'Chercher' }));

    const cards = await findCards();
    expect(cards).toHaveLength(PAGE_SIZE);
    expect(router.state.location.search).toBe('?q=q1');
    // La première carte : rang 1, avec sa bande caméra et sa frise.
    const first = cards[0];
    if (!first) throw new Error('aucune carte');
    expect(first).toHaveAccessibleName(/^Rang 1, clip C\d{4}$/);
    expect(within(first).getByRole('img', { name: /Instant clé/ })).toBeInTheDocument();
    expect(screen.getByText('« outil »')).toBeInTheDocument();
  });

  it('un onglet de l’éthogramme lance la recherche sur ce comportement', async () => {
    const user = userEvent.setup();
    renderApp({ path: '/recherche' });

    const tab = await screen.findByRole('button', { name: /^TOOL Usage d'outil/ });
    expect(tab).toHaveAttribute('aria-pressed', 'false');
    await user.click(tab);

    await findCards();
    expect(screen.getByRole('button', { name: /^TOOL Usage d'outil/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByText(/120 clips · itération 0/)).toBeInTheDocument();
  });

  it('« Afficher plus » ajoute un lot de cartes', async () => {
    const user = userEvent.setup();
    renderApp({ path: '/recherche' });
    await user.click(await screen.findByRole('button', { name: /^TOOL Usage d'outil/ }));
    await findCards();

    await user.click(screen.getByRole('button', { name: `Afficher ${String(PAGE_SIZE)} de plus` }));
    expect(await findCards()).toHaveLength(PAGE_SIZE * 2);
  });

  it('retrouve la recherche après un rechargement (adresse ?q=)', async () => {
    const api = createTestApi();
    const { query } = await api.search({ text: '', behaviourCode: 'FEED' });
    // Nouveau rendu, même API : comme une page rechargée sur cette adresse.
    renderApp({ path: `/recherche?q=${query.id}`, api });
    expect(await findCards()).toHaveLength(PAGE_SIZE);
    expect(screen.getByRole('button', { name: /^FEED Alimentation/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('affiche un état dédié pour une recherche introuvable', async () => {
    const user = userEvent.setup();
    const { router } = renderApp({ path: '/recherche?q=inconnue' });
    expect(await screen.findByText('Recherche introuvable')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Nouvelle recherche' }));
    expect(router.state.location.search).toBe('');
    expect(screen.getByText('Que cherchez-vous ?')).toBeInTheDocument();
  });

  it('affiche une erreur avec « Réessayer » quand le service ne répond pas', async () => {
    const user = userEvent.setup();
    renderApp({ path: '/recherche', api: createTestApi({ failureRate: 1 }) });

    await user.type(screen.getByRole('searchbox'), 'outil{Enter}');
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('La recherche a échoué');
    expect(within(alert).getByRole('button', { name: 'Réessayer' })).toBeInTheDocument();
  });

  it('affiche des squelettes pendant le chargement', async () => {
    const user = userEvent.setup();
    renderApp({ path: '/recherche', api: createTestApi({ latencyMs: [50, 50] }) });
    await user.type(screen.getByRole('searchbox'), 'outil{Enter}');
    expect(screen.getByRole('status')).toHaveTextContent('Chargement en cours');
    await findCards();
  });

  it('« / » place le focus dans la barre de recherche', async () => {
    const user = userEvent.setup();
    renderApp({ path: '/recherche' });
    await user.keyboard('/');
    await waitFor(() => {
      expect(screen.getByRole('searchbox')).toHaveFocus();
    });
  });
});
