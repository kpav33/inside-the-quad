import type { SpinDirection } from './layout';

export type Point2 = [x: number, z: number];

/**
 * An arc around a prop's hub in the horizontal plane, in travel order: `segments + 1` points at
 * `radius`, starting at `startRad` and turning `sweepRad` the way the prop spins. Angles are
 * `atan2(z, x)`; seen from above (+y), clockwise is increasing angle.
 */
export function spinArcPoints(
  spin: SpinDirection,
  radius: number,
  startRad: number,
  sweepRad: number,
  segments: number,
): Point2[] {
  const sign = spin === 'cw' ? 1 : -1;
  return Array.from({ length: segments + 1 }, (_, i) => {
    const angle = startRad + (sign * sweepRad * i) / segments;
    return [radius * Math.cos(angle), radius * Math.sin(angle)];
  });
}

const WING_RAD = (28 * Math.PI) / 180;

/** An open arrowhead at the arc's end: two wings of `length` angled back along the arc. */
export function arrowHead(points: readonly Point2[], length: number): [Point2, Point2, Point2] {
  const tip = points.at(-1);
  const before = points.at(-2);
  if (!tip || !before) throw new Error('an arrowhead needs at least two points');
  const back = Math.atan2(before[1] - tip[1], before[0] - tip[0]);
  const wing = (turn: number): Point2 => [
    tip[0] + length * Math.cos(back + turn),
    tip[1] + length * Math.sin(back + turn),
  ];
  return [wing(WING_RAD), tip, wing(-WING_RAD)];
}
