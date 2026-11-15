import { describe, expect, it } from 'vitest';

import { REFERENCE_5_INCH as spec } from '@/shared/domain/drone-spec';

import { motorTopMm } from './dimensions';
import { droneOutlineMm } from './extents';
import { motorPlacements } from './layout';
import { anchorPoints, endPoint, leaderSegments, leftTipCorners } from './path-anchors';
import { rearBay, type Vec3 } from './rear';
import { explodedOffsets } from './stack';

const closed = explodedOffsets(spec, false);
const open = explodedOffsets(spec, true);
const motorsMm = motorPlacements(spec).map(({ position: [x, , z] }) => [x * 1000, z * 1000]);

describe('anchorPoints', () => {
  it('puts one point on top of each motor, in motor order', () => {
    const points = anchorPoints(spec, 'motors', closed);
    expect(points).toHaveLength(4);
    points.forEach(([x, y, z], i) => {
      expect(x).toBeCloseTo(motorsMm[i]?.[0] ?? NaN);
      expect(z).toBeCloseTo(motorsMm[i]?.[1] ?? NaN);
      expect(y).toBeCloseTo(spec.frame.armThicknessMm + motorTopMm(spec));
    });
  });

  it('puts each propeller point above its motor', () => {
    const motors = anchorPoints(spec, 'motors', closed);
    const props = anchorPoints(spec, 'props', closed);
    props.forEach(([x, y, z], i) => {
      const [mx = NaN, my = NaN, mz = NaN] = motors[i] ?? [];
      expect([x, z]).toEqual([mx, mz]);
      expect(y).toBeGreaterThan(my);
    });
  });

  it('lifts a board with its layer when the frame is open', () => {
    const [shut] = anchorPoints(spec, 'fc', closed);
    const [lifted] = anchorPoints(spec, 'fc', open);
    expect((lifted?.[1] ?? 0) - (shut?.[1] ?? 0)).toBeCloseTo(open.fc);
  });

  it('touches the receiver antenna between the ends of its cross bar', () => {
    const [[x, y, z] = [NaN, NaN, NaN]] = anchorPoints(spec, 'receiverAntenna', open);
    const [a, b] = rearBay(spec).receiverAntenna.barEnds;
    expect(x).toBeCloseTo((a[0] + b[0]) / 2);
    expect(y).toBeCloseTo((a[1] + b[1]) / 2);
    expect(z).toBeCloseTo((a[2] + b[2]) / 2);
  });

  it('gives the off-drone ends their end points', () => {
    expect(anchorPoints(spec, 'radio', open)).toEqual([endPoint(spec, 'radio')]);
    expect(anchorPoints(spec, 'goggles', open)).toEqual([endPoint(spec, 'goggles')]);
  });
});

describe('endPoint', () => {
  const [front, rear] = leftTipCorners(spec);
  const outline = droneOutlineMm(spec);

  it('takes the front and rear blade-tip corners on the left of the fitted outline', () => {
    expect(outline).toContainEqual(front);
    expect(outline).toContainEqual(rear);
    expect(front[0]).toBeLessThan(0);
    expect(rear[0]).toBeLessThan(0);
    expect(front[2]).toBeLessThan(rear[2]);
  });

  it.each(['radio', 'goggles'] as const)('puts the %s between them, so it stays in view', (end) => {
    const point = endPoint(spec, end);
    const t = (point[2] - front[2]) / (rear[2] - front[2]);
    expect(t).toBeGreaterThan(0);
    expect(t).toBeLessThan(1);
    point.forEach((value, i) => {
      expect(value).toBeCloseTo((front[i] ?? 0) + t * ((rear[i] ?? 0) - (front[i] ?? 0)));
    });
  });

  it('puts the radio nearer the rear than the goggles', () => {
    expect(endPoint(spec, 'radio')[2]).toBeGreaterThan(endPoint(spec, 'goggles')[2]);
  });
});

describe('leaderSegments', () => {
  const p = (x: number): Vec3 => [x, 0, 0];

  it('fans out from one point to many', () => {
    expect(leaderSegments([p(0)], [p(1), p(2), p(3), p(4)])).toEqual([
      [p(0), p(1)],
      [p(0), p(2)],
      [p(0), p(3)],
      [p(0), p(4)],
    ]);
  });

  it('pairs equal counts by index', () => {
    expect(leaderSegments([p(0), p(10)], [p(1), p(11)])).toEqual([
      [p(0), p(1)],
      [p(10), p(11)],
    ]);
  });

  it('otherwise joins each target to its nearest source', () => {
    expect(leaderSegments([p(0), p(10)], [p(1), p(9), p(12)])).toEqual([
      [p(0), p(1)],
      [p(10), p(9)],
      [p(10), p(12)],
    ]);
  });
});
