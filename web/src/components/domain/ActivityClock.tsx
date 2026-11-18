import { scaleRadial } from 'd3-scale';
import { arc } from 'd3-shape';
import { useId, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { strings } from '@/content/strings';
import { cn } from '@/lib/cn';

const t = strings.pages.clock;

// Géométrie (unités du viewBox SVG).
const SIZE = 300;
const CENTER = SIZE / 2;
const INNER = 46; // rayon du disque central (total)
const OUTER = 118; // rayon maximal des barres
const LABEL = OUTER + 16;
const STEP = (2 * Math.PI) / 24; // un secteur par heure
const PAD = 0.012; // espace entre deux barres (radians)

/** Générateur d'arcs de d3-shape : l'angle 0 est en haut (minuit), sens horaire. */
const sector = arc<{ inner: number; outer: number; start: number; end: number }>()
  .innerRadius((d) => d.inner)
  .outerRadius((d) => d.outer)
  .startAngle((d) => d.start)
  .endAngle((d) => d.end)
  .cornerRadius(2);

const isNightHour = (h: number) => h < 6 || h >= 19;

interface ActivityClockProps {
  /** 24 valeurs : clips « oui » par heure locale. */
  counts: readonly number[];
  /** Nombre de clips exclus faute d'horodatage (signalé sous l'horloge). */
  excluded?: number;
  className?: string;
}

/**
 * Horloge d'activité 24 h : un graphique classique des études par caméras
 * pièges. Une barre par heure, minuit en haut. La longueur suit une échelle
 * RADIALE : c'est la surface de la barre qui est proportionnelle au nombre
 * de clips (sinon l'œil surestime les grandes valeurs).
 */
export function ActivityClock({ counts, excluded = 0, className }: ActivityClockProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [showData, setShowData] = useState(false);
  const tableId = useId();

  const total = counts.reduce((a, b) => a + b, 0);
  const max = Math.max(1, ...counts);
  const radius = scaleRadial()
    .domain([0, max])
    .range([INNER + 4, OUTER]);
  const peak = total > 0 ? counts.indexOf(Math.max(...counts)) : null;
  const summary = peak === null ? t.empty : t.summary(peak, counts[peak] ?? 0);

  return (
    <div className={cn('grid justify-items-center gap-3', className)}>
      <svg
        viewBox={`0 0 ${String(SIZE)} ${String(SIZE)}`}
        role="img"
        aria-label={t.label(summary)}
        className="w-full max-w-xs overflow-visible"
      >
        <g transform={`translate(${String(CENTER)} ${String(CENTER)})`}>
          {/* Fond : secteur de nuit (19 h → 6 h), discret. */}
          <path
            d={sector({ inner: INNER, outer: OUTER, start: 19 * STEP, end: 30 * STEP }) ?? ''}
            className="fill-surface-raised"
          />
          {/* Cercle de référence à la valeur maximale. */}
          <circle r={OUTER} className="fill-none stroke-line" strokeDasharray="2 4" />

          {counts.map((count, hour) => {
            const start = hour * STEP + PAD;
            const end = (hour + 1) * STEP - PAD;
            return (
              <g
                key={hour}
                data-hour={hour}
                data-count={count}
                onMouseEnter={() => {
                  setHovered(hour);
                }}
                onMouseLeave={() => {
                  setHovered(null);
                }}
              >
                {/* Zone de survol : tout le secteur, plus facile à viser que la barre. */}
                <path
                  d={sector({ inner: INNER, outer: OUTER, start, end }) ?? ''}
                  className="fill-transparent"
                />
                {count > 0 && (
                  <path
                    d={sector({ inner: INNER, outer: radius(count), start, end }) ?? ''}
                    className={cn(
                      'transition-opacity duration-150',
                      'fill-accent',
                      hovered !== null && hovered !== hour && 'opacity-40',
                    )}
                  />
                )}
              </g>
            );
          })}

          {/* Repères 0, 6, 12, 18 h. */}
          {[0, 6, 12, 18].map((hour) => {
            const angle = hour * STEP - Math.PI / 2; // 0 rad = 3 h en trigonométrie
            return (
              <text
                key={hour}
                x={LABEL * Math.cos(angle)}
                y={LABEL * Math.sin(angle)}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-ink-muted font-mono text-[10px]"
              >
                {String(hour).padStart(2, '0')}
              </text>
            );
          })}

          {/* Centre : total, ou détail de l'heure survolée. */}
          <text textAnchor="middle" className="fill-ink font-display text-[22px]" y={2}>
            {hovered === null ? total : (counts[hovered] ?? 0)}
          </text>
          <text textAnchor="middle" className="fill-ink-muted font-mono text-[9px]" y={18}>
            {hovered === null ? t.total(total) : t.hourRange(hovered)}
          </text>
        </g>
      </svg>

      <p className="text-center text-sm text-ink-muted" aria-hidden="true">
        {summary}
      </p>
      {excluded > 0 && <p className="text-xs text-ink-muted">{t.excluded(excluded)}</p>}

      {/* Vue tableau : les mêmes chiffres, lisibles sans le graphique. */}
      <Button
        size="sm"
        variant="ghost"
        aria-expanded={showData}
        aria-controls={tableId}
        onClick={() => {
          setShowData((v) => !v);
        }}
      >
        {showData ? t.hideData : t.showData}
      </Button>
      <div id={tableId} hidden={!showData} className="w-full">
        <table className="w-full text-sm">
          <caption className="sr-only">{t.dataCaption}</caption>
          <thead className="text-left text-xs text-ink-muted">
            <tr>
              <th scope="col" className="pb-1 font-normal">
                {t.hourColumn}
              </th>
              <th scope="col" className="pb-1 text-right font-normal">
                {t.countColumn}
              </th>
            </tr>
          </thead>
          <tbody className="font-mono text-xs">
            {counts.map((count, hour) => (
              <tr key={hour} className="border-t border-line">
                <th scope="row" className="py-1 text-left font-normal">
                  {t.hourRange(hour)}
                  {isNightHour(hour) && <span className="text-ink-muted"> · {t.night}</span>}
                </th>
                <td className="py-1 text-right">{count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
