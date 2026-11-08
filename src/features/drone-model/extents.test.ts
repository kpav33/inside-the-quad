import { describe, expect, it } from 'vitest';

import { INCH_MM, REFERENCE_5_INCH } from '@/shared/domain/drone-spec';

import { motorTopMm, PROP_HUB_HEIGHT_MM } from './dimensions';
import { closedExtentsMm } from './extents';
import { stackLayers } from './stack';

describe('closedExtentsMm', () => {
  const spec = REFERENCE_5_INCH;
  const extents = closedExtentsMm(spec);

  it('reaches the prop tips in every direction around the motors', () => {
    const tip = spec.frame.wheelbaseMm / 2 / Math.SQRT2 + (spec.prop.diameterIn * INCH_MM) / 2;
    expect(extents.halfWidthMm).toBeCloseTo(tip, 6);
  });

  it('runs from the bottom of the frame to the highest closed part', () => {
    expect(extents.bottomMm).toBe(0);
    const batteryTop = stackLayers(spec).topPlate.topMm + spec.battery.packHeightMm;
    const propTop = motorTopMm(spec) + PROP_HUB_HEIGHT_MM;
    expect(extents.topMm).toBe(Math.max(batteryTop, propTop));
  });
});
