import { describe, expect, it } from 'vitest';

import { generateDataset } from './dataset';
import {
  matchBehaviours,
  queryVector,
  rankClips,
  RESULT_LIMIT,
  rocchio,
  secondScoresFor,
} from './search-engine';

const dataset = generateDataset();
const hasLabel = (clipId: string, code: string) =>
  dataset.hidden.get(clipId)?.labels.includes(code) ?? false;

describe('matchBehaviours', () => {
  it('reconnaît des mots-clés, sans tenir compte des accents ni de la casse', () => {
    expect(matchBehaviours('Chimpanzé cassant une NOIX avec une pierre')).toContain('TOOL');
    expect(matchBehaviours('bâton')).toContain('TOOL');
    expect(matchBehaviours('xyz')).toEqual([]);
  });
});

describe('rankClips', () => {
  const results = rankClips(dataset, queryVector(dataset, '', 'TOOL'), 'q1');

  it('renvoie au plus RESULT_LIMIT résultats, rangs 1..n sans trou, scores décroissants', () => {
    expect(results).toHaveLength(RESULT_LIMIT);
    results.forEach((r, i) => {
      expect(r.rank).toBe(i + 1);
      if (i > 0) expect(r.score).toBeLessThanOrEqual(results[i - 1]?.score ?? 1);
    });
  });

  it('secondScores a une valeur par seconde, bestMomentS en est le maximum', () => {
    for (const r of results) {
      expect(r.secondScores).toHaveLength(15);
      expect(r.secondScores[r.bestMomentS]).toBe(Math.max(...r.secondScores));
      expect(r.secondScores.every((s) => s >= 0 && s <= 1)).toBe(true);
    }
  });

  it('est déterministe', () => {
    expect(rankClips(dataset, queryVector(dataset, '', 'TOOL'), 'q1')).toEqual(results);
  });

  it('est utile mais imparfait (sinon le reclassement ne servirait à rien)', () => {
    const top20 = results.slice(0, 20).filter((r) => hasLabel(r.clipId, 'TOOL')).length;
    expect(top20).toBeGreaterThan(3); // utile
    expect(top20).toBeLessThan(20); // imparfait : des faux positifs remontent
  });

  it('inclut toujours les clips déjà validés, même mal classés', () => {
    const last = dataset.clips.find((c) => !results.some((r) => r.clipId === c.id));
    if (!last) throw new Error('aucun clip hors résultats');
    const withValidated = rankClips(
      dataset,
      queryVector(dataset, '', 'TOOL'),
      'q1',
      new Set([last.id]),
    );
    expect(withValidated.some((r) => r.clipId === last.id)).toBe(true);
    expect(withValidated.at(-1)?.rank).toBe(withValidated.length);
  });
});

describe('secondScoresFor', () => {
  it("l'instant clé ne dépend pas du score (stable au reclassement et dans l'export)", () => {
    const clip = dataset.clips[0];
    if (!clip) throw new Error('aucun clip');
    expect(secondScoresFor('q', clip, 0.9).bestMomentS).toBe(
      secondScoresFor('q', clip, 0.2).bestMomentS,
    );
  });
});

describe('rocchio (reclassement)', () => {
  const base = queryVector(dataset, '', 'TOOL');
  const before = rankClips(dataset, base, 'q');
  const meanRankOfTool = (results: typeof before) => {
    const ranks = results.filter((r) => hasLabel(r.clipId, 'TOOL')).map((r) => r.rank);
    return ranks.reduce((a, b) => a + b, 0) / ranks.length;
  };
  const feedbackOn = (n: number) =>
    before.slice(0, n).map((r) => ({
      features: dataset.hidden.get(r.clipId)?.features ?? [],
      verdict: hasLabel(r.clipId, 'TOOL') ? ('yes' as const) : ('no' as const),
    }));

  it('sans validation, ne change rien', () => {
    expect(rankClips(dataset, rocchio(base, []), 'q')).toEqual(before);
  });

  it('après des « oui » et des « non », les vrais clips TOOL remontent en moyenne', () => {
    const after = rankClips(dataset, rocchio(base, feedbackOn(20)), 'q');
    expect(meanRankOfTool(after)).toBeLessThan(meanRankOfTool(before));
  });

  it('un « non » fait descendre les clips proches du clip refusé', () => {
    const rejected = before[0];
    if (!rejected) throw new Error('aucun résultat');
    const features = dataset.hidden.get(rejected.clipId)?.features ?? [];
    const after = rankClips(dataset, rocchio(base, [{ features, verdict: 'no' }]), 'q');
    const newRank = after.find((r) => r.clipId === rejected.clipId)?.rank ?? Infinity;
    expect(newRank).toBeGreaterThan(rejected.rank);
  });

  it('« incertain » est ignoré', () => {
    const features = dataset.hidden.get(before[0]?.clipId ?? '')?.features ?? [];
    expect(rocchio(base, [{ features, verdict: 'unsure' }])).toEqual(rocchio(base, []));
  });
});
