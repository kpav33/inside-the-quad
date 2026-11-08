import { describe, expect, it } from 'vitest';

import { mm, motorSizeCode, propSizeCode, REFERENCE_5_INCH } from './drone-spec';

describe('drone spec', () => {
  it('converts millimetres to metres', () => {
    expect(mm(1000)).toBe(1);
    expect(mm(225)).toBeCloseTo(0.225, 10);
  });

  it('describes the reference prop with its size code', () => {
    expect(propSizeCode(REFERENCE_5_INCH)).toBe('5 × 4.3 × 3');
  });

  it('describes the reference motor with its stator size code', () => {
    expect(motorSizeCode(REFERENCE_5_INCH)).toBe('2207');
  });

  it('matches the reference drone values from the product scope', () => {
    expect(REFERENCE_5_INCH.frame.wheelbaseMm).toBe(225);
    expect(REFERENCE_5_INCH.frame.stackMountMm).toBe(30.5);
    expect(REFERENCE_5_INCH.motor.kv).toBe(1950);
    expect(REFERENCE_5_INCH.motor.batteryCells).toBe(6);
    expect(REFERENCE_5_INCH.motor.mountPatternMm).toBe(16);
    expect(REFERENCE_5_INCH.motor.shaftThread).toBe('M5');
    expect(REFERENCE_5_INCH.motor.wires).toBe(3);
  });
});
