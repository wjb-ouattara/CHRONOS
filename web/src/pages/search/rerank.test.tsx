import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { ChronosApi } from '@/api/types';
import type { SearchResult, Verdict } from '@/domain/types';
import { createTestApi, findResultsList, renderApp } from '@/test/render-app';

import { computeRankChanges } from './useRerankFlow';

const result = (clipId: string, rank: number): SearchResult => ({
  clipId,
  rank,
  score: 1 - rank / 100,
  bestMomentS: 7,
  secondScores: [],
});

describe('computeRankChanges', () => {
  it('calcule les places gagnées ou perdues, et repère les nouveaux venus', () => {
    const before = [result('A', 1), result('B', 2), result('C', 30)];
    const after = [result('C', 1), result('A', 2), result('B', 3), result('D', 4)];
    const changes = computeRankChanges(before, after);
    expect(changes.get('C')).toBe('new'); // 30e → 1er : entre dans les premiers résultats
    expect(changes.get('A')).toBe(-1);
    expect(changes.get('B')).toBe(-1);
    expect(changes.get('D')).toBe('new'); // absent avant
  });

  it('un clip qui ne bouge pas a un déplacement nul', () => {
    expect(computeRankChanges([result('A', 1)], [result('A', 1)]).get('A')).toBe(0);
  });
});

/** Recherche TOOL avec quelques validations, écran ouvert dessus. */
async function setup(
  api: ChronosApi = createTestApi(),
  verdicts: readonly Verdict[] = ['yes', 'no', 'yes'],
) {
  const response = await api.search({ text: '', behaviourCode: 'TOOL' });
  for (const [i, verdict] of verdicts.entries()) {
    const clipId = response.results[i]?.clipId ?? '';
    await api.saveValidation({ queryId: response.query.id, clipId, verdict });
  }
  const view = renderApp({ path: `/recherche?q=${response.query.id}`, api });
  await findResultsList();
  return { ...view, response };
}

const cardIds = () =>
  screen
    .getAllByRole('article')
    .map((card) => card.getAttribute('data-clip-id'))
    .filter(Boolean);

describe('reclassement', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('« R » reclasse : l’itération augmente et l’ordre change', async () => {
    const user = userEvent.setup();
    await setup();
    const before = cardIds();

    await user.keyboard('r');
    expect(await screen.findByText(/clips · itération 1/)).toBeInTheDocument();
    await waitFor(() => {
      expect(cardIds()).not.toEqual(before);
    });
  });

  it('le bouton reclasse aussi, et annonce le résultat aux lecteurs d’écran', async () => {
    const user = userEvent.setup();
    await setup();
    await user.click(screen.getByRole('button', { name: 'Apprendre de mes validations' }));
    expect(await screen.findByText(/^Résultats reclassés \(itération 1\)/)).toBeInTheDocument();
  });

  it('affiche ↑ ↓ « nouveau » conformes au déplacement réel des cartes', async () => {
    const user = userEvent.setup();
    const { api, response } = await setup();
    const rankBefore = new Map(response.results.map((r) => [r.clipId, r.rank]));

    await user.keyboard('r');
    await screen.findByText(/clips · itération 1/);
    const after = await api.getSearch(response.query.id);

    for (const r of after.results.slice(0, 24)) {
      const card = screen.getByRole('article', {
        name: `Rang ${String(r.rank)}, clip ${r.clipId}`,
      });
      const old = rankBefore.get(r.clipId);
      const indicator = card.querySelector('[data-rank-change]');
      if (old === undefined || old > 24) {
        expect(indicator).toHaveTextContent('nouveau');
      } else if (old === r.rank) {
        expect(indicator).toBeNull();
      } else {
        expect(indicator?.getAttribute('data-rank-change')).toBe(String(old - r.rank));
      }
    }
  });

  it('désactivé sans validation « oui » ou « non » ; « incertain » seul ne suffit pas', async () => {
    const user = userEvent.setup();
    await setup(createTestApi(), ['unsure']);
    const button = screen.getByRole('button', { name: 'Apprendre de mes validations' });
    expect(button).toBeDisabled();
    expect(button).toHaveAccessibleDescription(
      'Validez au moins un clip (oui ou non) pour reclasser.',
    );
    await user.keyboard('r');
    expect(screen.getByText(/clips · itération 0/)).toBeInTheDocument();
  });

  it('balayage phosphore affiché… sauf en mouvement réduit', async () => {
    const user = userEvent.setup();
    await setup();
    await user.keyboard('r');
    await screen.findByText(/clips · itération 1/);
    expect(screen.getByTestId('phosphor-sweep')).toBeInTheDocument();
  });

  it('aucun balayage si l’utilisateur a demandé moins de mouvement', async () => {
    vi.spyOn(window, 'matchMedia').mockImplementation(
      (query: string) =>
        ({
          matches: query.includes('reduce'),
          media: query,
          addEventListener: () => undefined,
          removeEventListener: () => undefined,
        }) as unknown as MediaQueryList,
    );
    const user = userEvent.setup();
    await setup();
    await user.keyboard('r');
    await screen.findByText(/clips · itération 1/);
    expect(screen.queryByTestId('phosphor-sweep')).not.toBeInTheDocument();
    // Les indicateurs restent : c'est de l'information, pas de l'animation.
    expect(document.querySelector('[data-rank-change]')).not.toBeNull();
  });

  it('en cas d’échec : message et « Réessayer », le classement précédent reste affiché', async () => {
    const user = userEvent.setup();
    const base = createTestApi();
    let fail = true;
    const api: ChronosApi = {
      ...base,
      rerank: (queryId) => (fail ? Promise.reject(new Error('panne')) : base.rerank(queryId)),
    };
    await setup(api);
    const before = cardIds();

    await user.keyboard('r');
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Reclassement impossible.');
    expect(cardIds()).toEqual(before);
    expect(screen.getByText(/clips · itération 0/)).toBeInTheDocument();

    fail = false;
    await user.click(within(alert).getByRole('button', { name: 'Réessayer' }));
    expect(await screen.findByText(/clips · itération 1/)).toBeInTheDocument();
  });

  it('un rechargement retrouve l’itération et le classement', async () => {
    const user = userEvent.setup();
    const { api, response, unmount } = await setup();
    await user.keyboard('r');
    await screen.findByText(/clips · itération 1/);
    // Les cartes sorties du lot s'effacent en fondu : on attend la fin de leur sortie.
    await waitFor(() => {
      expect(cardIds()).toHaveLength(24);
    });
    const order = cardIds();
    unmount();

    renderApp({ path: `/recherche?q=${response.query.id}`, api });
    await findResultsList();
    expect(screen.getByText(/clips · itération 1/)).toBeInTheDocument();
    expect(cardIds()).toEqual(order);
  });
});
