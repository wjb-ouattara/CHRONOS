import { LoaderCircle, type LucideIcon } from 'lucide-react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { strings } from '@/content/strings';
import { cn } from '@/lib/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md';

interface CommonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Action en cours : le bouton est inactif et le signale aux lecteurs d'écran. */
  loading?: boolean;
}

/**
 * Deux formes possibles, vérifiées par TypeScript :
 *  - avec texte (icône facultative) ;
 *  - icône seule : `aria-label` devient OBLIGATOIRE, sinon le bouton serait
 *    muet pour un lecteur d'écran. L'oublier est une erreur de compilation.
 */
type ButtonProps = CommonProps &
  (
    | { children: ReactNode; icon?: LucideIcon }
    | { children?: never; icon: LucideIcon; 'aria-label': string }
  );

// Les classes sont écrites en entier pour que Tailwind les détecte.
const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-on-accent hover:bg-accent/85',
  secondary: 'border border-line-strong text-ink hover:bg-surface-raised',
  ghost: 'text-ink-muted hover:bg-surface-raised hover:text-ink',
};

const sizeClasses: Record<ButtonSize, { text: string; iconOnly: string }> = {
  sm: { text: 'h-8 px-3 text-sm gap-1.5', iconOnly: 'size-8' },
  md: { text: 'h-10 px-4 text-base gap-2', iconOnly: 'size-10' },
};

export function Button({
  variant = 'secondary',
  size = 'md',
  loading = false,
  icon: Icon,
  children,
  className,
  disabled,
  type = 'button', // évite qu'un bouton dans un <form> le soumette par accident
  ...rest
}: ButtonProps) {
  const iconOnly = children === undefined;
  const CurrentIcon = loading ? LoaderCircle : Icon;

  return (
    <button
      type={type}
      disabled={disabled === true || loading}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-md font-medium whitespace-nowrap',
        'transition-colors duration-150 ease-field',
        'disabled:cursor-not-allowed disabled:opacity-50',
        variantClasses[variant],
        iconOnly ? sizeClasses[size].iconOnly : sizeClasses[size].text,
        className,
      )}
      {...rest}
    >
      {CurrentIcon && (
        <CurrentIcon aria-hidden="true" className={cn('size-4', loading && 'animate-spin')} />
      )}
      {children}
      {loading && <span className="sr-only">{strings.button.loading}</span>}
    </button>
  );
}
