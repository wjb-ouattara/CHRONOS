import { Dialog } from '@/components/ui/Dialog';
import { shortcuts, type ShortcutGroup } from '@/content/shortcuts';
import { strings } from '@/content/strings';
import { cn } from '@/lib/cn';

const t = strings.shortcuts;
const groups: readonly ShortcutGroup[] = ['global', 'search'];

/** Aide des raccourcis, générée à partir du registre unique. */
export function ShortcutsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onClose={onClose} title={t.title}>
      <p className="mb-5 text-sm text-ink-muted">{t.intro}</p>
      <div className="grid gap-6">
        {groups.map((group) => (
          <section key={group}>
            <h3 className="mb-2 font-mono text-xs tracking-stamp text-stamp uppercase">
              {t.groups[group]}
            </h3>
            {/* Liste de définitions : touche → action, structure sémantique adaptée. */}
            <dl className="grid gap-1.5">
              {shortcuts
                .filter((s) => s.group === group)
                .map((s) => (
                  <div
                    key={s.id}
                    className={cn('flex items-center gap-3', !s.available && 'text-ink-muted')}
                  >
                    <dt>
                      <kbd className="inline-grid min-w-7 place-items-center rounded-sm border border-line-strong bg-surface px-1.5 py-0.5 font-mono text-xs">
                        {s.label}
                      </kbd>
                    </dt>
                    <dd className="text-sm">
                      {s.description}
                      {!s.available && (
                        <span className="ml-2 font-mono text-2xs uppercase">· {t.soon}</span>
                      )}
                    </dd>
                  </div>
                ))}
            </dl>
          </section>
        ))}
      </div>
    </Dialog>
  );
}
