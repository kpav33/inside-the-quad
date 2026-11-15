import { describe, expect, it } from 'vitest';

import {
  CENTRED,
  type FlightState,
  gust,
  initialFlight,
  isSettled,
  level,
  MAX_RATE_DPS,
  rotatePoint,
  stepFlight,
  type StickInput,
} from './model';

const DT = 1 / 60;
const DEG = Math.PI / 180;

function fly(state: FlightState, sticks: Partial<StickInput>, seconds: number): FlightState {
  let next = state;
  const input = { ...CENTRED, ...sticks };
  for (let t = 0; t < seconds - 1e-9; t += DT) next = stepFlight(next, input, DT);
  return next;
}

/** The roll angle: how far the right side has dropped, in degrees. */
const rollDeg = (s: FlightState) => {
  const [, y] = rotatePoint(s.attitude, [1, 0, 0]);
  return -Math.asin(Math.max(-1, Math.min(1, y))) / DEG;
};

const rateDps = (s: FlightState) =>
  Math.max(Math.abs(s.rate.roll), Math.abs(s.rate.pitch), Math.abs(s.rate.yaw)) / DEG;

describe('the flight model', () => {
  it('rolls right while the stick is held', () => {
    const s = fly(initialFlight(), { roll: 1 }, 1);
    expect(rotatePoint(s.attitude, [1, 0, 0])[1]).toBeLessThan(0);
    expect(rollDeg(s)).toBeGreaterThan(60);
    expect(rollDeg(s)).toBeLessThan(95);
  });

  it('pitches forward: the nose drops', () => {
    const s = fly(initialFlight(), { pitch: 1 }, 0.5);
    expect(rotatePoint(s.attitude, [0, 0, -1])[1]).toBeLessThan(0);
  });

  it('yaws right: the nose turns clockwise seen from above', () => {
    const s = fly(initialFlight(), { yaw: 1 }, 0.5);
    expect(rotatePoint(s.attitude, [0, 0, -1])[0]).toBeGreaterThan(0);
  });

  it('caps the rotation rate', () => {
    const s = fly(initialFlight(), { roll: 1 }, 2);
    expect(rateDps(s)).toBeLessThanOrEqual(MAX_RATE_DPS * 1.1);
  });

  it('raises the drone a little on full throttle', () => {
    const s = fly(initialFlight(), { throttle: 1 }, 2);
    expect(s.height).toBeGreaterThan(0);
    expect(s.height).toBeLessThanOrEqual(0.05);
  });

  it('holds the angle once the stick is centred', () => {
    const rolled = fly(initialFlight(), { roll: 1 }, 0.5);
    const settling = fly(rolled, {}, 1);
    const held = fly(settling, {}, 2);
    expect(rateDps(held)).toBeLessThan(0.5);
    expect(Math.abs(rollDeg(held) - rollDeg(settling))).toBeLessThan(2);
    expect(rollDeg(held)).toBeGreaterThan(20);
  });

  it('keeps the motors apart while a stick is held', () => {
    const s = fly(initialFlight(), { roll: 1 }, 2);
    const [m1, m2, m3, m4] = s.motors;
    expect(Math.min(m3, m4) - Math.max(m1, m2)).toBeGreaterThanOrEqual(0.03);
  });

  it('gives four equal speeds when centred and still', () => {
    expect(new Set(initialFlight().motors).size).toBe(1);
  });

  it('returns to the held angle after a gust', () => {
    const rolled = fly(fly(initialFlight(), { roll: 1 }, 0.4), {}, 2);
    const before = rollDeg(rolled);
    const after = fly(gust(rolled, 0), {}, 3);
    expect(Math.abs(rollDeg(after) - before)).toBeLessThan(2);
  });

  it('is knocked visibly by a gust, alternating sides', () => {
    const a = fly(gust(initialFlight(), 0), {}, 0.2);
    const b = fly(gust(initialFlight(), 1), {}, 0.2);
    expect(Math.abs(rollDeg(a))).toBeGreaterThan(5);
    expect(Math.sign(rollDeg(a))).toBe(-Math.sign(rollDeg(b)));
  });

  it('levels: upright, facing front, at rest', () => {
    const s = level(fly(initialFlight(), { roll: 1, yaw: 1 }, 1));
    expect(s.attitude).toEqual([0, 0, 0, 1]);
    expect(rateDps(s)).toBe(0);
  });

  it('settles after a gust, and not straight away', () => {
    const knocked = gust(initialFlight(), 0);
    expect(isSettled(knocked, CENTRED)).toBe(false);
    expect(isSettled(fly(knocked, {}, 4), CENTRED)).toBe(true);
    expect(isSettled(initialFlight(), { ...CENTRED, roll: 0.5 })).toBe(false);
  });

  it('stays finite and capped through a long frame', () => {
    const s = stepFlight(initialFlight(), { ...CENTRED, roll: 1 }, 5);
    for (const v of [...s.attitude, ...s.motors, s.height, s.rate.roll]) {
      expect(Number.isFinite(v)).toBe(true);
    }
    expect(rateDps(s)).toBeLessThanOrEqual(MAX_RATE_DPS * 1.1);
  });

  it('keeps a unit attitude and speeds in range over a long roll', () => {
    let s = initialFlight();
    for (let i = 0; i < 20_000; i++) s = stepFlight(s, { ...CENTRED, roll: 1, yaw: 0.6 }, DT);
    const [x, y, z, w] = s.attitude;
    expect(Math.abs(Math.hypot(x, y, z, w) - 1)).toBeLessThan(1e-6);
    for (const m of s.motors) {
      expect(m).toBeGreaterThan(0);
      expect(m).toBeLessThanOrEqual(1);
    }
  });
});
