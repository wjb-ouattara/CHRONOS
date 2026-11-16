import { useRouteError } from 'react-router';

import { ErrorState } from '@/components/ui/states';
import { strings } from '@/content/strings';

const t = strings.pages.routeError;

/**
 * Affiché par React Router quand un écran plante pendant son rendu.
 * Placé SOUS la mise en page : l'en-tête et le bandeau démo restent
 * visibles, seul le contenu est remplacé par un message et une issue.
 */
export function ScreenError() {
  const error = useRouteError();
  // Le détail technique va dans la console, pas sous les yeux de l'utilisateur.
  console.error(error);

  return (
    <ErrorState
      title={t.title}
      message={t.body}
      retryLabel={t.action}
      onRetry={() => {
        window.location.reload();
      }}
    />
  );
}

/** Filet de sécurité si la mise en page elle-même plante. */
export function RootError() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <ScreenError />
    </main>
  );
}
