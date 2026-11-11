import { describe, expect, it } from 'vitest';

import { REFERENCE_5_INCH } from '@/shared/domain/drone-spec';

import { explodedOffsets, STACK_LAYERS, stackLayers, stepLift } from './stack';

const MIN_GAP_MM = 8;

describe('stack layers', () => {
  const layers = stackLayers(REFERENCE_5_INCH);

  it('stacks the ESC, flight controller and top plate in order when closed', () => {
    expect(layers.esc.bottomMm).toBeGreaterThan(REFERENCE_5_INCH.frame.armThicknessMm);
    expect(layers.esc.topMm).toBeLessThan(layers.fc.bottomMm);
    expect(layers.fc.bottomMm).toBeLessThan(layers.fc.topMm);
    expect(layers.fc.topMm).toBeLessThan(layers.topPlate.bottomMm);
  });

  it('does not move anything when closed', () => {
    expect(explodedOffsets(REFERENCE_5_INCH, false)).toEqual({
      esc: 0,
      fc: 0,
      topPlate: 0,
      rearBay: 0,
    });
  });

  it('separates every layer by a clear gap when open', () => {
    const offsets = explodedOffsets(REFERENCE_5_INCH, true);
    const pairs = [
      ['esc', 'fc'],
      ['fc', 'topPlate'],
    ] as const;
    expect(pairs.flat()).toEqual(expect.arrayContaining([...STACK_LAYERS]));
    for (const [below, above] of pairs) {
      const belowTop = layers[below].topMm + offsets[below];
      const aboveBottom = layers[above].bottomMm + offsets[above];
      expect(aboveBottom - belowTop, `${below} → ${above}`).toBeGreaterThanOrEqual(MIN_GAP_MM);
    }
  });
});

describe('stepLift', () => {
  it('jumps straight to the target when motion is reduced', () => {
    expect(stepLift(0, 50, 1 / 60, true)).toEqual({ value: 50, settled: true });
  });

  it.each([-20, 0, 37, 80])('eases from %d to the target without overshooting', (start) => {
    const target = 50;
    let current = start;
    let steps = 0;
    for (; steps < 120; steps++) {
      const next = stepLift(current, target, 1 / 60, false);
      expect(Math.abs(target - next.value)).toBeLessThanOrEqual(Math.abs(target - current));
      current = next.value;
      if (next.settled) break;
    }
    expect(steps).toBeLessThan(120);
    expect(current).toBe(target);
  });
});
