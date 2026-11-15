import { describe, expect, it } from 'vitest';

import { IDLE, mixMotors } from './mixer';

const NONE = { roll: 0, pitch: 0, yaw: 0 };

/** Which motors (1–4) a mix speeds up and slows down against throttle alone. */
function changes(effort: Partial<typeof NONE>) {
  const base = mixMotors(0.5, NONE);
  const mixed = mixMotors(0.5, { ...NONE, ...effort });
  const up: number[] = [];
  const down: number[] = [];
  mixed.forEach((speed, i) => {
    if (speed > (base[i] ?? 0)) up.push(i + 1);
    if (speed < (base[i] ?? 0)) down.push(i + 1);
  });
  return { up, down };
}

describe('mixMotors', () => {
  it('rolls right with the left motors (3, 4) faster', () => {
    expect(changes({ roll: 0.2 })).toEqual({ up: [3, 4], down: [1, 2] });
  });

  it('pitches forward with the rear motors (1, 3) faster', () => {
    expect(changes({ pitch: 0.2 })).toEqual({ up: [1, 3], down: [2, 4] });
  });

  it('yaws right with the counter-clockwise pair (2, 3) faster', () => {
    expect(changes({ yaw: 0.2 })).toEqual({ up: [2, 3], down: [1, 4] });
  });

  it('gives four equal speeds with no effort, rising with throttle', () => {
    const low = mixMotors(0.2, NONE);
    const high = mixMotors(0.8, NONE);
    expect(new Set(low).size).toBe(1);
    expect(new Set(high).size).toBe(1);
    expect(high[0]).toBeGreaterThan(low[0]);
  });

  it('hovers at about 55 %', () => {
    expect(mixMotors(0.5, NONE)[0]).toBeCloseTo(0.55, 2);
  });

  it('never drops below idle or above full speed', () => {
    for (const throttle of [0, 1]) {
      for (const roll of [-1, 1]) {
        for (const speed of mixMotors(throttle, { roll, pitch: roll, yaw: -roll })) {
          expect(speed).toBeGreaterThanOrEqual(IDLE);
          expect(speed).toBeLessThanOrEqual(1);
        }
      }
    }
  });
});
