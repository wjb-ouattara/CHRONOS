import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { ActivityClock } from './ActivityClock';

const counts = Array.from({ length: 24 }, (_, h) =>
  h === 8 ? 4 : h === 16 ? 2 : h === 21 ? 1 : 0,
);

describe('ActivityClock', () => {
  it('dessine 24 secteurs dont les valeurs correspondent aux données', () => {
    const { container } = render(<ActivityClock counts={counts} />);
    const sectors = container.querySelectorAll('[data-hour]');
    expect(sectors).toHaveLength(24);
    expect(container.querySelector('[data-hour="8"]')).toHaveAttribute('data-count', '4');
    expect(container.querySelector('[data-hour="3"]')).toHaveAttribute('data-count', '0');
  });

  it('une barre plus grande pour une valeur plus grande', () => {
    const { container } = render(<ActivityClock counts={counts} />);
    // La 2e path d'un secteur est la barre (la 1re est la zone de survol).
    const barLength = (hour: number) =>
      container
        .querySelector(`[data-hour="${String(hour)}"] path:nth-of-type(2)`)
        ?.getAttribute('d')?.length ?? 0;
    expect(barLength(8)).toBeGreaterThan(0);
    expect(container.querySelector('[data-hour="3"] path:nth-of-type(2)')).toBeNull();
  });

  it('se résume en une phrase (pic d’activité) pour les lecteurs d’écran', () => {
    render(<ActivityClock counts={counts} />);
    expect(
      screen.getByRole('img', { name: /Pic d’activité entre 8 h et 9 h \(4 clips\)/ }),
    ).toBeInTheDocument();
  });

  it('affiche le total au centre, et le détail de l’heure survolée', async () => {
    const user = userEvent.setup();
    const { container } = render(<ActivityClock counts={counts} />);
    const clock = screen.getByRole('img', { name: /Horloge/ });
    expect(within(clock).getByText('7')).toBeInTheDocument();
    await user.hover(container.querySelector('[data-hour="16"]') ?? document.body);
    expect(within(clock).getByText('16 h – 17 h')).toBeInTheDocument();
    expect(within(clock).getByText('2')).toBeInTheDocument();
  });

  it('propose une vue tableau équivalente au graphique', async () => {
    const user = userEvent.setup();
    render(<ActivityClock counts={counts} />);
    const toggle = screen.getByRole('button', { name: 'Voir les données' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await user.click(toggle);

    const table = screen.getByRole('table', { name: 'Clips validés « oui » par heure locale' });
    const row = within(table).getByRole('row', { name: /08 h – 09 h/ });
    expect(row).toHaveTextContent('4');
    expect(within(table).getAllByRole('row')).toHaveLength(25); // 24 heures + en-tête
  });

  it('signale les clips exclus faute d’horodatage', () => {
    render(<ActivityClock counts={counts} excluded={2} />);
    expect(screen.getByText('2 clips sans horodatage exclus.')).toBeInTheDocument();
  });

  it('sans aucun « oui », le dit clairement', () => {
    render(<ActivityClock counts={Array.from({ length: 24 }, () => 0)} />);
    expect(screen.getByRole('img', { name: /Aucun clip validé « oui »/ })).toBeInTheDocument();
  });
});
