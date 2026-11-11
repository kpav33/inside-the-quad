import type { ThreeEvent } from '@react-three/fiber';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { DroneViewerProps } from '@/features/drone-viewer/DroneViewer';

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

  it('keeps the part list and lessons working when the 3D viewer fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    viewer.shouldThrow = true;
    render(<PartExplorer />);

    expect(await screen.findByRole('alert')).toHaveTextContent('3D model couldn’t be loaded');
    await userEvent.click(screen.getByRole('button', { name: 'Frame' }));
    expect(lessonHeading('Frame')).toBeInTheDocument();
  });
});
