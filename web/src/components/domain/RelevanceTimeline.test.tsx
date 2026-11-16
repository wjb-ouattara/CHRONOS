import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { RelevanceTimeline } from './RelevanceTimeline';

const scores = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.93, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0.05];

describe('RelevanceTimeline', () => {
  it('compact : un segment par seconde et un seul repère', () => {
    const { container } = render(<RelevanceTimeline scores={scores} bestMomentS={7} />);
    expect(container.querySelectorAll('[data-second]')).toHaveLength(15);
    expect(container.querySelectorAll('[data-marker]')).toHaveLength(1);
  });

  it('se résume en une phrase pour les lecteurs d’écran', () => {
    render(<RelevanceTimeline scores={scores} bestMomentS={7} />);
    expect(
      screen.getByRole('img', {
        name: 'Pertinence par seconde. Instant clé à 7 s (score 0,93).',
      }),
    ).toBeInTheDocument();
  });

  it("place le repère au-dessus de l'instant clé", () => {
    const { container } = render(<RelevanceTimeline scores={scores} bestMomentS={3} />);
    const markerSlots = container.querySelectorAll('[aria-hidden="true"] > span');
    // La 4e case (indice 3) de la rangée des repères contient le triangle.
    expect(markerSlots[3]?.querySelector('[data-marker]')).not.toBeNull();
  });

  it('large : affiche le score de la seconde survolée', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <RelevanceTimeline scores={scores} bestMomentS={7} variant="large" />,
    );
    const second2 = container.querySelector('[data-second="2"]');
    if (!second2) throw new Error('seconde 2 introuvable');

    await user.hover(second2);
    expect(screen.getByText('2 s : 0,30')).toBeInTheDocument();
  });

  it("large : affiche l'axe de 0 à 15 s", () => {
    render(<RelevanceTimeline scores={scores} bestMomentS={7} variant="large" />);
    expect(screen.getByText('0 s')).toBeInTheDocument();
    expect(screen.getByText('15 s')).toBeInTheDocument();
  });

  it('borne les scores hors de [0, 1] sans planter', () => {
    render(<RelevanceTimeline scores={[-1, 2, Number.NaN]} bestMomentS={1} />);
    expect(screen.getByRole('img', { name: /score 1,00/ })).toBeInTheDocument();
  });
});
