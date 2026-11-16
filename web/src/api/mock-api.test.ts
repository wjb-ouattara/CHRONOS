import { describe, expect, it } from 'vitest';

import { parseCsv } from '@/test/parse-csv';
import { createTestApi } from '@/test/render-app';

import { EXPORT_COLUMNS } from './csv';
import { ApiError } from './errors';
import type { MockApiOptions } from './mock-api';
import { memoryPersistence, type Persistence } from './persistence';

const testApi = (persistence: Persistence = memoryPersistence(), extra: MockApiOptions = {}) =>
  createTestApi({ persistence, ...extra });

describe('API fictive', () => {
  it('liste l’éthogramme, les sites et les clips filtrés', async () => {
    const api = testApi();
    expect(await api.listBehaviours()).toHaveLength(14);
    expect(await api.listSites()).toHaveLength(3);
    const night = await api.listClips({ siteId: 'S02', isNight: true });
    expect(night.every((c) => c.siteId === 'S02' && c.isNight)).toBe(true);
  });

  it('search renvoie une réponse rattachée à sa requête, itération 0', async () => {
    const api = testApi();
    const response = await api.search({ text: '', behaviourCode: 'TOOL' });
    expect(response.query.id).toBe('q1');
    expect(response.iteration).toBe(0);
    expect(response.results.length).toBeGreaterThan(0);
    expect(response.results.every((r) => r.secondScores.length === 15)).toBe(true);
  });

  it('refuse une requête vide ou un comportement inconnu', async () => {
    const api = testApi();
    await expect(api.search({ text: '  ', behaviourCode: null })).rejects.toBeInstanceOf(ApiError);
    await expect(api.search({ text: '', behaviourCode: 'XXXX' })).rejects.toMatchObject({
      code: 'invalid_input',
    });
  });

  it('rerank incrémente l’itération et modifie l’ordre de façon cohérente', async () => {
    const api = testApi();
    const first = await api.search({ text: '', behaviourCode: 'TOOL' });
    const [a, b] = first.results;
    if (!a || !b) throw new Error('résultats insuffisants');

    await api.saveValidation({ queryId: 'q1', clipId: a.clipId, verdict: 'no' });
    const second = await api.rerank('q1');

    expect(second.iteration).toBe(1);
    // Le clip refusé descend.
    const newRank = second.results.find((r) => r.clipId === a.clipId)?.rank ?? Infinity;
    expect(newRank).toBeGreaterThan(a.rank);
  });

  it('getSearch redonne les mêmes résultats, même après de nouvelles validations', async () => {
    const api = testApi();
    const first = await api.search({ text: 'outil', behaviourCode: null });
    const clipId = first.results[0]?.clipId ?? '';
    await api.saveValidation({ queryId: 'q1', clipId, verdict: 'yes' });
    const reranked = await api.rerank('q1');
    await api.saveValidation({
      queryId: 'q1',
      clipId: first.results[1]?.clipId ?? '',
      verdict: 'no',
    });

    const again = await api.getSearch('q1');
    expect(again.results.map((r) => r.clipId)).toEqual(reranked.results.map((r) => r.clipId));
  });

  it('une nouvelle validation du même clip remplace la précédente', async () => {
    const api = testApi();
    const { results } = await api.search({ text: '', behaviourCode: 'FEED' });
    const clipId = results[0]?.clipId ?? '';
    await api.saveValidation({ queryId: 'q1', clipId, verdict: 'yes' });
    await api.saveValidation({ queryId: 'q1', clipId, verdict: 'unsure', note: 'flou' });

    const validations = await api.listValidations('q1');
    expect(validations).toHaveLength(1);
    expect(validations[0]).toMatchObject({ verdict: 'unsure', note: 'flou' });
  });

  it('les requêtes et validations survivent à un « rechargement »', async () => {
    const persistence = memoryPersistence();
    const api = testApi(persistence);
    const { results } = await api.search({ text: '', behaviourCode: 'SOC' });
    await api.saveValidation({ queryId: 'q1', clipId: results[0]?.clipId ?? '', verdict: 'yes' });

    // Nouvelle instance, même stockage : comme après un rechargement de page.
    const reloaded = testApi(persistence);
    expect(await reloaded.listQueries()).toHaveLength(1);
    expect(await reloaded.listValidations('q1')).toHaveLength(1);
  });

  it('protège son état interne des modifications faites par un écran', async () => {
    const api = testApi();
    const behaviours = await api.listBehaviours();
    behaviours.length = 0;
    expect(await api.listBehaviours()).toHaveLength(14);
  });

  it('peut simuler une panne (pour tester les états d’erreur)', async () => {
    const api = testApi(memoryPersistence(), { failureRate: 1 });
    await expect(api.listBehaviours()).rejects.toMatchObject({ code: 'unavailable' });
  });

  it('exportCsv produit une ligne par validation, conforme à ExportRow', async () => {
    const api = testApi();
    const response = await api.search({ text: 'casse des noix', behaviourCode: 'TOOL' });
    const [first, second] = response.results;
    if (!first || !second) throw new Error('résultats insuffisants');
    await api.saveValidation({ queryId: 'q1', clipId: first.clipId, verdict: 'yes', note: 'a, b' });
    await api.saveValidation({ queryId: 'q1', clipId: second.clipId, verdict: 'no' });

    const [header, ...rows] = parseCsv(await api.exportCsv('q1'));
    expect(header).toEqual([...EXPORT_COLUMNS]);
    expect(rows).toHaveLength(2);

    const col = (name: (typeof EXPORT_COLUMNS)[number]) => EXPORT_COLUMNS.indexOf(name);
    expect(rows[0]?.[col('clip_id')]).toBe(first.clipId);
    expect(rows[0]?.[col('behaviour_code')]).toBe('TOOL');
    expect(rows[0]?.[col('note')]).toBe('a, b');
    expect(rows[1]?.[col('note')]).toBe('NA');
    // L'instant clé exporté est celui affiché à l'écran.
    expect(rows[0]?.[col('best_moment_s')]).toBe(String(first.bestMomentS));
  });

  it('deux recherches identiques donnent les mêmes instants clés', async () => {
    const api = testApi();
    const a = await api.search({ text: '', behaviourCode: 'TOOL' });
    const b = await api.search({ text: '', behaviourCode: 'TOOL' });
    expect(a.query.id).not.toBe(b.query.id);
    expect(b.results).toEqual(a.results);
  });
});
