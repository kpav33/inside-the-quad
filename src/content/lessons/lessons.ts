import type { PartId } from '@/shared/domain/parts';

import { batteryLesson } from './battery';
import { cameraLesson } from './camera';
import { escLesson } from './esc';
import { extrasLesson } from './extras';
import { fcLesson } from './fc';
import { frameLesson } from './frame';
import { motorsLesson } from './motors';
import { propsLesson } from './props';
import { receiverLesson } from './receiver';
import { strapLesson } from './strap';
import type { Lesson } from './types';
import { vtxLesson } from './vtx';

export const LESSONS: Record<PartId, Lesson> = {
  frame: frameLesson,
  motors: motorsLesson,
  props: propsLesson,
  esc: escLesson,
  fc: fcLesson,
  battery: batteryLesson,
  strap: strapLesson,
  receiver: receiverLesson,
  camera: cameraLesson,
  vtx: vtxLesson,
  extras: extrasLesson,
};
