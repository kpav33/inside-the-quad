import { PART_IDS, type PartId } from './parts';
import { PATH_IDS, type PathId } from './paths';

/** A sheet of the drawing set: the intro, one per part, then one per path. */
export type SheetId = 'intro' | PartId | PathId;

/** A sheet with a number: every sheet but the intro. */
export type NumberedSheet = PartId | PathId;

/** The numbered sheets in reading order: the parts, then the paths. */
export const NUMBERED_SHEETS: readonly NumberedSheet[] = [...PART_IDS, ...PATH_IDS];

/** The sheets in reading order: the intro before sheet 1. */
export const SHEET_IDS: readonly SheetId[] = ['intro', ...NUMBERED_SHEETS];

/** A sheet's number in the set, from 1. */
export function sheetNumber(sheet: NumberedSheet): number {
  return NUMBERED_SHEETS.indexOf(sheet) + 1;
}

/** The sheets before and after one, in reading order; null at either end. */
export function sheetNeighbours(sheet: SheetId): {
  previous: SheetId | null;
  next: SheetId | null;
} {
  const index = SHEET_IDS.indexOf(sheet);
  return { previous: SHEET_IDS[index - 1] ?? null, next: SHEET_IDS[index + 1] ?? null };
}
