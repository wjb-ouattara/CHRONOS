// États communs à tous les écrans : vide, chargement, erreur.
import { CircleAlert, RotateCw, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { strings } from '@/content/strings';
import { cn } from '@/lib/cn';

import { Button } from './Button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
}

/** Rien à afficher (pas encore de résultats, pas de validations…). */
export function EmptyState({ icon: Icon, title, children, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'grid justify-items-center gap-3 rounded-lg border border-dashed border-line px-6 py-12 text-center',
        className,
      )}
    >
      {Icon && <Icon aria-hidden="true" className="size-6 text-ink-muted" />}
      <p className="font-display text-xl">{title}</p>
      {children && <div className="max-w-prose text-sm text-ink-muted">{children}</div>}
      {action}
    </div>
  );
}

interface ErrorStateProps {
  title: string;
  message?: string;
  onRetry?: () => void;
  /** Libellé du bouton (par défaut « Réessayer »). */
  retryLabel?: string;
  className?: string;
}

/**
 * Erreur : `role="alert"` la fait annoncer immédiatement par les lecteurs
 * d'écran. Toujours une sortie proposée (Réessayer).
 */
export function ErrorState({
  title,
  message,
  onRetry,
  retryLabel = strings.states.retry,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        'grid justify-items-center gap-3 rounded-lg border border-danger/50 px-6 py-12 text-center',
        className,
      )}
    >
      <CircleAlert aria-hidden="true" className="size-6 text-danger" />
      <p className="font-display text-xl">{title}</p>
      {message && <p className="max-w-prose text-sm text-ink-muted">{message}</p>}
      {onRetry && (
        <Button icon={RotateCw} onClick={onRetry}>
          {retryLabel}
        </Button>
      )}
    </div>
  );
}

/**
 * Forme grise en attendant les données. Décorative : le conteneur qui
 * l'utilise annonce le chargement (voir LoadingRegion).
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn('block animate-pulse rounded-sm bg-surface-raised', className)}
    />
  );
}

/** Zone en cours de chargement : annoncée une fois, contenu visuel en squelettes. */
export function LoadingRegion({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div role="status" aria-busy="true" className={className}>
      <span className="sr-only">{strings.states.loading}</span>
      {children}
    </div>
  );
}
