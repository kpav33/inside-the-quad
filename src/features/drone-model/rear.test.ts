import { describe, expect, it } from 'vitest';

import { INCH_MM, REFERENCE_5_INCH } from '@/shared/domain/drone-spec';

import { BATTERY_PAD_MM } from './dimensions';
import { motorPlacements } from './layout';
import { type Box, boxesOverlap, escBox, rearBay, standoffBoxes, xt60Box } from './rear';
import { explodedOffsets, stackLayers } from './stack';

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

  it('points the VTX antenna out of the back of the frame', () => {
    expect(bay.vtxAntenna.tip[2]).toBeGreaterThan(spec.frame.bodyLengthMm / 2);
  });

  it('mounts the receiver antenna on a rear arm, off the carbon body and clear of the props', () => {
    const { bodyWidthMm } = spec.frame;
    const propRadius = (spec.prop.diameterIn * INCH_MM) / 2;
    const { start, tip, barEnds } = bay.receiverAntenna;
    expect(Math.abs(start[0])).toBeGreaterThan(bodyWidthMm / 2);
    for (const [x, , z] of [tip, ...barEnds]) {
      expect(Math.abs(x)).toBeGreaterThan(bodyWidthMm / 2);
      for (const { position } of motorPlacements(spec)) {
        const distance = Math.hypot(x - position[0] * 1000, z - position[2] * 1000);
        expect(distance).toBeGreaterThanOrEqual(propRadius + 2);
      }
    }
  });
});

describe('rear bay in the open frame', () => {
  const lift = explodedOffsets(spec, true);
  const raise = ({ centre: [x, y, z], size }: Box, by: number): Box => ({
    centre: [x, y + by, z],
    size,
  });
  const vtx = raise(bay.vtx, lift.rearBay);
  const receiver = raise(bay.receiver, lift.rearBay);

  it('lifts the VTX and receiver up into the gap', () => {
    expect(lift.rearBay).toBeGreaterThan(0);
  });

  it('keeps them under the lifted top plate and clear of the lifted ESC and its capacitor', () => {
    const plateBottom = layers.topPlate.bottomMm + lift.topPlate;
    for (const [name, box] of Object.entries({ vtx, receiver })) {
      expect(box.centre[1] + box.size[1] / 2, name).toBeLessThan(plateBottom);
      expect(boxesOverlap(box, raise(escBox(spec), lift.esc)), `${name} / esc`).toBe(false);
      expect(boxesOverlap(box, raise(bay.capacitor, lift.esc)), `${name} / capacitor`).toBe(false);
      for (const [standoff, b] of Object.entries(standoffBoxes(spec))) {
        expect(boxesOverlap(box, b), `${name} / ${standoff}`).toBe(false);
      }
    }
  });
});
