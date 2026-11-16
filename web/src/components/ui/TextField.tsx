import type { LucideIcon } from 'lucide-react';
import { useId, type InputHTMLAttributes } from 'react';

import { cn } from '@/lib/cn';

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  /** Libellé OBLIGATOIRE : un champ sans libellé est inaccessible. */
  label: string;
  /** Masque le libellé à l'écran, mais le garde pour les lecteurs d'écran. */
  hideLabel?: boolean;
  hint?: string;
  /** Message d'erreur : rend le champ invalide et l'annonce. */
  error?: string;
  icon?: LucideIcon;
}

export function TextField({
  label,
  hideLabel = false,
  hint,
  error,
  icon: Icon,
  className,
  type = 'text',
  ...rest
}: TextFieldProps) {
  // useId() fournit un identifiant unique et stable : il relie le <label>,
  // l'aide et l'erreur au champ, même si le composant est affiché plusieurs fois.
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  // aria-describedby : le lecteur d'écran lit l'aide et l'erreur après le libellé.
  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn('grid gap-1.5', className)}>
      <label htmlFor={id} className={cn('text-sm font-medium', hideLabel && 'sr-only')}>
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-muted"
          />
        )}
        <input
          id={id}
          type={type}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            'h-10 w-full rounded-md border bg-surface text-ink placeholder:text-ink-muted',
            'transition-colors duration-150 ease-field',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error ? 'border-danger' : 'border-line-strong hover:border-ink-muted',
            // Jamais px-3 ET pl-9 ensemble : l'ordre des deux règles CSS ne serait pas garanti.
            Icon ? 'pr-3 pl-9' : 'px-3',
          )}
          {...rest}
        />
      </div>
      {hint && (
        <p id={hintId} className="text-xs text-ink-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
