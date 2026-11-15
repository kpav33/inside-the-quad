import { type Axes, mixMotors, type MotorSpeeds } from './mixer';

export type { Axes, MotorSpeeds } from './mixer';

/** The sticks: throttle 0–1; the others −1 to 1, + is yaw right, pitch forward (up), roll right. */
export interface StickInput {
  throttle: number;
  yaw: number;
  pitch: number;
  roll: number;
}

/** Throttle at which the drone holds its height. */
export const HOVER_THROTTLE = 0.5;

export const CENTRED: StickInput = { throttle: HOVER_THROTTLE, yaw: 0, pitch: 0, roll: 0 };

/** The fastest the sheet lets the drone turn: real quads spin 6–8 times faster. */
export const MAX_RATE_DPS = 90;

export type Quaternion = readonly [x: number, y: number, z: number, w: number];
export type Vec3 = readonly [x: number, y: number, z: number];

export interface FlightState {
  /** Body to scene rotation. The drone's front is −z, right +x, up +y. */
  attitude: Quaternion;
  /** Measured rotation rate (the gyro), rad/s per axis. */
  rate: Axes;
  /** Wanted rotation rate from the sticks, rad/s per axis. */
  wanted: Axes;
  /** The flight controller's memory of drift since the stick was centred (the I term). */
  held: Axes;
  /** How far throttle has lifted (+) or dropped (−) the drone, scene metres. */
  height: number;
  motors: MotorSpeeds;
}

const MAX_RATE = (MAX_RATE_DPS * Math.PI) / 180;
const AXES = ['roll', 'pitch', 'yaw'] as const;

// A rate controller on a body with air drag. Feed-forward covers the drag, so a held stick turns
// at its rate and keeps the motors apart; P and I are critically damped, so a knock comes back to
// the held angle without swinging past it.
const KP = 6;
const DRAG = 2;
const KI = ((KP + DRAG) / 2) ** 2;
const FEED_FORWARD = DRAG;
/** Turning effort (rad/s²) to motor-speed difference. */
const MIX_SCALE = 0.02;
const MAX_MIX = 0.25;
const HELD_MAX = Math.PI;

const SUBSTEP_S = 1 / 240;
const MAX_STEP_S = 0.1;

/** Throttle's hint of height: full throttle lifts the drone this far, zero drops it as far. */
const RISE_M = 0.03;
const RISE_EASE = 3;

/** The knock a gust gives, rad/s: mostly roll, some pitch. */
const GUST = { roll: (200 * Math.PI) / 180, pitch: (100 * Math.PI) / 180 };

const ZERO: Axes = { roll: 0, pitch: 0, yaw: 0 };
const clamp = (value: number, low: number, high: number) => Math.min(Math.max(value, low), high);

function multiply(a: Quaternion, b: Quaternion): Quaternion {
  const [ax, ay, az, aw] = a;
  const [bx, by, bz, bw] = b;
  return [
    aw * bx + ax * bw + ay * bz - az * by,
    aw * by - ax * bz + ay * bw + az * bx,
    aw * bz + ax * by - ay * bx + az * bw,
    aw * bw - ax * bx - ay * by - az * bz,
  ];
}

function normalise([x, y, z, w]: Quaternion): Quaternion {
  const length = Math.hypot(x, y, z, w);
  return [x / length, y / length, z / length, w / length];
}

/** A point on the drone (body coordinates) in the scene, after the attitude's rotation. */
export function rotatePoint(attitude: Quaternion, [px, py, pz]: Vec3): Vec3 {
  const [x, y, z, w] = attitude;
  const [qx, qy, qz] = multiply(multiply([x, y, z, w], [px, py, pz, 0]), [-x, -y, -z, w]);
  return [qx, qy, qz];
}

/**
 * The body-rate rotation over a time step. Roll turns about the nose (−z), so roll right drops
 * the right side; pitch about −x, so pitch forward drops the nose; yaw about −y, so yaw right
 * turns the nose clockwise seen from above.
 */
function turn(rate: Axes, dt: number): Quaternion {
  const omega: Vec3 = [-rate.pitch, -rate.yaw, -rate.roll];
  const speed = Math.hypot(...omega);
  if (speed === 0) return [0, 0, 0, 1];
  const half = (speed * dt) / 2;
  const s = Math.sin(half) / speed;
  return [omega[0] * s, omega[1] * s, omega[2] * s, Math.cos(half)];
}

/** Level, still, at hover. */
export function initialFlight(): FlightState {
  return {
    attitude: [0, 0, 0, 1],
    rate: ZERO,
    wanted: ZERO,
    held: ZERO,
    height: 0,
    motors: mixMotors(HOVER_THROTTLE, ZERO),
  };
}

function substep(state: FlightState, sticks: StickInput, dt: number): FlightState {
  const rate = { ...state.rate };
  const wanted = { ...ZERO };
  const held = { ...state.held };
  const effort = { ...ZERO };
  for (const axis of AXES) {
    const stick = clamp(sticks[axis], -1, 1);
    wanted[axis] = stick * MAX_RATE;
    const error = wanted[axis] - rate[axis];
    // The angle to hold is wherever the drone is when the stick comes back to centre; while the
    // stick is off centre nothing is held (Betaflight's "I term relax").
    held[axis] = stick === 0 ? clamp(held[axis] + error * dt, -HELD_MAX, HELD_MAX) : 0;
    effort[axis] = KP * error + KI * held[axis] + FEED_FORWARD * wanted[axis];
    rate[axis] += (effort[axis] - DRAG * rate[axis]) * dt;
  }
  const target = (clamp(sticks.throttle, 0, 1) - HOVER_THROTTLE) * 2 * RISE_M;
  return {
    attitude: normalise(multiply(state.attitude, turn(rate, dt))),
    rate,
    wanted,
    held,
    height: state.height + (target - state.height) * Math.min(1, RISE_EASE * dt),
    motors: mixMotors(sticks.throttle, {
      roll: clamp(effort.roll * MIX_SCALE, -MAX_MIX, MAX_MIX),
      pitch: clamp(effort.pitch * MIX_SCALE, -MAX_MIX, MAX_MIX),
      yaw: clamp(effort.yaw * MIX_SCALE, -MAX_MIX, MAX_MIX),
    }),
  };
}

/**
 * The drone a time step later. A long step (a hidden tab, a slow phone) is cut to 0.1 s and run
 * in small fixed substeps, so the model stays stable at any frame rate.
 */
export function stepFlight(state: FlightState, sticks: StickInput, dtS: number): FlightState {
  const dt = clamp(dtS, 0, MAX_STEP_S);
  const steps = Math.ceil(dt / SUBSTEP_S);
  let next = state;
  for (let i = 0; i < steps; i++) next = substep(next, sticks, dt / steps);
  return next;
}

/** A sudden knock, as from a gust of wind; `n` alternates its side (even: one way, odd: back). */
export function gust(state: FlightState, n: number): FlightState {
  const sign = n % 2 === 0 ? 1 : -1;
  return {
    ...state,
    rate: {
      roll: state.rate.roll + sign * GUST.roll,
      pitch: state.rate.pitch + sign * GUST.pitch,
      yaw: state.rate.yaw,
    },
  };
}

/** Upright, facing front, at rest; throttle and height are left as they are. */
export function level(state: FlightState): FlightState {
  const mean = state.motors.reduce((sum, speed) => sum + speed, 0) / state.motors.length;
  return {
    ...state,
    attitude: [0, 0, 0, 1],
    rate: ZERO,
    held: ZERO,
    motors: [mean, mean, mean, mean],
  };
}

const STILL_RATE = (0.2 * Math.PI) / 180;
const STILL_HELD = 1e-3;
const STILL_HEIGHT = 1e-4;

/** Nothing left to move: sticks centred, rotation stopped, the held angle reached, height eased. */
export function isSettled(state: FlightState, sticks: StickInput): boolean {
  const target = (clamp(sticks.throttle, 0, 1) - HOVER_THROTTLE) * 2 * RISE_M;
  return (
    AXES.every(
      (axis) =>
        sticks[axis] === 0 &&
        Math.abs(state.rate[axis]) < STILL_RATE &&
        Math.abs(state.held[axis]) < STILL_HELD,
    ) && Math.abs(state.height - target) < STILL_HEIGHT
  );
}
