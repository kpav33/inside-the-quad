import type { GearId } from '@/shared/domain/gear';
import type { PartId } from '@/shared/domain/parts';
import type { PathId } from '@/shared/domain/paths';

export const LESSON_PANEL_ID = 'lesson-panel';

/** What takes focus when Back or Forward lands on the overview. */
export const OVERVIEW_FOCUS_ID = 'overview-start';

export function partButtonId(part: PartId): string {
  return `part-button-${part}`;
}

export function lessonTitleId(part: PartId): string {
  return `lesson-title-${part}`;
}

/** The intro sheet's heading, focused when the intro opens. */
export const INTRO_TITLE_ID = 'intro-title';

/** A path sheet's heading, focused when the path opens. */
export function pathTitleId(path: PathId): string {
  return `path-title-${path}`;
}

/** The moves sheet's heading, focused when it opens. */
export const MOVES_TITLE_ID = 'moves-title';

/** The what-if sheet's heading, focused when it opens. */
export const WHAT_IF_TITLE_ID = 'what-if-title';

/** The Check a build sheet's heading, focused when it opens. */
export const CHECK_TITLE_ID = 'check-title';

/** A gear sheet's heading, focused when it opens. */
export function gearTitleId(gear: GearId): string {
  return `gear-title-${gear}`;
}
