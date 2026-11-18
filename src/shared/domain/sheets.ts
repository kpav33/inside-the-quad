import { GEAR_IDS, type GearId, isGearId } from './gear';
import { MOVES_SHEET, type MovesSheet } from './moves';
import { PART_IDS, type PartId } from './parts';
import { isPathId, PATH_IDS, type PathId } from './paths';
import { WHAT_IF_SHEET, type WhatIfSheet } from './what-if';

/**
 * A sheet of the drawing set: the intro, one per part, the paths, how a quad moves and what if,
 * then one per piece of gear.
 */
export type SheetId = 'intro' | PartId | PathId | MovesSheet | WhatIfSheet | GearId;

/** A sheet with a number: every sheet but the intro. */
export type NumberedSheet = PartId | PathId | MovesSheet | WhatIfSheet | GearId;

/** A sheet walked through in steps, the step kept in its address: a path, moves or what if. */
export type SteppedSheet = PathId | MovesSheet | WhatIfSheet;

export function isSteppedSheet(value: unknown): value is SteppedSheet {
  return isPathId(value) || value === MOVES_SHEET || value === WHAT_IF_SHEET;
}

/** The sheets of "How it works together": the three paths, how a quad moves, then what if. */
const TOGETHER_SHEETS: readonly NumberedSheet[] = [...PATH_IDS, MOVES_SHEET, WHAT_IF_SHEET];

/** The numbered sheets in reading order: the parts, how it works together, then the gear. */
export const NUMBERED_SHEETS: readonly NumberedSheet[] = [
  ...PART_IDS,
  ...TOGETHER_SHEETS,
  ...GEAR_IDS,
];

/** The sheets in reading order: the intro before sheet 1. */
export const SHEET_IDS: readonly SheetId[] = ['intro', ...NUMBERED_SHEETS];

/**
 * The drawing set's three chapters: the parts, how they work together (the paths, moves, what
 * if), then the gear you hold and wear.
 */
export type Chapter = 'parts' | 'paths' | 'gear';

export const CHAPTER_SHEETS: Record<Chapter, readonly NumberedSheet[]> = {
  parts: PART_IDS,
  paths: TOGETHER_SHEETS,
  gear: GEAR_IDS,
};

export function chapterOf(sheet: NumberedSheet): Chapter {
  if (isGearId(sheet)) return 'gear';
  return isSteppedSheet(sheet) ? 'paths' : 'parts';
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
