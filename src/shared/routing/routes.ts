import { PART_IDS, type PartId } from '@/shared/domain/parts';

export const OVERVIEW_PATH = '/';

const PART_PREFIX = '/parts/';

/** Where a page lives: the overview, one part's lesson, or a path the app doesn't know. */
export type Route =
  { kind: 'overview' } | { kind: 'part'; part: PartId } | { kind: 'unknown'; slug: string };

export function partPath(part: PartId): string {
  return `${PART_PREFIX}${part}`;
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
  if (pathname.startsWith(PART_PREFIX)) {
    const slug = decode(pathname.slice(PART_PREFIX.length).replace(/\/$/, ''));
    return isPartId(slug) ? { kind: 'part', part: slug } : { kind: 'unknown', slug };
  }
  return { kind: 'unknown', slug: decode(pathname) };
}
