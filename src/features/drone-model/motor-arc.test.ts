import { describe, expect, it } from 'vitest';

import { arcSweep } from './motor-arc';

const deg = (rad: number) => (rad * 180) / Math.PI;

describe('arcSweep', () => {
  it('draws idle as a short arc and full speed as a long one', () => {
    expect(deg(arcSweep(0.1, 0.1))).toBeCloseTo(30);
    expect(deg(arcSweep(1, 0.1))).toBeCloseTo(200);
  });

  it('grows with speed and stays within its range', () => {
    const sweeps = [0, 0.1, 0.3, 0.55, 0.8, 1, 1.5].map((speed) => arcSweep(speed, 0.1));
    for (let i = 1; i < sweeps.length; i++) {
      expect(sweeps[i]).toBeGreaterThanOrEqual(sweeps[i - 1] ?? 0);
    }
    expect(deg(sweeps[0] ?? 0)).toBeCloseTo(30);
    expect(deg(sweeps.at(-1) ?? 0)).toBeCloseTo(200);
  });
});
