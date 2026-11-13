import { PART_IDS, type PartId } from '@/shared/domain/parts';

/** Where this browser keeps the parts marked as read. Versioned, so the format can change. */
export const READ_PARTS_KEY = 'inside-the-quad.read-parts.v1';

/**
 * What the overview offers: the intro to a newcomer, sheet 1, the first unread part, or done.
 */
export type StartState =
  { kind: 'intro' } | { kind: 'start' } | { kind: 'continue'; part: PartId } | { kind: 'done' };

function isPartId(value: unknown): value is PartId {
  return (PART_IDS as readonly unknown[]).includes(value);
}

/** Reads the stored value. Anything malformed or unknown is dropped, never thrown. */
export function parseReadParts(raw: string | null): ReadonlySet<PartId> {
  if (raw === null) return new Set();
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return new Set();
  }
  return new Set(Array.isArray(value) ? value.filter(isPartId) : []);
}

export function serializeReadParts(read: ReadonlySet<PartId>): string {
  return JSON.stringify(PART_IDS.filter((part) => read.has(part)));
}

export function firstUnread(read: ReadonlySet<PartId>): PartId | null {
  return PART_IDS.find((part) => !read.has(part)) ?? null;
}

/** A visitor who has read nothing, not even the intro, is offered the intro first. */
export function startState(read: ReadonlySet<PartId>, introRead: boolean): StartState {
  if (!introRead && read.size === 0) return { kind: 'intro' };
  const part = firstUnread(read);
  if (part === null) return { kind: 'done' };
  return read.size === 0 ? { kind: 'start' } : { kind: 'continue', part };
}
