import { isPartId } from '@/shared/domain/parts';
import { isSteppedSheet, NUMBERED_SHEETS, type NumberedSheet } from '@/shared/domain/sheets';

/** A sheet the learner can mark as read: a part, a path, or how a quad moves. */
export type ReadableSheet = NumberedSheet;

/**
 * Where this browser keeps the sheets marked as read. Versioned, so the format can change. The
 * name dates from before the paths; path ids were added to the same list, so old progress stays.
 */
export const READ_PARTS_KEY = 'inside-the-quad.read-parts.v1';

/**
 * What the overview offers: the intro to a newcomer, sheet 1, the first unread sheet, or done.
 */
export type StartState =
  | { kind: 'intro' }
  | { kind: 'start' }
  | { kind: 'continue'; sheet: ReadableSheet }
  | { kind: 'done' };

function isReadableSheet(value: unknown): value is ReadableSheet {
  return isPartId(value) || isSteppedSheet(value);
}

/** Reads the stored value. Anything malformed or unknown is dropped, never thrown. */
export function parseReadSheets(raw: string | null): ReadonlySet<ReadableSheet> {
  if (raw === null) return new Set();
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return new Set();
  }
  return new Set(Array.isArray(value) ? value.filter(isReadableSheet) : []);
}

export function serializeReadSheets(read: ReadonlySet<ReadableSheet>): string {
  return JSON.stringify(NUMBERED_SHEETS.filter((sheet) => read.has(sheet)));
}

export function firstUnread(read: ReadonlySet<ReadableSheet>): ReadableSheet | null {
  return NUMBERED_SHEETS.find((sheet) => !read.has(sheet)) ?? null;
}

/** A visitor who has read nothing, not even the intro, is offered the intro first. */
export function startState(read: ReadonlySet<ReadableSheet>, introRead: boolean): StartState {
  if (!introRead && read.size === 0) return { kind: 'intro' };
  const sheet = firstUnread(read);
  if (sheet === null) return { kind: 'done' };
  return read.size === 0 ? { kind: 'start' } : { kind: 'continue', sheet };
}
