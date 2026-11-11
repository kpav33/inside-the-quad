import { describe, expect, it } from 'vitest';

import { isInsidePart, PART_IDS } from './parts';

describe('parts', () => {
  it('lists the parts in teaching order', () => {
    expect(PART_IDS).toEqual([
      'frame',
      'motors',
      'props',
      'esc',
      'fc',
      'battery',
      'strap',
      'receiver',
      'camera',
      'vtx',
      'extras',
    ]);
  });
});

describe('isInsidePart', () => {
  it('is true only for the boards under the top plate', () => {
    for (const part of ['esc', 'fc', 'receiver', 'vtx'] as const) {
      expect(isInsidePart(part), part).toBe(true);
    }
    for (const part of ['camera', 'battery', 'strap', 'extras', 'frame', null] as const) {
      expect(isInsidePart(part), String(part)).toBe(false);
    }
  });
});
