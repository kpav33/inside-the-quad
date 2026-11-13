import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { INTRO } from '@/content/intro';

import { IntroPanel } from './IntroPanel';

function renderIntro(read = false) {
  const onClose = vi.fn();
  const onToggleRead = vi.fn();
  render(<IntroPanel read={read} onClose={onClose} onToggleRead={onToggleRead} />);
  return { onClose, onToggleRead };
}

describe('IntroPanel', () => {
  it('titles the sheet and marks it as the intro sheet', () => {
    renderIntro();
    expect(screen.getByRole('heading', { level: 2, name: 'What is an FPV drone?' })).toBeVisible();
    const block = screen.getByRole('group', { name: 'Title block' });
    expect(block).toHaveTextContent('SheetIntro');
    expect(within(block).queryByText('Part')).toBeNull();
    expect(within(block).queryByText('Qty')).toBeNull();
    expect(within(block).queryByText('Spec')).toBeNull();
  });

  it('answers the four intro topics in numbered sections', () => {
    renderIntro();
    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings.map((h) => h.textContent)).toEqual(INTRO.sections.map((s) => s.heading));
    const numbers = headings.map(
      (h) => h.closest('section')?.querySelector('[data-question-number]')?.textContent,
    );
    expect(numbers).toEqual(['1', '2', '3', '4']);
  });

  it('includes the system scene and the size comparison', () => {
    renderIntro();
    expect(screen.getByRole('button', { name: 'Drone' })).toBeInTheDocument();
    expect(screen.getByRole('table', { name: INTRO.sizes.label })).toBeInTheDocument();
  });

  it('leads on to sheet 1 and has no previous sheet', () => {
    renderIntro();
    expect(screen.queryByRole('link', { name: /^Previous/ })).toBeNull();
    expect(screen.getByRole('link', { name: 'Next: Frame · sheet 1' })).toHaveAttribute(
      'href',
      '/parts/frame',
    );
  });

  it('can be marked as read and closed', async () => {
    const { onClose, onToggleRead } = renderIntro();
    await userEvent.click(screen.getByRole('button', { name: 'Mark as read' }));
    expect(onToggleRead).toHaveBeenCalledOnce();
    await userEvent.click(screen.getByRole('button', { name: 'Close intro' }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
