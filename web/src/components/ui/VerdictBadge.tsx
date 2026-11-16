import { Check, CircleDashed, CircleHelp, X, type LucideIcon } from 'lucide-react';

import { strings } from '@/content/strings';
import type { Verdict } from '@/domain/types';
import { cn } from '@/lib/cn';

interface VerdictStyle {
  icon: LucideIcon;
  label: string;
  className: string;
}

// Chaque verdict a une ICÔNE + un TEXTE + une couleur : jamais la couleur
// seule (WCAG 1.4.1), pour les personnes daltoniennes et l'impression N&B.
const styles: Record<Verdict | 'none', VerdictStyle> = {
  yes: {
    icon: Check,
    label: strings.verdict.yes,
    className: 'text-verdict-yes border-verdict-yes/50 bg-verdict-yes/10',
  },
  no: {
    icon: X,
    label: strings.verdict.no,
    className: 'text-verdict-no border-verdict-no/50 bg-verdict-no/10',
  },
  unsure: {
    icon: CircleHelp,
    label: strings.verdict.unsure,
    className: 'text-verdict-unsure border-verdict-unsure/50 bg-verdict-unsure/10',
  },
  none: {
    icon: CircleDashed,
    label: strings.verdict.none,
    className: 'text-ink-muted border-line-strong border-dashed',
  },
};

interface VerdictBadgeProps {
  /** `null` : clip pas encore validé. */
  verdict: Verdict | null;
  size?: 'sm' | 'md';
  className?: string;
}

export function VerdictBadge({ verdict, size = 'md', className }: VerdictBadgeProps) {
  const { icon: Icon, label, className: tone } = styles[verdict ?? 'none'];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-sm border font-medium',
        size === 'sm' ? 'h-5 px-1.5 text-2xs' : 'h-6 px-2 text-xs',
        tone,
        className,
      )}
    >
      <Icon aria-hidden="true" className={size === 'sm' ? 'size-3' : 'size-3.5'} />
      {label}
    </span>
  );
}
