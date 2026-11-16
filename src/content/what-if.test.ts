import { describe, expect, it } from 'vitest';

import { REFERENCE_5_INCH } from '@/shared/domain/drone-spec';
import { packVolts, LIPO_CELL_VOLTS } from '@/shared/domain/lipo';
import { isPartId } from '@/shared/domain/parts';
import { WHAT_IF_STEP_IDS } from '@/shared/domain/what-if';

import { LESSONS } from './lessons';
import { WHAT_IF } from './what-if';

describe('what if', () => {
  it('walks the four mistakes in order, each with what happens, why and how to avoid it', () => {
    expect(Object.keys(WHAT_IF.steps)).toEqual([...WHAT_IF_STEP_IDS]);
    for (const step of Object.values(WHAT_IF.steps)) {
      for (const part of [step.name, step.happens, step.why, step.avoid]) {
        expect(part.trim()).not.toBe('');
      }
    }
  });

  it('says a failsafe drone has to be re-armed', () => {
    expect(WHAT_IF.steps.failsafe.why).toMatch(/re-arm/i);
  });

  it('names this drone’s battery and the smaller one with their voltages', () => {
    const cells = REFERENCE_5_INCH.motor.batteryCells;
    const text = Object.values(WHAT_IF.steps.battery).join(' ');
    expect(text).toContain(`${String(cells)}S`);
    expect(text).toContain('4S');
    expect(text).toContain(`${String(packVolts(cells, LIPO_CELL_VOLTS.nominal))} V`);
    expect(text).toContain(`${String(packVolts(4, LIPO_CELL_VOLTS.nominal))} V`);
  });

  it('says cooling down doesn’t undo VTX damage', () => {
    expect(WHAT_IF.steps.vtx.why).toMatch(/cooling down doesn.t undo/i);
  });

  it('links only real parts', () => {
    for (const step of Object.values(WHAT_IF.steps)) {
      for (const part of step.lessons) expect(isPartId(part)).toBe(true);
    }
  });

  it('the props lesson tells a prop for the other direction from one upside down', () => {
    const text = LESSONS.props.howItWorks.join(' ');
    expect(text).toMatch(/other direction/i);
    expect(text).toMatch(/upside down[^.]*little thrust/i);
  });
});
