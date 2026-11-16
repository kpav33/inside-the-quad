import type { Vec3 } from '@/features/drone-model';

/** The step for the first frame after a rest: short, so the drone never jumps. */
const WAKE_STEP_S = 1 / 60;

/**
 * How much time a frame advances the flight. The canvas draws on demand, so the first frame after
 * a rest arrives with the whole rest as its delta: that one is a short step. Every other frame, slow
 * or not, advances by the time it really took, so the sheet keeps its pace on a slow device.
 */
export function frameStep(delta: number, waking: boolean): number {
  return waking ? WAKE_STEP_S : delta;
}

type Quaternion = readonly [x: number, y: number, z: number, w: number];

/** The height (y) a point ends up at after the attitude turns it about the origin. */
function turnedY([px, py, pz]: readonly [number, number, number], [x, y, z, w]: Quaternion) {
  // The y row of the rotation matrix for a unit quaternion.
  return 2 * (x * y + w * z) * px + (1 - 2 * (x * x + z * z)) * py + 2 * (y * z - w * x) * pz;
}

/**
 * Where the drone is drawn on its way down and once down: the model's height, lifted when the drone's
 * lowest point (outline `points` about its middle, turned by the attitude) would go below the floor
 * at `floor`. A crash rests on the ground, upside down or not, instead of sinking through it.
 */
export function restingLift(
  points: readonly Vec3[],
  attitude: Quaternion,
  height: number,
  floor: number,
): number {
  const lowest = Math.min(...points.map((point) => turnedY(point, attitude)));
  return Math.max(height, floor - lowest);
}
