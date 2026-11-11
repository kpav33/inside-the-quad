import type { PartId } from '@/shared/domain/parts';

export const LESSON_PANEL_ID = 'lesson-panel';

/** What takes focus when Back or Forward lands on the overview. */
export const OVERVIEW_FOCUS_ID = 'overview-start';

export function partButtonId(part: PartId): string {
  return `part-button-${part}`;
}

export function lessonTitleId(part: PartId): string {
  return `lesson-title-${part}`;
}
