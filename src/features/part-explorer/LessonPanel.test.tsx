import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { LESSONS } from '@/content/lessons';
import type { PartId } from '@/shared/domain/parts';

import { LessonPanel } from './LessonPanel';

function renderLesson(part: PartId, read = false) {
  const onClose = vi.fn();
  const onToggleRead = vi.fn();
  render(
    <LessonPanel
      lesson={LESSONS[part]}
      read={read}
      onClose={onClose}
      onToggleRead={onToggleRead}
    />,
  );
  return { onClose, onToggleRead };
}

const renderMotors = () => renderLesson('motors');

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

  it('names the part once, as the heading above the title block', () => {
    renderLesson('vtx');
    const panel = screen.getByRole('region', { name: 'VTX' });
    expect(within(panel).getAllByText('VTX', { exact: true })).toHaveLength(1);
    const heading = screen.getByRole('heading', { level: 2, name: 'VTX' });
    const block = screen.getByRole('group', { name: 'Title block' });
    expect(heading.compareDocumentPosition(block) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(block).not.toHaveTextContent(/^Part/);
  });

  it('follows each connection with a link that names the part it opens', () => {
    renderLesson('esc');
    const link = screen.getByRole('link', { name: 'Battery · sheet 6' });
    expect(link).toHaveAttribute('href', '/parts/battery');
    expect(screen.getByText(/XT60 plug connects to the ESC/).closest('a')).toBeNull();
  });

  it('shows connections without a lesson as plain text', () => {
    renderLesson('battery');
    const text = screen.getByText(/balance lead plugs into the charger/);
    expect(text.closest('a')).toBeNull();
  });

  it('marks the lesson as read with a toggle', async () => {
    const { onToggleRead } = renderMotors();
    const toggle = screen.getByRole('button', { name: 'Mark as read' });
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(toggle);
    expect(onToggleRead).toHaveBeenCalledOnce();
  });

  it('shows a read lesson as read', () => {
    renderLesson('motors', true);
    const toggle = screen.getByRole('button', { name: 'Mark as read' });
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
    expect(toggle).toHaveTextContent('Read');
  });

  it('leads to the previous and next sheets', () => {
    renderMotors();
    expect(screen.getByRole('link', { name: 'Previous: Frame · sheet 1' })).toHaveAttribute(
      'href',
      '/parts/frame',
    );
    expect(screen.getByRole('link', { name: 'Next: Propellers · sheet 3' })).toHaveAttribute(
      'href',
      '/parts/props',
    );
  });

  it('has no previous sheet on sheet 1', () => {
    renderLesson('frame');
    expect(screen.queryByRole('link', { name: /^Previous/ })).toBeNull();
  });

  it('leads back to the overview from the last sheet', () => {
    renderLesson('extras');
    expect(screen.getByRole('link', { name: 'Next: Back to overview' })).toHaveAttribute(
      'href',
      '/',
    );
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
