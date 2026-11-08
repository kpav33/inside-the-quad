import { describe, expect, it } from 'vitest';

import { PART_IDS } from '@/shared/domain/parts';

import { PART_LABELS, UI } from './ui';

function strings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === 'object') return Object.values(value).flatMap(strings);
  return [];
}

describe('interface text', () => {
  it('asks the four lesson questions in order', () => {
    expect(UI.lesson.questions).toEqual([
      'What does it do?',
      'How does it work?',
      'What do the numbers mean?',
      'What is it connected to?',
    ]);
  });

  it('splits the masthead title without changing it', () => {
    expect(`${UI.app.titleLead} ${UI.app.titleAccent}`).toBe(UI.app.title);
  });

  it('labels every part', () => {
    for (const id of PART_IDS) expect(PART_LABELS[id].trim()).not.toBe('');
  });

  it('has no empty strings', () => {
    for (const text of strings(UI)) expect(text.trim()).not.toBe('');
  });
});
