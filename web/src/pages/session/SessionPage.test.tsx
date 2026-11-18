import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { EXPORT_COLUMNS } from '@/api/csv';
import type { ChronosApi } from '@/api/types';
import { parseCsv } from '@/test/parse-csv';
import { createTestApi, renderApp } from '@/test/render-app';

/** Une recherche TOOL avec 4 validations (dont une note contenant une virgule). */
async function seed(api: ChronosApi = createTestApi()) {
  const response = await api.search({ text: '', behaviourCode: 'TOOL' });
  const ids = response.results.slice(0, 4).map((r) => r.clipId);
  const q = response.query.id;
  await api.saveValidation({
    queryId: q,
    clipId: ids[0] ?? '',
    verdict: 'yes',
    note: 'adulte, pierre',
  });
  await api.saveValidation({ queryId: q, clipId: ids[1] ?? '', verdict: 'no' });
  await api.saveValidation({ queryId: q, clipId: ids[2] ?? '', verdict: 'yes' });
  await api.saveValidation({ queryId: q, clipId: ids[3] ?? '', verdict: 'unsure' });
  return { api, response, ids };
}

const findTable = () =>
  screen.findByRole('table', { name: /^Clips validés : / }, { timeout: 5000 });

describe('écran Session & export', () => {
  // Capture du fichier « téléchargé » : jsdom n'a pas de vrai téléchargement.
  let blob: Blob | undefined;
  let fileName = '';
  beforeEach(() => {
    blob = undefined;
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: (b: Blob) => {
        blob = b;
        return 'blob:test';
      },
    });
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: () => undefined });
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      fileName = this.download;
    });
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('le CSV téléchargé est conforme à ExportRow (critère de l’étape)', async () => {
    const user = userEvent.setup();
    const { api, response, ids } = await seed();
    renderApp({ path: `/session?q=${response.query.id}`, api });
    await findTable();

    await user.click(screen.getByRole('button', { name: 'Télécharger le CSV' }));

    expect(fileName).toMatch(/^chronos_TOOL_\d{4}-\d{2}-\d{2}\.csv$/);
    if (!blob) throw new Error('aucun fichier produit');
    expect(blob.type).toBe('text/csv;charset=utf-8');

    const [header, ...rows] = parseCsv(await blob.text());
    expect(header).toEqual([...EXPORT_COLUMNS]); // colonnes exactes, dans l'ordre
    expect(rows).toHaveLength(4); // une ligne par validation

    const col = (name: (typeof EXPORT_COLUMNS)[number]) => EXPORT_COLUMNS.indexOf(name);
    const first = rows.find((r) => r[col('clip_id')] === ids[0]);
    expect(first?.[col('verdict')]).toBe('yes');
    expect(first?.[col('note')]).toBe('adulte, pierre'); // virgule correctement échappée
    expect(first?.[col('behaviour_code')]).toBe('TOOL');
    const bestMoment = response.results.find((r) => r.clipId === ids[0])?.bestMomentS;
    expect(first?.[col('best_moment_s')]).toBe(String(bestMoment));
  });

  it('montre l’en-tête et les premières lignes du CSV en aperçu', async () => {
    const { api, response } = await seed();
    renderApp({ path: `/session?q=${response.query.id}`, api });
    const preview = await screen.findByTestId('csv-preview', {}, { timeout: 5000 });
    await waitFor(() => {
      expect(preview.textContent.split('\n')[0]).toBe(EXPORT_COLUMNS.join(','));
    });
    expect(preview.textContent.split('\n')).toHaveLength(5); // en-tête + 4 validations
  });

  it('l’aperçu tient compte d’une validation modifiée entre-temps dans la loupe', async () => {
    const user = userEvent.setup();
    const { api, response, ids } = await seed();
    const first = ids[0] ?? '';
    renderApp({ path: `/session?q=${response.query.id}`, api });
    const preview = await screen.findByTestId('csv-preview', {}, { timeout: 5000 });
    await waitFor(() => {
      expect(preview).toHaveTextContent(`${first},S`);
    });
    const lineOf = (text: string) => text.split('\n').find((line) => line.includes(first)) ?? '';
    expect(lineOf(preview.textContent)).toContain(',yes,');

    // Revoir le clip dans la loupe et changer son verdict (« oui » → « non »)…
    await user.click(screen.getByRole('link', { name: `Revoir le clip ${first} dans la loupe` }));
    await screen.findByRole('complementary', { name: `Loupe, clip ${first}` }, { timeout: 5000 });
    await user.keyboard('n');

    // …puis revenir à la session : l'aperçu du CSV est à jour.
    await user.click(screen.getByRole('link', { name: 'Session' }));
    const updated = await screen.findByTestId('csv-preview', {}, { timeout: 5000 });
    await waitFor(() => {
      expect(lineOf(updated.textContent)).toContain(',no,');
    });
  });

  it('liste les validations, filtre par verdict et trie par colonne', async () => {
    const user = userEvent.setup();
    const { api, response } = await seed();
    renderApp({ path: `/session?q=${response.query.id}`, api });
    const table = await findTable();
    expect(within(table).getAllByRole('row')).toHaveLength(5); // en-tête + 4

    // Filtre « Oui » : 2 lignes.
    await user.click(screen.getByRole('button', { name: /^Oui/ }));
    expect(within(table).getAllByRole('row')).toHaveLength(3);
    await user.click(screen.getByRole('button', { name: /^Tous/ }));

    // Tri par clip : croissant puis décroissant, annoncé par aria-sort.
    await user.click(within(table).getByRole('button', { name: /^Clip/ }));
    const header = within(table).getByRole('columnheader', { name: /^Clip/ });
    expect(header).toHaveAttribute('aria-sort', 'ascending');
    const ids = () =>
      within(table)
        .getAllByRole('rowheader')
        .map((cell) => cell.textContent);
    expect(ids()).toEqual([...ids()].sort());
    await user.click(within(table).getByRole('button', { name: /^Clip/ }));
    expect(header).toHaveAttribute('aria-sort', 'descending');
    expect(ids()).toEqual([...ids()].sort().reverse());
  });

  it('« Revoir » rouvre le clip dans la loupe de la recherche', async () => {
    const user = userEvent.setup();
    const { api, response, ids } = await seed();
    const { router } = renderApp({ path: `/session?q=${response.query.id}`, api });
    await findTable();
    await user.click(
      screen.getByRole('link', { name: `Revoir le clip ${ids[0] ?? ''} dans la loupe` }),
    );
    expect(router.state.location.pathname).toBe('/recherche');
    expect(router.state.location.search).toBe(`?q=${response.query.id}&clip=${ids[0] ?? ''}`);
  });

  it('affiche l’horloge 24 h des clips « oui »', async () => {
    const { api, response } = await seed();
    renderApp({ path: `/session?q=${response.query.id}`, api });
    await findTable();
    expect(
      screen.getByRole('img', { name: /^Horloge d’activité sur 24 heures/ }),
    ).toBeInTheDocument();
  });

  it('sans paramètre, ouvre la recherche la plus récente ; le sélecteur change de session', async () => {
    const user = userEvent.setup();
    const { api } = await seed();
    const other = await api.search({ text: '', behaviourCode: 'FEED' });
    const { router } = renderApp({ path: '/session', api });

    // La plus récente (FEED) n'a aucune validation.
    expect(
      await screen.findByText('Aucun clip validé dans cette recherche', {}, { timeout: 5000 }),
    ).toBeInTheDocument();
    const select = screen.getByRole('combobox', { name: 'Recherche' });
    expect(select).toHaveValue(other.query.id);

    await user.selectOptions(select, screen.getByRole('option', { name: /^TOOL/ }));
    expect(router.state.location.search).toMatch(/^\?q=/);
    await findTable();
  });

  it('sans aucune recherche, renvoie vers l’écran Recherche', async () => {
    renderApp({ path: '/session' });
    expect(await screen.findByText('Aucune session pour l’instant')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Aller à la recherche' })).toHaveAttribute(
      'href',
      '/recherche',
    );
  });

  it('affiche une erreur avec « Réessayer » si le service ne répond pas', async () => {
    renderApp({ path: '/session', api: createTestApi({ failureRate: 1 }) });
    const alert = await screen.findByRole('alert', {}, { timeout: 5000 });
    expect(alert).toHaveTextContent('Impossible de charger la session');
    expect(within(alert).getByRole('button', { name: 'Réessayer' })).toBeInTheDocument();
  });
});
