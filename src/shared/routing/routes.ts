import { isPartId, type PartId } from '@/shared/domain/parts';
import { isPathId, type PathId } from '@/shared/domain/paths';
import type { SheetId } from '@/shared/domain/sheets';

export const OVERVIEW_PATH = '/';
export const INTRO_PATH = '/intro';

const PART_PREFIX = '/parts/';
const PATH_PREFIX = '/paths/';
/** A cap for a step read from an address; far beyond any path's stops. */
const MAX_STEP = 999;

/** A page the app can open: a sheet (the intro, a part's lesson, a path), or the overview (null). */
export type Page = SheetId | null;

/** Where a page lives: the overview, the intro, a part's lesson, a path sheet, or an address the app doesn't know. */
export type Route =
  | { kind: 'overview' }
  | { kind: 'intro' }
  | { kind: 'part'; part: PartId }
  | { kind: 'path'; path: PathId; step: number }
  | { kind: 'unknown'; slug: string };

export function partPath(part: PartId): string {
  return `${PART_PREFIX}${part}`;
}

/** A path sheet's address at a step (from 1); step 1 is the path's own address. */
export function pathSheetPath(path: PathId, step = 1): string {
  return step > 1 ? `${PATH_PREFIX}${path}/${String(step)}` : `${PATH_PREFIX}${path}`;
}

/** A page's address; `step` applies to a path sheet only. */
export function pagePath(page: Page, step?: number): string {
  if (page === null) return OVERVIEW_PATH;
  if (page === 'intro') return INTRO_PATH;
  return isPathId(page) ? pathSheetPath(page, step) : partPath(page);
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
  if (pathname.startsWith(PATH_PREFIX)) {
    const slug = decode(pathname.slice(PATH_PREFIX.length).replace(/\/$/, ''));
    const [id, step, ...rest] = slug.split('/');
    // A whole-number step outside the path is kept as the nearest sensible one: below 1 is 1, and a
    // huge one is capped (the explorer then shows the path's last stop).
    const stepNumber =
      step === undefined
        ? 1
        : /^-?\d+$/.test(step)
          ? Math.min(Math.max(Number(step), 1), MAX_STEP)
          : NaN;
    return isPathId(id) && rest.length === 0 && !Number.isNaN(stepNumber)
      ? { kind: 'path', path: id, step: stepNumber }
      : { kind: 'unknown', slug };
  }
  return { kind: 'unknown', slug: decode(pathname) };
}
