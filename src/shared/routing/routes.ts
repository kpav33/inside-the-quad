import { isPartId, type PartId } from '@/shared/domain/parts';
import { MOVES_SHEET } from '@/shared/domain/moves';
import { WHAT_IF_SHEET } from '@/shared/domain/what-if';
import { isPathId, type PathId } from '@/shared/domain/paths';
import type { SheetId, SteppedSheet } from '@/shared/domain/sheets';

export const OVERVIEW_PATH = '/';
export const INTRO_PATH = '/intro';

const PART_PREFIX = '/parts/';
const PATH_PREFIX = '/paths/';
/** The flight sheets, each at its own top-level address with an optional step. */
const FLIGHT_SHEETS = [MOVES_SHEET, WHAT_IF_SHEET] as const;
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
  | { kind: 'moves'; step: number }
  | { kind: 'what-if'; step: number }
  | { kind: 'unknown'; slug: string };

export function partPath(part: PartId): string {
  return `${PART_PREFIX}${part}`;
}

/** A stepped sheet's address at a step (from 1); step 1 is the sheet's own address. */
export function steppedPath(sheet: SteppedSheet, step = 1): string {
  const base = isPathId(sheet) ? `${PATH_PREFIX}${sheet}` : `/${sheet}`;
  return step > 1 ? `${base}/${String(step)}` : base;
}

/** A path sheet's address at a step (from 1); step 1 is the path's own address. */
export function pathSheetPath(path: PathId, step = 1): string {
  return steppedPath(path, step);
}

/** A page's address; `step` applies to a stepped sheet only (a path, or how a quad moves). */
export function pagePath(page: Page, step?: number): string {
  if (page === null) return OVERVIEW_PATH;
  if (page === 'intro') return INTRO_PATH;
  if (page === MOVES_SHEET || page === WHAT_IF_SHEET || isPathId(page)) {
    return steppedPath(page, step);
  }
  return partPath(page);
}

/**
 * A step read from an address: a whole number outside the sheet is kept as the nearest sensible
 * one (below 1 is 1, a huge one is capped; the explorer then shows the last step). NaN when the
 * value is not a whole number.
 */
function readStep(step: string | undefined): number {
  if (step === undefined) return 1;
  return /^-?\d+$/.test(step) ? Math.min(Math.max(Number(step), 1), MAX_STEP) : NaN;
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
    const stepNumber = readStep(step);
    return isPathId(id) && rest.length === 0 && !Number.isNaN(stepNumber)
      ? { kind: 'path', path: id, step: stepNumber }
      : { kind: 'unknown', slug };
  }
  for (const sheet of FLIGHT_SHEETS) {
    if (pathname !== `/${sheet}` && !pathname.startsWith(`/${sheet}/`)) continue;
    const slug = decode(pathname.slice(1).replace(/\/$/, ''));
    const [, step, ...rest] = slug.split('/');
    const stepNumber = readStep(step);
    return rest.length === 0 && !Number.isNaN(stepNumber)
      ? { kind: sheet, step: stepNumber }
      : { kind: 'unknown', slug };
  }
  return { kind: 'unknown', slug: decode(pathname) };
}
