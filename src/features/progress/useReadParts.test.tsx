import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { READ_PARTS_KEY } from './progress';
import { useReadParts } from './useReadParts';

describe('useReadParts', () => {
  afterEach(() => {
    window.localStorage.clear();
  });

  it('starts from what this browser stored', () => {
    window.localStorage.setItem(READ_PARTS_KEY, '["esc"]');
    const { result } = renderHook(() => useReadParts());
    expect([...result.current.read]).toEqual(['esc']);
  });

  it('marks a part read, then unread, and stores it', () => {
    const { result } = renderHook(() => useReadParts());
    act(() => {
      result.current.toggle('vtx');
    });
    expect(result.current.read.has('vtx')).toBe(true);
    expect(window.localStorage.getItem(READ_PARTS_KEY)).toBe('["vtx"]');
    act(() => {
      result.current.toggle('vtx');
    });
    expect(result.current.read.has('vtx')).toBe(false);
    expect(window.localStorage.getItem(READ_PARTS_KEY)).toBe('[]');
  });

  it('clears all progress', () => {
    window.localStorage.setItem(READ_PARTS_KEY, '["esc","fc"]');
    const { result } = renderHook(() => useReadParts());
    act(() => {
      result.current.clear();
    });
    expect(result.current.read.size).toBe(0);
    expect(window.localStorage.getItem(READ_PARTS_KEY)).toBe('[]');
  });

  it('follows changes made in another tab', () => {
    const { result } = renderHook(() => useReadParts());
    act(() => {
      window.localStorage.setItem(READ_PARTS_KEY, '["camera"]');
      window.dispatchEvent(
        new StorageEvent('storage', { key: READ_PARTS_KEY, newValue: '["camera"]' }),
      );
    });
    expect([...result.current.read]).toEqual(['camera']);
  });

  it('keeps working in memory when storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    const { result } = renderHook(() => useReadParts());
    expect(result.current.read.size).toBe(0);
    act(() => {
      result.current.toggle('frame');
    });
    expect(result.current.read.has('frame')).toBe(true);
  });
});
