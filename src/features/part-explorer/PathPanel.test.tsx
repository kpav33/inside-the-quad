import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { PATHS } from '@/content/paths';
import type { PathId } from '@/shared/domain/paths';

import { PathPanel } from './PathPanel';

function renderPath(path: PathId, step = 0, playing = false) {
  const props = {
    onStep: vi.fn(),
    onPlay: vi.fn(),
    onStop: vi.fn(),
    onClose: vi.fn(),
    onToggleRead: vi.fn(),
  };
  const view = render(
    <PathPanel path={PATHS[path]} step={step} playing={playing} read={false} {...props} />,
  );
  return { ...props, ...view };
}

const stops = () => within(screen.getByRole('list', { name: 'Stops' })).getAllByRole('listitem');

describe('PathPanel', () => {
  it('names the path and numbers its sheet out of 14', () => {
    renderPath('power');
    expect(screen.getByRole('heading', { level: 2, name: 'Power path' })).toBeInTheDocument();
    const block = screen.getByRole('group', { name: 'Title block' });
    expect(block).toHaveTextContent('13 of 14');
    expect(block).toHaveTextContent('Stops6');
  });

  it('lists the stops in order and marks the current one', () => {
    renderPath('control', 2);
    expect(stops()).toHaveLength(6);
    expect(stops()[2]).toHaveAttribute('aria-current', 'step');
    expect(stops()[0]).not.toHaveAttribute('aria-current');
  });

  it('links each stop to its lesson, and the radio to the intro', () => {
    renderPath('control');
    expect(screen.getByRole('link', { name: 'Your radio' })).toHaveAttribute('href', '/intro');
    expect(screen.getByRole('link', { name: 'Flight controller' })).toHaveAttribute(
      'href',
      '/parts/fc',
    );
  });

  it('links every part of a stop with several parts', () => {
    renderPath('power');
    const last = stops()[5];
    if (!last) throw new Error('no stop 6');
    for (const [name, href] of [
      ['Receiver', '/parts/receiver'],
      ['Camera', '/parts/camera'],
      ['VTX', '/parts/vtx'],
    ] as const) {
      expect(within(last).getByRole('link', { name })).toHaveAttribute('href', href);
    }
  });

  it('steps forward and back', async () => {
    const { onStep } = renderPath('video', 2);
    await userEvent.click(screen.getByRole('button', { name: 'Next step' }));
    expect(onStep).toHaveBeenLastCalledWith(3);
    await userEvent.click(screen.getByRole('button', { name: 'Previous step' }));
    expect(onStep).toHaveBeenLastCalledWith(1);
  });

  it('cannot step past either end', () => {
    renderPath('video', 0);
    expect(screen.getByRole('button', { name: 'Previous step' })).toBeDisabled();
  });

  it('announces the current stop', () => {
    renderPath('video', 1);
    expect(screen.getByTestId('path-announcer')).toHaveTextContent(
      /^Stop 2 of 5: Flight controller\./,
    );
  });

  it('plays the path, and offers to stop while it plays', async () => {
    const { onPlay, unmount } = renderPath('control');
    await userEvent.click(screen.getByRole('button', { name: 'Play the path' }));
    expect(onPlay).toHaveBeenCalledOnce();
    unmount();
    const { onStop } = renderPath('control', 1, true);
    await userEvent.click(screen.getByRole('button', { name: 'Stop' }));
    expect(onStop).toHaveBeenCalledOnce();
  });

  it('switches between the three paths, marking the open one', () => {
    renderPath('video');
    const nav = screen.getByRole('navigation', { name: 'Paths' });
    const links = within(nav).getAllByRole('link');
    expect(links.map((link) => link.textContent)).toEqual(['Control', 'Power', 'Video']);
    expect(within(nav).getByRole('link', { name: 'Video' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(within(nav).getByRole('link', { name: 'Control' })).toHaveAttribute(
      'href',
      '/paths/control',
    );
  });

  it('ends the set: the video path leads back to the overview', () => {
    renderPath('video');
    expect(screen.getByRole('link', { name: 'Next: Back to overview' })).toHaveAttribute(
      'href',
      '/',
    );
  });
});
