import { pagePath, parseRoute, type Route } from '@/shared/routing';
import { subscribe } from '@/shared/routing/history';

/**
 * Visit counts, through GoatCounter (site `insidethequad`, dashboard at
 * https://insidethequad.goatcounter.com).
 *
 * Chosen for what it doesn't do: no cookies, nothing stored in the browser, no personal data. So
 * the app needs no consent banner, and the overview says so in one line.
 *
 * The app changes pages without loading one, so GoatCounter's own count (`no_onload` switches it
 * off) would see only the page a visit started on. This module counts instead, on the app's own
 * address changes. It counts each sheet at its own address: the path, never the query, and a
 * stepped sheet without its step, so pressing Play on a path is one view, not one per stop.
 * Addresses the app doesn't know aren't counted.
 *
 * Only in a production build, and never on this machine (dev, `vite preview`, the e2e runs).
 */

/** The counter's script, loaded from GoatCounter. Allowed by the CSP in nginx/security-headers.conf. */
export const GOATCOUNTER_SCRIPT = 'https://gc.zgo.at/count.js';
/** Where counts go. Allowed by the CSP too. */
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

interface GoatCounter {
  count?: (vars: { path: string }) => void;
}

declare global {
  interface Window {
    goatcounter?: GoatCounter;
  }
}

/**
 * Adds GoatCounter's script and returns the function that sends one count. Counts made before
 * the script arrives are held and sent when it does. If it never arrives (an ad blocker, the
 * service down), they stay held and nothing breaks.
 */
export function loadCounter(): (path: string) => void {
  const pending: string[] = [];
  const send = (path: string): void => {
    const count = window.goatcounter?.count;
    if (count === undefined) pending.push(path);
    else count({ path });
  };
  const script = document.createElement('script');
  script.async = true;
  script.src = GOATCOUNTER_SCRIPT;
  script.dataset.goatcounter = GOATCOUNTER_ENDPOINT;
  script.dataset.goatcounterSettings = JSON.stringify({ no_onload: true });
  script.addEventListener('load', () => {
    for (const path of pending.splice(0)) send(path);
  });
  document.head.append(script);
  return send;
}

/** Starts counting visits. Called once, from main.tsx. */
export function startAnalytics(): void {
  if (!import.meta.env.PROD || isLocalHost(window.location.hostname)) return;
  countPages(() => window.location.pathname, loadCounter());
}
