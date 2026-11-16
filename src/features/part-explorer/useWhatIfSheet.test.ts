import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { NO_FAULTS } from '@/features/flight';

import { useWhatIfSheet } from './useWhatIfSheet';

describe('useWhatIfSheet', () => {
  it('keeps the step inside the four mistakes and fixes the address', () => {
    const replaceStep = vi.fn();
    const { result } = renderHook(() => useWhatIfSheet(true, 9, replaceStep));
    expect(result.current.step).toBe(3);
    expect(replaceStep).toHaveBeenCalledWith('what-if', 4);
  });

  it('resets the drone when another mistake opens', () => {
    const { result, rerender } = renderHook(({ step }) => useWhatIfSheet(true, step, vi.fn()), {
      initialProps: { step: 3 },
    });
    act(() => {
      result.current.flight?.setFaults({ vtxNoAntenna: true });
      for (let i = 0; i < 50; i++) result.current.flight?.advance(0.1);
    });
    expect(result.current.flight?.state.vtxLevel).toBeGreaterThan(0);
    rerender({ step: 0 });
    expect(result.current.flight?.faults).toEqual(NO_FAULTS);
    expect(result.current.flight?.state.vtxLevel).toBe(0);
  });

  it('has no drone while closed', () => {
    const { result } = renderHook(() => useWhatIfSheet(false, 0, vi.fn()));
    expect(result.current.flight).toBeNull();
  });
});
