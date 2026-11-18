// Page 404 (les écrans provisoires des étapes précédentes ont tous été remplacés).
import { Compass } from 'lucide-react';
import { Link } from 'react-router';

import { PageTitle } from '@/components/ui/PageTitle';
import { EmptyState } from '@/components/ui/states';
import { strings } from '@/content/strings';

const p = strings.pages;

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
