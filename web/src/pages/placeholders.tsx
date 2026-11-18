// Écrans provisoires : chacun sera remplacé à son étape. Ils montrent déjà
// l'état « vide » commun et posent le titre de page (focus + onglet).
import { Compass, Library } from 'lucide-react';
import { Link } from 'react-router';

import { PageTitle } from '@/components/ui/PageTitle';
import { EmptyState } from '@/components/ui/states';
import { strings } from '@/content/strings';

const p = strings.pages;

export function CollectionPage() {
  return (
    <>
      <PageTitle>{p.collection.title}</PageTitle>
      <p className="mt-3 max-w-prose text-lg text-ink-muted">{strings.app.tagline}</p>
      <EmptyState icon={Library} title={p.collection.emptyTitle} className="mt-10">
        {p.collection.emptyBody}
      </EmptyState>
    </>
  );
}

export function NotFoundPage() {
  return (
    <>
      <PageTitle eyebrow="404">{p.notFound.title}</PageTitle>
      <EmptyState
        icon={Compass}
        title={p.notFound.body}
        className="mt-10"
        action={
          <Link to="/" className="text-accent underline underline-offset-4">
            {p.notFound.action}
          </Link>
        }
      />
    </>
  );
}
