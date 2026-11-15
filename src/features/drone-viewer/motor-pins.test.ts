import { describe, expect, it } from 'vitest';

import { mixMotors } from '@/features/flight';

import { motorPinState, placeMotorPin } from './motor-pins';

describe('motorPinState', () => {
  it('marks the motors a roll right speeds up and slows down', () => {
    const speeds = mixMotors(0.5, { roll: 0.1, pitch: 0, yaw: 0 });
    expect([0, 1, 2, 3].map((i) => motorPinState(speeds, i))).toEqual(['down', 'down', 'up', 'up']);
  });

  it('marks every motor even when they spin alike', () => {
    const speeds = mixMotors(0.7, { roll: 0, pitch: 0, yaw: 0 });
    expect([0, 1, 2, 3].map((i) => motorPinState(speeds, i))).toEqual([
      'even',
      'even',
      'even',
      'even',
    ]);
  });
});

describe('placeMotorPin', () => {
  const field = { width: 400, height: 300 };
  const box = { width: 60, height: 24 };

  it('sits beside its motor, pushed away from the drone’s middle', () => {
    const [x, y] = placeMotorPin([300, 150], [200, 150], box, field, []);
    expect(x).toBeGreaterThan(300);
    expect(y).toBeCloseTo(150);
  });

  it('stays inside the field', () => {
    const [x, y] = placeMotorPin([395, 5], [200, 150], box, field, []);
    expect(x + box.width / 2).toBeLessThanOrEqual(field.width);
    expect(y - box.height / 2).toBeGreaterThanOrEqual(0);
  });

  it('moves up out of a stick it would cover', () => {
    const stick = { left: 0, right: 110, top: 190, bottom: 300 };
    const [, y] = placeMotorPin([60, 220], [200, 150], box, field, [stick]);
    expect(y + box.height / 2).toBeLessThanOrEqual(stick.top);
  });

  it('keeps clear of every box, even after moving out of one into another', () => {
    const balloon = { left: 30, right: 90, top: 166, bottom: 190 };
    const stick = { left: 0, right: 110, top: 190, bottom: 300 };
    const [x, y] = placeMotorPin([60, 220], [200, 150], box, field, [balloon, stick]);
    const mine = { left: x - 30, right: x + 30, top: y - 12, bottom: y + 12 };
    for (const other of [balloon, stick]) {
      const overlaps =
        mine.left < other.right &&
        other.left < mine.right &&
        mine.top < other.bottom &&
        other.top < mine.bottom;
      expect(overlaps).toBe(false);
    }
  });

  it('finds room elsewhere when the way up is blocked at the top edge', () => {
    const other = { left: 340, right: 400, top: 0, bottom: 24 };
    const [x, y] = placeMotorPin([380, 6], [200, 150], box, field, [other]);
    const mine = { left: x - 30, right: x + 30, top: y - 12, bottom: y + 12 };
    const overlaps =
      mine.left < other.right &&
      other.left < mine.right &&
      mine.top < other.bottom &&
      other.top < mine.bottom;
    expect(overlaps).toBe(false);
    expect(mine.top).toBeGreaterThanOrEqual(0);
    expect(mine.right).toBeLessThanOrEqual(field.width);
  });
});
