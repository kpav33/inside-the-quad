import { describe, expect, it } from 'vitest';

import { mm, REFERENCE_5_INCH } from '@/shared/domain/drone-spec';

import { type MotorPlacement, motorPlacements } from './layout';

const placements = motorPlacements(REFERENCE_5_INCH);

function byNumber(n: MotorPlacement['number']): MotorPlacement {
  const placement = placements.find((p) => p.number === n);
  if (!placement) throw new Error(`motor ${n} missing`);
  return placement;
}

function distanceXZ(a: MotorPlacement, b: MotorPlacement): number {
  return Math.hypot(a.position[0] - b.position[0], a.position[2] - b.position[2]);
}

describe('motorPlacements', () => {
  it('follows Betaflight Quad X numbering with props-in spin directions', () => {
    expect(placements.map((p) => p.number)).toEqual([1, 2, 3, 4]);
    expect(placements.map((p) => p.corner)).toEqual([
      'rear-right',
      'front-right',
      'rear-left',
      'front-left',
    ]);
    expect(placements.map((p) => p.spin)).toEqual(['cw', 'ccw', 'ccw', 'cw']);
  });

  it('spaces diagonal motors by the wheelbase', () => {
    expect(distanceXZ(byNumber(2), byNumber(3))).toBeCloseTo(mm(225), 6);
    expect(distanceXZ(byNumber(1), byNumber(4))).toBeCloseTo(mm(225), 6);
  });

  it('puts front motors at negative z and right motors at positive x', () => {
    for (const p of placements) {
      expect(p.position[2] < 0).toBe(p.corner.startsWith('front'));
      expect(p.position[0] > 0).toBe(p.corner.endsWith('right'));
    }
  });

  it('seats every motor on top of the arms', () => {
    for (const p of placements) {
      expect(p.position[1]).toBeCloseTo(mm(REFERENCE_5_INCH.frame.armThicknessMm), 10);
    }
  });

  it('spins diagonal pairs the same way and neighbours opposite ways', () => {
    expect(byNumber(1).spin).toBe(byNumber(4).spin);
    expect(byNumber(2).spin).toBe(byNumber(3).spin);
    expect(byNumber(1).spin).not.toBe(byNumber(2).spin);
    expect(byNumber(1).spin).not.toBe(byNumber(3).spin);
  });
});
