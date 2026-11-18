import type { GearId } from '@/shared/domain/gear';

import { chargerLesson } from './charger';
import { gogglesLesson } from './goggles';
import { radioLesson } from './radio';
import type { GearLesson } from './types';

export { chargerSays } from './charger';
export { gogglesSays } from './goggles';
export { RADIO_MODES, radioSays } from './radio';
export type * from './types';

/** The gear sheets' copy, by sheet. */
export const GEAR: Record<GearId, GearLesson> = {
  radio: radioLesson,
  goggles: gogglesLesson,
  charger: chargerLesson,
};
