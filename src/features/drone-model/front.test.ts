import { describe, expect, it } from 'vitest';

import { REFERENCE_5_INCH } from '@/shared/domain/drone-spec';

import { cameraPlacement, cameraPlates } from './front';
import { type Box, boxesOverlap, escBox, standoffBoxes } from './rear';
import { stackLayers } from './stack';

const spec = REFERENCE_5_INCH;

describe('front of the frame', () => {
  const { centre, tiltRad } = cameraPlacement(spec);
  const width = spec.camera.widthMm;
  // The camera body as a box big enough to hold it at any tilt.
  const reach = Math.hypot(width, 18) / 2;
  const camera: Box = { centre, size: [width, reach * 2, reach * 2] };

  it('tilts the camera up by the spec angle', () => {
    expect(tiltRad).toBeCloseTo((spec.camera.tiltDeg * Math.PI) / 180, 10);
  });

  it('fits the camera between its plates, under the top plate and clear of the ESC', () => {
    const [left, right] = cameraPlates(spec);
    expect(boxesOverlap(camera, left)).toBe(false);
    expect(boxesOverlap(camera, right)).toBe(false);
    expect(boxesOverlap(camera, escBox(spec))).toBe(false);
    expect(centre[1] + reach).toBeLessThanOrEqual(stackLayers(spec).topPlate.bottomMm);
  });

  it('keeps the plates clear of the standoffs', () => {
    for (const plate of cameraPlates(spec)) {
      for (const [name, standoff] of Object.entries(standoffBoxes(spec))) {
        expect(boxesOverlap(plate, standoff), name).toBe(false);
      }
    }
  });
});
