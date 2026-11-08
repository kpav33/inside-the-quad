import type { PartId } from '@/shared/domain/parts';

export const LESSON_PANEL_ID = 'lesson-panel';

export function partButtonId(part: PartId): string {
  return `part-button-${part}`;
}

export function lessonTitleId(part: PartId): string {
  return `lesson-title-${part}`;
}
