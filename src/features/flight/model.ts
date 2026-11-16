import { type Faults, NO_FAULTS } from './faults';
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
  /** Armed: the motors run. Failsafe and a crash disarm it; only a reset arms it again. */
  armed: boolean;
  /** Seconds since the link was lost; 0 while it is fine. */
  linkLostS: number;
  /** How fast the drone is falling, m/s down; 0 unless it is falling. */
  fallSpeed: number;
  /** Down on the ground line after a fall. */
  onGround: boolean;
  /** How hot a VTX without antenna has run: 0 cool, 1 and over damaged. */
  vtxHeat: number;
  /** The VTX heat in words: none, Warm, Hot, Damaged. */
  vtxLevel: 0 | 1 | 2 | 3;
}

/** How long failsafe uses safe stick values before it disarms (Betaflight's guard time). */
export const FAILSAFE_GUARD_S = 1;
/** The height (scene metres, from where the drone hovers) it rests at after a fall. */
export const GROUND_M = -0.2;
/** About how long a VTX without antenna takes to be damaged on this sheet (illustrative). */
export const VTX_DAMAGE_S = 30;
const VTX_HOT = 0.6;
/** A slowed-down fall, like the slowed-down turns, so the drop can be watched (m/s², m/s). */
const GRAVITY = 2;
const MAX_FALL_SPEED = 1;
/** How hard the wrong prop's corner pushes the body over, per unit of motor 2's speed. */
const PROP_TORQUE = 15;

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
/** The most turning effort the motors can give on 6S: what the mix can still add or take away. */
const AUTHORITY = MAX_MIX / MIX_SCALE;
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
    armed: true,
    linkLostS: 0,
    fallSpeed: 0,
    onGround: false,
    vtxHeat: 0,
    vtxLevel: 0,
  };
}

const STOPPED: MotorSpeeds = [0, 0, 0, 0];

/** The sticks the flight controller acts on: during failsafe, safe values instead of the radio's. */
function effectiveSticks(sticks: StickInput, faults: Faults): StickInput {
  return faults.linkLost ? { ...CENTRED, throttle: 0 } : sticks;
}

function vtxLevelOf(heat: number): FlightState['vtxLevel'] {
  if (heat >= 1) return 3;
  if (heat >= VTX_HOT) return 2;
  return heat > 0 ? 1 : 0;
}

function substep(state: FlightState, radio: StickInput, dt: number, faults: Faults): FlightState {
  const vtxHeat = faults.vtxNoAntenna ? state.vtxHeat + dt / VTX_DAMAGE_S : state.vtxHeat;
  const linkLostS = faults.linkLost ? state.linkLostS + dt : 0;
  const heat = { vtxHeat, vtxLevel: vtxLevelOf(vtxHeat), linkLostS };
  if (state.onGround) return { ...state, ...heat };

  // Failsafe: after the guard time the drone is disarmed for good (until a reset).
  const armed = state.armed && !(faults.linkLost && linkLostS >= FAILSAFE_GUARD_S);
  const sticks = effectiveSticks(radio, faults);
  const share = faults.cells / 6;
  const authority = AUTHORITY * share;
  const rate = { ...state.rate };
  const wanted = { ...ZERO };
  const held = { ...state.held };
  const effort = { ...ZERO };
  for (const axis of AXES) {
    if (!armed) {
      held[axis] = 0;
      continue;
    }
    const stick = clamp(sticks[axis], -1, 1);
    wanted[axis] = stick * MAX_RATE;
    const error = wanted[axis] - rate[axis];
    // The angle to hold is wherever the drone is when the stick comes back to centre; while the
    // stick is off centre nothing is held (Betaflight's "I term relax").
    held[axis] = stick === 0 ? clamp(held[axis] + error * dt, -HELD_MAX, HELD_MAX) : 0;
    // The motors can only do so much: on a smaller battery, less.
    effort[axis] = clamp(
      KP * error + KI * held[axis] + FEED_FORWARD * wanted[axis],
      -authority,
      authority,
    );
  }
  const motors: MotorSpeeds = armed
    ? (mixMotors(sticks.throttle, {
        roll: effort.roll * MIX_SCALE,
        pitch: effort.pitch * MIX_SCALE,
        yaw: effort.yaw * MIX_SCALE,
      }).map((speed) => speed * share) as unknown as MotorSpeeds)
    : STOPPED;
  // A prop made for the other direction pushes its corner (front right) down instead of up: the
  // body rolls right and pitches forward, harder the faster motor 2 spins.
  const push = faults.wrongProp ? 2 * PROP_TORQUE * motors[1] : 0;
  const torque = { roll: effort.roll + push, pitch: effort.pitch + push, yaw: effort.yaw };
  for (const axis of AXES) rate[axis] += (torque[axis] - DRAG * rate[axis]) * dt;
  const attitude = normalise(multiply(state.attitude, turn(rate, dt)));

  // Disarmed, or tipped over by the wrong prop (its thrust no longer holds it up), the drone falls.
  // A healthy drone rolled upside down on purpose doesn't: this sheet never flies it around.
  // Once falling, it keeps falling until it lands: a tumbling drone doesn't catch itself.
  const tipped = faults.wrongProp && rotatePoint(attitude, [0, 1, 0])[1] < 0;
  if (!armed || tipped || state.fallSpeed > 0) {
    const fallSpeed = Math.min(state.fallSpeed + GRAVITY * dt, MAX_FALL_SPEED);
    const height = Math.max(GROUND_M, state.height - fallSpeed * dt);
    const onGround = height <= GROUND_M;
    return {
      ...state,
      ...heat,
      attitude,
      rate: onGround ? ZERO : rate,
      wanted,
      held,
      height,
      motors: onGround ? STOPPED : motors,
      armed: armed && !onGround,
      fallSpeed: onGround ? 0 : fallSpeed,
      onGround,
    };
  }
  const target = (clamp(sticks.throttle, 0, 1) - HOVER_THROTTLE) * 2 * RISE_M;
  return {
    ...state,
    ...heat,
    attitude,
    rate,
    wanted,
    held,
    height: state.height + (target - state.height) * Math.min(1, RISE_EASE * dt),
    motors,
    armed,
    fallSpeed: 0,
  };
}

/**
 * The drone a time step later. A long step (a hidden tab, a slow phone) is cut to 0.1 s and run
 * in small fixed substeps, so the model stays stable at any frame rate.
 */
export function stepFlight(
  state: FlightState,
  sticks: StickInput,
  dtS: number,
  faults: Faults = NO_FAULTS,
): FlightState {
  const dt = clamp(dtS, 0, MAX_STEP_S);
  const steps = Math.ceil(dt / SUBSTEP_S);
  let next = state;
  for (let i = 0; i < steps; i++) next = substep(next, sticks, dt / steps, faults);
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

/**
 * Nothing left to move: on the ground, or sticks centred, rotation stopped, the held angle reached,
 * height eased; and no VTX still heating.
 */
export function isSettled(
  state: FlightState,
  radio: StickInput,
  faults: Faults = NO_FAULTS,
): boolean {
  if (faults.vtxNoAntenna && state.vtxLevel < 3) return false;
  if (state.onGround) return true;
  if (!state.armed || state.fallSpeed > 0) return false;
  const sticks = effectiveSticks(radio, faults);
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
