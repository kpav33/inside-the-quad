import { describe, expect, it } from 'vitest';

import { groundFit, vtxGaugeSegments } from './vtx-gauge';

describe('vtxGaugeSegments', () => {
  it('lights one segment per heat level', () => {
    expect(vtxGaugeSegments(0)).toEqual([false, false, false]);
    expect(vtxGaugeSegments(1)).toEqual([true, false, false]);
    expect(vtxGaugeSegments(2)).toEqual([true, true, false]);
    expect(vtxGaugeSegments(3)).toEqual([true, true, true]);
  });
});

describe('groundFit', () => {
  it('holds the drone hovering, the drone on the ground, and the whole ground line', () => {
    const radius = 0.2;
    const ground = -0.2;
    const bottom = 0.03;
    const fit = groundFit(radius, ground, bottom);
    const inside = (y: number, x = 0) => Math.hypot(x, y - fit.centreY) <= fit.radius + 1e-9;
    // the drone's sphere at hover and resting on the ground
    expect(inside(radius)).toBe(true);
    expect(inside(ground - radius)).toBe(true);
    // the ground line's ends
    expect(inside(fit.lineY, fit.lineHalf)).toBe(true);
    expect(inside(fit.lineY, -fit.lineHalf)).toBe(true);
    expect(fit.lineY).toBeCloseTo(ground - bottom);
    expect(fit.lineHalf).toBeGreaterThan(radius);
  });
});
