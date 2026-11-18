import { describe, expect, it } from 'vitest';

import { GEAR_IDS, isGearId } from './gear';

describe('gear ids', () => {
  it('lists the radio, goggles and charger, in reading order', () => {
    expect(GEAR_IDS).toEqual(['radio', 'goggles', 'charger']);
  });

  it('recognises only gear ids', () => {
    expect(isGearId('radio')).toBe(true);
    expect(isGearId('drone')).toBe(false);
    expect(isGearId('')).toBe(false);
    expect(isGearId(undefined)).toBe(false);
  });
});
