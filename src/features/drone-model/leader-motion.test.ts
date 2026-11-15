import { describe, expect, it } from 'vitest';

import { dashOffset } from './leader-motion';

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
