import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { VerdictBadge } from './VerdictBadge';

describe('VerdictBadge', () => {
  it.each([
    ['yes', 'Oui'],
    ['no', 'Non'],
    ['unsure', 'Incertain'],
    [null, 'Non validé'],
  ] as const)('verdict %s → texte « %s » (jamais la couleur seule)', (verdict, label) => {
    const { container } = render(<VerdictBadge verdict={verdict} />);
    expect(screen.getByText(label)).toBeInTheDocument();
    // L'icône est décorative : elle ne doit pas être annoncée en plus du texte.
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });
});
