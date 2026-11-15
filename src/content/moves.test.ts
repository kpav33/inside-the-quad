import { describe, expect, it } from 'vitest';

import { MOVE_STEP_IDS } from '@/shared/domain/moves';
import { isPartId } from '@/shared/domain/parts';

import { MOVES } from './moves';

describe('how a quad moves', () => {
  it('walks the five steps in order', () => {
    expect(Object.keys(MOVES.steps)).toEqual([...MOVE_STEP_IDS]);
  });

  it('says which motors speed up for a roll', () => {
    expect(MOVES.steps.roll.text).toMatch(/left motors/i);
  });

  it('explains yaw with the clockwise and counter-clockwise pairs', () => {
    expect(MOVES.steps.yaw.text).toMatch(/counter-clockwise/i);
    expect(MOVES.steps.yaw.text).toMatch(/twist/i);
  });

  it('tells the gyro loop runs thousands of times a second', () => {
    expect(MOVES.steps.gyro.text).toMatch(/thousands of times a second/i);
  });

  it('says the sheet flies acro, slowed down', () => {
    const facts = MOVES.facts.map((fact) => `${fact.label} ${fact.value}`).join(' ');
    expect(facts).toMatch(/acro/i);
    expect(facts).toMatch(/slow/i);
  });

  it('links only real parts', () => {
    for (const step of Object.values(MOVES.steps)) {
      for (const part of step.lessons) expect(isPartId(part)).toBe(true);
    }
  });
});
