import { describe, expect, it } from 'vitest';

import { COLOR, contrastRatio, MODEL_COLOR } from '@/shared/design/tokens';
import { PART_IDS } from '@/shared/domain/parts';

import { partAppearance } from './materials';

describe('partAppearance', () => {
  it.each(PART_IDS.map((id) => [id]))('draws %s in its token colour with drafting edges', (id) => {
    expect(partAppearance(id, false)).toEqual({ color: MODEL_COLOR[id], edgeColor: COLOR.muted });
  });

  it.each(PART_IDS.map((id) => [id]))('draws a selected %s entirely in redline', (id) => {
    expect(partAppearance(id, true)).toEqual({ color: COLOR.accent, edgeColor: COLOR.accent });
  });

  it('keeps every part distinguishable from the ground', () => {
    for (const id of PART_IDS) {
      expect(contrastRatio(MODEL_COLOR[id], COLOR.ground), id).toBeGreaterThanOrEqual(1.8);
    }
  });
});
