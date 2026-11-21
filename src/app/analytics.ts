import { pagePath, parseRoute, type Route } from '@/shared/routing';
import { subscribe } from '@/shared/routing/history';

/**
 * Visit counts, through GoatCounter (site `insidethequad`, dashboard at
 * https://insidethequad.goatcounter.com).
 *
 * Chosen for what it doesn't do: no cookies, no personal data. So the app needs no consent
 * banner, and the overview says so in one line.
 *
 * The app sends each count itself, to GoatCounter's count address, rather than loading its
 * script: the script also sends the page's query and full referrer, and reads and writes
 * localStorage. A count here carries only the counted path, the screen size and, on the first
 * page of a visit, the origin of the site the visitor came from. Nothing is stored.
 *
 * The app counts each sheet at its own address: the path, never the query, and a stepped sheet
 * without its step, so pressing Play on a path is one view, not one per stop. Addresses the app
 * doesn't know aren't counted. Only in a production build, and never on this machine (dev,
 * `vite preview`, the e2e runs).
 */

/** Where counts go. Allowed by the CSP (connect-src and img-src, nginx/security-headers.conf). */
export const GOATCOUNTER_ENDPOINT = 'https://insidethequad.goatcounter.com/count';

function pageOf(route: Route): string | null {
  switch (route.kind) {
    case 'overview':
      return pagePath(null);
    case 'intro':
      return pagePath('intro');
    case 'part':
      return pagePath(route.part);
    case 'path':
      return pagePath(route.path);
    case 'moves':
    case 'what-if':
    case 'check':
      return pagePath(route.kind);
    case 'gear':
      return pagePath(route.gear);
    case 'unknown':
      return null;
  }
}

/** The address a visit to `pathname` is counted under, or null when it isn't counted. */
export function countedPath(pathname: string): string | null {
  return pageOf(parseRoute(pathname));
}

/** Turns a stream of addresses into counts: one each time the counted page changes. */
export function pageCounter(count: (path: string) => void): (pathname: string) => void {
  let last: string | null = null;
  return (pathname) => {
    const path = countedPath(pathname);
    if (path === null || path === last) return;
    last = path;
    count(path);
  };
}

/** Counts the current page, then every page moved to. Returns the unsubscribe. */
export function countPages(
  readPath: () => string,
  count: (path: string) => void,
  onChange: (listener: () => void) => () => void = subscribe,
): () => void {
  const counter = pageCounter(count);
  counter(readPath());
  return onChange(() => {
    counter(readPath());
  });
}

/** True for this machine's own addresses, where nothing is counted. */
export function isLocalHost(hostname: string): boolean {
  return /^(localhost|127(\.\d+){3}|0\.0\.0\.0|\[::1?\])$|\.localhost$/.test(hostname);
}

interface CountOptions {
  screen: { width: number; height: number; pixelRatio: number };
  /** The origin of the site the visitor came from, on the visit's first count; else null. */
  referrer: string | null;
  /** Keeps a browser or proxy from answering from its cache. */
  random: string;
}

/** One count's address: the path, the screen size, and the referrer when given. Nothing else. */
export function countUrl(path: string, { screen, referrer, random }: CountOptions): string {
  const params = new URLSearchParams({
    p: path,
    s: `${String(screen.width)},${String(screen.height)},${String(screen.pixelRatio)}`,
  });
  if (referrer !== null) params.set('r', referrer);
  params.set('rnd', random);
  return `${GOATCOUNTER_ENDPOINT}?${params.toString()}`;
}

/** The origin of `referrer` when it is another site; null for this site, none, or unreadable. */
export function externalReferrer(referrer: string, origin: string): string | null {
  try {
    const from = new URL(referrer).origin;
    return from === origin || from === 'null' ? null : from;
  } catch {
    return null;
  }
}

/**
 * Sends a count by beacon, or with an image when the browser has no beacon or refuses it. Never
 * throws: a blocked or missing counter must not break the app.
 */
export function sendCount(
  url: string,
  nav: { sendBeacon?: (url: string) => boolean },
  makeImage: () => { src: string } = () => new Image(),
): void {
  try {
    if (nav.sendBeacon?.(url)) return;
  } catch {
    // Fall back to the image.
  }
  try {
    makeImage().src = url;
  } catch {
    // Nothing more to try.
  }
}

/** Starts counting visits. Called once, from main.tsx. */
export function startAnalytics(): void {
  if (!import.meta.env.PROD || isLocalHost(window.location.hostname)) return;
  let referrer = externalReferrer(document.referrer, window.location.origin);
  countPages(
    () => window.location.pathname,
    (path) => {
      const url = countUrl(path, {
        screen: {
          width: window.screen.width,
          height: window.screen.height,
          pixelRatio: window.devicePixelRatio,
        },
        referrer,
        random: Math.random().toString(36).slice(2, 7),
      });
      referrer = null;
      sendCount(url, navigator);
    },
  );
}
