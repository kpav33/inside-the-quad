import { describe, expect, it } from 'vitest';

import { cachedOriginalIsUsable } from './download.mjs';

describe('cachedOriginalIsUsable', () => {
  it('reuses a cached file only when it is the full-size original', () => {
    expect(cachedOriginalIsUsable(6720, 6720)).toBe(true);
  });

  it('downloads again when the cache holds a scaled copy, so crops never come out smaller', () => {
    expect(cachedOriginalIsUsable(2560, 6720)).toBe(false);
  });

  it('downloads when nothing is cached', () => {
    expect(cachedOriginalIsUsable(undefined, 6720)).toBe(false);
  });
});
