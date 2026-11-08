import { describe, expect, it } from 'vitest';

import { PART_IDS } from './parts';

describe('parts', () => {
  it('lists the parts in teaching order', () => {
    expect(PART_IDS).toEqual(['frame', 'motors', 'props', 'esc', 'fc', 'battery']);
  });
});
