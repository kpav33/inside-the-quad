import { describe, expect, it } from 'vitest';

import { PART_IDS } from '@/shared/domain/parts';

import { HIGHLIGHT_EMISSIVE, PART_COLORS, partEmissive } from './materials';

describe('materials', () => {
  it('glows highlighted parts', () => {
    expect(partEmissive(true)).toEqual({ emissive: HIGHLIGHT_EMISSIVE, emissiveIntensity: 0.6 });
  });

  it('leaves other parts unlit', () => {
    expect(partEmissive(false).emissiveIntensity).toBe(0);
  });

  it('has a base colour for every part', () => {
    for (const id of PART_IDS) expect(PART_COLORS[id]).toMatch(/^#[0-9a-f]{6}$/);
  });
});
