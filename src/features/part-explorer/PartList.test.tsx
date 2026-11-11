import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { PartId } from '@/shared/domain/parts';

import { PartList } from './PartList';

const NONE: ReadonlySet<PartId> = new Set();

describe('PartList', () => {
  it('offers one button per part', () => {
    render(<PartList read={NONE} selectedPart={null} onToggle={vi.fn()} />);
    const nav = screen.getByRole('navigation', { name: 'Drone parts' });
    expect(nav).toBeInTheDocument();
    for (const name of ['Frame', 'Motors', 'Propellers', 'ESC', 'Flight controller', 'Battery']) {
      expect(screen.getByRole('button', { name })).toBeInTheDocument();
    }
  });

  it('marks only the selected part as pressed', () => {
    render(<PartList read={NONE} selectedPart="motors" onToggle={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Motors' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Frame' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: 'Propellers' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('reports clicks with the part id', async () => {
    const onToggle = vi.fn();
    render(<PartList read={NONE} selectedPart={null} onToggle={onToggle} />);
    await userEvent.click(screen.getByRole('button', { name: 'Motors' }));
    expect(onToggle).toHaveBeenCalledWith('motors');
  });

  it('works with Enter and Space', async () => {
    const onToggle = vi.fn();
    render(<PartList read={NONE} selectedPart={null} onToggle={onToggle} />);
    screen.getByRole('button', { name: 'Frame' }).focus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    expect(onToggle).toHaveBeenNthCalledWith(1, 'frame');
    expect(onToggle).toHaveBeenNthCalledWith(2, 'frame');
  });

  it('only points at the lesson panel while a lesson is open', () => {
    const { rerender } = render(<PartList read={NONE} selectedPart={null} onToggle={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Frame' })).not.toHaveAttribute('aria-controls');
    rerender(<PartList read={NONE} selectedPart="frame" onToggle={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Frame' })).toHaveAttribute(
      'aria-controls',
      'lesson-panel',
    );
  });

  it('lists item number and quantity beside each part, keeping the part as the name', () => {
    render(<PartList read={NONE} selectedPart="motors" onToggle={vi.fn()} />);
    const motors = screen.getByRole('button', { name: 'Motors' });
    expect(motors).toHaveTextContent(/^2\s*Motors\s*4$/);
    expect(motors).toHaveAttribute('data-selected', 'true');
    expect(screen.getByRole('button', { name: 'Frame' })).toHaveAttribute('data-selected', 'false');
  });

  it('ticks the parts marked as read and says so', () => {
    render(<PartList read={new Set<PartId>(['vtx'])} selectedPart={null} onToggle={vi.fn()} />);
    const vtx = screen.getByRole('button', { name: 'VTX, read' });
    expect(vtx.querySelector('svg')).not.toBeNull();
    const camera = screen.getByRole('button', { name: 'Camera' });
    expect(camera.querySelector('svg')).toBeNull();
  });
});
