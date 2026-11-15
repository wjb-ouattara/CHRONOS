import type { ReactNode } from 'react';
import { Link } from 'react-router';

import type { Theme } from '@/app/theme/theme';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { strings } from '@/content/strings';
import { contrastRatio } from '@/lib/contrast';
import { parseThemes } from '@/styles/parse-themes';
import themesCss from '@/styles/themes.css?raw';
import { colorTokens, contrastPairs, fontTokens, radiusTokens, textSizes } from '@/styles/tokens';

const t = strings.design;
// Analysé une seule fois, au chargement du module.
const { themes } = parseThemes(themesCss);
const THEMES: readonly { id: Theme; label: string }[] = [
  { id: 'dark', label: t.darkTheme },
  { id: 'light', label: t.lightTheme },
];

/** Classes d'espacement écrites en entier pour que Tailwind les détecte. */
const spacingSamples = [
  { step: 1, className: 'w-1' },
  { step: 2, className: 'w-2' },
  { step: 3, className: 'w-3' },
  { step: 4, className: 'w-4' },
  { step: 6, className: 'w-6' },
  { step: 8, className: 'w-8' },
  { step: 12, className: 'w-12' },
  { step: 16, className: 'w-16' },
] as const;

const formatRatio = (ratio: number) =>
  ratio.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function DesignPage() {
  return (
    <main className="mx-auto max-w-6xl px-8 py-12">
      <header className="flex flex-wrap items-end justify-between gap-6 border-b border-line pb-8">
        <div>
          <p className="font-mono text-xs tracking-stamp text-stamp uppercase">/design</p>
          <h1 className="mt-2 font-display text-4xl">{t.title}</h1>
          <p className="mt-3 max-w-prose text-ink-muted">{t.intro}</p>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/" className="text-sm text-accent underline underline-offset-4">
            {t.backHome}
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <Section title={t.colors} intro={t.colorsIntro}>
        <div className="grid gap-6 lg:grid-cols-2">
          {THEMES.map(({ id, label }) => (
            <ThemePanel key={id} theme={id} label={label}>
              <ul className="grid gap-2">
                {colorTokens.map(({ name, usage }) => (
                  <li key={name} className="flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="size-9 shrink-0 rounded-sm border border-line"
                      style={{ backgroundColor: `var(--theme-${name})` }}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block font-mono text-sm">{name}</span>
                      <span className="block text-xs text-ink-muted">{usage}</span>
                    </span>
                    <code className="font-mono text-xs text-ink-muted">{themes[id][name]}</code>
                  </li>
                ))}
              </ul>
            </ThemePanel>
          ))}
        </div>
      </Section>

      <Section title={t.contrast} intro={t.contrastIntro}>
        <div className="grid gap-6 lg:grid-cols-2">
          {THEMES.map(({ id, label }) => (
            <ThemePanel key={id} theme={id} label={label}>
              <ContrastTable theme={id} label={label} />
            </ThemePanel>
          ))}
        </div>
      </Section>

      <Section title={t.typography}>
        <div className="grid gap-8">
          {fontTokens.map((font) => (
            <div key={font.name} className="grid gap-2 border-b border-line pb-6">
              <p className="font-mono text-xs text-ink-muted">
                font-{font.name} · {font.family} · {font.usage}
              </p>
              <p className={`${font.className} text-3xl`}>{font.sample}</p>
            </div>
          ))}
          <div>
            <h3 className="mb-4 font-display text-xl">{t.textScale}</h3>
            <ul className="grid gap-3">
              {textSizes.map((size) => (
                <li key={size.name} className="flex items-baseline gap-6">
                  <span className="w-16 shrink-0 font-mono text-xs text-ink-muted">
                    {size.className}
                  </span>
                  <span className={size.className}>Chimpanzés, forêt de Taï, 05:12</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <div className="grid gap-12 lg:grid-cols-2">
        <Section title={t.radius}>
          <ul className="flex flex-wrap gap-6">
            {radiusTokens.map((radius) => (
              <li key={radius.name} className="grid justify-items-center gap-2">
                <span
                  aria-hidden="true"
                  className={`${radius.className} size-16 border-2 border-accent bg-surface-raised`}
                />
                <span className="font-mono text-xs text-ink-muted">{radius.className}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title={t.spacing} intro={t.spacingIntro}>
          <ul className="grid gap-2">
            {spacingSamples.map(({ step, className }) => (
              <li key={step} className="flex items-center gap-4">
                <span className="w-20 font-mono text-xs text-ink-muted">
                  {step} · {step * 4} px
                </span>
                <span aria-hidden="true" className={`${className} h-3 rounded-xs bg-accent`} />
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </main>
  );
}

function Section({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-12">
      <h2 className="font-display text-2xl">{title}</h2>
      {intro && <p className="mt-1 mb-6 max-w-prose text-sm text-ink-muted">{intro}</p>}
      {!intro && <div className="mb-6" />}
      {children}
    </section>
  );
}

/** Panneau qui force un thème : tout ce qu'il contient utilise ses tokens. */
function ThemePanel({
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

function ContrastTable({ theme, label }: { theme: Theme; label: string }) {
  return (
    <table className="w-full text-sm">
      <caption className="sr-only">
        {t.contrast} · {label}
      </caption>
      <thead className="text-left text-xs text-ink-muted">
        <tr>
          <th scope="col" className="pb-2 font-normal">
            Aperçu
          </th>
          <th scope="col" className="pb-2 font-normal">
            Paire
          </th>
          <th scope="col" className="pb-2 text-right font-normal">
            Rapport
          </th>
        </tr>
      </thead>
      <tbody>
        {contrastPairs.map(({ fg, bg, min }) => {
          const ratio = contrastRatio(themes[theme][fg] ?? '', themes[theme][bg] ?? '');
          const pass = ratio >= min;
          return (
            <tr key={`${fg}/${bg}`} className="border-t border-line">
              <td className="py-1.5">
                <span
                  className="inline-block rounded-xs px-2 font-medium"
                  style={{ color: `var(--theme-${fg})`, backgroundColor: `var(--theme-${bg})` }}
                >
                  Aa
                </span>
              </td>
              <td className="py-1.5 font-mono text-xs">
                {fg} / {bg}
              </td>
              <td className="py-1.5 text-right font-mono text-xs">
                {formatRatio(ratio)} ≥ {min}{' '}
                <span className={pass ? 'text-verdict-yes' : 'text-danger'}>
                  {pass ? t.pass : t.fail}
                </span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
