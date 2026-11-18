import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

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
  it('names its chapter, numbers its sheet within it, and says what the path is about', () => {
    renderPath('control');
    expect(screen.getByRole('heading', { level: 2, name: 'Control path' })).toBeInTheDocument();
    const block = screen.getByRole('group', { name: 'Title block' });
    expect(block).toHaveTextContent('ChapterHow it works together');
    expect(block).toHaveTextContent('Sheet1 of 5');
    expect(block).toHaveTextContent('FromYour radio');
    expect(block).toHaveTextContent('ToPropellers');
    expect(block).toHaveTextContent('CarriesStick commands');
    expect(block).not.toHaveTextContent('Stops');
  });

  it('leads back across the chapter break from the first path', () => {
    renderPath('control');
    expect(
      screen.getByRole('link', { name: 'Back to the parts: Extras · sheet 11' }),
    ).toHaveAttribute('href', '/parts/extras');
  });

  it('refers to the next path by its sheet in the chapter', () => {
    renderPath('control');
    expect(screen.getByRole('link', { name: 'Next: Power path · sheet 2' })).toHaveAttribute(
      'href',
      '/paths/power',
    );
  });

  it('lists the stops in order and marks the current one', () => {
    renderPath('control', 2);
    expect(stops()).toHaveLength(6);
    expect(stops()[2]).toHaveAttribute('aria-current', 'step');
    expect(stops()[0]).not.toHaveAttribute('aria-current');
  });

  it('makes a stop current when its name is clicked, without leaving the path', async () => {
    const { onStep } = renderPath('control');
    await userEvent.click(screen.getByRole('button', { name: 'Receiver' }));
    expect(onStep).toHaveBeenLastCalledWith(1);
    expect(screen.queryByRole('link', { name: 'Receiver' })).toHaveAttribute(
      'href',
      '/parts/receiver',
    );
  });

  it('keeps each lesson one quieter link away, and the radio on its gear sheet', () => {
    renderPath('control');
    const fc = stops()[2];
    if (!fc) throw new Error('no stop 3');
    expect(within(fc).getByText(/^Lesson:/)).toBeInTheDocument();
    expect(within(fc).getByRole('link', { name: 'Flight controller' })).toHaveAttribute(
      'href',
      '/parts/fc',
    );
    const radio = stops()[0];
    if (!radio) throw new Error('no stop 1');
    expect(within(radio).getByRole('link', { name: 'Radio' })).toHaveAttribute(
      'href',
      '/gear/radio',
    );
  });

  it('ends the video path at the goggles’ gear sheet', () => {
    renderPath('video');
    const goggles = stops().at(-1);
    if (!goggles) throw new Error('no last stop');
    expect(within(goggles).getByRole('link', { name: 'Goggles' })).toHaveAttribute(
      'href',
      '/gear/goggles',
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

  it('switches between every sheet of the chapter, marking the open one', () => {
    renderPath('video');
    const nav = screen.getByRole('navigation', { name: 'How it works together' });
    const links = within(nav).getAllByRole('link');
    expect(links.map((link) => link.textContent)).toEqual([
      'Control',
      'Power',
      'Video',
      'How a quad moves',
      'What if',
    ]);
    expect(within(nav).getByRole('link', { name: 'How a quad moves' })).toHaveAttribute(
      'href',
      '/moves',
    );
    expect(within(nav).getByRole('link', { name: 'Video' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(within(nav).getByRole('link', { name: 'Control' })).toHaveAttribute(
      'href',
      '/paths/control',
    );
  });

  it('runs on from the video path to how a quad moves', () => {
    renderPath('video');
    expect(screen.getByRole('link', { name: 'Next: How a quad moves · sheet 4' })).toHaveAttribute(
      'href',
      '/moves',
    );
  });

  describe('bringing the current stop into view', () => {
    afterEach(() => {
      vi.unstubAllGlobals();
      vi.restoreAllMocks();
    });

    const panel = (step: number) => (
      <PathPanel
        path={PATHS.control}
        step={step}
        playing={false}
        read={false}
        onStep={vi.fn()}
        onPlay={vi.fn()}
        onStop={vi.fn()}
        onClose={vi.fn()}
        onToggleRead={vi.fn()}
      />
    );

    it('scrolls the new stop into view when the step changes, not when the sheet opens', () => {
      const scroll = vi.fn();
      Element.prototype.scrollIntoView = scroll;
      const { rerender } = render(panel(0));
      expect(scroll).not.toHaveBeenCalled();
      rerender(panel(3));
      expect(scroll).toHaveBeenCalledOnce();
      expect(scroll.mock.contexts[0]).toBe(stops()[3]);
      expect(scroll).toHaveBeenCalledWith({ block: 'nearest', behavior: 'smooth' });
    });

    it('jumps instead of gliding when motion is reduced', () => {
      vi.stubGlobal(
        'matchMedia',
        vi.fn(() => ({
          matches: true,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        })),
      );
      const scroll = vi.fn();
      Element.prototype.scrollIntoView = scroll;
      const { rerender } = render(panel(0));
      rerender(panel(1));
      expect(scroll).toHaveBeenCalledWith({ block: 'nearest', behavior: 'auto' });
    });
  });
});
