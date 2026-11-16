import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Search } from 'lucide-react';
import { describe, expect, it } from 'vitest';

import { TextField } from './TextField';

describe('TextField', () => {
  it('relie le libellé au champ (clic sur le libellé = focus)', async () => {
    const user = userEvent.setup();
    render(<TextField label="Note" />);
    await user.click(screen.getByText('Note'));
    expect(screen.getByLabelText('Note')).toHaveFocus();
  });

  it('garde un nom accessible quand le libellé est masqué', () => {
    render(<TextField label="Rechercher" hideLabel icon={Search} type="search" />);
    expect(screen.getByRole('searchbox', { name: 'Rechercher' })).toBeInTheDocument();
  });

  it("annonce l'aide comme description", () => {
    render(<TextField label="Note" hint="Facultatif." />);
    expect(screen.getByLabelText('Note')).toHaveAccessibleDescription('Facultatif.');
  });

  it("marque le champ invalide et annonce l'erreur", () => {
    render(<TextField label="Note" hint="Facultatif." error="Trop long." />);
    const input = screen.getByLabelText('Note');
    expect(input).toBeInvalid();
    expect(input).toHaveAccessibleDescription('Facultatif. Trop long.');
  });

  it('donne des identifiants uniques à deux champs identiques', () => {
    render(
      <>
        <TextField label="Note" />
        <TextField label="Note" />
      </>,
    );
    const [a, b] = screen.getAllByLabelText('Note');
    expect(a?.id).not.toBe(b?.id);
  });
});
