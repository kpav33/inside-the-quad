import { describe, expect, it } from 'vitest';

import { COLOR, contrastRatio, MODEL_COLOR } from '@/shared/design/tokens';
import { PART_IDS } from '@/shared/domain/parts';

import { partAppearance } from './materials';

describe('partAppearance', () => {
  it.each(PART_IDS.map((id) => [id]))('draws %s as ink linework over a dark fill', (id) => {
    expect(partAppearance(id, false)).toEqual({ color: MODEL_COLOR[id], edgeColor: COLOR.ink });
  });

  it.each(PART_IDS.map((id) => [id]))('fills a selected %s with redline', (id) => {
    expect(partAppearance(id, true).color).toBe(COLOR.accent);
  });

  it('keeps the drawn lines readable on the ground', () => {
    expect(contrastRatio(COLOR.ink, COLOR.ground)).toBeGreaterThanOrEqual(4.5);
  });

  it('keeps part fills in the dark ground and sheet tones, so redline is the only colour', () => {
    for (const id of PART_IDS) {
      expect(contrastRatio(MODEL_COLOR[id], COLOR.ground), id).toBeLessThan(1.6);
    }
  });
});
