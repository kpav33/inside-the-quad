import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { createFlight, type Flight } from '@/features/flight';

import { MovesPanel } from './MovesPanel';

function renderMoves(step = 0, flight: Flight | null = createFlight()) {
  const props = {
    onStep: vi.fn(),
    onShowMe: vi.fn(),
    onClose: vi.fn(),
    onToggleRead: vi.fn(),
  };
  const view = render(<MovesPanel flight={flight} step={step} read={false} {...props} />);
  return { ...props, ...view, flight };
}

const steps = () => within(screen.getByRole('list', { name: 'Steps' })).getAllByRole('listitem');

describe('MovesPanel', () => {
  it('lists the five steps in order, the current one marked', () => {
    renderMoves(1);
    expect(screen.getByRole('heading', { level: 2, name: 'How a quad moves' })).toBeInTheDocument();
    const items = steps();
    expect(items.map((item) => within(item).getByRole('button').textContent)).toEqual([
      'Throttle: up and down',
      'Roll: tilt sideways',
      'Pitch: tip forward and back',
      'Yaw: turn on the spot',
      'Gyro loop: staying where you put it',
    ]);
    expect(items[1]).toHaveAttribute('aria-current', 'step');
  });

  it('names its chapter and sheet, and says how it flies', () => {
    renderMoves();
    const block = screen.getByRole('group', { name: 'Title block' });
    expect(block).toHaveTextContent('ChapterHow it works together');
    expect(block).toHaveTextContent('Sheet4 of 5');
    expect(block).toHaveTextContent('ModeAcro');
  });

  it('steps with Next, Previous and a step’s name', async () => {
    const { onStep } = renderMoves(2);
    await userEvent.click(screen.getByRole('button', { name: 'Next step' }));
    expect(onStep).toHaveBeenLastCalledWith(3);
    await userEvent.click(screen.getByRole('button', { name: 'Previous step' }));
    expect(onStep).toHaveBeenLastCalledWith(1);
    await userEvent.click(screen.getByRole('button', { name: 'Yaw: turn on the spot' }));
    expect(onStep).toHaveBeenLastCalledWith(3);
  });

  it('shows the step again, knocks the drone and levels it', async () => {
    const { onShowMe, flight } = renderMoves();
    if (!flight) throw new Error('no flight');
    await userEvent.click(screen.getByRole('button', { name: 'Show me' }));
    expect(onShowMe).toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Gust' }));
    expect(flight.state.rate.roll).not.toBe(0);
    await userEvent.click(screen.getByRole('button', { name: 'Level' }));
    expect(flight.state.rate.roll).toBe(0);
  });

  it('shows what the flight controller compares on the gyro loop step', () => {
    const flight = createFlight();
    renderMoves(4, flight);
    const table = screen.getByRole('table', { name: 'What the flight controller compares' });
    expect(within(table).getByRole('columnheader', { name: 'You ask for' })).toBeInTheDocument();
    expect(within(table).getByRole('columnheader', { name: 'Gyro measures' })).toBeInTheDocument();
    expect(within(table).getByRole('rowheader', { name: 'Roll' })).toBeInTheDocument();
    act(() => {
      flight.setSticks({ roll: 1 }, 'user');
    });
  });

  it('keeps the comparison off the other steps', () => {
    renderMoves(1);
    expect(screen.queryByRole('table')).toBeNull();
  });

  it('announces the current step', () => {
    renderMoves(3);
    expect(screen.getByTestId('moves-announcer')).toHaveTextContent(
      /^Step 4 of 5: Yaw: turn on the spot\./,
    );
  });

  it('runs on from the video path to what if', () => {
    renderMoves();
    expect(screen.getByRole('link', { name: 'Previous: Video path · sheet 3' })).toHaveAttribute(
      'href',
      '/paths/video',
    );
    expect(screen.getByRole('link', { name: 'Next: What if · sheet 5' })).toHaveAttribute(
      'href',
      '/what-if',
    );
  });

  it('offers the whole chapter in its switcher, itself marked open', () => {
    renderMoves();
    const nav = screen.getByRole('navigation', { name: 'How it works together' });
    expect(within(nav).getAllByRole('link')).toHaveLength(5);
    expect(within(nav).getByRole('link', { name: 'How a quad moves' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(within(nav).getByRole('link', { name: 'Control' })).toHaveAttribute(
      'href',
      '/paths/control',
    );
  });
});
