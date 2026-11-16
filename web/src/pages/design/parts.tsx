// Briques de mise en page propres à la page /design.
import type { ReactNode } from 'react';

import type { Theme } from '@/app/theme/theme';

export function Section({
  id,
  title,
  intro,
  children,
}: {
  id?: string;
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="mt-12 scroll-mt-8">
      <h2 className="font-display text-2xl">{title}</h2>
      {intro && <p className="mt-1 mb-6 max-w-prose text-sm text-ink-muted">{intro}</p>}
      {!intro && <div className="mb-6" />}
      {children}
    </section>
  );
}

/** Panneau qui force un thème : tout ce qu'il contient utilise ses tokens. */
export function ThemePanel({
  theme,
  label,
  children,
}: {
  theme: Theme;
  label: string;
  children: ReactNode;
}) {
  return (
    <div data-theme={theme} className="rounded-lg border border-line bg-canvas p-5 text-ink">
      <p className="mb-4 font-mono text-xs tracking-stamp text-stamp uppercase">{label}</p>
      {children}
    </div>
  );
}
