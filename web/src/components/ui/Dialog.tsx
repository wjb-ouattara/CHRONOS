import { X } from 'lucide-react';
import { useEffect, useId, useRef, type ReactNode } from 'react';

import { strings } from '@/content/strings';
import { cn } from '@/lib/cn';

import { Button } from './Button';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}

/**
 * Fenêtre modale fondée sur l'élément natif <dialog> + showModal().
 * Le navigateur fournit gratuitement : le piège à focus (Tab reste dans la
 * fenêtre), la fermeture par Échap, le fond (::backdrop), l'affichage au
 * premier plan et le retour du focus sur l'élément qui l'a ouverte.
 */
export function Dialog({ open, onClose, title, children, className }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  // React décrit l'état voulu (`open`) ; cet effet le synchronise avec le DOM.
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    // Le clic sur le fond n'est qu'un raccourci souris : au clavier, Échap
    // ferme déjà la fenêtre (comportement natif). Exception justifiée et ciblée.
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      // Échap déclenche `cancel` puis `close` : on prévient le parent dans les deux cas.
      onClose={onClose}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      // Clic sur le fond (hors du contenu) : ferme la fenêtre.
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className={cn(
        'm-auto w-full max-w-lg rounded-lg border border-line bg-surface-raised p-0 text-ink',
        'backdrop:bg-canvas/70',
        className,
      )}
    >
      <div className="p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 id={titleId} className="font-display text-2xl">
            {title}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            icon={X}
            aria-label={strings.shortcuts.close}
            onClick={onClose}
          />
        </div>
        {children}
      </div>
    </dialog>
  );
}
