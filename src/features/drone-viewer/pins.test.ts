import { describe, expect, it } from 'vitest';

import { pinState, screenPoint } from './pins';

describe('screenPoint', () => {
  const size = { width: 600, height: 400 };

  it('maps the centre of view to the middle of the canvas', () => {
    expect(screenPoint([0, 0], size)).toEqual([300, 200]);
  });

  it('maps the top-left corner of view to the canvas origin', () => {
    expect(screenPoint([-1, 1], size)).toEqual([0, 0]);
  });

  it('maps the bottom-right corner of view to the far corner', () => {
    expect(screenPoint([1, -1], size)).toEqual([600, 400]);
  });
});

describe('pinState', () => {
  it('shows stops passed and the current one, with their numbers', () => {
    expect(pinState(0, 2, false)).toBe('passed');
    expect(pinState(2, 2, false)).toBe('current');
  });

  it('hides stops ahead, except an off-drone end, whose label shows from the start', () => {
    expect(pinState(3, 2, false)).toBe('hidden');
    expect(pinState(4, 2, true)).toBe('ahead');
  });
});
