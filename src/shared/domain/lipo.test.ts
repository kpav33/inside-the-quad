import { describe, expect, it } from 'vitest';

import { LIPO_CELL_VOLTS, packVolts } from './lipo';

describe('LiPo voltages', () => {
  it('uses the standard per-cell voltages', () => {
    expect(LIPO_CELL_VOLTS).toEqual({
      nominal: 3.7,
      full: 4.2,
      storage: 3.8,
      emptyUnderLoad: 3.5,
      minResting: 3.3,
    });
  });

  it('multiplies by the cell count, rounded to one decimal', () => {
    expect(packVolts(6, LIPO_CELL_VOLTS.nominal)).toBe(22.2);
    expect(packVolts(6, LIPO_CELL_VOLTS.full)).toBe(25.2);
    expect(packVolts(4, 4.2)).toBe(16.8);
  });
});
