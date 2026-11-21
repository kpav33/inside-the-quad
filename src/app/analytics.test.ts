import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  countedPath,
  countPages,
  GOATCOUNTER_ENDPOINT,
  GOATCOUNTER_SCRIPT,
  isLocalHost,
  loadCounter,
  pageCounter,
} from './analytics';

describe('countedPath', () => {
  it('counts a sheet at its own address, without its step', () => {
    expect(countedPath('/')).toBe('/');
    expect(countedPath('/intro')).toBe('/intro');
    expect(countedPath('/parts/motors')).toBe('/parts/motors');
    expect(countedPath('/parts/motors/')).toBe('/parts/motors');
    expect(countedPath('/paths/control')).toBe('/paths/control');
    expect(countedPath('/paths/control/3')).toBe('/paths/control');
    expect(countedPath('/moves/4')).toBe('/moves');
    expect(countedPath('/what-if/2')).toBe('/what-if');
    expect(countedPath('/gear/radio')).toBe('/gear/radio');
  });

  it('leaves out an address the app does not know', () => {
    expect(countedPath('/parts/nope')).toBeNull();
    expect(countedPath('/wp-login.php')).toBeNull();
  });
});

describe('pageCounter', () => {
  it('counts a path once until another path comes', () => {
    const count = vi.fn();
    const counter = pageCounter(count);
    counter('/');
    counter('/');
    counter('/parts/motors');
    counter('/');
    expect(count.mock.calls).toEqual([['/'], ['/parts/motors'], ['/']]);
  });

  it('skips addresses that are not counted, and the same page reached again', () => {
    const count = vi.fn();
    const counter = pageCounter(count);
    counter('/paths/control');
    counter('/paths/control/2');
    counter('/paths/control/3');
    counter('/nope');
    counter('/moves/2');
    expect(count.mock.calls).toEqual([['/paths/control'], ['/moves']]);
  });
});

describe('countPages', () => {
  it('counts the current page, then each page moved to, until unsubscribed', () => {
    let path = '/';
    let notify: () => void = () => undefined;
    const unsubscribe = vi.fn();
    const count = vi.fn();
    const stop = countPages(
      () => path,
      count,
      (onChange) => {
        notify = onChange;
        return unsubscribe;
      },
    );
    path = '/parts/frame';
    notify();
    expect(count.mock.calls).toEqual([['/'], ['/parts/frame']]);
    stop();
    expect(unsubscribe).toHaveBeenCalledOnce();
  });
});

describe('isLocalHost', () => {
  it('is true for this machine, so dev, preview and test runs never count', () => {
    for (const host of ['localhost', '127.0.0.1', '[::1]', '0.0.0.0', 'app.localhost']) {
      expect(isLocalHost(host), host).toBe(true);
    }
  });

  it('is false for a real address', () => {
    for (const host of ['insidethequad.com', 'insidethequad.b-cdn.net', 'itq.test']) {
      expect(isLocalHost(host), host).toBe(false);
    }
  });
});

describe('loadCounter', () => {
  afterEach(() => {
    document.head.querySelectorAll('script').forEach((script) => {
      script.remove();
    });
    delete window.goatcounter;
  });

  it('adds the GoatCounter script with its own count switched off', () => {
    loadCounter();
    const script = document.head.querySelector<HTMLScriptElement>('script');
    expect(script?.src).toBe(GOATCOUNTER_SCRIPT);
    expect(script?.async).toBe(true);
    expect(script?.dataset.goatcounter).toBe(GOATCOUNTER_ENDPOINT);
    expect(JSON.parse(script?.dataset.goatcounterSettings ?? '{}')).toEqual({ no_onload: true });
  });

  it('holds counts made before the script arrives and sends them when it does', () => {
    const send = loadCounter();
    send('/');
    send('/intro');
    const count = vi.fn();
    window.goatcounter = { count };
    document.head.querySelector('script')?.dispatchEvent(new Event('load'));
    send('/parts/frame');
    expect(count.mock.calls).toEqual([
      [{ path: '/' }],
      [{ path: '/intro' }],
      [{ path: '/parts/frame' }],
    ]);
  });

  it('sends nothing and throws nothing when the script never arrives', () => {
    const send = loadCounter();
    expect(() => {
      send('/');
    }).not.toThrow();
    document.head.querySelector('script')?.dispatchEvent(new Event('error'));
    expect(window.goatcounter).toBeUndefined();
  });
});

it('the counter is the insidethequad site', () => {
  expect(GOATCOUNTER_ENDPOINT).toBe('https://insidethequad.goatcounter.com/count');
  expect(GOATCOUNTER_SCRIPT).toBe('https://gc.zgo.at/count.js');
});
