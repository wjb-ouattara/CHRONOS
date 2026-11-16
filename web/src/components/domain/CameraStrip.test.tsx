import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { CameraStrip, type CameraStripProps } from './CameraStrip';

const base: CameraStripProps = {
  siteId: 'S03',
  cameraId: 'CAM-17',
  recordedAt: '2025-03-04T05:12:08',
  temperatureC: 18.4,
  moonPhase: 0.5,
  isNight: true,
};

describe('CameraStrip', () => {
  it('affiche les informations de la caméra en version compacte', () => {
    const { container } = render(<CameraStrip {...base} />);
    const visible = container.querySelector('[aria-hidden="true"]');
    expect(visible).toHaveTextContent('S03 · CAM-17');
    expect(visible).toHaveTextContent('2025-03-04 05:12:08');
    expect(visible).toHaveTextContent('18°C');
    expect(visible).toHaveTextContent('IR');
  });

  it('fournit une phrase complète aux lecteurs d’écran', () => {
    render(<CameraStrip {...base} />);
    expect(
      screen.getByText('S03, caméra CAM-17, 2025-03-04 à 05:12:08, 18°C, Pleine lune, nuit'),
    ).toBeInTheDocument();
  });

  it('affiche des tirets et « inconnu » quand les valeurs manquent', () => {
    const { container } = render(
      <CameraStrip {...base} recordedAt={null} temperatureC={null} moonPhase={null} />,
    );
    expect(container).toHaveTextContent('---------- --:--:--');
    expect(container).toHaveTextContent('--°C');
    expect(
      screen.getByText(
        'S03, caméra CAM-17, date inconnue, température inconnue, Phase inconnue, nuit',
      ),
    ).toBeInTheDocument();
  });

  it('reste en thème sombre, comme une vraie incrustation de caméra', () => {
    const { container } = render(<CameraStrip {...base} />);
    expect(container.firstElementChild).toHaveAttribute('data-theme', 'dark');
  });

  it("n'affiche pas « IR » de jour", () => {
    const { container } = render(<CameraStrip {...base} isNight={false} />);
    expect(container).not.toHaveTextContent('IR');
  });
});
