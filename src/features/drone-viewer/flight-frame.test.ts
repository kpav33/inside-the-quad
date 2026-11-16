import { describe, expect, it } from 'vitest';

import { frameStep, restingLift } from './flight-frame';

describe('frameStep', () => {
  it('steps the real time of a running frame, however slow', () => {
    expect(frameStep(0.016, false)).toBeCloseTo(0.016);
    expect(frameStep(0.3, false)).toBeCloseTo(0.3);
  });

  it('steps one short frame on waking from rest, however long the rest', () => {
    expect(frameStep(12, true)).toBeCloseTo(1 / 60);
  });
});

describe('restingLift', () => {
  const points: [number, number, number][] = [
    [0.1, 0.05, 0],
    [-0.1, -0.03, 0],
  ];
  const upright: [number, number, number, number] = [0, 0, 0, 1];
  // Rolled over by 180° about the nose (−z).
  const upsideDown: [number, number, number, number] = [0, 0, 1, 0];

  it('keeps an upright drone where the model put it', () => {
    expect(restingLift(points, upright, -0.12, -0.15)).toBeCloseTo(-0.12);
  });

  it('lifts a drone whose lowest point would go through the floor', () => {
    // Upside down, the point 5 cm up is now 5 cm down: resting at −0.12 would put it at −0.17.
    const y = restingLift(points, upsideDown, -0.12, -0.15);
    expect(y).toBeCloseTo(-0.1);
  });
});
