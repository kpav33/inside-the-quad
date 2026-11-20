import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { REFERENCE_BUILD } from '@/shared/domain/build-check';

import { useBuild } from './useBuild';

function start(address: string) {
  window.history.replaceState(null, '', address);
  return renderHook(() => useBuild());
}

describe('useBuild', () => {
  it('reads the build from the address', () => {
    const { result } = start('/check?camera=21');
    expect(result.current.build).toEqual({ ...REFERENCE_BUILD, cameraMm: 21 });
  });

  it('writes a change to the address without a new history entry', () => {
    const { result } = start('/check');
    const before = window.history.length;
    act(() => {
      result.current.set({ cells: 4 });
    });
    expect(window.location.search).toBe('?cells=4');
    expect(window.history.length).toBe(before);
    expect(result.current.build.cells).toBe(4);
  });

  it('keeps a KV that is not entered on the sheet, though the address leaves it out', () => {
    const { result } = start('/check');
    act(() => {
      result.current.set({ kv: null });
    });
    expect(result.current.build.kv).toBeNull();
    expect(window.location.search).toBe('');
  });

  it('resets to the reference and clears the query', () => {
    const { result } = start('/check?cells=4&camera=21');
    act(() => {
      result.current.set({ kv: null });
    });
    act(() => {
      result.current.reset();
    });
    expect(result.current.build).toEqual(REFERENCE_BUILD);
    expect(window.location.search).toBe('');
  });
});

describe('useBuild off the sheet', () => {
  it('forgets a cleared KV once the sheet closes', () => {
    window.history.replaceState(null, '', '/check');
    const { result, rerender } = renderHook(({ open }) => useBuild(open), {
      initialProps: { open: true },
    });
    act(() => {
      result.current.set({ kv: null });
    });
    rerender({ open: false });
    rerender({ open: true });
    expect(result.current.build.kv).toBe(REFERENCE_BUILD.kv);
  });
});
