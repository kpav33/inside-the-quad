import { act, renderHook } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { PathId } from '@/shared/domain/paths';

import { PLAY_INTERVAL_MS, usePathStep } from './usePathStep';

/** The hook as the explorer uses it: the step lives outside (in the address). */
function start(path: PathId | null = 'control', stops = 6, initial = 0) {
  return renderHook(
    ({ path: p, stops: n }) => {
      const [step, setStep] = useState(initial);
      return usePathStep(p, n, step, setStep);
    },
    { initialProps: { path, stops } },
  );
}

describe('usePathStep', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts at the step it is given, not playing', () => {
    const { result } = start('control', 6, 2);
    expect(result.current.step).toBe(2);
    expect(result.current.playing).toBe(false);
  });

  it('steps forward and back, stopping at both ends', () => {
    const { result } = start('video', 5);
    act(() => {
      result.current.previous();
    });
    expect(result.current.step).toBe(0);
    for (let i = 0; i < 7; i++) {
      act(() => {
        result.current.next();
      });
    }
    expect(result.current.step).toBe(4);
    act(() => {
      result.current.goTo(2);
    });
    expect(result.current.step).toBe(2);
  });

  it('plays the path to its last stop and stops there', () => {
    const { result } = start('control', 6);
    act(() => {
      result.current.play();
    });
    expect(result.current.playing).toBe(true);
    act(() => {
      vi.advanceTimersByTime(PLAY_INTERVAL_MS);
    });
    expect(result.current.step).toBe(1);
    // Each stop schedules the next after it renders, so time moves on one stop at a time.
    for (let i = 0; i < 10; i++) {
      act(() => {
        vi.advanceTimersByTime(PLAY_INTERVAL_MS);
      });
    }
    expect(result.current.step).toBe(5);
    expect(result.current.playing).toBe(false);
  });

  it('plays from the start when asked at the last stop', () => {
    const { result } = start('video', 5, 4);
    act(() => {
      result.current.play();
    });
    expect(result.current.step).toBe(0);
    expect(result.current.playing).toBe(true);
  });

  it('stops playing when the learner steps by hand', () => {
    const { result } = start();
    act(() => {
      result.current.play();
    });
    act(() => {
      result.current.next();
    });
    expect(result.current.playing).toBe(false);
    act(() => {
      vi.advanceTimersByTime(PLAY_INTERVAL_MS * 3);
    });
    expect(result.current.step).toBe(1);
  });

  it('stops playing when another path opens', () => {
    const { result, rerender } = start('control', 6);
    act(() => {
      result.current.play();
    });
    rerender({ path: 'video', stops: 5 });
    expect(result.current.playing).toBe(false);
    const at = result.current.step;
    act(() => {
      vi.advanceTimersByTime(PLAY_INTERVAL_MS * 3);
    });
    expect(result.current.step).toBe(at);
  });
});
