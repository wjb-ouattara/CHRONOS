import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import type { ChronosApi } from '@/api/types';
import { createTestApi, renderApp } from '@/test/render-app';

const findStats = () =>
  screen.findByRole('region', { name: 'Chiffres clés de la collection' }, { timeout: 5000 });

/** Valeur affichée d'une tuile (le <dd> qui suit son libellé). */
function tile(stats: HTMLElement, label: string) {
  const term = within(stats).getByText(label, { selector: 'dt' });
  return term.nextElementSibling?.textContent ?? '';
}

describe('écran Collection', () => {
  it('les chiffres clés sont cohérents avec les données générées (critère de l’étape)', async () => {
    const api = createTestApi();
    renderApp({ path: '/', api });
    const stats = await findStats();

    // Calcul INDÉPENDANT, directement sur ce que renvoie l'API.
    const clips = await api.listClips();
    const sites = await api.listSites();
    const night = clips.filter((c) => c.isNight).length;
    const pct = (n: number) => `${String(Math.round((n / clips.length) * 100))} %`;
    const days = clips.flatMap((c) => (c.recordedAt ? [c.recordedAt.slice(0, 10)] : [])).sort();

    expect(tile(stats, 'Clips')).toBe(String(clips.length));
    expect(clips).toHaveLength(400);
    expect(tile(stats, 'Durée totale')).toBe('1 h 40 min'); // 400 × 15 s = 6 000 s
    expect(tile(stats, 'Sites · caméras')).toBe(
      `${String(sites.length)} · ${String(new Set(clips.map((c) => c.cameraId)).size)}`,
    );
    expect(tile(stats, 'Jour / nuit')).toBe(`${pct(clips.length - night)} / ${pct(night)}`);
    expect(tile(stats, 'Sans horodatage')).toBe(
      String(clips.filter((c) => c.recordedAt === null).length),
    );
    expect(days[0]?.startsWith('2024-01')).toBe(true);
    expect(tile(stats, 'Période couverte')).toBe('janv. 2024');
  });

  it('la frise dessine un trait par clip horodaté, à la bonne heure', async () => {
    const api = createTestApi();
    const { container } = renderApp({ path: '/', api });
    await findStats();
    const clips = await api.listClips();
    const dated = clips.filter((c) => c.recordedAt !== null);

    const marks = container.querySelectorAll('[data-clip]');
    expect(marks).toHaveLength(dated.length);
    const sample = dated[0];
    const mark = container.querySelector(`[data-clip="${sample?.id ?? ''}"]`);
    expect(Math.floor(Number(mark?.getAttribute('data-hour')))).toBe(
      Number(sample?.recordedAt?.slice(11, 13)),
    );
    expect(
      screen.getByText(
        `${String(clips.length - dated.length)} clips sans horodatage exclus de la frise.`,
      ),
    ).toBeInTheDocument();
  });

  it('la vue tableau de la frise totalise tous les clips horodatés', async () => {
    const user = userEvent.setup();
    const api = createTestApi();
    renderApp({ path: '/', api });
    await findStats();
    await user.click(screen.getByRole('button', { name: 'Voir les données par mois' }));

    const table = screen.getByRole('table', { name: 'Clips par mois, de jour et de nuit' });
    const totals = within(table)
      .getAllByRole('row')
      .slice(1)
      .map((row) => Number(row.lastElementChild?.textContent));
    const dated = (await api.listClips()).filter((c) => c.recordedAt !== null).length;
    expect(totals.reduce((a, b) => a + b, 0)).toBe(dated);
  });

  it('mettre un site en avant estompe les autres', async () => {
    const user = userEvent.setup();
    const api = createTestApi();
    const { container } = renderApp({ path: '/', api });
    await findStats();
    const filter = screen.getByRole('group', { name: 'Mettre en avant un site' });
    await user.click(within(filter).getByRole('button', { name: 'S02' }));

    expect(within(filter).getByRole('button', { name: 'S02' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    const clips = await api.listClips();
    const other = clips.find((c) => c.siteId === 'S01' && c.recordedAt);
    const own = clips.find((c) => c.siteId === 'S02' && c.recordedAt);
    expect(container.querySelector(`[data-clip="${other?.id ?? ''}"]`)).toHaveClass('opacity-15');
    expect(container.querySelector(`[data-clip="${own?.id ?? ''}"]`)).not.toHaveClass('opacity-15');
  });

  it('trois cartes de site dont les clips totalisent la collection', async () => {
    renderApp({ path: '/' });
    await findStats();
    const list = screen.getByRole('region', { name: 'Sites' });
    const cards = within(list).getAllByRole('listitem', { name: /^Site 0\d$/ });
    expect(cards).toHaveLength(3);
    const total = cards
      .map((card) => Number(/(\d+) clips/.exec(card.textContent)?.[1]))
      .reduce((a, b) => a + b, 0);
    expect(total).toBe(400);
  });

  it('liste les recherches récentes avec leurs validations et des liens directs', async () => {
    const api: ChronosApi = createTestApi();
    const tool = await api.search({ text: '', behaviourCode: 'TOOL' });
    await api.saveValidation({
      queryId: tool.query.id,
      clipId: tool.results[0]?.clipId ?? '',
      verdict: 'yes',
    });
    await api.saveValidation({
      queryId: tool.query.id,
      clipId: tool.results[1]?.clipId ?? '',
      verdict: 'no',
    });
    await api.search({ text: 'casse des noix', behaviourCode: null });

    renderApp({ path: '/', api });
    const recent = await screen.findByRole('region', { name: 'Recherches récentes' });
    const items = await within(recent).findAllByRole('listitem');
    expect(items[0]).toHaveTextContent('« casse des noix »'); // la plus récente d'abord
    expect(
      await within(recent).findByText(/2 validés · 1 oui · 1 non · 0 incertains/),
    ).toBeInTheDocument();
    expect(
      within(recent).getByRole('link', { name: /^Reprendre la recherche TOOL/ }),
    ).toHaveAttribute('href', `/recherche?q=${tool.query.id}`);
    expect(
      within(recent).getByRole('link', { name: /^Session et export de la recherche TOOL/ }),
    ).toHaveAttribute('href', `/session?q=${tool.query.id}`);
  });

  it('sans recherche, invite à en lancer une', async () => {
    renderApp({ path: '/' });
    expect(await screen.findByText('Aucune recherche pour l’instant')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Lancer une première recherche' })).toHaveAttribute(
      'href',
      '/recherche',
    );
  });

  it('affiche une erreur avec « Réessayer » si le service ne répond pas', async () => {
    renderApp({ path: '/', api: createTestApi({ failureRate: 1 }) });
    const alerts = await screen.findAllByRole('alert', {}, { timeout: 5000 });
    const first = alerts[0];
    if (!first) throw new Error('aucune alerte');
    expect(first).toHaveTextContent('Impossible de charger la collection');
    expect(within(first).getByRole('button', { name: 'Réessayer' })).toBeInTheDocument();
  });
});
