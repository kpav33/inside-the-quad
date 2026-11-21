import type { ThreeEvent } from '@react-three/fiber';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { DroneViewerProps } from '@/features/drone-viewer/DroneViewer';
import type { Flight } from '@/features/flight';

import { PART_IDS } from '@/shared/domain/parts';
import { NUMBERED_SHEETS } from '@/shared/domain/sheets';
import { PartLink } from '@/shared/routing';

import { OVERVIEW_FOCUS_ID, partButtonId } from './ids';
import { PartExplorer } from './PartExplorer';
import { PLAY_INTERVAL_MS } from './usePathStep';

// WebGL is unavailable in jsdom: the viewer is replaced by buttons that call its props.
const viewer = vi.hoisted(() => ({
  shouldThrow: false,
  flight: null as Flight | null,
}));

vi.mock('@/features/drone-viewer/DroneViewer', () => ({
  default: function DroneViewerStub({
    onPartClick,
    onBackgroundClick,
    onPartHover,
    openParts,
    exploded,
    turnTo,
    leader,
    flight,
  }: DroneViewerProps) {
    if (viewer.shouldThrow) throw new Error('WebGL unavailable');
    viewer.flight = flight ?? null;
    const click = (delta: number) => {
      onPartClick('motors', { delta } as ThreeEvent<MouseEvent>);
    };
    return (
      <div>
        <button
          type="button"
          onClick={() => {
            click(0);
          }}
        >
          stub: click motors
        </button>
        <button
          type="button"
          onClick={() => {
            click(30);
          }}
        >
          stub: drag ending on motors
        </button>
        <p data-testid="viewer-state">
          {JSON.stringify({
            open: [...openParts],
            exploded,
            turnTo,
            step: leader?.step ?? null,
            flying: Boolean(flight),
          })}
        </p>
        <button type="button" onClick={onBackgroundClick}>
          stub: background
        </button>
        <button
          type="button"
          onClick={() => {
            onPartHover('motors');
          }}
        >
          stub: hover motors
        </button>
        <button
          type="button"
          onClick={() => {
            onPartHover(null);
          }}
        >
          stub: hover nothing
        </button>
      </div>
    );
  },
}));

const READ_KEY = 'inside-the-quad.read-parts.v1';
const INTRO_KEY = 'inside-the-quad.intro-read.v1';
const introHeading = () =>
  screen.queryByRole('heading', { level: 2, name: 'What is an FPV drone?' });

const lessonHeading = (name: string) => screen.queryByRole('heading', { level: 2, name });

const viewerState = () =>
  JSON.parse(screen.getByTestId('viewer-state').textContent) as {
    open: string[];
    exploded: boolean;
    turnTo: string | null;
    step: number | null;
    flying: boolean;
  };

async function renderExplorer() {
  render(<PartExplorer />);
  await screen.findByRole('button', { name: 'stub: click motors' });
}

describe('PartExplorer', () => {
  afterEach(() => {
    viewer.shouldThrow = false;
    viewer.flight = null;
    window.localStorage.clear();
    vi.unstubAllGlobals();
  });

  describe('the gear sheets', () => {
    it('opens the radio with its flat drawing, never the 3D view', async () => {
      window.history.replaceState(null, '', '/gear/radio');
      render(<PartExplorer />);
      await screen.findByRole('heading', { level: 2, name: 'Radio' });
      expect(document.querySelector('.gear-drawing')).toHaveAttribute('data-gear', 'radio');
      expect(screen.queryByTestId('viewer-state')).toBeNull();
      expect(screen.queryByText('Loading the 3D drawing…')).toBeNull();
    });

    it('starts the radio afresh after another gear sheet', async () => {
      window.history.replaceState(null, '', '/gear/radio');
      render(<PartExplorer />);
      await userEvent.click(await screen.findByRole('button', { name: 'Armed' }));
      const gearNav = () => screen.getByRole('navigation', { name: 'The gear you hold and wear' });
      await userEvent.click(within(gearNav()).getByRole('link', { name: 'Goggles' }));
      expect(screen.getByRole('heading', { level: 2, name: 'Goggles' })).toHaveFocus();
      await userEvent.click(within(gearNav()).getByRole('link', { name: 'Radio' }));
      expect(screen.getByRole('button', { name: 'Disarmed' })).toHaveAttribute(
        'aria-pressed',
        'true',
      );
    });
  });

  describe('the what-if sheet', () => {
    it('opens at the mistake in the address, flying, with the status line', async () => {
      window.history.replaceState(null, '', '/what-if/2');
      await renderExplorer();
      expect(lessonHeading('What if')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Prop on backwards' }).closest('li'),
      ).toHaveAttribute('aria-current', 'step');
      expect(viewerState()).toMatchObject({ open: [], exploded: false, flying: true });
      expect(screen.getByTestId('flight-status')).toHaveTextContent('Link OK · 6S');
      expect(screen.getByRole('slider', { name: 'Roll' })).toBeInTheDocument();
    });

    it('never carries a mistake over to the moves sheet', async () => {
      window.history.replaceState(null, '', '/what-if/3');
      await renderExplorer();
      await userEvent.click(screen.getByRole('button', { name: '4S' }));
      expect(viewer.flight?.faults.cells).toBe(4);
      await userEvent.click(
        within(screen.getByRole('navigation', { name: 'How it works together' })).getByRole(
          'link',
          { name: 'How a quad moves' },
        ),
      );
      expect(lessonHeading('How a quad moves')).toBeInTheDocument();
      expect(viewer.flight?.faults.cells).toBe(6);
    });

    it('does nothing when the drawing is clicked', async () => {
      window.history.replaceState(null, '', '/what-if');
      await renderExplorer();
      await userEvent.click(screen.getByRole('button', { name: 'stub: click motors' }));
      expect(window.location.pathname).toBe('/what-if');
    });

    it('still lists the mistakes, without sticks or status, when the 3D view fails', async () => {
      viewer.shouldThrow = true;
      vi.spyOn(console, 'error').mockImplementation(() => undefined);
      window.history.replaceState(null, '', '/what-if');
      render(<PartExplorer />);
      expect(
        await screen.findByRole('button', { name: 'VTX without antenna' }),
      ).toBeInTheDocument();
      expect(screen.queryByRole('slider', { name: 'Roll' })).toBeNull();
      expect(screen.queryByTestId('flight-status')).toBeNull();
    });
  });

  describe('the moves sheet', () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    it('opens at the step in the address, with the drone flying', async () => {
      window.history.replaceState(null, '', '/moves/2');
      await renderExplorer();
      expect(lessonHeading('How a quad moves')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Roll: tilt sideways' }).closest('li'),
      ).toHaveAttribute('aria-current', 'step');
      expect(viewerState()).toMatchObject({
        open: [],
        exploded: false,
        turnTo: null,
        flying: true,
      });
      expect(screen.getByRole('slider', { name: 'Roll' })).toBeInTheDocument();
    });

    it('replaces a step past the end with the last one', async () => {
      window.history.replaceState(null, '', '/moves/9');
      await renderExplorer();
      expect(window.location.pathname).toBe('/moves/5');
    });

    it('moves the address with the steps', async () => {
      window.history.replaceState(null, '', '/moves');
      await renderExplorer();
      await userEvent.click(screen.getByRole('button', { name: 'Next step' }));
      expect(window.location.pathname).toBe('/moves/2');
    });

    it('plays a step’s demo when it opens', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      window.history.replaceState(null, '', '/moves/2');
      await renderExplorer();
      act(() => {
        vi.advanceTimersByTime(10);
      });
      expect(viewer.flight?.sticks.roll).toBe(1);
    });

    it('waits for Show me when motion is reduced', async () => {
      vi.stubGlobal(
        'matchMedia',
        vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
      );
      vi.useFakeTimers({ shouldAdvanceTime: true });
      window.history.replaceState(null, '', '/moves/2');
      await renderExplorer();
      act(() => {
        vi.advanceTimersByTime(10);
      });
      expect(viewer.flight?.sticks.roll).toBe(0);
      await userEvent.click(screen.getByRole('button', { name: 'Show me' }));
      act(() => {
        vi.advanceTimersByTime(10);
      });
      expect(viewer.flight?.sticks.roll).toBe(1);
    });

    it('does nothing when the drawing is clicked', async () => {
      window.history.replaceState(null, '', '/moves');
      await renderExplorer();
      await userEvent.click(screen.getByRole('button', { name: 'stub: click motors' }));
      expect(window.location.pathname).toBe('/moves');
      expect(lessonHeading('How a quad moves')).toBeInTheDocument();
    });

    it('still lists the steps, without sticks, when the 3D view fails', async () => {
      viewer.shouldThrow = true;
      vi.spyOn(console, 'error').mockImplementation(() => undefined);
      window.history.replaceState(null, '', '/moves');
      render(<PartExplorer />);
      expect(
        await screen.findByRole('button', { name: 'Yaw: turn on the spot' }),
      ).toBeInTheDocument();
      expect(screen.queryByRole('slider', { name: 'Roll' })).toBeNull();
    });
  });

  it('starts on the overview sheet and invites the user to pick a part', async () => {
    await renderExplorer();
    expect(screen.queryByRole('region')).toBeNull();
    expect(screen.getByText(/select a part/i)).toBeInTheDocument();
    const block = screen.getByRole('group', { name: 'Title block' });
    expect(block).toHaveTextContent('Reference 5\u2011inch quad');
    expect(block).toHaveTextContent('Wheelbase225 mm');
    expect(block).toHaveTextContent('Props5 × 4.3 × 3');
  });

  it('announces the lesson that opened', async () => {
    await renderExplorer();
    await userEvent.click(screen.getByRole('button', { name: 'Motors' }));
    expect(screen.getByTestId('explorer-announcer')).toHaveTextContent('Motors lesson opened');
  });

  it('toggles a lesson from the part list', async () => {
    await renderExplorer();
    const motors = screen.getByRole('button', { name: 'Motors' });
    await userEvent.click(motors);
    expect(lessonHeading('Motors')).toBeInTheDocument();
    await userEvent.click(motors);
    expect(lessonHeading('Motors')).toBeNull();
  });

  it('selects a part clicked in 3D', async () => {
    await renderExplorer();
    await userEvent.click(screen.getByRole('button', { name: 'stub: click motors' }));
    expect(lessonHeading('Motors')).toBeInTheDocument();
  });

  it('ignores a camera drag that ends on a part', async () => {
    await renderExplorer();
    await userEvent.click(screen.getByRole('button', { name: 'Frame' }));
    await userEvent.click(screen.getByRole('button', { name: 'stub: drag ending on motors' }));
    expect(lessonHeading('Frame')).toBeInTheDocument();
    expect(lessonHeading('Motors')).toBeNull();
  });

  it('clears the selection when the background is clicked', async () => {
    await renderExplorer();
    await userEvent.click(screen.getByRole('button', { name: 'Frame' }));
    await userEvent.click(screen.getByRole('button', { name: 'stub: background' }));
    expect(lessonHeading('Frame')).toBeNull();
  });

  it('follows connection links to another lesson and focuses its title', async () => {
    await renderExplorer();
    await userEvent.click(screen.getByRole('button', { name: 'Motors' }));
    await userEvent.click(screen.getByRole('link', { name: 'Propellers · sheet 3' }));
    expect(lessonHeading('Propellers')).toHaveFocus();
    expect(window.location.pathname).toBe('/parts/props');
  });

  it('walks to the next sheet and focuses its title', async () => {
    await renderExplorer();
    await userEvent.click(screen.getByRole('button', { name: 'Frame' }));
    await userEvent.click(screen.getByRole('link', { name: 'Next: Motors · sheet 2' }));
    expect(lessonHeading('Motors')).toHaveFocus();
  });

  it('shows a board sheet on the opened frame, turned to the board, with no leader', async () => {
    window.history.replaceState(null, '', '/parts/esc');
    await renderExplorer();
    expect(viewerState()).toEqual({
      open: ['esc'],
      exploded: true,
      turnTo: 'esc',
      step: null,
      flying: false,
    });
  });

  it('keeps the frame closed for a part outside it', async () => {
    window.history.replaceState(null, '', '/parts/frame');
    await renderExplorer();
    expect(viewerState()).toMatchObject({ open: ['frame'], exploded: false });
  });

  it('opens nothing on the overview', async () => {
    await renderExplorer();
    expect(viewerState()).toEqual({
      open: [],
      exploded: false,
      turnTo: null,
      step: null,
      flying: false,
    });
  });

  it('opens a path sheet on the opened frame, at its first stop', async () => {
    window.history.replaceState(null, '', '/paths/power');
    await renderExplorer();
    expect(screen.getByRole('heading', { level: 2, name: 'Power path' })).toBeInTheDocument();
    expect(document.title).toContain('Power path');
    expect(viewerState()).toEqual({
      open: ['battery'],
      exploded: true,
      turnTo: 'battery',
      step: 0,
      flying: false,
    });
  });

  it('jumps to the step of a part clicked on a path sheet', async () => {
    window.history.replaceState(null, '', '/paths/power');
    await renderExplorer();
    await userEvent.click(screen.getByRole('button', { name: 'stub: click motors' }));
    expect(window.location.pathname).toBe('/paths/power/4');
    expect(viewerState()).toMatchObject({ open: ['motors'], step: 3 });
  });

  it('ignores a click on a part off the path', async () => {
    window.history.replaceState(null, '', '/paths/video');
    await renderExplorer();
    await userEvent.click(screen.getByRole('button', { name: 'stub: click motors' }));
    expect(window.location.pathname).toBe('/paths/video');
    expect(viewerState().step).toBe(0);
  });

  it('opens a path at the step its address names', async () => {
    window.history.replaceState(null, '', '/paths/power/3');
    await renderExplorer();
    expect(viewerState()).toMatchObject({ open: ['esc'], step: 2 });
  });

  it('keeps the step in the address, without a history entry per step', async () => {
    window.history.replaceState(null, '', '/paths/power');
    await renderExplorer();
    const before = window.history.length;
    await userEvent.click(screen.getByRole('button', { name: 'Next step' }));
    expect(window.location.pathname).toBe('/paths/power/2');
    expect(window.history.length).toBe(before);
  });

  it('replaces a step below 1 with the first stop, keeping the path', async () => {
    window.history.replaceState(null, '', '/paths/control/0');
    await renderExplorer();
    expect(window.location.pathname).toBe('/paths/control');
    expect(screen.getByRole('heading', { level: 2, name: 'Control path' })).toBeInTheDocument();
  });

  it('drops the way back when a link outside the sheet opens another page', async () => {
    window.history.replaceState(null, '', '/paths/control/3');
    render(
      <>
        <PartLink to="intro">masthead: intro</PartLink>
        <PartExplorer />
      </>,
    );
    await screen.findByRole('button', { name: 'stub: click motors' });
    await userEvent.click(screen.getByRole('link', { name: 'Flight controller' }));
    await userEvent.click(screen.getByRole('link', { name: 'masthead: intro' }));
    await act(async () => {
      window.history.back();
      await new Promise((resolve) => setTimeout(resolve, 50));
    });
    expect(
      screen.getByRole('heading', { level: 2, name: 'Flight controller' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /^Back to Control path/ })).toBeNull();
  });

  it('replaces a step past the end with the last stop', async () => {
    window.history.replaceState(null, '', '/paths/video/9');
    await renderExplorer();
    expect(window.location.pathname).toBe('/paths/video/5');
    expect(viewerState().step).toBe(4);
  });

  it('offers the way back to the step a lesson was opened from', async () => {
    window.history.replaceState(null, '', '/paths/control/3');
    await renderExplorer();
    await userEvent.click(screen.getByRole('link', { name: 'Flight controller' }));
    const back = screen.getByRole('link', { name: 'Back to Control path, step 3' });
    expect(back).toHaveAttribute('href', '/paths/control/3');
    await userEvent.click(back);
    expect(screen.getByRole('heading', { level: 2, name: 'Control path' })).toHaveFocus();
    expect(viewerState().step).toBe(2);
  });

  it('drops the way back once another sheet opens', async () => {
    window.history.replaceState(null, '', '/paths/control/3');
    await renderExplorer();
    await userEvent.click(screen.getByRole('link', { name: 'Flight controller' }));
    await userEvent.click(screen.getByRole('link', { name: /^Next/ }));
    await userEvent.click(screen.getByRole('link', { name: /^Previous/ }));
    expect(screen.queryByRole('link', { name: /^Back to Control path/ })).toBeNull();
  });

  it('moves the drawing along as the learner steps through a path', async () => {
    window.history.replaceState(null, '', '/paths/power');
    await renderExplorer();
    await userEvent.click(screen.getByRole('button', { name: 'Next step' }));
    expect(viewerState()).toMatchObject({ open: ['battery', 'esc'], step: 1 });
  });

  it('leaves the view where it is at an off-drone end', async () => {
    window.history.replaceState(null, '', '/paths/control');
    await renderExplorer();
    expect(viewerState()).toMatchObject({ open: [], turnTo: null, step: 0, exploded: true });
  });

  it('marks a path as read', async () => {
    window.history.replaceState(null, '', '/paths/video');
    await renderExplorer();
    await userEvent.click(screen.getByRole('button', { name: 'Mark as read' }));
    expect(window.localStorage.getItem(READ_KEY)).toBe('["video"]');
  });

  it('runs on from the last path to how a quad moves', async () => {
    window.history.replaceState(null, '', '/paths/video');
    await renderExplorer();
    await userEvent.click(screen.getByRole('link', { name: 'Next: How a quad moves · sheet 4' }));
    expect(window.location.pathname).toBe('/moves');
  });

  it.each([
    ['the path switcher', 'Control'],
    ['a link elsewhere on the page', 'masthead: control path'],
  ])('stops playing when %s leads to the open path', async (_, name) => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime.bind(vi) });
      window.history.replaceState(null, '', '/paths/control');
      render(
        <>
          <PartLink to="control">masthead: control path</PartLink>
          <PartExplorer />
        </>,
      );
      await screen.findByRole('button', { name: 'stub: click motors' });
      await user.click(screen.getByRole('button', { name: 'Play the path' }));
      await user.click(screen.getByRole('link', { name }));
      act(() => {
        vi.advanceTimersByTime(PLAY_INTERVAL_MS * 2);
      });
      expect(screen.getByRole('button', { name: 'Play the path' })).toBeInTheDocument();
      expect(viewerState().step).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });

  it('closes a path sheet with Escape', async () => {
    window.history.replaceState(null, '', '/paths/control');
    await renderExplorer();
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('heading', { level: 2, name: 'Control path' })).toBeNull();
  });

  it('runs on from the last part to the control path', async () => {
    window.history.replaceState(null, '', '/parts/extras');
    await renderExplorer();
    await userEvent.click(screen.getByRole('link', { name: /^End of the parts: / }));
    expect(window.location.pathname).toBe('/paths/control');
  });

  it('remembers a lesson marked as read', async () => {
    await renderExplorer();
    await userEvent.click(screen.getByRole('button', { name: 'Frame' }));
    await userEvent.click(screen.getByRole('button', { name: 'Mark as read' }));
    expect(screen.getByRole('button', { name: 'Mark as read' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(window.localStorage.getItem('inside-the-quad.read-parts.v1')).toBe('["frame"]');
  });

  it('closes with Escape and keeps focus on the part button', async () => {
    await renderExplorer();
    const frame = screen.getByRole('button', { name: 'Frame' });
    await userEvent.click(frame);
    expect(lessonHeading('Frame')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    expect(lessonHeading('Frame')).toBeNull();
    expect(frame).toHaveFocus();
  });

  it('returns focus to the part button after closing the lesson', async () => {
    await renderExplorer();
    await userEvent.click(screen.getByRole('button', { name: 'Propellers' }));
    await userEvent.click(screen.getByRole('button', { name: 'Close lesson' }));
    expect(lessonHeading('Propellers')).toBeNull();
    expect(screen.getByRole('button', { name: 'Propellers' })).toHaveFocus();
  });

  it('opens the lesson the address names and titles the page after it', async () => {
    window.history.replaceState(null, '', '/parts/vtx');
    await renderExplorer();
    expect(lessonHeading('VTX')).toBeInTheDocument();
    expect(document.title).toBe('VTX · Inside the Quad');
  });

  it('puts the chosen part in the address, and the overview after closing', async () => {
    await renderExplorer();
    await userEvent.click(screen.getByRole('button', { name: 'Frame' }));
    expect(window.location.pathname).toBe('/parts/frame');
    await userEvent.click(screen.getByRole('button', { name: 'Close lesson' }));
    expect(window.location.pathname).toBe('/');
    expect(document.title).toBe('Inside the Quad');
  });

  it('closes the lesson on Back and keeps focus on the sheet', async () => {
    await renderExplorer();
    await userEvent.click(screen.getByRole('button', { name: 'Frame' }));
    act(() => {
      window.history.replaceState(null, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    expect(lessonHeading('Frame')).toBeNull();
    expect(document.getElementById(OVERVIEW_FOCUS_ID)).toHaveFocus();
  });

  it('focuses the lesson title when Forward reopens it', async () => {
    await renderExplorer();
    act(() => {
      window.history.pushState(null, '', '/parts/esc');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    expect(lessonHeading('ESC')).toHaveFocus();
  });

  it('tells the user when the address names no part', async () => {
    window.history.replaceState(null, '', '/parts/foo');
    await renderExplorer();
    expect(screen.getByRole('status')).toHaveTextContent('There’s no part called “foo”');
    expect(window.location.pathname).toBe('/');
  });

  it('says on the overview how visits are counted', async () => {
    await renderExplorer();
    expect(
      screen.getByText('Visits are counted with GoatCounter, without cookies.'),
    ).toBeInTheDocument();
    const [introLink] = screen.getAllByRole('link', { name: 'What is an FPV drone?' });
    if (introLink) await userEvent.click(introLink);
    expect(screen.getByRole('heading', { level: 2, name: 'What is an FPV drone?' })).toBeVisible();
    expect(screen.queryByText(/GoatCounter/)).toBeNull();
  });

  it('offers sheet 1 to a new visitor', async () => {
    await renderExplorer();
    const start = screen.getByRole('link', { name: 'Start with sheet 1: Frame' });
    expect(start).toHaveAttribute('href', '/parts/frame');
    expect(screen.queryByText(/Parts \d+ of 11/)).toBeNull();
    expect(screen.queryByRole('button', { name: 'Clear progress' })).toBeNull();
    await userEvent.click(start);
    expect(lessonHeading('Frame')).toHaveFocus();
  });

  it('offers the first unread sheet once something is read', async () => {
    window.localStorage.setItem(READ_KEY, '["frame"]');
    await renderExplorer();
    expect(screen.getByRole('link', { name: 'Continue with sheet 2: Motors' })).toBeInTheDocument();
    expect(
      screen.getByText('Parts 1 of 11 · How it works 0 of 5 · Gear 0 of 3 · Build 0 of 1'),
    ).toBeInTheDocument();
  });

  it('continues into the control path once every part is read', async () => {
    window.localStorage.setItem(READ_KEY, JSON.stringify(PART_IDS));
    await renderExplorer();
    expect(
      screen.getByRole('link', {
        name: 'Continue with How it works together, sheet 1: Control path',
      }),
    ).toHaveAttribute('href', '/paths/control');
    expect(
      screen.getByText('Parts 11 of 11 · How it works 0 of 5 · Gear 0 of 3 · Build 0 of 1'),
    ).toBeInTheDocument();
  });

  it('says when every sheet is read and offers to start again', async () => {
    window.localStorage.setItem(READ_KEY, JSON.stringify(NUMBERED_SHEETS));
    await renderExplorer();
    expect(screen.getByText(/every sheet read/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Read again from sheet 1' })).toHaveAttribute(
      'href',
      '/parts/frame',
    );
  });

  it('clears progress and returns focus to the start link', async () => {
    window.localStorage.setItem(READ_KEY, '["frame","motors"]');
    await renderExplorer();
    await userEvent.click(screen.getByRole('button', { name: 'Clear progress' }));
    expect(screen.queryByText(/Parts \d+ of 11/)).toBeNull();
    // Clearing everything returns to the newcomer's start, which leads with the intro.
    expect(document.getElementById(OVERVIEW_FOCUS_ID)).toHaveFocus();
    expect(document.getElementById(OVERVIEW_FOCUS_ID)).toHaveAttribute('href', '/intro');
  });

  it('ticks a part in the list once its lesson is marked read', async () => {
    await renderExplorer();
    await userEvent.click(screen.getByRole('button', { name: 'Motors' }));
    await userEvent.click(screen.getByRole('button', { name: 'Mark as read' }));
    expect(screen.getByRole('button', { name: 'Motors, read' })).toBeInTheDocument();
  });

  it('opens the intro sheet at /intro, with nothing selected', async () => {
    window.history.replaceState(null, '', '/intro');
    await renderExplorer();
    expect(introHeading()).toBeInTheDocument();
    expect(document.title).toBe('What is an FPV drone? · Inside the Quad');
    for (const row of screen.queryAllByRole('button', { pressed: true })) {
      expect(row.closest('.part-list')).toBeNull();
    }
    expect(screen.getByTestId('explorer-announcer')).toHaveTextContent(
      'What is an FPV drone? opened',
    );
  });

  it('closes the intro with Close and returns focus to the start link', async () => {
    window.history.replaceState(null, '', '/intro');
    await renderExplorer();
    await userEvent.click(screen.getByRole('button', { name: 'Close intro' }));
    expect(window.location.pathname).toBe('/');
    expect(document.getElementById(OVERVIEW_FOCUS_ID)).toHaveFocus();
  });

  it('closes the intro with Escape', async () => {
    window.history.replaceState(null, '', '/intro');
    await renderExplorer();
    await userEvent.keyboard('{Escape}');
    expect(window.location.pathname).toBe('/');
    expect(document.getElementById(OVERVIEW_FOCUS_ID)).toHaveFocus();
  });

  it('keeps the intro open when the empty 3D background is clicked', async () => {
    window.history.replaceState(null, '', '/intro');
    await renderExplorer();
    await userEvent.click(screen.getByRole('button', { name: 'stub: background' }));
    expect(window.location.pathname).toBe('/intro');
  });

  it('does nothing on Escape when no sheet is open', async () => {
    await renderExplorer();
    const frame = screen.getByRole('button', { name: 'Frame' });
    frame.focus();
    await userEvent.keyboard('{Escape}');
    expect(window.location.pathname).toBe('/');
    expect(frame).toHaveFocus();
  });

  it('follows sheet 1 back to the intro and focuses its title', async () => {
    window.history.replaceState(null, '', '/parts/frame');
    await renderExplorer();
    await userEvent.click(screen.getByRole('link', { name: 'Previous: What is an FPV drone?' }));
    expect(introHeading()).toHaveFocus();
  });

  it('focuses a lesson title when Back returns to it from the intro', async () => {
    window.history.replaceState(null, '', '/intro');
    await renderExplorer();
    act(() => {
      window.history.pushState(null, '', '/parts/frame');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    expect(lessonHeading('Frame')).toHaveFocus();
  });

  it('offers the intro first to a visitor who has read nothing', async () => {
    await renderExplorer();
    expect(screen.getByText('New to FPV? Start here.')).toBeInTheDocument();
    const intro = screen.getByRole('link', { name: 'What is an FPV drone?' });
    expect(intro).toHaveAttribute('href', '/intro');
    expect(intro).toHaveAttribute('id', OVERVIEW_FOCUS_ID);
    expect(screen.getByRole('link', { name: 'Start with sheet 1: Frame' })).toBeInTheDocument();
  });

  it('offers sheet 1 once the intro is read, with a way to clear it', async () => {
    window.localStorage.setItem(INTRO_KEY, '1');
    await renderExplorer();
    const start = screen.getByRole('link', { name: 'Start with sheet 1: Frame' });
    expect(start).toHaveAttribute('id', OVERVIEW_FOCUS_ID);
    expect(screen.queryByText(/Parts \d+ of 11/)).toBeNull();
    expect(screen.getByRole('link', { name: 'What is an FPV drone?' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Clear progress' }));
    expect(screen.getByText('New to FPV? Start here.')).toBeInTheDocument();
    expect(window.localStorage.getItem(INTRO_KEY)).toBeNull();
  });

  it('clears parts and the intro together', async () => {
    window.localStorage.setItem(INTRO_KEY, '1');
    window.localStorage.setItem(READ_KEY, '["frame"]');
    await renderExplorer();
    await userEvent.click(screen.getByRole('button', { name: 'Clear progress' }));
    expect(window.localStorage.getItem(INTRO_KEY)).toBeNull();
    expect(window.localStorage.getItem(READ_KEY)).toBe('[]');
  });

  it('moves focus into a lesson opened from the parts list with the keyboard', async () => {
    await renderExplorer();
    screen.getByRole('button', { name: 'Frame' }).focus();
    await userEvent.keyboard('{Enter}');
    expect(lessonHeading('Frame')).toHaveFocus();
  });

  it('moves focus into a lesson opened from the 3D model, and back to its row on Escape', async () => {
    await renderExplorer();
    await userEvent.click(screen.getByRole('button', { name: 'stub: click motors' }));
    expect(lessonHeading('Motors')).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    expect(screen.getByRole('button', { name: 'Motors' })).toHaveFocus();
  });

  it('leaves focus alone when a lesson address is loaded directly', async () => {
    window.history.replaceState(null, '', '/parts/vtx');
    await renderExplorer();
    expect(document.body).toHaveFocus();
  });

  it('moves focus into the intro when a link outside the explorer opens it', async () => {
    render(
      <>
        <PartLink to="intro">outside link</PartLink>
        <PartExplorer />
      </>,
    );
    await screen.findByRole('button', { name: 'stub: click motors' });
    await userEvent.click(screen.getByRole('link', { name: 'outside link' }));
    expect(introHeading()).toHaveFocus();
  });

  it('keeps a path sheet working as a list when the 3D viewer fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    viewer.shouldThrow = true;
    window.history.replaceState(null, '', '/paths/video');
    render(<PartExplorer />);
    expect(await screen.findByRole('alert')).toHaveTextContent('3D model couldn’t be loaded');
    expect(screen.getByRole('list', { name: 'Stops' })).toBeInTheDocument();
  });

  it('keeps the part list and lessons working when the 3D viewer fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    viewer.shouldThrow = true;
    render(<PartExplorer />);

    expect(await screen.findByRole('alert')).toHaveTextContent('3D model couldn’t be loaded');
    await userEvent.click(screen.getByRole('button', { name: 'Frame' }));
    expect(lessonHeading('Frame')).toBeInTheDocument();
  });
});

describe('Check a build', () => {
  afterEach(() => {
    window.localStorage.clear();
  });

  const result = (name: string) => {
    const item = screen
      .getAllByRole('listitem')
      .find((li) => li.querySelector('.check-result-name')?.textContent === name);
    if (!item) throw new Error(`no result ${name}`);
    return item;
  };

  it('reads the build from the address and lights a result’s parts only while pointed at', async () => {
    window.history.replaceState(null, '', '/check?camera=21');
    await renderExplorer();
    expect(lessonHeading('Check a build')).toBeInTheDocument();
    expect(result('Camera width')).toHaveTextContent('Doesn’t fit');
    expect(viewerState().open).toEqual([]);
    fireEvent.mouseEnter(result('Camera width'));
    expect(viewerState().open).toEqual(['frame', 'camera']);
    fireEvent.mouseLeave(result('Camera width'));
    expect(viewerState().open).toEqual([]);
  });

  it('writes a pick to the address and Reset clears it', async () => {
    window.history.replaceState(null, '', '/check');
    await renderExplorer();
    const battery = screen.getByRole('group', { name: 'Battery' });
    await userEvent.selectOptions(within(battery).getByLabelText('Cells'), '4S');
    expect(window.location.search).toBe('?cells=4');
    expect(result('Motor KV')).toHaveTextContent('Check this');
    const kv = screen.getByRole('textbox', { name: 'KV' });
    await userEvent.clear(kv);
    await userEvent.type(kv, 'abc');
    expect(result('Motor KV')).toHaveTextContent(/Enter the motors’ KV/);
    await userEvent.click(screen.getByRole('button', { name: /Reset/ }));
    expect(window.location.search).toBe('');
    expect(kv).toHaveValue('1950');
    expect(screen.getByText('7 fit')).toBeInTheDocument();
  });
});

describe('3D hover', () => {
  const motorsRow = () => {
    const row = document.getElementById(partButtonId('motors'));
    if (!row) throw new Error('no Motors row');
    return row;
  };

  it("gives the hovered part's row the hover look, and clears it", async () => {
    const user = userEvent.setup();
    await renderExplorer();
    await user.click(screen.getByRole('button', { name: 'stub: hover motors' }));
    expect(motorsRow().dataset.hovered).toBe('true');
    await user.click(screen.getByRole('button', { name: 'stub: hover nothing' }));
    expect(document.querySelector('[data-hovered="true"]')).toBeNull();
  });

  it("clears the hover look when the hovered part's sheet opens", async () => {
    const user = userEvent.setup();
    await renderExplorer();
    await user.click(screen.getByRole('button', { name: 'stub: hover motors' }));
    await user.click(screen.getByRole('button', { name: 'stub: click motors' }));
    expect(lessonHeading('Motors')).not.toBeNull();
    expect(document.querySelector('[data-hovered="true"]')).toBeNull();
  });
});

describe('real part photos', () => {
  it('appear on part sheets only, not on the overview or the intro', async () => {
    await renderExplorer();
    expect(document.querySelector('.part-photo')).toBeNull();
    window.history.pushState(null, '', '/intro');
    window.dispatchEvent(new PopStateEvent('popstate'));
    expect(
      await screen.findByRole('heading', { level: 2, name: 'What is an FPV drone?' }),
    ).toBeInTheDocument();
    expect(document.querySelector('.part-photo')).toBeNull();
  });
});
