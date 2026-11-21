import { describe, expect, it } from 'vitest';

import { mayPin } from './usePinnedWhileShort';

describe('mayPin', () => {
  it('keeps short controls pinned and lets tall ones scroll with the sheet', () => {
    expect(mayPin(100, 844)).toBe(true);
    expect(mayPin(211, 844)).toBe(true);
    // 320 × 667 with 200 % text: the controls were 394 px tall.
    expect(mayPin(394, 667)).toBe(false);
  });
});
