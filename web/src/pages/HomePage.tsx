import { Link } from 'react-router';

import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { strings } from '@/content/strings';

/** Accueil provisoire. L'écran Collection le remplacera à l'étape 10. */
export function HomePage() {
  return (
    <main className="mx-auto max-w-3xl px-8 py-16">
      <p className="font-mono text-xs tracking-stamp text-stamp uppercase">{strings.demo.banner}</p>
      <h1 className="mt-3 font-display text-4xl">{strings.app.name}</h1>
      <p className="mt-3 text-lg text-ink-muted">{strings.app.tagline}</p>
      <div className="mt-8 flex items-center gap-4">
        <Link to="/design" className="text-accent underline underline-offset-4">
          {strings.home.designLink}
        </Link>
        <ThemeToggle />
      </div>
    </main>
  );
}
