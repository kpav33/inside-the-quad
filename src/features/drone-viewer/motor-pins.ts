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
  const free = ([x, y]: ScreenPoint) =>
    x - halfW >= 0 &&
    y - halfH >= 0 &&
    x + halfW <= field.width &&
    y + halfH <= field.height &&
    !avoid.some(
      (rect) =>
        x - halfW < rect.right &&
        rect.left < x + halfW &&
        y - halfH < rect.bottom &&
        rect.top < y + halfH,
    );
  if (free(base)) return base;
  // Search outward in rings, nearest first: up, down, the sides, then the corners.
  const stepX = box.width + GAP_PX;
  const stepY = box.height + GAP_PX;
  for (let ring = 1; ring <= RINGS; ring++) {
    for (const [ux, uy] of DIRECTIONS) {
      const spot: ScreenPoint = [base[0] + ux * stepX * ring, base[1] + uy * stepY * ring];
      if (free(spot)) return spot;
    }
  }
  return base;
}
