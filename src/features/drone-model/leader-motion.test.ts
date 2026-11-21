import { describe, expect, it } from 'vitest';

import { dashesFlow, dashOffset, FLOW_BURST_MS } from './leader-motion';

describe('dashOffset', () => {
  it('holds the dashes still when motion is reduced', () => {
    expect(dashOffset(0, true)).toBe(0);
    expect(dashOffset(2, true)).toBe(0);
  });

  it('moves the dashes over time otherwise', () => {
    expect(dashOffset(0.5, false)).not.toBe(dashOffset(0, false));
  });

  it('moves them toward the next stop (a falling offset runs dashes forward)', () => {
    expect(dashOffset(0.5, false)).toBeLessThan(dashOffset(0, false));
  });
});

describe('dashesFlow', () => {
  // Fix check of the release review (WCAG 2.2.2): moving content needs a way to stop it.
  const seen = { playing: false, sinceStepMs: 0, onScreen: true, reduceMotion: false };

  it('flows for a few seconds after a step changes, then holds still', () => {
    expect(dashesFlow(seen)).toBe(true);
    expect(dashesFlow({ ...seen, sinceStepMs: FLOW_BURST_MS - 1 })).toBe(true);
    expect(dashesFlow({ ...seen, sinceStepMs: FLOW_BURST_MS })).toBe(false);
  });

  it('flows while the path plays, so Stop pauses it', () => {
    expect(dashesFlow({ ...seen, playing: true, sinceStepMs: 60_000 })).toBe(true);
  });

  it('never flows unseen or with reduced motion', () => {
    expect(dashesFlow({ ...seen, playing: true, onScreen: false })).toBe(false);
    expect(dashesFlow({ ...seen, playing: true, reduceMotion: true })).toBe(false);
  });
});
