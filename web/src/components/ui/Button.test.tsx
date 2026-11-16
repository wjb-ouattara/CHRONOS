import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Settings2 } from 'lucide-react';
import { describe, expect, it, vi } from 'vitest';

import { Button } from './Button';

describe('Button', () => {
  it('se déclenche au clic et au clavier', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Valider</Button>);

    await user.click(screen.getByRole('button', { name: 'Valider' }));
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it('est de type « button » par défaut (ne soumet pas un formulaire par accident)', () => {
    render(<Button>Valider</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('un bouton icône seule a un nom accessible', () => {
    render(<Button icon={Settings2} aria-label="Réglages" />);
    expect(screen.getByRole('button', { name: 'Réglages' })).toBeInTheDocument();
  });

  it('en cours : inactif, signalé occupé et annoncé', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Enregistrer
      </Button>,
    );
    const button = screen.getByRole('button');

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toHaveTextContent('Chargement…');
    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('désactivé : ne réagit pas', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Valider
      </Button>,
    );
    await user.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('refuse à la compilation un bouton icône seule sans aria-label', () => {
    // Ce test vérifie le TYPE : `@ts-expect-error` fait échouer `npm run typecheck`
    // si la ligne suivante devenait valide (c.-à-d. si la protection disparaissait).
    // @ts-expect-error — aria-label obligatoire pour un bouton sans texte
    const element = <Button icon={Settings2} />;
    expect(element).toBeTruthy();
  });
});
