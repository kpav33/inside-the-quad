import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { usePartRoute } from './usePartRoute';

function start(path: string) {
  window.history.replaceState(null, '', path);
  return renderHook(() => usePartRoute());
}

describe('usePartRoute', () => {
  it('reads the part from the address the page loaded with', () => {
    const { result } = start('/parts/esc');
    expect(result.current.route).toEqual({ kind: 'part', part: 'esc' });
    expect(result.current.cause).toBe('load');
  });

  it('pushes one history entry per navigation', () => {
    const { result } = start('/parts/esc');
    const before = window.history.length;
    act(() => {
      result.current.navigate('fc');
    });
    expect(result.current.route).toEqual({ kind: 'part', part: 'fc' });
    expect(result.current.cause).toBe('push');
    expect(window.location.pathname).toBe('/parts/fc');
    expect(window.history.length).toBe(before + 1);
  });

  it('adds no entry when asked for the page it is already on', () => {
    const { result } = start('/parts/fc');
    const before = window.history.length;
    act(() => {
      result.current.navigate('fc');
    });
    expect(window.history.length).toBe(before);
  });

  it('goes to the overview for null', () => {
    const { result } = start('/parts/fc');
    act(() => {
      result.current.navigate(null);
    });
    expect(result.current.route).toEqual({ kind: 'overview' });
    expect(window.location.pathname).toBe('/');
  });

  it('follows Back and Forward', () => {
    const { result } = start('/');
    act(() => {
      result.current.navigate('fc');
    });
    act(() => {
      window.history.replaceState(null, '', '/parts/esc');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    expect(result.current.route).toEqual({ kind: 'part', part: 'esc' });
    expect(result.current.cause).toBe('pop');
  });

  it('shows the overview for an unknown part and keeps its name until the next navigation', () => {
    const { result } = start('/parts/foo');
    expect(result.current.route).toEqual({ kind: 'overview' });
    expect(result.current.unknownSlug).toBe('foo');
    expect(window.location.pathname).toBe('/');

    act(() => {
      result.current.navigate('frame');
    });
    expect(result.current.unknownSlug).toBeNull();
  });

  it('drops a trailing slash, so choosing the open part adds no entry', () => {
    const { result } = start('/parts/fc/');
    expect(window.location.pathname).toBe('/parts/fc');
    const before = window.history.length;
    act(() => {
      result.current.navigate('fc');
    });
    expect(window.history.length).toBe(before);
  });

  it('reads the intro and drops its trailing slash', () => {
    const { result } = start('/intro/');
    expect(result.current.route).toEqual({ kind: 'intro' });
    expect(window.location.pathname).toBe('/intro');
  });

  it('reads a path sheet and drops its trailing slash', () => {
    const { result } = start('/paths/control/');
    expect(result.current.route).toEqual({ kind: 'path', path: 'control', step: 1 });
    expect(window.location.pathname).toBe('/paths/control');
  });

  it('writes step 1 of a path without its number', () => {
    start('/paths/control/1');
    expect(window.location.pathname).toBe('/paths/control');
  });

  it('replaces the address with a new step, adding no history entry', () => {
    const { result } = start('/paths/power');
    const before = window.history.length;
    act(() => {
      result.current.replaceStep('power', 4);
    });
    expect(window.location.pathname).toBe('/paths/power/4');
    expect(window.history.length).toBe(before);
    expect(result.current.route).toEqual({ kind: 'path', path: 'power', step: 4 });
  });

  it('navigates to the intro', () => {
    const { result } = start('/');
    act(() => {
      result.current.navigate('intro');
    });
    expect(result.current.route).toEqual({ kind: 'intro' });
    expect(window.location.pathname).toBe('/intro');
  });
});

describe('usePartRoute on Check a build', () => {
  it('reads /check and keeps its query when dropping the trailing slash', () => {
    const { result } = start('/check/?kv=2400');
    expect(result.current.route).toEqual({ kind: 'check' });
    expect(window.location.pathname + window.location.search).toBe('/check?kv=2400');
  });

  it('drops a query from an address the app replaces with the overview', () => {
    start('/nowhere?kv=2400');
    expect(window.location.pathname + window.location.search).toBe('/');
  });
});
