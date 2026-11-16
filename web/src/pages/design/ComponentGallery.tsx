import { Plus, Search, Settings2 } from 'lucide-react';
import { useState, type ReactNode } from 'react';

import type { Theme } from '@/app/theme/theme';
import { CameraStrip } from '@/components/domain/CameraStrip';
import { ProceduralThumbnail } from '@/components/domain/ProceduralThumbnail';
import { RelevanceTimeline } from '@/components/domain/RelevanceTimeline';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { VerdictBadge } from '@/components/ui/VerdictBadge';
import { strings } from '@/content/strings';

import { Section, ThemePanel } from './parts';

const t = strings.design;
const g = strings.design.gallery;

// Données d'exemple pour la vitrine (pas des données de l'application).
const sampleScores = [
  0.05, 0.08, 0.12, 0.2, 0.34, 0.52, 0.71, 0.93, 0.8, 0.6, 0.41, 0.3, 0.18, 0.1, 0.06,
];
const flatScores = Array.from({ length: 15 }, () => 0.1);
const sampleStrip = {
  siteId: 'S03',
  cameraId: 'CAM-17',
  recordedAt: '2025-03-04T05:12:08',
  temperatureC: 18.4,
  moonPhase: 0.32,
  isNight: true,
};

/** Affiche le même contenu dans les deux thèmes, côte à côte. */
function BothThemes({ children }: { children: (theme: Theme) => ReactNode }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <ThemePanel theme="dark" label={t.darkTheme}>
        {children('dark')}
      </ThemePanel>
      <ThemePanel theme="light" label={t.lightTheme}>
        {children('light')}
      </ThemePanel>
    </div>
  );
}

function StateLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mb-2 font-mono text-2xs tracking-stamp text-ink-muted uppercase">{children}</p>
  );
}

export function ComponentGallery() {
  return (
    <>
      <Section id="button" title="Button" intro={g.buttonIntro}>
        <BothThemes>
          {() => (
            <div className="grid gap-5">
              {(['primary', 'secondary', 'ghost'] as const).map((variant) => (
                <div key={variant}>
                  <StateLabel>{variant}</StateLabel>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button variant={variant}>{g.validate}</Button>
                    <Button variant={variant} size="sm" icon={Plus}>
                      {g.add}
                    </Button>
                    <Button variant={variant} icon={Settings2} aria-label={g.settings} />
                    <Button variant={variant} loading>
                      {g.saving}
                    </Button>
                    <Button variant={variant} disabled>
                      {g.disabled}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </BothThemes>
      </Section>

      <Section id="textfield" title="TextField" intro={g.fieldIntro}>
        <BothThemes>{() => <FieldStates />}</BothThemes>
      </Section>

      <Section id="verdict" title="VerdictBadge" intro={g.verdictIntro}>
        <BothThemes>
          {() => (
            <div className="grid gap-3">
              {(['md', 'sm'] as const).map((size) => (
                <div key={size} className="flex flex-wrap items-center gap-2">
                  <VerdictBadge verdict="yes" size={size} />
                  <VerdictBadge verdict="no" size={size} />
                  <VerdictBadge verdict="unsure" size={size} />
                  <VerdictBadge verdict={null} size={size} />
                </div>
              ))}
            </div>
          )}
        </BothThemes>
      </Section>

      <Section id="strip" title="CameraStrip" intro={g.stripIntro}>
        <BothThemes>
          {() => (
            <div className="grid gap-4">
              <div>
                <StateLabel>{g.night}</StateLabel>
                <CameraStrip {...sampleStrip} />
              </div>
              <div>
                <StateLabel>{g.day}</StateLabel>
                <CameraStrip
                  {...sampleStrip}
                  recordedAt="2025-03-04T14:47:31"
                  temperatureC={27}
                  moonPhase={0.5}
                  isNight={false}
                />
              </div>
              <div>
                <StateLabel>{g.missing}</StateLabel>
                <CameraStrip
                  {...sampleStrip}
                  recordedAt={null}
                  temperatureC={null}
                  moonPhase={null}
                />
              </div>
              <div>
                <StateLabel>{g.moonPhases}</StateLabel>
                <div className="grid gap-1">
                  {[0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875].map((phase) => (
                    <CameraStrip key={phase} {...sampleStrip} moonPhase={phase} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </BothThemes>
      </Section>

      <Section id="timeline" title="RelevanceTimeline" intro={g.timelineIntro}>
        <BothThemes>
          {() => (
            <div className="grid gap-6">
              <div className="max-w-xs">
                <StateLabel>compact</StateLabel>
                <RelevanceTimeline scores={sampleScores} bestMomentS={7} />
              </div>
              <div className="max-w-xs">
                <StateLabel>{g.lowScores}</StateLabel>
                <RelevanceTimeline scores={flatScores} bestMomentS={0} />
              </div>
              <div>
                <StateLabel>large · {g.playhead}</StateLabel>
                <RelevanceTimeline
                  scores={sampleScores}
                  bestMomentS={7}
                  variant="large"
                  currentS={4.5}
                  className="mt-6"
                />
              </div>
            </div>
          )}
        </BothThemes>
      </Section>

      <Section id="thumbnail" title="ProceduralThumbnail" intro={g.thumbnailIntro}>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[11, 42, 1337, 2024].map((seed, i) => (
            <figure key={seed} className="overflow-hidden rounded-md border border-line">
              <ProceduralThumbnail seed={seed} isNight={i % 2 === 0} />
              <figcaption className="px-2 py-1 font-mono text-2xs text-ink-muted">
                seed {seed} · {i % 2 === 0 ? g.night : g.day}
              </figcaption>
            </figure>
          ))}
        </div>

        <h3 className="mt-8 mb-3 font-display text-xl">{g.cardPreview}</h3>
        <BothThemes>
          {() => (
            <article className="max-w-sm overflow-hidden rounded-md border border-line bg-surface-raised">
              <ProceduralThumbnail seed={42} isNight />
              <CameraStrip {...sampleStrip} />
              <div className="grid gap-2 p-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-ink-muted">#01</span>
                  <VerdictBadge verdict={null} size="sm" />
                </div>
                <RelevanceTimeline scores={sampleScores} bestMomentS={7} />
              </div>
            </article>
          )}
        </BothThemes>

        <h3 className="mt-8 mb-3 font-display text-xl">{g.imageColors}</h3>
        <div className="grid gap-2">
          {(['night', 'day'] as const).map((period) => (
            <div key={period} className="flex items-center gap-2">
              <span className="w-12 font-mono text-xs text-ink-muted">{period}</span>
              {([1, 2, 3, 4, 5] as const).map((step) => (
                <span
                  key={step}
                  title={`--image-${period}-${String(step)}`}
                  className="size-9 rounded-sm border border-line"
                  style={{ backgroundColor: `var(--image-${period}-${String(step)})` }}
                />
              ))}
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}

/** États du champ, dont un champ contrôlé pour montrer la saisie. */
function FieldStates() {
  const [query, setQuery] = useState('');
  return (
    <div className="grid gap-5">
      <TextField
        label={g.searchLabel}
        hideLabel
        icon={Search}
        type="search"
        placeholder={g.searchPlaceholder}
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
        }}
      />
      <TextField label={g.noteLabel} hint={g.noteHint} placeholder={g.notePlaceholder} />
      <TextField label={g.noteLabel} error={g.noteError} defaultValue="???" />
      <TextField label={g.noteLabel} disabled placeholder={g.disabled} />
    </div>
  );
}
