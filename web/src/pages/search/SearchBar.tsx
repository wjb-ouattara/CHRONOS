import { Search } from 'lucide-react';
import { useRef, type SubmitEvent } from 'react';

import { useShortcut } from '@/app/useShortcut';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { strings } from '@/content/strings';

const t = strings.pages.search;

interface SearchBarProps {
  /** Texte de la recherche en cours (pré-remplit le champ). */
  initialText: string;
  onSubmit: (text: string) => void;
  pending: boolean;
}

/**
 * Barre de recherche en texte libre. Un vrai <form> : la touche Entrée
 * soumet sans code supplémentaire. Champ « non contrôlé » (`defaultValue`) :
 * React n'a pas besoin de suivre chaque frappe ; le parent le réinitialise
 * en changeant sa `key` quand la recherche change.
 */
export function SearchBar({ initialText, onSubmit, pending }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Raccourci « / » : aller à la barre de recherche.
  useShortcut('focusSearch', () => {
    inputRef.current?.focus();
    inputRef.current?.select();
  });

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault(); // pas de rechargement de page
    const text = new FormData(event.currentTarget).get('q');
    if (typeof text === 'string' && text.trim() !== '') onSubmit(text.trim());
  };

  return (
    <form role="search" onSubmit={handleSubmit} className="flex items-end gap-3">
      <TextField
        ref={inputRef}
        name="q"
        type="search"
        label={t.fieldLabel}
        hideLabel
        icon={Search}
        placeholder={t.placeholder}
        defaultValue={initialText}
        aria-keyshortcuts="/"
        autoComplete="off"
        className="flex-1"
      />
      <Button type="submit" variant="primary" loading={pending}>
        {t.submit}
      </Button>
    </form>
  );
}
