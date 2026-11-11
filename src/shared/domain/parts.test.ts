import { describe, expect, it } from 'vitest';

import { isInsidePart, PART_IDS, partNeighbours } from './parts';

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

describe('partNeighbours', () => {
  it('gives the first sheet no previous part', () => {
    expect(partNeighbours('frame')).toEqual({ previous: null, next: 'motors' });
  });

  it('gives the last sheet no next part', () => {
    expect(partNeighbours('extras')).toEqual({ previous: 'vtx', next: null });
  });

  it('steps through the sheets in teaching order', () => {
    expect(partNeighbours('fc')).toEqual({ previous: 'esc', next: 'battery' });
  });
});
