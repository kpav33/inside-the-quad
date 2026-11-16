import { describe, expect, it } from 'vitest';

import { type Faults, NO_FAULTS } from './faults';
import {
  CENTRED,
  type FlightState,
  GROUND_M,
  initialFlight,
  isSettled,
  rotatePoint,
  stepFlight,
  type StickInput,
} from './model';

const DT = 1 / 60;
const DEG = Math.PI / 180;

function fly(
  state: FlightState,
  sticks: Partial<StickInput>,
  seconds: number,
  faults: Partial<Faults> = {},
): FlightState {
  let next = state;
  const input = { ...CENTRED, ...sticks };
  const all = { ...NO_FAULTS, ...faults };
  for (let t = 0; t < seconds - 1e-9; t += DT) next = stepFlight(next, input, DT, all);
  return next;
}

const rollDeg = (s: FlightState) => {
  const [, y] = rotatePoint(s.attitude, [1, 0, 0]);
  return -Math.asin(Math.max(-1, Math.min(1, y))) / DEG;
};
const upY = (s: FlightState) => rotatePoint(s.attitude, [0, 1, 0])[1];
const top = (s: FlightState) => Math.max(...s.motors);

describe('link lost (failsafe)', () => {
  it('ignores the sticks', () => {
    const s = fly(initialFlight(), { roll: 1 }, 0.5, { linkLost: true });
    expect(Math.abs(rollDeg(s))).toBeLessThan(2);
  });

  it('uses safe values for a moment, then disarms and stops the motors', () => {
    const early = fly(initialFlight(), {}, 0.5, { linkLost: true });
    expect(early.armed).toBe(true);
    for (const m of early.motors) expect(m).toBeLessThan(initialFlight().motors[0]);
    const late = fly(initialFlight(), {}, 1.5, { linkLost: true });
    expect(late.armed).toBe(false);
    for (const m of late.motors) expect(m).toBe(0);
  });

  it('falls to the ground and stays there when the link comes back', () => {
    const down = fly(initialFlight(), {}, 4, { linkLost: true });
    expect(down.onGround).toBe(true);
    expect(down.height).toBe(GROUND_M);
    const after = fly(down, {}, 2);
    expect(after.armed).toBe(false);
    expect(after.onGround).toBe(true);
  });

  it('lands on the ground line through a long frame, never below it', () => {
    const falling = fly(initialFlight(), {}, 2, { linkLost: true });
    const s = stepFlight(falling, CENTRED, 5, { ...NO_FAULTS, linkLost: true });
    expect(s.height).toBe(GROUND_M);
  });
});

describe('a wrong prop on motor 2', () => {
  it('flips the drone from hover, motor 2 working hardest, and it ends on the ground', () => {
    let s = initialFlight();
    let flipped = false;
    let motor2Fastest = false;
    for (let t = 0; t < 3; t += DT) {
      s = stepFlight(s, CENTRED, DT, { ...NO_FAULTS, wrongProp: true });
      if (upY(s) < 0) flipped = true;
      if (!motor2Fastest && t > 0.1 && s.armed) motor2Fastest = s.motors[1] === top(s);
    }
    expect(flipped).toBe(true);
    expect(motor2Fastest).toBe(true);
    s = fly(s, {}, 3, { wrongProp: true });
    expect(s.onGround).toBe(true);
  });
});

describe('4S on this 6S drone', () => {
  it('tops out at about two-thirds of the speed', () => {
    const six = fly(initialFlight(), { throttle: 1, roll: 1 }, 1);
    const four = fly(initialFlight(), { throttle: 1, roll: 1 }, 1, { cells: 4 });
    expect(top(four)).toBeCloseTo((top(six) * 4) / 6, 1);
  });

  it('is slower to reach the rate', () => {
    const six = fly(initialFlight(), { roll: 1 }, 0.15);
    const four = fly(initialFlight(), { roll: 1 }, 0.15, { cells: 4 });
    expect(four.rate.roll).toBeLessThan(six.rate.roll);
  });
});

describe('a VTX without its antenna', () => {
  it('heats through Warm and Hot to Damaged', () => {
    const on = { vtxNoAntenna: true };
    expect(fly(initialFlight(), {}, 1, on).vtxLevel).toBe(1);
    expect(fly(initialFlight(), {}, 20, on).vtxLevel).toBe(2);
    expect(fly(initialFlight(), {}, 31, on).vtxLevel).toBe(3);
    expect(fly(initialFlight(), {}, 31).vtxLevel).toBe(0);
  });
});

describe('settling with faults', () => {
  it('keeps drawing while falling or heating, and stops once it has landed', () => {
    const falling = fly(initialFlight(), {}, 1.2, { linkLost: true });
    expect(isSettled(falling, CENTRED, { ...NO_FAULTS, linkLost: true })).toBe(false);
    const heating = fly(initialFlight(), {}, 1, { vtxNoAntenna: true });
    expect(isSettled(heating, CENTRED, { ...NO_FAULTS, vtxNoAntenna: true })).toBe(false);
    const landed = fly(initialFlight(), {}, 5, { linkLost: true });
    expect(isSettled(landed, CENTRED, { ...NO_FAULTS, linkLost: true })).toBe(true);
  });
});
