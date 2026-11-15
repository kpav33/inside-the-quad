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

/** The drawing set's two chapters: the parts, then how they work together (the paths). */
export type Chapter = 'parts' | 'paths';

export const CHAPTER_SHEETS: Record<Chapter, readonly NumberedSheet[]> = {
  parts: PART_IDS,
  paths: PATH_IDS,
};

export function chapterOf(sheet: NumberedSheet): Chapter {
  return (PATH_IDS as readonly string[]).includes(sheet) ? 'paths' : 'parts';
}

/** A sheet's number within its chapter, from 1. */
export function sheetNumber(sheet: NumberedSheet): number {
  return CHAPTER_SHEETS[chapterOf(sheet)].indexOf(sheet) + 1;
}

/** How many sheets a sheet's chapter has. */
export function chapterCount(sheet: NumberedSheet): number {
  return CHAPTER_SHEETS[chapterOf(sheet)].length;
}

/** The sheets before and after one, in reading order; null at either end. */
export function sheetNeighbours(sheet: SheetId): {
  previous: SheetId | null;
  next: SheetId | null;
} {
  const index = SHEET_IDS.indexOf(sheet);
  return { previous: SHEET_IDS[index - 1] ?? null, next: SHEET_IDS[index + 1] ?? null };
}
