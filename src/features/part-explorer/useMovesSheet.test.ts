import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useMovesSheet } from './useMovesSheet';

/** A reduced-motion preference the test can switch, with listeners told of the change. */
function motionPreference(reduce: boolean) {
  const listeners = new Set<() => void>();
  const state = { matches: reduce };
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({
      get matches() {
        return state.matches;
      },
      addEventListener: (_: string, listener: () => void) => listeners.add(listener),
      removeEventListener: (_: string, listener: () => void) => listeners.delete(listener),
    })),
  );
  return (next: boolean) => {
    state.matches = next;
    for (const listener of listeners) listener();
  };
}

describe('useMovesSheet', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('stops a Show me replay when another step opens', () => {
    motionPreference(true);
    const replaceStep = vi.fn();
    const { result, rerender } = renderHook(({ step }) => useMovesSheet(true, step, replaceStep), {
      initialProps: { step: 3 },
    });
    act(() => {
      result.current.showMe();
      vi.advanceTimersByTime(0);
    });
    expect(result.current.flight?.sticks.yaw).toBe(1);
    rerender({ step: 4 });
    // Mid-way through the old replay, where it would be pushing yaw the other way.
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.flight?.sticks.yaw).toBe(0);
  });

  it('stops a playing demo when reduced motion is switched on', () => {
    const setReduce = motionPreference(false);
    const { result } = renderHook(() => useMovesSheet(true, 3, vi.fn()));
    act(() => {
      vi.advanceTimersByTime(0);
    });
    expect(result.current.flight?.sticks.yaw).toBe(1);
    act(() => {
      setReduce(true);
    });
    expect(result.current.flight?.sticks.yaw).toBe(0);
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(result.current.flight?.sticks.yaw).toBe(0);
  });
});
