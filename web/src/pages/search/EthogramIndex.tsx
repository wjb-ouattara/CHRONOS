import { Skeleton } from '@/components/ui/states';
import { strings } from '@/content/strings';
import type { Behaviour, BehaviourCode } from '@/domain/types';
import { cn } from '@/lib/cn';

const t = strings.pages.search;

/** Nombre de points pleins selon la fréquence : repère visuel discret. */
const frequencyDots: Record<Behaviour['frequency'], number> = { head: 3, middle: 2, tail: 1 };

interface EthogramIndexProps {
  behaviours: readonly Behaviour[] | undefined;
  isLoading: boolean;
  isError: boolean;
  selected: BehaviourCode | null;
  onSelect: (code: BehaviourCode) => void;
  disabled?: boolean;
}

/**
 * L'éthogramme présenté comme l'index à onglets d'un carnet de terrain.
 * Chaque onglet est un bouton à bascule (`aria-pressed`) ; l'onglet actif
 * « dépasse » sur la page, avec une tranche phosphore.
 */
export function EthogramIndex({
  behaviours,
  isLoading,
  isError,
  selected,
  onSelect,
  disabled = false,
}: EthogramIndexProps) {
  return (
    <section aria-labelledby="ethogram-title" className="min-w-0">
      <h2
        id="ethogram-title"
        className="mb-1 font-mono text-xs tracking-stamp text-stamp uppercase"
      >
        {t.ethogram}
      </h2>
      <p className="mb-3 text-xs text-ink-muted">{t.ethogramHint}</p>

      {isError && <p className="text-sm text-danger">{t.ethogramError}</p>}

      {isLoading && (
        <div aria-hidden="true" className="grid gap-1.5">
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} className="h-9" />
          ))}
        </div>
      )}

      {behaviours && (
        // Sous 1024 px : une bande horizontale qui défile ; au-delà : une colonne d'onglets.
        <ul className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-2 lg:mx-0 lg:grid lg:overflow-visible lg:px-0 lg:pb-0">
          {behaviours.map((behaviour) => {
            const active = behaviour.code === selected;
            return (
              <li key={behaviour.code} className="shrink-0">
                <button
                  type="button"
                  aria-pressed={active}
                  disabled={disabled}
                  title={behaviour.description}
                  onClick={() => {
                    onSelect(behaviour.code);
                  }}
                  className={cn(
                    'group flex w-full items-center gap-3 rounded-sm border px-3 py-2 text-left text-sm',
                    'transition-[transform,background-color,border-color] duration-150 ease-field',
                    'disabled:cursor-not-allowed disabled:opacity-60',
                    active
                      ? // Onglet actif : tranche phosphore à gauche, légèrement sorti du carnet.
                        'border-l-4 border-line-strong border-l-accent bg-surface-raised text-ink lg:translate-x-1.5'
                      : 'border-transparent text-ink-muted hover:bg-surface hover:text-ink',
                  )}
                >
                  <span
                    className={cn(
                      'w-11 shrink-0 font-mono text-xs font-medium',
                      active ? 'text-accent' : 'text-stamp',
                    )}
                  >
                    {behaviour.code}
                  </span>{' '}
                  <span className="flex-1 whitespace-nowrap lg:whitespace-normal">
                    {behaviour.label}
                  </span>{' '}
                  <FrequencyDots frequency={behaviour.frequency} />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function FrequencyDots({ frequency }: { frequency: Behaviour['frequency'] }) {
  const filled = frequencyDots[frequency];
  return (
    <span className="flex shrink-0 gap-0.5" title={t.frequency[frequency]}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          aria-hidden="true"
          className={cn('size-1 rounded-full', i < filled ? 'bg-ink-muted' : 'bg-line')}
        />
      ))}
      <span className="sr-only">{t.frequency[frequency]}</span>
    </span>
  );
}
