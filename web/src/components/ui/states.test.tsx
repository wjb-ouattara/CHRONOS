import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { EmptyState, ErrorState, LoadingRegion, Skeleton } from './states';

describe('états communs', () => {
  it('EmptyState affiche son titre et son explication', () => {
    render(<EmptyState title="Aucun clip">Validez des clips.</EmptyState>);
    expect(screen.getByText('Aucun clip')).toBeInTheDocument();
    expect(screen.getByText('Validez des clips.')).toBeInTheDocument();
  });

  it('ErrorState est annoncé immédiatement et « Réessayer » appelle onRetry', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<ErrorState title="Échec" message="Le service ne répond pas." onRetry={onRetry} />);

    expect(screen.getByRole('alert')).toHaveTextContent('Échec');
    await user.click(screen.getByRole('button', { name: 'Réessayer' }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('LoadingRegion annonce le chargement ; les squelettes restent muets', () => {
    render(
      <LoadingRegion>
        <Skeleton className="h-4" />
      </LoadingRegion>,
    );
    const region = screen.getByRole('status');
    expect(region).toHaveAttribute('aria-busy', 'true');
    expect(region).toHaveTextContent('Chargement en cours');
    expect(region.querySelector('[aria-hidden="true"]')).not.toBeNull();
  });
});
