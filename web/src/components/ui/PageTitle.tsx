import { useEffect, type ReactNode } from 'react';

import { strings } from '@/content/strings';

interface PageTitleProps {
  children: string;
  /** Petite ligne au-dessus du titre, style bande caméra (ex. « /design »). */
  eyebrow?: ReactNode;
  className?: string;
}

/**
 * Titre principal (h1) de chaque écran. Il met aussi à jour le titre de
 * l'onglet, et peut recevoir le focus (`tabIndex={-1}`) : AppLayout le
 * focalise à chaque changement de page pour que les lecteurs d'écran
 * annoncent le nouvel écran.
 */
export function PageTitle({ children, eyebrow, className }: PageTitleProps) {
  useEffect(() => {
    document.title = `${children} · ${strings.layout.titleSuffix}`;
  }, [children]);

  return (
    <div className={className}>
      {eyebrow && (
        <p className="font-mono text-xs tracking-stamp text-stamp uppercase">{eyebrow}</p>
      )}
      <h1
        tabIndex={-1}
        // Le focus programmatique ne doit pas afficher de contour : ce n'est
        // pas un élément interactif.
        className="mt-1 font-display text-4xl focus-visible:outline-none"
      >
        {children}
      </h1>
    </div>
  );
}
