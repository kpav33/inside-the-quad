import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createFlight } from './store';
import { useFlightReadout } from './useFlightReadout';

describe('useFlightReadout', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('is null without a flight', () => {
    const { result } = renderHook(() => useFlightReadout(null));
    expect(result.current).toBeNull();
  });

  it('shows wanted and measured rotation in °/s, at most every 100 ms', () => {
    const flight = createFlight();
    const { result } = renderHook(() => useFlightReadout(flight));
    expect(result.current).toEqual({
      wanted: { roll: 0, pitch: 0, yaw: 0 },
      measured: { roll: 0, pitch: 0, yaw: 0 },
    });
    act(() => {
      flight.setSticks({ roll: 1 }, 'user');
      flight.advance(0.05);
    });
    const early = result.current;
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current?.wanted.roll).toBe(90);
    expect(result.current?.measured.roll).toBeGreaterThan(0);
    expect(early?.wanted.roll === 90 || early?.wanted.roll === 0).toBe(true);
  });
});
