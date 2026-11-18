import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { chargerSays, gogglesSays, radioSays } from '@/content/gear';
import { type GearState, initialGearState } from '@/features/gear';
import type { GearId } from '@/shared/domain/gear';

import { GearPanel } from './GearPanel';

function renderGear(gear: GearId, state: GearState = initialGearState(gear)) {
  const props = {
    onChange: vi.fn(),
    onHighlight: vi.fn(),
    onClose: vi.fn(),
    onToggleRead: vi.fn(),
  };
  render(<GearPanel gear={gear} state={state} highlight={null} read={false} {...props} />);
  return props;
}

describe('GearPanel', () => {
  it('is sheet 1 of 3 of the gear, with the chapter switcher and the four questions', () => {
    renderGear('radio');
    expect(screen.getByRole('heading', { level: 2, name: 'Radio' })).toBeInTheDocument();
    const block = screen.getByRole('group', { name: 'Title block' });
    expect(block).toHaveTextContent('ChapterThe gear you hold and wear');
    expect(block).toHaveTextContent('Sheet1 of 3');
    const nav = screen.getByRole('navigation', { name: 'The gear you hold and wear' });
    expect(
      within(nav)
        .getAllByRole('link')
        .map((link) => link.textContent),
    ).toEqual(['Radio', 'Goggles', 'Charger']);
    expect(within(nav).getByRole('link', { name: 'Radio' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    for (const question of [
      'What does it do?',
      'How does it work?',
      'What do the numbers mean?',
      'What is it connected to?',
    ]) {
      expect(screen.getByRole('heading', { level: 3, name: question })).toBeInTheDocument();
    }
    expect(screen.getByRole('link', { name: /Receiver/ })).toHaveAttribute(
      'href',
      '/parts/receiver',
    );
  });

  it('arms the radio and says what the drone would do', async () => {
    const { onChange } = renderGear('radio');
    expect(screen.getByRole('button', { name: 'Disarmed' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByTestId('gear-says')).toHaveTextContent(radioSays(false, 'acro'));
    await userEvent.click(screen.getByRole('button', { name: 'Armed' }));
    expect(onChange).toHaveBeenLastCalledWith({ gear: 'radio', armed: true, mode: 'acro' });
    await userEvent.click(screen.getByRole('button', { name: 'Angle' }));
    expect(onChange).toHaveBeenLastCalledWith({ gear: 'radio', armed: false, mode: 'angle' });
  });

  it('says what an armed radio in angle mode does', () => {
    renderGear('radio', { gear: 'radio', armed: true, mode: 'angle' });
    expect(screen.getByTestId('gear-says')).toHaveTextContent(radioSays(true, 'angle'));
    expect(screen.getByTestId('gear-says')).toHaveAttribute('aria-live', 'polite');
  });

  it('switches the goggles to digital', async () => {
    const { onChange } = renderGear('goggles');
    await userEvent.click(screen.getByRole('button', { name: 'Digital' }));
    expect(onChange).toHaveBeenLastCalledWith({ gear: 'goggles', system: 'digital' });
  });

  it('says what digital goggles show', () => {
    renderGear('goggles', { gear: 'goggles', system: 'digital' });
    expect(screen.getByTestId('gear-says')).toHaveTextContent(gogglesSays('digital'));
  });

  it('puts the charger into storage', async () => {
    const { onChange } = renderGear('charger');
    await userEvent.click(screen.getByRole('button', { name: 'Storage' }));
    expect(onChange).toHaveBeenLastCalledWith({ gear: 'charger', mode: 'storage' });
  });

  it('says what storage does', () => {
    renderGear('charger', { gear: 'charger', mode: 'storage' });
    expect(screen.getByTestId('gear-says').textContent).toBe(chargerSays('storage'));
  });

  it('highlights a part on the drawing while its name has focus or the mouse', () => {
    const { onHighlight } = renderGear('radio');
    const name = screen.getByRole('button', { name: 'Arm switch' });
    fireEvent.focus(name);
    expect(onHighlight).toHaveBeenLastCalledWith('arm-switch');
    fireEvent.blur(name);
    expect(onHighlight).toHaveBeenLastCalledWith(null);
    fireEvent.mouseEnter(name);
    expect(onHighlight).toHaveBeenLastCalledWith('arm-switch');
    fireEvent.mouseLeave(name);
    expect(onHighlight).toHaveBeenLastCalledWith(null);
  });

  it('shows a real, credited photo of the gear as one example', () => {
    renderGear('charger');
    const figure = screen.getByRole('figure');
    expect(figure).toHaveTextContent('Real gear');
    expect(within(figure).getByRole('img')).toHaveAccessibleName(/charger/i);
    expect(figure).toHaveTextContent(/One example: /);
    expect(within(figure).getByRole('link', { name: /CC BY-SA 3.0/ })).toBeInTheDocument();
  });
});
