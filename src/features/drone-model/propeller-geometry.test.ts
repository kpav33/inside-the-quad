import { Euler, Vector3 } from 'three';
import { describe, expect, it } from 'vitest';

import { bladeTwist } from './propeller-geometry';

/**
 * A blade lies along +x, with its edges at ±z. Seen from above (+y), x points right and z points
 * down the screen, so a clockwise prop moves its +x blade towards +z: the +z edge leads.
 * A counter-clockwise prop leads with the −z edge.
 */
function leadingEdgeHeight(spin: 'cw' | 'ccw'): number {
  const leadingEdge = new Vector3(0, 0, spin === 'cw' ? 1 : -1);
  return leadingEdge.applyEuler(new Euler(bladeTwist(spin), 0, 0)).y;
}

describe('bladeTwist', () => {
  it('tilts the leading edge up on clockwise props, so they push air down', () => {
    expect(leadingEdgeHeight('cw')).toBeGreaterThan(0);
  });

  it('tilts the leading edge up on counter-clockwise props, so they push air down', () => {
    expect(leadingEdgeHeight('ccw')).toBeGreaterThan(0);
  });

  it('uses a 12° blade angle', () => {
    expect(Math.abs(bladeTwist('cw'))).toBeCloseTo((12 * Math.PI) / 180, 10);
  });
});
