import { describe, expect, it } from 'vitest';

import { REFERENCE_5_INCH } from '@/shared/domain/drone-spec';

import { BATTERY_PAD_MM } from './dimensions';
import { type Box, boxesOverlap, escBox, rearBay, standoffBoxes, xt60Box } from './rear';
import { stackLayers } from './stack';

const spec = REFERENCE_5_INCH;
const bay = rearBay(spec);
const layers = stackLayers(spec);

function batteryBox(): Box {
  const { packWidthMm, packHeightMm, packLengthMm } = spec.battery;
  const bottom = layers.topPlate.topMm + BATTERY_PAD_MM;
  return {
    centre: [0, bottom + packHeightMm / 2, 0],
    size: [packWidthMm, packHeightMm, packLengthMm],
  };
}

describe('boxesOverlap', () => {
  const a: Box = { centre: [0, 0, 0], size: [2, 2, 2] };
  it('is true for boxes that share space and false for boxes that only touch', () => {
    expect(boxesOverlap(a, { centre: [1, 1, 1], size: [2, 2, 2] })).toBe(true);
    expect(boxesOverlap(a, { centre: [2, 0, 0], size: [2, 2, 2] })).toBe(false);
  });
});

describe('rear bay', () => {
  const inBay = { vtx: bay.vtx, receiver: bay.receiver, capacitor: bay.capacitor };
  const others: Record<string, Box> = { esc: escBox(spec), ...standoffBoxes(spec) };

  it('keeps the VTX, receiver and capacitor apart from each other and from the ESC and standoffs', () => {
    const all = Object.entries({ ...inBay, ...others });
    for (const [i, [nameA, a]] of all.entries()) {
      for (const [nameB, b] of all.slice(i + 1)) {
        if (nameA in others && nameB in others) continue;
        expect(boxesOverlap(a, b), `${nameA} / ${nameB}`).toBe(false);
      }
    }
  });

  it('keeps the rear boards inside the body and under the top plate', () => {
    const { bodyWidthMm, bodyLengthMm, armThicknessMm } = spec.frame;
    for (const [name, { centre, size }] of Object.entries(inBay)) {
      expect(Math.abs(centre[0]) + size[0] / 2, name).toBeLessThanOrEqual(bodyWidthMm / 2);
      expect(Math.abs(centre[2]) + size[2] / 2, name).toBeLessThanOrEqual(bodyLengthMm / 2);
      expect(centre[1] - size[1] / 2, name).toBeGreaterThanOrEqual(armThicknessMm);
      expect(centre[1] + size[1] / 2, name).toBeLessThanOrEqual(layers.topPlate.bottomMm);
    }
  });

  it('puts the GPS clear of the battery and its XT60 plug', () => {
    expect(boxesOverlap(bay.gps, batteryBox())).toBe(false);
    expect(boxesOverlap(bay.gps, xt60Box(spec))).toBe(false);
    expect(boxesOverlap(bay.gpsPost, batteryBox())).toBe(false);
    expect(boxesOverlap(bay.gpsPost, xt60Box(spec))).toBe(false);
  });

  it('points both antennas out of the back of the frame', () => {
    expect(bay.vtxAntenna.tip[2]).toBeGreaterThan(spec.frame.bodyLengthMm / 2);
    expect(bay.receiverAntenna.tip[2]).toBeGreaterThan(spec.frame.bodyLengthMm / 2);
  });
});
