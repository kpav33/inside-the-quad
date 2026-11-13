import { PART_IDS, type PartId } from './parts';

/** A sheet of the drawing set: the intro, then one per part. */
export type SheetId = 'intro' | PartId;

/** The sheets in reading order: the intro before sheet 1. */
export const SHEET_IDS: readonly SheetId[] = ['intro', ...PART_IDS];

/** The sheets before and after one, in reading order; null at either end. */
export function sheetNeighbours(sheet: SheetId): {
  previous: SheetId | null;
  next: SheetId | null;
} {
  const index = SHEET_IDS.indexOf(sheet);
  return { previous: SHEET_IDS[index - 1] ?? null, next: SHEET_IDS[index + 1] ?? null };
}
