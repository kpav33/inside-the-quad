import { describe, expect, it } from 'vitest';

import { isDeliberateClick, MAX_CLICK_MOVEMENT_PX } from './clicks';

describe('isDeliberateClick', () => {
  it('accepts clicks that barely moved', () => {
    expect(isDeliberateClick(0)).toBe(true);
    expect(isDeliberateClick(MAX_CLICK_MOVEMENT_PX)).toBe(true);
  });

  it('rejects drags, such as rotating the camera', () => {
    expect(isDeliberateClick(MAX_CLICK_MOVEMENT_PX + 1)).toBe(false);
    expect(isDeliberateClick(40)).toBe(false);
  });

  it('allows 4 px of movement', () => {
    expect(MAX_CLICK_MOVEMENT_PX).toBe(4);
  });
});
