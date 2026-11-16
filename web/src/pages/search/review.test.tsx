import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import type { ChronosApi } from '@/api/types';
import { createTestApi, renderApp } from '@/test/render-app';

/** Prépare une recherche TOOL et rend l'écran directement dessus. */
async function setup(api: ChronosApi = createTestApi(), extraParams = '') {
  const { query } = await api.search({ text: '', behaviourCode: 'TOOL' });
  const view = renderApp({ path: `/recherche?q=${query.id}${extraParams}`, api });
  await screen.findByRole('list', { name: 'Résultats classés par pertinence' });
  return { ...view, queryId: query.id };
}

const loupe = () => screen.getByRole('complementary', { name: /^Loupe, clip/ });
const selectedClipId = () => /C\d{4}/.exec(loupe().getAttribute('aria-label') ?? '')?.[0];

describe('loupe et validation au clavier', () => {
  it('parcours complet de 20 clips sans souris', async () => {
    const user = userEvent.setup();
    const { api, queryId } = await setup();

    await user.keyboard('j'); // ouvre le premier clip
    expect(loupe()).toBeInTheDocument();

    const keys = ['y', 'n', 'u', 'y', 'y'];
    const seen: string[] = [];
    for (let i = 0; i < 20; i++) {
      const before = selectedClipId();
      if (!before) throw new Error('aucun clip ouvert');
      seen.push(before);
      await user.keyboard(keys[i % keys.length] ?? 'y');
      // Passage automatique au clip suivant (sauf après le dernier).
      if (i < 19) {
        await waitFor(() => {
          expect(selectedClipId()).not.toBe(before);
        });
      }
    }

    expect(new Set(seen).size).toBe(20); // 20 clips différents, dans l'ordre
    expect(
      await screen.findByText('20 validés · 12 oui · 4 non · 4 incertains'),
    ).toBeInTheDocument();
    await waitFor(async () => {
      expect(await api.listValidations(queryId)).toHaveLength(20);
    });
  }, 20_000); // parcours de bout en bout : 20 × (pause de 150 ms + rendu)

  it('les validations survivent à un rechargement ; la loupe se rouvre sur le clip de l’adresse', async () => {
    const user = userEvent.setup();
    const { api, queryId, unmount } = await setup();
    await user.keyboard('j');
    const first = selectedClipId() ?? '';
    await user.keyboard('y');
    await waitFor(() => {
      expect(selectedClipId()).not.toBe(first);
    });
    unmount();

    // « Rechargement » : nouveau rendu, même API (même stockage), même adresse.
    renderApp({ path: `/recherche?q=${queryId}&clip=${first}`, api });
    await screen.findByRole('complementary', { name: `Loupe, clip ${first}` });
    expect(screen.getByRole('button', { name: /^Oui/ })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('1 validés · 1 oui · 0 non · 0 incertains')).toBeInTheDocument();
  });

  it('un clic sur une carte ouvre la loupe et l’inscrit dans l’adresse', async () => {
    const user = userEvent.setup();
    const { router } = await setup();
    const cards = screen.getAllByRole('button', { name: /^Ouvrir le clip/ });
    await user.click(cards[2] ?? document.body);

    const id = selectedClipId() ?? '';
    expect(router.state.location.search).toContain(`clip=${id}`);
    expect(
      screen.getByRole('button', { name: new RegExp(`Ouvrir le clip ${id}`) }),
    ).toHaveAttribute('aria-current', 'true');
  });

  it('Échap ferme la loupe et rend le focus à la carte', async () => {
    const user = userEvent.setup();
    await setup();
    await user.keyboard('j');
    const id = selectedClipId() ?? '';
    await user.keyboard('{Escape}');

    expect(screen.queryByRole('complementary', { name: /^Loupe/ })).not.toBeInTheDocument();
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: new RegExp(`Ouvrir le clip ${id}`) }),
      ).toHaveFocus();
    });
  });

  it('K revient au clip précédent ; un nouveau verdict remplace l’ancien', async () => {
    const user = userEvent.setup();
    await setup();
    await user.keyboard('j');
    const first = selectedClipId();
    await user.keyboard('y');
    await waitFor(() => {
      expect(selectedClipId()).not.toBe(first);
    });

    await user.keyboard('k');
    expect(selectedClipId()).toBe(first);
    await user.keyboard('n');
    expect(await screen.findByText('1 validés · 0 oui · 1 non · 0 incertains')).toBeInTheDocument();
  });

  it('taper dans la note ne déclenche aucun raccourci, et la note est enregistrée', async () => {
    const user = userEvent.setup();
    const { api, queryId } = await setup();
    await user.keyboard('j');
    const id = selectedClipId();

    await user.type(screen.getByRole('textbox', { name: 'Note' }), 'yes juvenile');
    expect(selectedClipId()).toBe(id); // ni « y » ni « j » n'ont agi
    expect(screen.getByText('0 validés · 0 oui · 0 non · 0 incertains')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /^Oui/ }));
    await waitFor(async () => {
      expect((await api.listValidations(queryId))[0]).toMatchObject({ note: 'yes juvenile' });
    });
  });

  it('en cas d’échec, revient à l’état précédent et propose de réessayer', async () => {
    const user = userEvent.setup();
    const base = createTestApi();
    let fail = true;
    // API dont l'enregistrement échoue tant que `fail` est vrai.
    const api: ChronosApi = {
      ...base,
      saveValidation: (input) =>
        fail ? Promise.reject(new Error('panne')) : base.saveValidation(input),
    };
    await setup(api, '');
    await user.click(
      screen.getAllByRole('button', { name: /^Ouvrir le clip/ })[0] ?? document.body,
    );
    const id = selectedClipId();
    await user.click(screen.getByRole('button', { name: /^Oui/ }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Validation non enregistrée.');
    // Retour en arrière : rien n'est validé. On reste sur le clip pour réessayer.
    expect(screen.getByText('0 validés · 0 oui · 0 non · 0 incertains')).toBeInTheDocument();
    await waitFor(() => {
      expect(selectedClipId()).toBe(id);
    });

    fail = false;
    await user.click(within(alert).getByRole('button', { name: 'Réessayer' }));
    expect(await screen.findByText('1 validés · 1 oui · 0 non · 0 incertains')).toBeInTheDocument();
  });

  it('P lance et met en pause la lecture ; « Aller à l’instant clé » place le curseur', async () => {
    const user = userEvent.setup();
    await setup();
    await user.keyboard('j');

    await user.keyboard('p');
    expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument();
    await user.keyboard('p');
    expect(screen.getByRole('button', { name: 'Lecture' })).toBeInTheDocument();

    const slider = screen.getByRole('slider', { name: 'Position dans le clip' });
    await user.click(screen.getByRole('button', { name: 'Aller à l’instant clé' }));
    const best = /Instant clé à (\d+) s/.exec(
      within(loupe())
        .getAllByRole('img', { name: /Instant clé/ })[0]
        ?.getAttribute('aria-label') ?? '',
    )?.[1];
    expect(slider).toHaveValue(best);
  });
});
