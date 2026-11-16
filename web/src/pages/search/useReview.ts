import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';

import { useSaveValidation } from '@/api/queries';
import { useShortcut } from '@/app/useShortcut';
import { strings } from '@/content/strings';
import type { SearchResult, Validation, Verdict } from '@/domain/types';

/** Pause entre un verdict et le passage au clip suivant : le temps de voir la confirmation. */
export const ADVANCE_DELAY_MS = 150;

/** Donne le focus au bouton de la carte d'un clip (après la fermeture de la loupe). */
function focusCard(clipId: string) {
  requestAnimationFrame(() => {
    document.querySelector<HTMLElement>(`[data-clip-id="${clipId}"] button`)?.focus();
  });
}

/**
 * Logique de la revue des résultats : clip sélectionné (dans l'adresse,
 * `?clip=`), navigation J/K, verdicts avec passage automatique au suivant,
 * fermeture par Échap, annonce pour les lecteurs d'écran.
 */
export function useReview(
  queryId: string | null,
  results: readonly SearchResult[] | undefined,
  validations: readonly Validation[] | undefined,
) {
  const [params, setParams] = useSearchParams();
  const save = useSaveValidation(queryId);
  const [announcement, setAnnouncement] = useState('');
  const advanceTimer = useRef<number | undefined>(undefined);

  const list = results ?? [];
  const requested = params.get('clip');
  // On ne garde la sélection que si le clip fait partie des résultats.
  const selectedIndex = list.findIndex((r) => r.clipId === requested);
  const selected = selectedIndex >= 0 ? list[selectedIndex] : undefined;

  // Annule un passage automatique en attente si le composant disparaît.
  useEffect(
    () => () => {
      window.clearTimeout(advanceTimer.current);
    },
    [],
  );

  /**
   * Ouvre un clip. `replace` : J/K remplacent l'entrée d'historique (sinon
   * « précédent » rejouerait chaque clip un par un) ; un clic en ajoute une.
   */
  const open = (clipId: string, replace = false) => {
    if (!queryId) return;
    setParams({ q: queryId, clip: clipId }, { replace });
  };

  const close = () => {
    if (!queryId || !selected) return;
    window.clearTimeout(advanceTimer.current);
    setParams({ q: queryId }, { replace: true });
    focusCard(selected.clipId);
  };

  const step = (delta: 1 | -1) => {
    if (list.length === 0) return;
    window.clearTimeout(advanceTimer.current);
    // Sans sélection : J ouvre le premier clip, K ne fait rien.
    const next = selected ? selectedIndex + delta : delta === 1 ? 0 : -1;
    const target = list[next];
    if (target) open(target.clipId, true);
  };

  const validate = (clipId: string, verdict: Verdict, note: string) => {
    if (!queryId) return;
    save.mutate({ queryId, clipId, verdict, ...(note.trim() ? { note: note.trim() } : {}) });
    setAnnouncement(strings.pages.search.announce(clipId, strings.verdict[verdict]));

    // Passage automatique au clip suivant, après une courte confirmation visuelle.
    const index = list.findIndex((r) => r.clipId === clipId);
    const target = list[index + 1];
    window.clearTimeout(advanceTimer.current);
    if (target) {
      advanceTimer.current = window.setTimeout(() => {
        open(target.clipId, true);
      }, ADVANCE_DELAY_MS);
    }
  };

  /** Note modifiée après coup : réenregistre la validation existante. */
  const updateNote = (clipId: string, note: string) => {
    const existing = validations?.find((v) => v.clipId === clipId);
    if (!queryId || !existing) return;
    save.mutate({ queryId, clipId, verdict: existing.verdict, note: note.trim() });
  };

  useShortcut('next', () => {
    step(1);
  });
  useShortcut('previous', () => {
    step(-1);
  });
  useShortcut('close', close, { enabled: selected !== undefined });

  return {
    selected,
    open,
    close,
    validate,
    updateNote,
    announcement,
    /** L'enregistrement du clip affiché a échoué (l'état a été restauré). */
    saveFailed: save.isError && save.variables.clipId === selected?.clipId,
    retrySave: () => {
      if (save.variables) save.mutate(save.variables);
    },
  };
}
