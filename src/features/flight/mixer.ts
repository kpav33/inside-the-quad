/** Turning effort per axis, or a rate per axis. + is roll right, pitch forward, yaw right. */
export interface Axes {
  roll: number;
  pitch: number;
  yaw: number;
}

/** Motor speeds 0–1, motors 1–4 in Betaflight order (rear-right, front-right, rear-left, front-left). */
export type MotorSpeeds = readonly [m1: number, m2: number, m3: number, m4: number];

/** The slowest a motor turns while armed: it never stops in flight. */
export const IDLE = 0.1;

/**
 * Per motor, how each axis' effort changes its speed, for this drone's Quad X, props-in layout.
 * Roll right: the left motors (3, 4) push harder. Pitch forward: the rear motors (1, 3). Yaw
 * right: the counter-clockwise pair (2, 3), whose twist on the frame turns it clockwise.
 */
const MIX: readonly Axes[] = [
  { roll: -1, pitch: 1, yaw: -1 }, // 1 rear-right, CW
  { roll: -1, pitch: -1, yaw: 1 }, // 2 front-right, CCW
  { roll: 1, pitch: 1, yaw: 1 }, // 3 rear-left, CCW
  { roll: 1, pitch: -1, yaw: -1 }, // 4 front-left, CW
];

const clamp = (value: number, low: number, high: number) => Math.min(Math.max(value, low), high);

/** Four motor speeds from throttle (0–1) and each axis' effort (motor-speed units, about ±0.25). */
export function mixMotors(throttle: number, effort: Axes): MotorSpeeds {
  const base = IDLE + clamp(throttle, 0, 1) * (1 - IDLE);
  const [a, b, c, d] = MIX.map((m) =>
    clamp(base + m.roll * effort.roll + m.pitch * effort.pitch + m.yaw * effort.yaw, IDLE, 1),
  ) as [number, number, number, number];
  return [a, b, c, d];
}
