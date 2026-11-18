import { useId, useRef, useState, type MouseEvent } from 'react';

import { Button } from '@/components/ui/Button';
import { strings } from '@/content/strings';
import { cn } from '@/lib/cn';
import { splitLocalDateTime } from '@/lib/format';

import {
  formatMonth,
  monthlyTable,
  monthTicks,
  type Actogram as ActogramData,
  type ActogramPoint,
} from './collection-data';

const t = strings.pages.collection;

// Géométrie (unités du viewBox SVG ; le dessin s'adapte à la largeur disponible).
const W = 1000;
const H = 300;
const M = { top: 10, right: 12, bottom: 28, left: 36 }; // marges pour les axes
const PLOT_W = W - M.left - M.right;
const PLOT_H = H - M.top - M.bottom;
const HIT_RADIUS = 14; // distance de survol, en unités du viewBox

interface ActogramProps {
  data: ActogramData;
  /** Site mis en avant (les autres s'estompent), ou null pour tous. */
  highlightSite: string | null;
  label: string;
  className?: string;
}

/**
 * Actogramme : un trait par clip, date en horizontal, heure locale en
 * vertical (0 h en haut). Deux couleurs (jour / nuit) toujours doublées par
 * la légende et la bande de nuit en fond : la couleur n'est jamais seule.
 */
export function Actogram({ data, highlightSite, label, className }: ActogramProps) {
  const [hovered, setHovered] = useState<ActogramPoint | null>(null);
  const [showData, setShowData] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const tableId = useId();

  const x = (dayIndex: number) => M.left + ((dayIndex + 0.5) / Math.max(1, data.spanDays)) * PLOT_W;
  const y = (hour: number) => M.top + (hour / 24) * PLOT_H;
  const ticks = monthTicks(data.firstDayMs, data.spanDays);

  /** Survol : on cherche le clip le plus proche du pointeur (plus facile qu'un trait de 2 px). */
  const onMove = (event: MouseEvent<SVGSVGElement>) => {
    const box = svgRef.current?.getBoundingClientRect();
    if (!box || box.width === 0) return;
    const px = ((event.clientX - box.left) / box.width) * W;
    const py = ((event.clientY - box.top) / box.height) * H;
    let best: ActogramPoint | null = null;
    let bestDistance = HIT_RADIUS;
    for (const p of data.points) {
      const d = Math.hypot(x(p.dayIndex) - px, y(p.hour) - py);
      if (d < bestDistance) {
        bestDistance = d;
        best = p;
      }
    }
    setHovered(best);
  };

  const tooltip =
    hovered &&
    (() => {
      const { date, time } = splitLocalDateTime(hovered.recordedAt);
      return {
        text: t.tooltip(
          hovered.clipId,
          hovered.siteId,
          hovered.cameraId,
          `${date} ${time.slice(0, 5)}`,
        ),
        left: `${String((x(hovered.dayIndex) / W) * 100)}%`,
        top: `${String((y(hovered.hour) / H) * 100)}%`,
      };
    })();

  return (
    <div className={cn('grid gap-3', className)}>
      {/* Légende : couleur + texte. */}
      <ul className="flex gap-4 text-xs text-ink-muted">
        <li className="flex items-center gap-1.5">
          <span aria-hidden="true" className="h-3 w-1 rounded-xs bg-chart-day" />
          {t.legendDay}
        </li>
        <li className="flex items-center gap-1.5">
          <span aria-hidden="true" className="h-3 w-1 rounded-xs bg-chart-night" />
          {t.legendNight}
        </li>
      </ul>

      <div className="relative">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${String(W)} ${String(H)}`}
          role="img"
          aria-label={label}
          className="w-full"
          onMouseMove={onMove}
          onMouseLeave={() => {
            setHovered(null);
          }}
        >
          {/* Bandes de nuit (0-6 h et 19-24 h). `line` à 50 % : plus sombre que le
              fond dans les DEUX thèmes (surface-raised serait plus clair en thème clair). */}
          <rect x={M.left} y={y(0)} width={PLOT_W} height={y(6) - y(0)} className="fill-line/50" />
          <rect
            x={M.left}
            y={y(19)}
            width={PLOT_W}
            height={y(24) - y(19)}
            className="fill-line/50"
          />

          {/* Axe des heures : graduations discrètes. */}
          {[0, 6, 12, 18, 24].map((hour) => (
            <g key={hour}>
              <line
                x1={M.left}
                x2={W - M.right}
                y1={y(hour)}
                y2={y(hour)}
                className="stroke-line"
              />
              <text
                x={M.left - 6}
                y={y(hour)}
                textAnchor="end"
                dominantBaseline="middle"
                className="fill-ink-muted font-mono text-[10px]"
              >
                {String(hour).padStart(2, '0')} h
              </text>
            </g>
          ))}

          {/* Axe des dates : un repère par mois, libellé un mois sur trois. */}
          {ticks.map((tick, i) => (
            <g key={tick.month}>
              <line
                x1={x(tick.dayIndex) - 0.5}
                x2={x(tick.dayIndex) - 0.5}
                y1={y(24)}
                y2={y(24) + 4}
                className="stroke-line-strong"
              />
              {i % 3 === 0 && (
                <text
                  x={x(tick.dayIndex)}
                  y={y(24) + 16}
                  textAnchor="middle"
                  className="fill-ink-muted font-mono text-[10px]"
                >
                  {formatMonth(tick.month)}
                </text>
              )}
            </g>
          ))}

          {/* Les clips. */}
          {data.points.map((p) => {
            const dimmed = highlightSite !== null && p.siteId !== highlightSite;
            return (
              <rect
                key={p.clipId}
                data-clip={p.clipId}
                data-hour={p.hour.toFixed(2)}
                x={x(p.dayIndex) - 1.25}
                y={y(p.hour) - 3}
                width={2.5}
                height={6}
                rx={1}
                className={cn(
                  'transition-opacity duration-150',
                  p.isNight ? 'fill-chart-night' : 'fill-chart-day',
                  dimmed && 'opacity-15',
                  hovered?.clipId === p.clipId && 'stroke-ink',
                )}
              />
            );
          })}
        </svg>

        {tooltip && (
          <p
            role="status"
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-[140%] rounded-sm border border-line bg-surface-raised px-2 py-1 font-mono text-2xs whitespace-nowrap text-ink"
            style={{ left: tooltip.left, top: tooltip.top }}
          >
            {tooltip.text}
          </p>
        )}
      </div>

      {data.excluded > 0 && <p className="text-xs text-ink-muted">{t.excluded(data.excluded)}</p>}

      <Button
        size="sm"
        variant="ghost"
        className="justify-self-start"
        aria-expanded={showData}
        aria-controls={tableId}
        onClick={() => {
          setShowData((v) => !v);
        }}
      >
        {showData ? t.hideData : t.showData}
      </Button>
      <div id={tableId} hidden={!showData}>
        <table className="w-full max-w-md text-sm">
          <caption className="sr-only">{t.dataCaption}</caption>
          <thead className="text-left text-xs text-ink-muted">
            <tr>
              <th scope="col" className="pb-1 font-normal">
                {t.monthColumn}
              </th>
              <th scope="col" className="pb-1 text-right font-normal">
                {t.dayColumn}
              </th>
              <th scope="col" className="pb-1 text-right font-normal">
                {t.nightColumn}
              </th>
              <th scope="col" className="pb-1 text-right font-normal">
                {t.totalColumn}
              </th>
            </tr>
          </thead>
          <tbody className="font-mono text-xs">
            {monthlyTable(data.points).map((row) => (
              <tr key={row.month} className="border-t border-line">
                <th scope="row" className="py-1 text-left font-normal">
                  {formatMonth(row.month)}
                </th>
                <td className="py-1 text-right">{row.day}</td>
                <td className="py-1 text-right">{row.night}</td>
                <td className="py-1 text-right">{row.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
