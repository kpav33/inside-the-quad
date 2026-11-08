import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { LESSONS } from '@/content/lessons';

import { LessonPanel } from './LessonPanel';

function renderMotors() {
  const onClose = vi.fn();
  const onSelectPart = vi.fn();
  render(<LessonPanel lesson={LESSONS.motors} onClose={onClose} onSelectPart={onSelectPart} />);
  return { onClose, onSelectPart };
}

describe('LessonPanel', () => {
  it('titles the lesson and asks the four questions in order', () => {
    renderMotors();
    expect(screen.getByRole('heading', { level: 2, name: 'Motors' })).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual([
      'What does it do?',
      'How does it work?',
      'What do the numbers mean?',
      'What is it connected to?',
    ]);
  });

  it('is a region labelled by its title', () => {
    renderMotors();
    expect(screen.getByRole('region', { name: 'Motors' })).toHaveAttribute('id', 'lesson-panel');
  });

  it('shows the specs as a table', () => {
    renderMotors();
    const table = screen.getByRole('table');
    expect(within(table).getByRole('cell', { name: '2207' })).toBeInTheDocument();
    expect(
      within(table)
        .getAllByRole('columnheader')
        .map((h) => h.textContent),
    ).toEqual(['Spec', 'Value', 'What it means']);
  });

  it('links connections to other lessons', async () => {
    const { onSelectPart } = renderMotors();
    await userEvent.click(screen.getByRole('button', { name: /propeller slides onto/ }));
    expect(onSelectPart).toHaveBeenCalledWith('props');
  });

  it('shows connections without a lesson as plain text', () => {
    renderMotors();
    const text = screen.getByText(/soldered to the ESC/);
    expect(text.closest('button')).toBeNull();
  });

  it('can be closed', async () => {
    const { onClose } = renderMotors();
    await userEvent.click(screen.getByRole('button', { name: 'Close lesson' }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('numbers the four questions 1 to 4', () => {
    renderMotors();
    const numbers = screen
      .getAllByRole('heading', { level: 3 })
      .map((h) => h.closest('section')?.querySelector('[data-question-number]')?.textContent);
    expect(numbers).toEqual(['1', '2', '3', '4']);
  });
});
