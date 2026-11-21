import { describe, expect, it, vi } from 'vitest';

import {
  countedPath,
  countPages,
  countUrl,
  externalReferrer,
  GOATCOUNTER_ENDPOINT,
  isLocalHost,
  pageCounter,
  sendCount,
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

const SCREEN = { width: 390, height: 844, pixelRatio: 3 };

describe('countUrl', () => {
  const read = (url: string) => new URL(url);

  it('sends the path and the screen size to the insidethequad counter', () => {
    const url = read(countUrl('/paths/control', { screen: SCREEN, referrer: null, random: 'abc' }));
    expect(`${url.origin}${url.pathname}`).toBe(GOATCOUNTER_ENDPOINT);
    expect(url.searchParams.get('p')).toBe('/paths/control');
    expect(url.searchParams.get('s')).toBe('390,844,3');
    expect(url.searchParams.get('rnd')).toBe('abc');
  });

  it('sends nothing else: no query, no title, no referrer unless given', () => {
    const url = read(countUrl('/', { screen: SCREEN, referrer: null, random: 'abc' }));
    expect([...url.searchParams.keys()].sort()).toEqual(['p', 'rnd', 's']);
  });

  it('sends a referrer when given', () => {
    const url = read(
      countUrl('/', { screen: SCREEN, referrer: 'https://news.example', random: 'abc' }),
    );
    expect(url.searchParams.get('r')).toBe('https://news.example');
  });
});

describe('externalReferrer', () => {
  const here = 'https://insidethequad.example';

  it('keeps only the origin of another site', () => {
    expect(externalReferrer('https://news.example/a/b?user=me#x', here)).toBe(
      'https://news.example',
    );
  });

  it('is null for this site, none, or something unreadable', () => {
    expect(externalReferrer('https://insidethequad.example/intro?x=1', here)).toBeNull();
    expect(externalReferrer('', here)).toBeNull();
    expect(externalReferrer('not a url', here)).toBeNull();
  });
});

describe('sendCount', () => {
  it('sends by beacon when the browser takes it', () => {
    const sendBeacon = vi.fn(() => true);
    const makeImage = vi.fn();
    sendCount('https://insidethequad.goatcounter.com/count?p=%2F', { sendBeacon }, makeImage);
    expect(sendBeacon).toHaveBeenCalledWith('https://insidethequad.goatcounter.com/count?p=%2F');
    expect(makeImage).not.toHaveBeenCalled();
  });

  it('falls back to an image when there is no beacon or it is refused', () => {
    const makeImage = vi.fn(() => ({ src: '' }));
    sendCount('https://x.example/count?p=%2F', {}, makeImage);
    sendCount('https://x.example/count?p=%2Fintro', { sendBeacon: () => false }, makeImage);
    expect(makeImage.mock.results.map((r) => (r.value as { src: string }).src)).toEqual([
      'https://x.example/count?p=%2F',
      'https://x.example/count?p=%2Fintro',
    ]);
  });

  it('never throws, so a blocked counter cannot break the app', () => {
    expect(() => {
      sendCount(
        'https://x.example/count',
        {
          sendBeacon: () => {
            throw new TypeError('blocked');
          },
        },
        () => {
          throw new Error('no images');
        },
      );
    }).not.toThrow();
  });
});

it('touches no browser storage', () => {
  const getItem = vi.spyOn(Storage.prototype, 'getItem');
  const setItem = vi.spyOn(Storage.prototype, 'setItem');
  countUrl('/', { screen: SCREEN, referrer: null, random: 'abc' });
  sendCount('https://x.example/count', { sendBeacon: () => true });
  expect(getItem).not.toHaveBeenCalled();
  expect(setItem).not.toHaveBeenCalled();
});
