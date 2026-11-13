import { describe, expect, it } from 'vitest';

import { REFERENCE_5_INCH } from './drone-spec';
import { drawingSizeMm, SIZE_CLASSES } from './size-classes';

const byId = (id: string) => {
  const found = SIZE_CLASSES.find((c) => c.id === id);
  if (!found) throw new Error(`no size class ${id}`);
  return found;
};

describe('size classes', () => {
  it('runs from the tiny whoop to the 7-inch', () => {
    expect(SIZE_CLASSES.map((c) => c.id)).toEqual(['whoop', '3in', '5in', '7in']);
  });

  it('agrees with the reference drone', () => {
    const five = byId('5in');
    const prop = Math.round(REFERENCE_5_INCH.prop.diameterIn * 25.4);
    expect(prop).toBe(127);
    expect(five.propMm[0]).toBeLessThanOrEqual(prop);
    expect(five.propMm[1]).toBeGreaterThanOrEqual(prop);
    expect(five.frameMm[0]).toBeLessThanOrEqual(REFERENCE_5_INCH.frame.wheelbaseMm);
    expect(five.frameMm[1]).toBeGreaterThanOrEqual(REFERENCE_5_INCH.frame.wheelbaseMm);
  });

  it('keeps every range in order and grows class by class', () => {
    SIZE_CLASSES.forEach((c, i) => {
      expect(c.propMm[0]).toBeLessThanOrEqual(c.propMm[1]);
      expect(c.frameMm[0]).toBeLessThanOrEqual(c.frameMm[1]);
      const next = SIZE_CLASSES[i + 1];
      if (next) {
        expect(next.propMm[0]).toBeGreaterThan(c.propMm[1]);
        expect(next.frameMm[0]).toBeGreaterThan(c.frameMm[1]);
      }
    });
  });

  it('draws each class at the middle of its frame range', () => {
    expect(drawingSizeMm(byId('3in'))).toBe(135);
  });
});
