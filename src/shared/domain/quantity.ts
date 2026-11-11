import type { DroneSpec } from './drone-spec';
import type { PartId } from './parts';

/** How many of a part the drone has, as listed in the parts list and title block. */
export function partQuantity(part: PartId, spec: DroneSpec): number {
  switch (part) {
    case 'frame':
    case 'esc':
    case 'fc':
    case 'battery':
    case 'receiver':
    case 'camera':
    case 'vtx':
    case 'strap':
      return 1;
    case 'motors':
    case 'props':
      return spec.motor.count;
    case 'extras':
      // GPS, buzzer and one LED strip on each rear arm.
      return 4;
  }
}
