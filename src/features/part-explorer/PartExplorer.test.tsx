import type { ThreeEvent } from '@react-three/fiber';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { DroneViewerProps } from '@/features/drone-viewer/DroneViewer';

import { PART_IDS } from '@/shared/domain/parts';

import { OVERVIEW_FOCUS_ID } from './ids';
import { PartExplorer } from './PartExplorer';

// WebGL is unavailable in jsdom: the viewer is replaced by buttons that call its props.
const viewer = vi.hoisted(() => ({ shouldThrow: false }));

vi.mock('@/features/drone-viewer/DroneViewer', () => ({
  default: function DroneViewerStub({ onPartClick, onBackgroundClick }: DroneViewerProps) {
    if (viewer.shouldThrow) throw new Error('WebGL unavailable');
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
        <button type="button" onClick={onBackgroundClick}>
          stub: background
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

async function renderExplorer() {
  render(<PartExplorer />);
  await screen.findByRole('button', { name: 'stub: click motors' });
}

describe('PartExplorer', () => {
  afterEach(() => {
    viewer.shouldThrow = false;
    window.localStorage.clear();
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

  it('returns from the last sheet to the overview', async () => {
    window.history.replaceState(null, '', '/parts/extras');
    await renderExplorer();
    await userEvent.click(screen.getByRole('link', { name: 'Next: Back to overview' }));
    expect(lessonHeading('Extras')).toBeNull();
    expect(document.getElementById(OVERVIEW_FOCUS_ID)).toHaveFocus();
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

  it('offers sheet 1 to a new visitor', async () => {
    await renderExplorer();
    const start = screen.getByRole('link', { name: 'Start with sheet 1: Frame' });
    expect(start).toHaveAttribute('href', '/parts/frame');
    expect(screen.queryByText(/of 11 read/)).toBeNull();
    expect(screen.queryByRole('button', { name: 'Clear progress' })).toBeNull();
    await userEvent.click(start);
    expect(lessonHeading('Frame')).toHaveFocus();
  });

  it('offers the first unread sheet once something is read', async () => {
    window.localStorage.setItem(READ_KEY, '["frame"]');
    await renderExplorer();
    expect(screen.getByRole('link', { name: 'Continue with sheet 2: Motors' })).toBeInTheDocument();
    expect(screen.getByText('1 of 11 read')).toBeInTheDocument();
  });

  it('says when every part is read and offers to start again', async () => {
    window.localStorage.setItem(READ_KEY, JSON.stringify(PART_IDS));
    await renderExplorer();
    expect(screen.getByText(/all 11 parts read/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Start again from sheet 1' })).toHaveAttribute(
      'href',
      '/parts/frame',
    );
  });

  it('clears progress and returns focus to the start link', async () => {
    window.localStorage.setItem(READ_KEY, '["frame","motors"]');
    await renderExplorer();
    await userEvent.click(screen.getByRole('button', { name: 'Clear progress' }));
    expect(screen.queryByText(/of 11 read/)).toBeNull();
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
    expect(screen.queryByText(/of 11 read/)).toBeNull();
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

  it('keeps the part list and lessons working when the 3D viewer fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    viewer.shouldThrow = true;
    render(<PartExplorer />);

    expect(await screen.findByRole('alert')).toHaveTextContent('3D model couldn’t be loaded');
    await userEvent.click(screen.getByRole('button', { name: 'Frame' }));
    expect(lessonHeading('Frame')).toBeInTheDocument();
  });
});
