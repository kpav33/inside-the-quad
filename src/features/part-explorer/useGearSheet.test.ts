import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { GearId } from '@/shared/domain/gear';

import { useGearSheet } from './useGearSheet';

describe('useGearSheet', () => {
  it('has nothing to show off a gear sheet', () => {
    const { result } = renderHook(() => useGearSheet(null));
    expect(result.current.state).toBeNull();
    expect(result.current.highlight).toBeNull();
  });

  it('starts a sheet afresh each time it opens, its switches and highlight undone', () => {
    const { result, rerender } = renderHook(({ gear }) => useGearSheet(gear), {
      initialProps: { gear: 'radio' as GearId | null },
    });
    act(() => {
      result.current.setState({ gear: 'radio', armed: true, mode: 'angle' });
      result.current.setHighlight('arm-switch');
    });
    expect(result.current.state).toEqual({ gear: 'radio', armed: true, mode: 'angle' });
    expect(result.current.highlight).toBe('arm-switch');
    rerender({ gear: 'goggles' });
    expect(result.current.state).toEqual({ gear: 'goggles', system: 'analog' });
    expect(result.current.highlight).toBeNull();
    rerender({ gear: 'radio' });
    expect(result.current.state).toEqual({ gear: 'radio', armed: false, mode: 'acro' });
    expect(result.current.highlight).toBeNull();
  });
});
