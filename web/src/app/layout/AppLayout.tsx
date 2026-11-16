import { Keyboard } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router';

import { MoonIcon } from '@/components/domain/MoonIcon';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { strings } from '@/content/strings';
import { cn } from '@/lib/cn';

import { useShortcut } from '../useShortcut';

import { ShortcutsDialog } from './ShortcutsDialog';

const t = strings.layout;

const navItems = [
  { to: '/', label: strings.nav.collection, end: true },
  { to: '/recherche', label: strings.nav.search, end: false },
  { to: '/session', label: strings.nav.session, end: false },
] as const;

/** Classes d'un lien de navigation : onglet de carnet, repère phosphore si actif. */
const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'relative inline-flex h-12 items-center px-3 text-sm transition-colors duration-150',
    // Le repère sous l'onglet actif : une forme, pas seulement une couleur.
    "after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:content-['']",
    isActive
      ? 'text-ink font-medium after:bg-accent'
      : 'text-ink-muted hover:text-ink after:bg-transparent',
  );

/** Mise en page commune : bandeau démo, en-tête, contenu de l'écran. */
export function AppLayout() {
  const [helpOpen, setHelpOpen] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  useShortcut('help', () => {
    setHelpOpen((open) => !open);
  });
  useFocusOnNavigation();

  return (
    <div className="min-h-dvh">
      {/* Lien d'évitement : invisible jusqu'à ce qu'il reçoive le focus (premier Tab). */}
      <a
        href="#main"
        onClick={(event) => {
          event.preventDefault();
          mainRef.current?.focus();
        }}
        className="sr-only z-50 rounded-md bg-accent px-4 py-2 text-on-accent focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        {t.skipLink}
      </a>

      {/* En-tête collant : le bandeau démo reste visible en permanence. */}
      <header className="sticky top-0 z-40 border-b border-line bg-canvas/95 backdrop-blur-sm">
        <p className="flex h-7 items-center justify-center gap-2 border-b border-stamp/30 bg-stamp/12 px-4 font-mono text-2xs tracking-stamp text-stamp uppercase">
          <span className="font-medium">{strings.demo.banner}</span>
          <span aria-hidden="true">·</span>
          <span className="tracking-normal normal-case">{strings.demo.detail}</span>
        </p>

        <div className="mx-auto flex max-w-7xl items-center gap-6 px-6">
          <NavLink to="/" aria-label={t.brandLabel} className="flex items-center gap-2 rounded-sm">
            <MoonIcon phase={0.3} className="size-5 text-accent" />
            <span className="font-display text-xl">{t.brand}</span>
          </NavLink>

          <nav aria-label={t.navLabel} className="flex-1">
            <ul className="flex items-center">
              {navItems.map((item) => (
                <li key={item.to}>
                  <NavLink to={item.to} end={item.end} className={navLinkClass}>
                    {item.label}
                  </NavLink>
                </li>
              ))}
              <li className="ml-2">
                <NavLink to="/design" className={navLinkClass}>
                  {strings.nav.design}
                  <span className="ml-1.5 font-mono text-2xs text-ink-muted uppercase">
                    {t.internal}
                  </span>
                </NavLink>
              </li>
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              icon={Keyboard}
              aria-keyshortcuts="?"
              onClick={() => {
                setHelpOpen(true);
              }}
            >
              {t.shortcuts}
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main
        id="main"
        ref={mainRef}
        tabIndex={-1}
        className="mx-auto max-w-7xl px-6 py-10 focus-visible:outline-none"
      >
        <Outlet />
      </main>

      <ShortcutsDialog
        open={helpOpen}
        onClose={() => {
          setHelpOpen(false);
        }}
      />
    </div>
  );
}

/**
 * Après chaque changement de page (pas au premier chargement), place le
 * focus sur le titre h1 du nouvel écran. Sans cela, dans une application
 * d'une seule page, un lecteur d'écran ne remarque pas le changement.
 */
function useFocusOnNavigation() {
  const { pathname } = useLocation();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    document.querySelector<HTMLElement>('main h1')?.focus();
    window.scrollTo({ top: 0 });
  }, [pathname]);
}
