import { describe, expect, it } from 'vitest';

import { INTRO } from './intro';
import { LESSONS } from './lessons';
import { MOVES } from './moves';

/**
 * Release review I4: a beginner reading in order (intro, parts, How it works together) meets each
 * term with a short explanation the first time it appears, not only on its own sheet later.
 */
const intro = JSON.stringify(INTRO);
const fc = JSON.stringify(LESSONS.fc);
const battery = JSON.stringify(LESSONS.battery);
const moves = JSON.stringify(MOVES);

describe('terms explained where a beginner first meets them', () => {
  it('the intro says what ExpressLRS and analog video are', () => {
    expect(intro).toMatch(/ExpressLRS, a radio control system/);
    expect(intro).toMatch(/analog \(the older, simpler kind of video/);
  });

  it('the intro says what acro mode is, and that it is how most FPV drones are flown', () => {
    expect(intro).toMatch(/acro mode/);
    expect(intro).not.toMatch(/An FPV drone is flown by hand\. Let go/);
  });

  it('the flight controller says what roll, pitch and yaw are', () => {
    expect(fc).toMatch(
      /roll \(tipping left or right\), pitch \(tipping the nose up or down\) and yaw \(turning the nose left or right\)/,
    );
  });

  it('the battery says what the throttle is', () => {
    expect(battery).toMatch(/throttle \(the stick that sets how hard the motors spin\)/);
  });

  it('how a quad moves says what armed means', () => {
    expect(moves).toMatch(/armed \(switched on to fly/);
  });
});
