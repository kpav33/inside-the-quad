import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { createFlight } from './store';
import { Sticks } from './Sticks';

function setup() {
  const flight = createFlight();
  const user = vi.fn();
  flight.onUserInput(user);
  render(<Sticks flight={flight} />);
  return { flight, user };
}

/** A 100 × 100 pad at the page's origin. */
function sizePad(side: 'left' | 'right') {
  const pad = document.querySelector<HTMLElement>(`.stick-pad[data-side="${side}"]`);
  if (!pad) throw new Error('no pad');
  pad.getBoundingClientRect = () =>
    ({ left: 0, top: 0, width: 100, height: 100, right: 100, bottom: 100 }) as DOMRect;
  return pad;
}

describe('Sticks', () => {
  it('offers each axis as a named slider', () => {
    setup();
    for (const name of ['Throttle', 'Yaw', 'Pitch', 'Roll']) {
      expect(screen.getByRole('slider', { name })).toBeInTheDocument();
    }
    expect(screen.getByRole('slider', { name: 'Throttle' })).toHaveAttribute(
      'aria-valuetext',
      'Throttle 50 %',
    );
    expect(screen.getByRole('slider', { name: 'Roll' })).toHaveAttribute(
      'aria-valuetext',
      'Roll centred',
    );
  });

  it('moves a stick from the keyboard and springs back when the key is let go', () => {
    const { flight, user } = setup();
    const roll = screen.getByRole('slider', { name: 'Roll' });
    fireEvent.change(roll, { target: { value: '40' } });
    expect(flight.sticks.roll).toBeCloseTo(0.4);
    expect(roll).toHaveAttribute('aria-valuetext', 'Roll 40 % right');
    expect(user).toHaveBeenCalled();
    fireEvent.keyUp(roll, { key: 'ArrowRight' });
    expect(flight.sticks.roll).toBe(0);
  });

  it('springs back when focus leaves a deflected stick', () => {
    const { flight } = setup();
    const yaw = screen.getByRole('slider', { name: 'Yaw' });
    fireEvent.change(yaw, { target: { value: '-60' } });
    expect(yaw).toHaveAttribute('aria-valuetext', 'Yaw 60 % left');
    fireEvent.blur(yaw);
    expect(flight.sticks.yaw).toBe(0);
  });

  it('leaves the throttle where it is put', () => {
    const { flight } = setup();
    const throttle = screen.getByRole('slider', { name: 'Throttle' });
    fireEvent.change(throttle, { target: { value: '80' } });
    fireEvent.keyUp(throttle, { key: 'ArrowUp' });
    fireEvent.blur(throttle);
    expect(flight.sticks.throttle).toBeCloseTo(0.8);
  });

  it('follows a drag on the pad and springs back on release', () => {
    const { flight } = setup();
    const pad = sizePad('right');
    fireEvent.pointerDown(pad, { pointerId: 1, clientX: 100, clientY: 0 });
    expect(flight.sticks.roll).toBe(1);
    expect(flight.sticks.pitch).toBe(1);
    fireEvent.pointerMove(pad, { pointerId: 1, clientX: 25, clientY: 50 });
    expect(flight.sticks.roll).toBeCloseTo(-0.5);
    expect(flight.sticks.pitch).toBeCloseTo(0);
    fireEvent.pointerUp(pad, { pointerId: 1 });
    expect(flight.sticks.roll).toBe(0);
  });

  it.each(['pointerCancel', 'lostPointerCapture'] as const)(
    'springs back when the drag ends with %s',
    (event) => {
      const { flight } = setup();
      const pad = sizePad('right');
      fireEvent.pointerDown(pad, { pointerId: 1, clientX: 90, clientY: 50 });
      expect(flight.sticks.roll).toBeGreaterThan(0);
      fireEvent[event](pad, { pointerId: 1 });
      expect(flight.sticks.roll).toBe(0);
    },
  );

  it('sets throttle from the left pad’s height and keeps it after release', () => {
    const { flight } = setup();
    const pad = sizePad('left');
    fireEvent.pointerDown(pad, { pointerId: 2, clientX: 50, clientY: 10 });
    expect(flight.sticks.throttle).toBeCloseTo(0.9);
    fireEvent.pointerUp(pad, { pointerId: 2 });
    expect(flight.sticks.throttle).toBeCloseTo(0.9);
    expect(flight.sticks.yaw).toBe(0);
  });

  it('ignores a move with no drag in progress', () => {
    const { flight } = setup();
    const pad = sizePad('right');
    fireEvent.pointerMove(pad, { pointerId: 1, clientX: 100, clientY: 50 });
    expect(flight.sticks.roll).toBe(0);
  });
});
