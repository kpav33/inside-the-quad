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

interface Size {
  width: number;
  height: number;
}

const clamp = (value: number, low: number, high: number) =>
  Math.min(Math.max(value, low), Math.max(low, high));

/**
 * Where a motor's balloon is centred: beside the motor on screen, pushed outward from the drone's
 * projected middle, kept inside the field and lifted clear of any box in `avoid` (the sticks).
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
  const x = clamp(motor[0] + (dx / length) * OFFSET_PX, halfW, field.width - halfW);
  let y = clamp(motor[1] + (dy / length) * OFFSET_PX, halfH, field.height - halfH);
  // Lift the balloon over whatever it covers until it covers nothing (or reaches the top).
  for (let pass = 0; pass <= avoid.length; pass++) {
    const hit = avoid.find(
      (rect) =>
        x - halfW < rect.right &&
        rect.left < x + halfW &&
        y - halfH < rect.bottom &&
        rect.top < y + halfH,
    );
    if (!hit) break;
    y = Math.max(halfH, hit.top - GAP_PX - halfH);
  }
  return [x, y];
}
