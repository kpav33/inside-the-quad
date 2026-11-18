import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { createFlight, type Flight } from '@/features/flight';

import { WhatIfPanel } from './WhatIfPanel';

function renderWhatIf(step = 0, flight: Flight | null = createFlight()) {
  const props = { onStep: vi.fn(), onClose: vi.fn(), onToggleRead: vi.fn() };
  render(<WhatIfPanel flight={flight} step={step} read={false} {...props} />);
  return { ...props, flight };
}

const steps = () => within(screen.getByRole('list', { name: 'Mistakes' })).getAllByRole('listitem');

describe('WhatIfPanel', () => {
  it('lists the four mistakes, the current one marked', () => {
    renderWhatIf(1);
    expect(screen.getByRole('heading', { level: 2, name: 'What if' })).toBeInTheDocument();
    expect(steps().map((item) => within(item).getAllByRole('button')[0]?.textContent)).toEqual([
      'Link lost: failsafe',
      'Prop on backwards',
      'Wrong battery',
      'VTX without antenna',
    ]);
    expect(steps()[1]).toHaveAttribute('aria-current', 'step');
  });

  it('is sheet 5 of 5, listed in the switcher', () => {
    renderWhatIf();
    expect(screen.getByRole('group', { name: 'Title block' })).toHaveTextContent('Sheet5 of 5');
    const nav = screen.getByRole('navigation', { name: 'How it works together' });
    expect(within(nav).getByRole('link', { name: 'What if' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('says what happens, why, and how to avoid it', () => {
    renderWhatIf(0);
    const current = steps()[0];
    if (!current) throw new Error('no step');
    expect(within(current).getByText('What happens')).toBeInTheDocument();
    expect(within(current).getByText('Why')).toBeInTheDocument();
    expect(within(current).getByText('How to avoid it')).toBeInTheDocument();
  });

  it('acts out the current mistake with Try it, and Reset undoes it', async () => {
    const { flight } = renderWhatIf(0);
    if (!flight) throw new Error('no flight');
    await userEvent.click(screen.getByRole('button', { name: 'Try it' }));
    expect(flight.faults.linkLost).toBe(true);
    await userEvent.click(screen.getByRole('button', { name: 'Reset' }));
    expect(flight.faults.linkLost).toBe(false);
  });

  it('switches the battery on the battery step, in place of Try it', async () => {
    const { flight } = renderWhatIf(2);
    if (!flight) throw new Error('no flight');
    expect(screen.queryByRole('button', { name: 'Try it' })).toBeNull();
    const four = screen.getByRole('button', { name: '4S' });
    expect(screen.getByRole('button', { name: '6S' })).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(four);
    expect(flight.faults.cells).toBe(4);
    expect(four).toHaveAttribute('aria-pressed', 'true');
    act(() => {
      flight.reset();
    });
    expect(screen.getByRole('button', { name: '6S' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('tells the current step how to see its mistake, until it is on', async () => {
    const { flight } = renderWhatIf(0);
    if (!flight) throw new Error('no flight');
    const hint = () =>
      within(steps()[0] ?? document.body).queryByText('Press Try it to see it happen.');
    expect(hint()).toBeInTheDocument();
    expect(within(steps()[1] ?? document.body).queryByText(/Press Try it/)).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'Try it' }));
    expect(hint()).toBeNull();
    act(() => {
      flight.reset();
    });
    expect(hint()).toBeInTheDocument();
  });

  it('on the battery step, says to switch to 4S, until it is switched', async () => {
    const { flight } = renderWhatIf(2);
    if (!flight) throw new Error('no flight');
    const hint = () =>
      within(steps()[2] ?? document.body).queryByText('Switch to 4S to feel the difference.');
    expect(hint()).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: '4S' }));
    expect(hint()).toBeNull();
  });

  it('steps with Next, Previous and a mistake’s name', async () => {
    const { onStep } = renderWhatIf(1);
    await userEvent.click(screen.getByRole('button', { name: 'Next step' }));
    expect(onStep).toHaveBeenLastCalledWith(2);
    await userEvent.click(screen.getByRole('button', { name: 'VTX without antenna' }));
    expect(onStep).toHaveBeenLastCalledWith(3);
  });

  it('runs on from How a quad moves into the gear', () => {
    renderWhatIf();
    expect(
      screen.getByRole('link', { name: 'Previous: How a quad moves · sheet 4' }),
    ).toHaveAttribute('href', '/moves');
    expect(
      screen.getByRole('link', {
        name: 'End of How it works together: The gear you hold and wear, sheet 1: Radio',
      }),
    ).toHaveAttribute('href', '/gear/radio');
  });
});
