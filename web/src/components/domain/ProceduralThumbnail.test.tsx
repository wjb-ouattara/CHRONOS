import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ProceduralThumbnail } from './ProceduralThumbnail';
import { buildScene } from './scene';

describe('buildScene', () => {
  it('même graine → même scène', () => {
    expect(buildScene(42)).toEqual(buildScene(42));
  });

  it('graines différentes → scènes différentes', () => {
    expect(buildScene(1)).not.toEqual(buildScene(2));
  });
});

describe('ProceduralThumbnail', () => {
  it('est décorative (ignorée par les lecteurs d’écran)', () => {
    const { container } = render(<ProceduralThumbnail seed={42} isNight />);
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('utilise les couleurs de nuit ou de jour', () => {
    const night = render(<ProceduralThumbnail seed={42} isNight />).container.innerHTML;
    const day = render(<ProceduralThumbnail seed={42} isNight={false} />).container.innerHTML;
    expect(night).toContain('--image-night-');
    expect(night).not.toContain('--image-day-');
    expect(day).toContain('--image-day-');
  });

  it('donne des identifiants SVG uniques à chaque vignette', () => {
    const { container } = render(
      <>
        <ProceduralThumbnail seed={1} isNight />
        <ProceduralThumbnail seed={1} isNight />
      </>,
    );
    const ids = [...container.querySelectorAll('[id]')].map((el) => el.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
