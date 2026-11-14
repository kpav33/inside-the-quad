import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { usePrefersReducedMotion } from './usePrefersReducedMotion';

/** A stand-in for the browser's media query list, whose answer the test can change. */
function fakeMedia(initial: boolean) {
  const listeners = new Set<() => void>();
  const list = {
    matches: initial,
    addEventListener: (_type: string, listener: () => void) => listeners.add(listener),
    removeEventListener: (_type: string, listener: () => void) => listeners.delete(listener),
  };
  window.matchMedia = (() => list) as unknown as typeof window.matchMedia;
  return {
    set(matches: boolean) {
      list.matches = matches;
      listeners.forEach((listener) => {
        listener();
      });
    },
  };
}

const original = Object.getOwnPropertyDescriptor(window, 'matchMedia');

describe('usePrefersReducedMotion', () => {
  afterEach(() => {
    if (original) Object.defineProperty(window, 'matchMedia', original);
    // @ts-expect-error -- jsdom has no matchMedia of its own to restore
    else delete window.matchMedia;
  });

  it('follows the setting when it is turned on and off during a visit', () => {
    const media = fakeMedia(false);
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(false);
    act(() => {
      media.set(true);
    });
    expect(result.current).toBe(true);
    act(() => {
      media.set(false);
    });
    expect(result.current).toBe(false);
  });

  it('assumes motion is fine where the browser cannot tell', () => {
    // @ts-expect-error -- simulating a browser without matchMedia
    delete window.matchMedia;
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(false);
  });
});
