import type { PartId } from '@/shared/domain/parts';

import batteryLarge from '@/assets/photos/battery-1280.webp';
import battery from '@/assets/photos/battery-640.webp';
import cameraLarge from '@/assets/photos/camera-1280.webp';
import camera from '@/assets/photos/camera-640.webp';
import escLarge from '@/assets/photos/esc-1280.webp';
import esc from '@/assets/photos/esc-640.webp';
import extrasLarge from '@/assets/photos/extras-1280.webp';
import extras from '@/assets/photos/extras-640.webp';
import fcLarge from '@/assets/photos/fc-1280.webp';
import fc from '@/assets/photos/fc-640.webp';
import frameLarge from '@/assets/photos/frame-1280.webp';
import frame from '@/assets/photos/frame-640.webp';
import motorsLarge from '@/assets/photos/motors-1280.webp';
import motors from '@/assets/photos/motors-640.webp';
import propsLarge from '@/assets/photos/props-1280.webp';
import props from '@/assets/photos/props-640.webp';
import receiverLarge from '@/assets/photos/receiver-1280.webp';
import receiver from '@/assets/photos/receiver-640.webp';
import strapLarge from '@/assets/photos/strap-1280.webp';
import strap from '@/assets/photos/strap-640.webp';
import vtxLarge from '@/assets/photos/vtx-1280.webp';
import vtx from '@/assets/photos/vtx-640.webp';

import credits from './credits.json';
import { type Licence, LICENCES, type PartPhoto } from './types';

export { LICENCES };
export type { Licence, PartPhoto, PhotoCredit } from './types';

const FILES: Record<PartId, { src: string; srcLarge: string }> = {
  frame: { src: frame, srcLarge: frameLarge },
  motors: { src: motors, srcLarge: motorsLarge },
  props: { src: props, srcLarge: propsLarge },
  esc: { src: esc, srcLarge: escLarge },
  fc: { src: fc, srcLarge: fcLarge },
  battery: { src: battery, srcLarge: batteryLarge },
  strap: { src: strap, srcLarge: strapLarge },
  receiver: { src: receiver, srcLarge: receiverLarge },
  camera: { src: camera, srcLarge: cameraLarge },
  vtx: { src: vtx, srcLarge: vtxLarge },
  extras: { src: extras, srcLarge: extrasLarge },
};

/** What each photo shows (alt) and how we present it (caption, always one example). */
const TEXT: Record<PartId, { alt: string; caption: string }> = {
  frame: {
    alt: 'A bare carbon-fibre quad frame on a workbench, with a motor on each arm and a camera cage in the middle.',
    caption:
      'One example: a carbon-fibre 5″ frame with its motors and camera fitted. Yours may look different.',
  },
  motors: {
    alt: 'Two small brushless motors on the ends of carbon arms, each with a purple propeller on top.',
    caption:
      'One example: brushless motors on the ends of the arms, the copper windings showing under the bells. Yours may look different.',
  },
  props: {
    alt: 'A quad seen from directly above, with an orange three-blade propeller at the end of each arm.',
    caption:
      'One example: four 3-blade props on a 5″ quad, seen from above. Yours may look different.',
  },
  esc: {
    alt: 'A small ESC wrapped in blue shrink tube, with three motor wires leaving one end and power and signal wires the other.',
    caption:
      'One example: a single ESC, one per motor. On most 5″ builds the four sit together on one 4-in-1 board.',
  },
  fc: {
    alt: 'A square white circuit board with a mounting hole in each corner, a processor chip and rows of solder pads.',
    caption:
      'One example: an older flight controller board. Newer ones look much like it and do the same job.',
  },
  battery: {
    alt: 'A white LiPo battery held under a quad’s frame by a black strap, with red power wires and a yellow plug.',
    caption:
      'One example: a LiPo pack strapped under the frame, with its yellow XT60 power plug. Many builds carry it on top instead.',
  },
  strap: {
    alt: 'A black hook-and-loop strap with a red logo, wrapped around a battery under a quad’s frame.',
    caption:
      'One example: a hook-and-loop strap holding the battery down. Yours may look different.',
  },
  receiver: {
    alt: 'A tiny black receiver board with gold solder pads and a thin antenna cable, on a grey cloth.',
    caption:
      'One example: a tiny receiver with its antenna lead. ExpressLRS receivers look much the same.',
  },
  camera: {
    alt: 'A small black FPV camera with a wide glass lens, held in a black mounting bracket with screws at the sides.',
    caption: 'One example: a small FPV camera in its mounting bracket. Yours may look different.',
  },
  vtx: {
    alt: 'A small video transmitter board with a short cable ending in a gold antenna connector.',
    caption:
      'One example: an analog VTX with its antenna lead and connector. Yours may look different.',
  },
  extras: {
    alt: 'A round black buzzer and a USB socket on a small blue board, with a bundle of coloured wires.',
    caption:
      'One example: a buzzer on a small board, wired to the flight controller. GPS modules and LEDs are other extras.',
  },
};

function asLicence(value: string): Licence {
  const licence = LICENCES.find((allowed) => allowed === value);
  if (!licence) throw new Error(`Photo licence not allowed: ${value}`);
  return licence;
}

/** One real photo per part, credited (see `scripts/photos/` for where they come from). */
export const PART_PHOTOS = Object.fromEntries(
  (Object.keys(FILES) as PartId[]).map((id) => {
    const credit = credits[id];
    const photo: PartPhoto = {
      ...FILES[id],
      ...TEXT[id],
      width: credit.width,
      height: credit.height,
      credit: {
        author: credit.author,
        licence: asLicence(credit.licence),
        ...('licenceUrl' in credit ? { licenceUrl: credit.licenceUrl } : {}),
        sourceUrl: credit.sourceUrl,
        cropped: credit.cropped,
      },
    };
    return [id, photo];
  }),
) as Record<PartId, PartPhoto>;
