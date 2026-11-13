import { PART_IDS, type PartId } from '@/shared/domain/parts';

export const OVERVIEW_PATH = '/';
export const INTRO_PATH = '/intro';

const PART_PREFIX = '/parts/';

/** A page the app can open: the intro, a part's lesson, or the overview (null). */
export type Page = 'intro' | PartId | null;

/** Where a page lives: the overview, the intro, a part's lesson, or a path the app doesn't know. */
export type Route =
  | { kind: 'overview' }
  | { kind: 'intro' }
  | { kind: 'part'; part: PartId }
  | { kind: 'unknown'; slug: string };

export function partPath(part: PartId): string {
  return `${PART_PREFIX}${part}`;
}

export function pagePath(page: Page): string {
  if (page === null) return OVERVIEW_PATH;
  return page === 'intro' ? INTRO_PATH : partPath(page);
}

function isPartId(value: string): value is PartId {
  return (PART_IDS as readonly string[]).includes(value);
}

function decode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/** Reads a URL path. Part ids match exactly; a trailing slash is allowed. */
export function parseRoute(pathname: string): Route {
  if (pathname === '' || pathname === OVERVIEW_PATH) return { kind: 'overview' };
  if (pathname === INTRO_PATH || pathname === `${INTRO_PATH}/`) return { kind: 'intro' };
  if (pathname.startsWith(PART_PREFIX)) {
    const slug = decode(pathname.slice(PART_PREFIX.length).replace(/\/$/, ''));
    return isPartId(slug) ? { kind: 'part', part: slug } : { kind: 'unknown', slug };
  }
  return { kind: 'unknown', slug: decode(pathname) };
}
