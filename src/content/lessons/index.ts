import type { PartId } from '@/shared/domain/parts';

import { batteryLesson } from './battery';
import { escLesson } from './esc';
import { fcLesson } from './fc';
import { frameLesson } from './frame';
import { motorsLesson } from './motors';
import { propsLesson } from './props';
import type { Lesson } from './types';

export type { Lesson, LessonConnection, LessonSpecRow } from './types';

export const LESSONS: Record<PartId, Lesson> = {
  frame: frameLesson,
  motors: motorsLesson,
  props: propsLesson,
  esc: escLesson,
  fc: fcLesson,
  battery: batteryLesson,
};
