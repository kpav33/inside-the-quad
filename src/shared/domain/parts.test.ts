import { describe, expect, it } from 'vitest';

import { isStackPart, PART_IDS } from './parts';

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
    ]);
  });
});

describe('isStackPart', () => {
  it('is true only for the boards in the stack', () => {
    expect(isStackPart('esc')).toBe(true);
    expect(isStackPart('fc')).toBe(true);
    expect(isStackPart('battery')).toBe(false);
    expect(isStackPart('frame')).toBe(false);
    expect(isStackPart(null)).toBe(false);
  });
});
