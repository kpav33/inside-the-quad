import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { PathId } from '@/shared/domain/paths';

import { PLAY_INTERVAL_MS, usePathStep } from './usePathStep';

function start(path: PathId | null = 'control', stops = 6) {
  return renderHook(({ path: p, stops: n }) => usePathStep(p, n), {
    initialProps: { path, stops },
  });
}

describe('usePathStep', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts at the first stop, not playing', () => {
    const { result } = start();
    expect(result.current.step).toBe(0);
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
    const { result } = start('video', 5);
    act(() => {
      result.current.goTo(4);
    });
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

  it('starts a new path at its first stop and stops playing', () => {
    const { result, rerender } = start('control', 6);
    act(() => {
      result.current.goTo(5);
      result.current.play();
    });
    rerender({ path: 'video', stops: 5 });
    expect(result.current.step).toBe(0);
    expect(result.current.playing).toBe(false);
    act(() => {
      vi.advanceTimersByTime(PLAY_INTERVAL_MS * 3);
    });
    expect(result.current.step).toBe(0);
  });

  it('resets when the sheet closes and the path reopens', () => {
    const { result, rerender } = start('power', 6);
    act(() => {
      result.current.goTo(3);
    });
    rerender({ path: null, stops: 0 });
    rerender({ path: 'power', stops: 6 });
    expect(result.current.step).toBe(0);
  });
});
