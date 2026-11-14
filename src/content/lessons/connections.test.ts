import { describe, expect, it } from 'vitest';

import { PART_IDS } from '@/shared/domain/parts';

import { connectedParts } from './connections';

describe('connectedParts', () => {
  it('lists the parts a lesson says it connects to', () => {
    expect(connectedParts('esc')).toEqual(new Set(['battery', 'motors', 'fc', 'frame']));
  });

  it('lists each part once', () => {
    expect([...connectedParts('extras')].filter((id) => id === 'fc')).toHaveLength(1);
  });

  it.each(PART_IDS.map((id) => [id]))('never lists %s itself, and only real parts', (id) => {
    const parts = connectedParts(id);
    expect(parts.has(id)).toBe(false);
    for (const other of parts) expect(PART_IDS).toContain(other);
  });

  it('follows the frame lesson, which leaves out the propellers and extras', () => {
    const parts = connectedParts('frame');
    expect(parts.has('props')).toBe(false);
    expect(parts.has('extras')).toBe(false);
    expect(parts.has('battery')).toBe(true);
  });
});
