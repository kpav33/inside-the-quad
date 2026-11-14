import { describe, expect, it } from 'vitest';

import { REFERENCE_5_INCH } from '@/shared/domain/drone-spec';

import { motorPlacements } from './layout';
import { arrowHead, type Point2, spinArcPoints } from './spin-arc';

/** The point at `index` (negative counts from the end); fails the test if there is none. */
function at(points: readonly Point2[], index: number): Point2 {
  const point = points.at(index);
  if (!point) throw new Error(`no point at ${index}`);
  return point;
}

const cross = ([x1, z1]: Point2, [x2, z2]: Point2) => x1 * z2 - z1 * x2;

describe('spinArcPoints', () => {
  const sweep = Math.PI / 2;

  it('runs clockwise seen from above for a cw prop', () => {
    const points = spinArcPoints('cw', 50, 0, sweep, 12);
    for (let i = 1; i < points.length; i++) {
      expect(cross(at(points, i - 1), at(points, i))).toBeGreaterThan(0);
    }
  });

  it('runs anticlockwise for a ccw prop', () => {
    const points = spinArcPoints('ccw', 50, 0, sweep, 12);
    for (let i = 1; i < points.length; i++) {
      expect(cross(at(points, i - 1), at(points, i))).toBeLessThan(0);
    }
  });

  it('lies on its radius and spans its sweep', () => {
    const points = spinArcPoints('cw', 50, 0.3, sweep, 12);
    expect(points).toHaveLength(13);
    for (const [x, z] of points) expect(Math.hypot(x, z)).toBeCloseTo(50, 9);
    const [first, last] = [at(points, 0), at(points, -1)];
    const turned = Math.atan2(cross(first, last), first[0] * last[0] + first[1] * last[1]);
    expect(turned).toBeCloseTo(sweep, 9);
  });

  it('makes the front props spin inwards, towards the camera (props in)', () => {
    const front = motorPlacements(REFERENCE_5_INCH).filter(({ position: [, , z] }) => z < 0);
    expect(front).toHaveLength(2);
    for (const { position, spin } of front) {
      // Start at the prop's front-most point (angle −90°, towards −z) and take one step.
      const step = spinArcPoints(spin, 50, -Math.PI / 2, 0.1, 1);
      const towardsCentre = -Math.sign(position[0]);
      expect(Math.sign(at(step, 1)[0] - at(step, 0)[0])).toBe(towardsCentre);
    }
  });
});

describe('arrowHead', () => {
  it('puts the tip on the last point with both wings pointing back along the arc', () => {
    const points = spinArcPoints('cw', 50, 0, Math.PI / 2, 12);
    const [left, tip, right] = arrowHead(points, 6);
    const last = at(points, -1);
    const before = at(points, -2);
    expect(tip).toEqual(last);
    for (const wing of [left, right]) {
      const back =
        (wing[0] - tip[0]) * (before[0] - last[0]) + (wing[1] - tip[1]) * (before[1] - last[1]);
      expect(back).toBeGreaterThan(0);
      expect(Math.hypot(wing[0] - tip[0], wing[1] - tip[1])).toBeCloseTo(6, 9);
    }
    expect(left).not.toEqual(right);
  });
});
