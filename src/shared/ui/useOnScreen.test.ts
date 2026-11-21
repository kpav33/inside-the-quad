import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useOnScreen } from './useOnScreen';

let report: ((entries: { isIntersecting: boolean }[]) => void) | null = null;

class FakeObserver {
  constructor(callback: (entries: { isIntersecting: boolean }[]) => void) {
    report = callback;
  }
  observe = vi.fn();
  disconnect = vi.fn();
}

function setVisibility(state: 'visible' | 'hidden') {
  Object.defineProperty(document, 'visibilityState', { configurable: true, value: state });
  document.dispatchEvent(new Event('visibilitychange'));
}

describe('useOnScreen', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    setVisibility('visible');
    report = null;
  });

  it('follows the element in and out of the viewport', () => {
    vi.stubGlobal('IntersectionObserver', FakeObserver);
    const { result } = renderHook(() => useOnScreen(document.body));
    expect(result.current).toBe(true);
    act(() => {
      report?.([{ isIntersecting: false }]);
    });
    expect(result.current).toBe(false);
    act(() => {
      report?.([{ isIntersecting: true }]);
    });
    expect(result.current).toBe(true);
  });

  it('is false while the page is hidden', () => {
    vi.stubGlobal('IntersectionObserver', FakeObserver);
    const { result } = renderHook(() => useOnScreen(document.body));
    act(() => {
      setVisibility('hidden');
    });
    expect(result.current).toBe(false);
    act(() => {
      setVisibility('visible');
    });
    expect(result.current).toBe(true);
  });

  it('counts as seen where IntersectionObserver is missing', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    const { result } = renderHook(() => useOnScreen(document.body));
    expect(result.current).toBe(true);
  });
});
