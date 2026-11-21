import { describe, expect, it } from 'vitest';

import { LESSONS } from './lessons';

const text = (part: keyof typeof LESSONS) => JSON.stringify(LESSONS[part]);

describe('copy corrected after the release review', () => {
  it('says GPS Rescue must be set up and tested, with a home fix, not just a GPS fitted (I5)', () => {
    for (const part of ['receiver', 'extras'] as const) {
      expect(text(part), part).toMatch(/set up and tested/);
      expect(text(part), part).toMatch(/home position/);
    }
    expect(text('extras')).not.toMatch(/enables GPS Rescue: if the radio signal is lost/);
  });

  it('says a 6S drone flies weakly on fewer cells and can burn on more (M1)', () => {
    expect(text('battery')).not.toMatch(/needs a 6S battery/);
    expect(text('battery')).toMatch(/on fewer cells it flies weakly/);
  });

  it('says the country decides the channels as well as the power (deferred 03b #6)', () => {
    expect(text('vtx')).toMatch(/which channels you may use/);
  });
});
