import type { Rect, ScreenPoint } from '@/features/drone-model';
import type { MotorSpeeds } from '@/features/flight';

/** Within this of the four motors' mean, a motor reads as spinning like the others. */
const EVEN = 0.03;

/** Whether a motor spins faster or slower than the others, or alike. */
export function motorPinState(speeds: MotorSpeeds, index: number): 'up' | 'down' | 'even' {
  const mean = speeds.reduce((sum, speed) => sum + speed, 0) / speeds.length;
  const speed = speeds[index] ?? mean;
  if (speed > mean + EVEN) return 'up';
  if (speed < mean - EVEN) return 'down';
  return 'even';
}

/** How far a balloon sits beyond its motor, away from the drone's middle. */
const OFFSET_PX = 28;
const GAP_PX = 4;
const RINGS = 4;
const DIRECTIONS: readonly [number, number][] = [
  [0, -1],
  [0, 1],
  [-1, 0],
  [1, 0],
  [-1, -1],
  [1, -1],
  [-1, 1],
  [1, 1],
];

interface Size {
  width: number;
  height: number;
}

const clamp = (value: number, low: number, high: number) =>
  Math.min(Math.max(value, low), Math.max(low, high));

/**
 * Where a motor's balloon is centred: beside the motor on screen, pushed outward from the drone's
 * projected middle, kept inside the field and clear of every box in `avoid` (the sticks and the
 * balloons placed before it): when that spot is taken, the nearest free one around it.
 */
export function placeMotorPin(
  motor: ScreenPoint,
  centre: ScreenPoint,
  box: Size,
  field: Size,
  avoid: readonly Rect[],
): ScreenPoint {
  const dx = motor[0] - centre[0];
  const dy = motor[1] - centre[1];
  const length = Math.hypot(dx, dy) || 1;
  const halfW = box.width / 2;
  const halfH = box.height / 2;
  const base: ScreenPoint = [
    clamp(motor[0] + (dx / length) * OFFSET_PX, halfW, field.width - halfW),
    clamp(motor[1] + (dy / length) * OFFSET_PX, halfH, field.height - halfH),
  ];
  const inField = ([x, y]: ScreenPoint) =>
    x - halfW >= 0 && y - halfH >= 0 && x + halfW <= field.width && y + halfH <= field.height;
  /** How much of the boxes a balloon here would cover, in px². */
  const covered = ([x, y]: ScreenPoint) =>
    avoid.reduce(
      (sum, rect) =>
        sum +
        Math.max(0, Math.min(x + halfW, rect.right) - Math.max(x - halfW, rect.left)) *
          Math.max(0, Math.min(y + halfH, rect.bottom) - Math.max(y - halfH, rect.top)),
      0,
    );
  // Search outward in rings, nearest first: up, down, the sides, then the corners. The first spot
  // that covers nothing wins; in a drawing too small for that, the one that covers least.
  let best = base;
  let least = covered(base);
  if (least === 0) return base;
  const stepX = box.width + GAP_PX;
  const stepY = box.height + GAP_PX;
  for (let ring = 1; ring <= RINGS; ring++) {
    for (const [ux, uy] of DIRECTIONS) {
      for (const share of [0.5, 1]) {
        const spot: ScreenPoint = [
          clamp(base[0] + ux * stepX * ring * share, halfW, field.width - halfW),
          clamp(base[1] + uy * stepY * ring * share, halfH, field.height - halfH),
        ];
        if (!inField(spot)) continue;
        const cover = covered(spot);
        if (cover === 0) return spot;
        if (cover < least) {
          best = spot;
          least = cover;
        }
      }
    }
  }
  return best;
}
