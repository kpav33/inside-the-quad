import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { INTRO_READ_KEY, useIntroRead } from './useIntroRead';

describe('useIntroRead', () => {
  afterEach(() => {
    window.localStorage.clear();
  });

  it('starts unread, and read when this browser stored it', () => {
    expect(renderHook(() => useIntroRead()).result.current.read).toBe(false);
    window.localStorage.setItem(INTRO_READ_KEY, '1');
    expect(renderHook(() => useIntroRead()).result.current.read).toBe(true);
  });

  it('marks the intro read, then unread, and stores it', () => {
    const { result } = renderHook(() => useIntroRead());
    act(() => {
      result.current.toggle();
    });
    expect(result.current.read).toBe(true);
    expect(window.localStorage.getItem(INTRO_READ_KEY)).toBe('1');
    act(() => {
      result.current.toggle();
    });
    expect(result.current.read).toBe(false);
    expect(window.localStorage.getItem(INTRO_READ_KEY)).toBeNull();
  });

  it('clears the flag', () => {
    window.localStorage.setItem(INTRO_READ_KEY, '1');
    const { result } = renderHook(() => useIntroRead());
    act(() => {
      result.current.clear();
    });
    expect(result.current.read).toBe(false);
    expect(window.localStorage.getItem(INTRO_READ_KEY)).toBeNull();
  });

  it('follows changes made in another tab', () => {
    const { result } = renderHook(() => useIntroRead());
    act(() => {
      window.localStorage.setItem(INTRO_READ_KEY, '1');
      window.dispatchEvent(new StorageEvent('storage', { key: INTRO_READ_KEY, newValue: '1' }));
    });
    expect(result.current.read).toBe(true);
  });

  it('keeps working in memory when storage is blocked', () => {
    for (const method of ['getItem', 'setItem', 'removeItem'] as const) {
      vi.spyOn(Storage.prototype, method).mockImplementation(() => {
        throw new Error('blocked');
      });
    }
    const { result } = renderHook(() => useIntroRead());
    expect(result.current.read).toBe(false);
    act(() => {
      result.current.toggle();
    });
    expect(result.current.read).toBe(true);
    act(() => {
      result.current.clear();
    });
    expect(result.current.read).toBe(false);
  });
});
