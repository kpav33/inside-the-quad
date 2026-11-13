import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { INTRO } from '@/content/intro';

import { SystemScene } from './SystemScene';

function renderScene() {
  const { container } = render(<SystemScene />);
  const svg = container.querySelector('svg');
  if (!svg) throw new Error('no drawing');
  const highlighted = (link: string) =>
    svg.querySelector(`[data-link="${link}"]`)?.getAttribute('data-highlight');
  return { svg, highlighted };
}

describe('SystemScene', () => {
  it('hides the drawing from assistive technology and keeps nothing focusable in it', () => {
    const { svg } = renderScene();
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg.querySelector('[tabindex]')).toBeNull();
  });

  it('offers one toggle per device in a labelled list', () => {
    renderScene();
    const list = screen.getByRole('list', { name: INTRO.scene.label });
    const buttons = within(list).getAllByRole('button');
    expect(buttons.map((b) => b.textContent)).toEqual(['Radio', 'Drone', 'Goggles']);
    for (const button of buttons) expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  it('lights both links for the drone, and clears on a second press', async () => {
    const { highlighted } = renderScene();
    const drone = screen.getByRole('button', { name: 'Drone' });
    drone.focus();
    await userEvent.keyboard('{Enter}');
    expect(drone).toHaveAttribute('aria-pressed', 'true');
    expect(highlighted('control')).toBe('true');
    expect(highlighted('video')).toBe('true');
    await userEvent.keyboard('{Enter}');
    expect(drone).toHaveAttribute('aria-pressed', 'false');
    expect(highlighted('control')).toBe('false');
    expect(highlighted('video')).toBe('false');
  });

  it('moves the highlight to another device', async () => {
    const { highlighted } = renderScene();
    await userEvent.click(screen.getByRole('button', { name: 'Drone' }));
    await userEvent.click(screen.getByRole('button', { name: 'Radio' }));
    expect(screen.getByRole('button', { name: 'Drone' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: 'Radio' })).toHaveAttribute('aria-pressed', 'true');
    expect(highlighted('control')).toBe('true');
    expect(highlighted('video')).toBe('false');
  });

  it('previews a device while the mouse is over it', async () => {
    const { highlighted } = renderScene();
    const goggles = screen.getByRole('button', { name: 'Goggles' });
    await userEvent.hover(goggles);
    expect(highlighted('video')).toBe('true');
    await userEvent.unhover(goggles);
    expect(highlighted('video')).toBe('false');
  });

  it('keeps no preview after a touch, so a second tap clears the highlight', () => {
    const { highlighted } = renderScene();
    const drone = screen.getByRole('button', { name: 'Drone' });
    for (let i = 0; i < 2; i++) {
      // A tap sends pointer events, then compatibility mouse events with no matching leave.
      fireEvent.pointerEnter(drone, { pointerType: 'touch' });
      fireEvent.mouseEnter(drone);
      fireEvent.click(drone);
    }
    expect(highlighted('video')).toBe('false');
  });

  it('does the same when a device in the drawing is tapped', () => {
    const { svg } = renderScene();
    const radio = svg.querySelector('[data-device="radio"]');
    if (!radio) throw new Error('no radio');
    fireEvent.click(radio);
    expect(screen.getByRole('button', { name: 'Radio' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('says what each device does and over which link', () => {
    renderScene();
    for (const device of INTRO.scene.devices) {
      expect(screen.getByText(device.role)).toBeInTheDocument();
    }
    expect(screen.getAllByText(/ExpressLRS · 2.4 GHz/).length).toBeGreaterThan(0);
  });
});
