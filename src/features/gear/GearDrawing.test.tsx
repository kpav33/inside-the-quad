import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { GEAR } from '@/content/gear';
import { GEAR_IDS } from '@/shared/domain/gear';

import { GearDrawing } from './GearDrawing';
import { type GearState, initialGearState } from './gear-state';

function draw(state: GearState, highlight: string | null = null) {
  const onHighlight = vi.fn();
  const { container } = render(
    <GearDrawing state={state} highlight={highlight} onHighlight={onHighlight} />,
  );
  const part = (id: string) => container.querySelector<SVGGElement>(`[data-part="${id}"]`);
  return { container, onHighlight, part };
}

describe('GearDrawing', () => {
  it.each(GEAR_IDS)('names every part of the %s, hidden from assistive technology', (id) => {
    const { container, part } = draw(initialGearState(id));
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    for (const { id: partId, label } of GEAR[id].parts) {
      expect(part(partId)).toHaveTextContent(label);
    }
  });

  it('marks the highlighted part, and only that one', () => {
    const { part } = draw(initialGearState('radio'), 'arm-switch');
    expect(part('arm-switch')).toHaveAttribute('data-highlight', 'true');
    expect(part('screen')).toHaveAttribute('data-highlight', 'false');
  });

  it('highlights a part under the mouse or on a tap, and clears it when the mouse leaves', () => {
    const { part, onHighlight } = draw(initialGearState('goggles'));
    const strap = part('strap');
    if (!strap) throw new Error('no strap');
    fireEvent.mouseEnter(strap);
    expect(onHighlight).toHaveBeenLastCalledWith('strap');
    fireEvent.mouseLeave(strap);
    expect(onHighlight).toHaveBeenLastCalledWith(null);
    fireEvent.click(strap);
    expect(onHighlight).toHaveBeenLastCalledWith('strap');
  });

  it('moves the radio’s switch levers with the state', () => {
    const lever = (state: GearState, part: string) =>
      draw(state).container.querySelector(`[data-part="${part}"] [data-position]`);
    expect(lever({ gear: 'radio', armed: false, mode: 'acro' }, 'arm-switch')).toHaveAttribute(
      'data-position',
      'disarmed',
    );
    expect(lever({ gear: 'radio', armed: true, mode: 'angle' }, 'arm-switch')).toHaveAttribute(
      'data-position',
      'armed',
    );
    expect(lever({ gear: 'radio', armed: true, mode: 'angle' }, 'mode-switch')).toHaveAttribute(
      'data-position',
      'angle',
    );
  });

  it('shows a picture in analog goggles, and no signal in digital ones', () => {
    const analog = draw({ gear: 'goggles', system: 'analog' }).part('screens');
    expect(analog?.querySelector('[data-picture]')).not.toBeNull();
    expect(analog).not.toHaveTextContent(/no signal/i);
    const digital = draw({ gear: 'goggles', system: 'digital' }).part('screens');
    expect(digital?.querySelector('[data-picture]')).toBeNull();
    expect(digital).toHaveTextContent(/no signal/i);
  });

  it('draws six cells at the charger’s voltage', () => {
    const cells = (state: GearState) =>
      [...draw(state).container.querySelectorAll('[data-volts]')].map((cell) =>
        cell.getAttribute('data-volts'),
      );
    expect(cells({ gear: 'charger', mode: 'charge' })).toEqual(Array(6).fill('4.2'));
    expect(cells({ gear: 'charger', mode: 'storage' })).toEqual(Array(6).fill('3.8'));
  });
});
