import { Check, CircleHelp, X, type LucideIcon } from 'lucide-react';
import { useId, useState } from 'react';

import { useShortcut } from '@/app/useShortcut';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/states';
import type { ShortcutId } from '@/content/shortcuts';
import { strings } from '@/content/strings';
import type { Clip, SearchResult, Validation, Verdict } from '@/domain/types';
import { cn } from '@/lib/cn';
import { formatScore, formatTemperature, moonPhaseName, splitLocalDateTime } from '@/lib/format';

import { ClipPlayer } from './ClipPlayer';

const t = strings.pages.loupe;

interface VerdictOption {
  verdict: Verdict;
  shortcut: ShortcutId;
  key: string;
  icon: LucideIcon;
  label: string;
  activeClass: string;
}

const verdictOptions: readonly VerdictOption[] = [
  {
    verdict: 'yes',
    shortcut: 'yes',
    key: 'Y',
    icon: Check,
    label: strings.verdict.yes,
    activeClass: 'border-verdict-yes bg-verdict-yes/15 text-verdict-yes',
  },
  {
    verdict: 'no',
    shortcut: 'no',
    key: 'N',
    icon: X,
    label: strings.verdict.no,
    activeClass: 'border-verdict-no bg-verdict-no/15 text-verdict-no',
  },
  {
    verdict: 'unsure',
    shortcut: 'unsure',
    key: 'U',
    icon: CircleHelp,
    label: strings.verdict.unsure,
    activeClass: 'border-verdict-unsure bg-verdict-unsure/15 text-verdict-unsure',
  },
];

interface LoupeProps {
  clip: Clip;
  result: SearchResult;
  validation: Validation | undefined;
  onVerdict: (verdict: Verdict, note: string) => void;
  /** Enregistre une note modifiée APRÈS le verdict. */
  onNoteChange: (note: string) => void;
  onClose: () => void;
  saveFailed: boolean;
  onRetrySave: () => void;
}

/**
 * La loupe : lecteur simulé, frise agrandie, verdict, note et métadonnées.
 * Panneau NON modal : la grille reste utilisable à côté.
 * Le parent change sa `key` à chaque clip (note et lecteur repartent à zéro).
 */
export function Loupe({
  clip,
  result,
  validation,
  onVerdict,
  onNoteChange,
  onClose,
  saveFailed,
  onRetrySave,
}: LoupeProps) {
  const [note, setNote] = useState(validation?.note ?? '');
  const noteId = useId();
  const current = validation?.verdict ?? null;

  // Y / N / U : actifs tant que la loupe est ouverte (et pas pendant la saisie).
  useShortcut('yes', () => {
    onVerdict('yes', note);
  });
  useShortcut('no', () => {
    onVerdict('no', note);
  });
  useShortcut('unsure', () => {
    onVerdict('unsure', note);
  });

  const { date, time } = splitLocalDateTime(clip.recordedAt);

  return (
    <aside aria-label={t.label(clip.id)} className="grid content-start gap-5">
      <header className="flex items-center justify-between gap-3">
        <p className="font-mono text-sm">
          <span className="text-stamp">{strings.pages.card.rank(result.rank)}</span>{' '}
          <span>{clip.id}</span>
        </p>
        <Button
          variant="ghost"
          size="sm"
          icon={X}
          aria-label={t.close}
          aria-keyshortcuts="Escape"
          onClick={onClose}
        />
      </header>

      <ClipPlayer key={clip.id} clip={clip} result={result} />

      <section aria-labelledby={`${noteId}-verdict`} className="grid gap-3">
        <h3
          id={`${noteId}-verdict`}
          className="font-mono text-xs tracking-stamp text-stamp uppercase"
        >
          {t.verdictTitle}
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {verdictOptions.map((option) => {
            const active = current === option.verdict;
            const Icon = option.icon;
            return (
              <button
                key={option.verdict}
                type="button"
                aria-pressed={active}
                aria-keyshortcuts={option.key}
                onClick={() => {
                  onVerdict(option.verdict, note);
                }}
                className={cn(
                  'flex h-11 items-center justify-center gap-2 rounded-md border text-sm font-medium',
                  'transition-colors duration-150 ease-field',
                  active
                    ? option.activeClass
                    : 'border-line-strong text-ink hover:bg-surface-raised',
                )}
              >
                <Icon aria-hidden="true" className="size-4" />
                {option.label}
                <kbd className="font-mono text-2xs text-ink-muted" aria-hidden="true">
                  {option.key}
                </kbd>
              </button>
            );
          })}
        </div>

        {saveFailed && <ErrorState title={t.saveError} onRetry={onRetrySave} className="py-4" />}

        <div className="grid gap-1.5">
          <label htmlFor={noteId} className="text-sm font-medium">
            {t.note}
          </label>
          <textarea
            id={noteId}
            value={note}
            rows={2}
            aria-describedby={`${noteId}-hint`}
            onChange={(event) => {
              setNote(event.target.value);
            }}
            onBlur={() => {
              // Note modifiée après le verdict : on la réenregistre.
              if (validation && note !== (validation.note ?? '')) onNoteChange(note);
            }}
            className="w-full resize-y rounded-md border border-line-strong bg-surface px-3 py-2 text-sm text-ink hover:border-ink-muted"
          />
          <p id={`${noteId}-hint`} className="text-xs text-ink-muted">
            {t.noteHint}
          </p>
        </div>
      </section>

      <section aria-labelledby={`${noteId}-meta`}>
        <h3
          id={`${noteId}-meta`}
          className="mb-2 font-mono text-xs tracking-stamp text-stamp uppercase"
        >
          {t.metadata}
        </h3>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
          <Meta label={t.fields.site} value={`${clip.siteId} · ${clip.cameraId}`} mono />
          <Meta
            label={t.fields.recordedAt}
            value={clip.recordedAt ? `${date} ${time}` : t.unknown}
            mono
          />
          <Meta
            label={t.fields.temperature}
            value={clip.temperatureC === null ? t.unknown : formatTemperature(clip.temperatureC)}
            mono
          />
          <Meta label={t.fields.moon} value={moonPhaseName(clip.moonPhase)} />
          <Meta label={t.fields.period} value={clip.isNight ? t.night : t.day} />
          <Meta
            label={t.fields.species}
            value={clip.species ? t.species[clip.species] : t.unknown}
          />
          <Meta label={t.fields.score} value={formatScore(result.score)} mono />
        </dl>
      </section>
    </aside>
  );
}

function Meta({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <>
      <dt className="text-ink-muted">{label}</dt>
      <dd className={cn(mono && 'font-mono text-xs leading-5')}>{value}</dd>
    </>
  );
}
