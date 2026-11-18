import { describe, expect, it } from 'vitest';

import { cellFill, chargerCells, initialGearState } from './gear-state';

describe('chargerCells', () => {
  it('fills six cells to 4.2 V each, 25.2 V in all', () => {
    expect(chargerCells('charge', 6)).toEqual({ cellVolts: 4.2, packVolts: 25.2 });
  });

  it('settles six cells at 3.8 V each for storage, 22.8 V in all', () => {
    expect(chargerCells('storage', 6)).toEqual({ cellVolts: 3.8, packVolts: 22.8 });
  });
});

describe('cellFill', () => {
  it('is full at 4.2 V, empty at the 3.3 V floor, and part way at storage', () => {
    expect(cellFill(4.2)).toBe(1);
    expect(cellFill(3.3)).toBe(0);
    expect(cellFill(3.8)).toBeCloseTo(0.556, 2);
  });
});

describe('initialGearState', () => {
  it('starts each sheet in its plain state', () => {
    expect(initialGearState('radio')).toEqual({ gear: 'radio', armed: false, mode: 'acro' });
    expect(initialGearState('goggles')).toEqual({ gear: 'goggles', system: 'analog' });
    expect(initialGearState('charger')).toEqual({ gear: 'charger', mode: 'charge' });
  });
});
